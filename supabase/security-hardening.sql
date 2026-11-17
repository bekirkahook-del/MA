-- M&A Prep: database security hardening (Nov 17, 2026).
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run. Safe to run more than once.
-- It supersedes the policies in schema.sql. Server (Netlify) code works with or without it, but the protections below only apply once it has been run.
--
-- What it fixes:
--  1. Signed-in users could write ANY collection under their own user id (e.g. fake "alerts", "refs", "engage" or "subscribers"
--     documents that the server later trusts). Clients can now only write the collections the app really uses.
--  2. Admin access (is_admin) trusted the email claim alone; it now also requires a confirmed email.
--  3. No size limit on documents, so one account could fill the database. Capped at ~400 KB per document.
--  4. Adds an atomic counter used for AI daily limits and rate limiting (the old read-then-write counter could be raced).

-- ---------------------------------------------------------------------------------------------------------------------
-- 1) admin check: confirmed email only
-- ---------------------------------------------------------------------------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
      and lower(u.email) in ('bekirkahook@gmail.com','kahook.3@osu.edu')
  )
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------------------------------------------------
-- 2) row-level security: allowlist of client-writable collections
--    players/reviews/avatars/views/names/subscribers: only the row whose id is your own user id
--    data/users/<your id>: your private progress (any doc id inside it)
--    views/_founder: owner only
--    Everything else (billing, ai_usage, alerts, engage, refs, refcodes, refby, connmail, feedback, visits, ratelimit...) is server-only.
-- ---------------------------------------------------------------------------------------------------------------------
alter table public.docs enable row level security;

drop policy if exists docs_read on public.docs;
drop policy if exists docs_insert on public.docs;
drop policy if exists docs_update on public.docs;
drop policy if exists docs_delete on public.docs;

create policy docs_read on public.docs for select to authenticated
  using (col in ('players','reviews','views','avatars','names') or uid = auth.uid() or (select public.is_admin()));

create policy docs_insert on public.docs for insert to authenticated
  with check (
    uid = auth.uid()
    and pg_column_size(data) < 400000
    and (
      (col in ('players','reviews','avatars','views','names','subscribers') and id = auth.uid()::text)
      or col = 'data/users/' || auth.uid()::text
      or (col = 'views' and id = '_founder' and (select public.is_admin()))
    )
  );

create policy docs_update on public.docs for update to authenticated
  using (uid = auth.uid() or (col = 'views' and id = '_founder' and (select public.is_admin())))
  with check (
    uid = auth.uid()
    and pg_column_size(data) < 400000
    and (
      (col in ('players','reviews','avatars','views','names','subscribers') and id = auth.uid()::text)
      or col = 'data/users/' || auth.uid()::text
      or (col = 'views' and id = '_founder' and (select public.is_admin()))
    )
  );

create policy docs_delete on public.docs for delete to authenticated
  using (
    (uid = auth.uid() and (col in ('players','reviews','avatars','views','names','subscribers') or col = 'data/users/' || auth.uid()::text))
    or (col = 'reviews' and (select public.is_admin()))
  );

-- Anonymous visitors have no access at all (the app always signs in before touching the database).
revoke all on public.docs from anon;

-- ---------------------------------------------------------------------------------------------------------------------
-- 3) atomic counter (service role only): returns the new count, or NULL when the limit was already reached
-- ---------------------------------------------------------------------------------------------------------------------
create or replace function public.bump_counter(p_col text, p_id text, p_uid uuid, p_limit int)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into public.docs as d (col, id, uid, data, updated_at)
  values (p_col, p_id, p_uid, jsonb_build_object('n', 1), now())
  on conflict (col, id) do update
    set data = jsonb_build_object('n', coalesce((d.data->>'n')::int, 0) + 1), updated_at = now()
    where coalesce((d.data->>'n')::int, 0) < p_limit
  returning (d.data->>'n')::int into n;
  return n;
end $$;
revoke all on function public.bump_counter(text, text, uuid, int) from public, anon, authenticated;
grant execute on function public.bump_counter(text, text, uuid, int) to service_role;

-- ---------------------------------------------------------------------------------------------------------------------
-- 4) one-time cleanup of anything a user could have planted before this ran. REVIEW the SELECTs first.
-- ---------------------------------------------------------------------------------------------------------------------
-- Rows owned by a user in collections that are supposed to be server-only (the server always writes these with uid = null):
--   select col, id, uid from public.docs
--   where uid is not null
--     and col not in ('players','reviews','avatars','views','names','subscribers','billing','ai_usage')
--     and col not like 'data/users/%';
-- If that list only contains junk you didn't expect, delete it:
--   delete from public.docs
--   where uid is not null
--     and col not in ('players','reviews','avatars','views','names','subscribers','billing','ai_usage')
--     and col not like 'data/users/%';
--
-- Rows in "subscribers" that are not real newsletter signups (real ones have a 32-character hex id) are the app's own settings docs. They're harmless
-- now (the weekly email ignores them) so there is nothing to delete.
