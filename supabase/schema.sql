-- M&A database setup. Paste this whole file into Supabase > SQL Editor > New query, then click Run.

create table if not exists public.docs (
  col text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  uid uuid not null default auth.uid() references auth.users on delete cascade,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);
create index if not exists docs_col_updated on public.docs (col, updated_at desc);
alter table public.docs enable row level security;
-- Feedback and question reports can come from signed-out visitors (written only by the server).
alter table public.docs alter column uid drop not null;

create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'bekirkahook@gmail.com', false)
$$;

drop policy if exists docs_read on public.docs;
drop policy if exists docs_insert on public.docs;
drop policy if exists docs_update on public.docs;
drop policy if exists docs_delete on public.docs;

-- Anyone signed in can read public collections; private ones (progress, emails, AI usage) only by their owner.
create policy docs_read on public.docs for select to authenticated
  using (col in ('players','reviews','views','avatars','names') or uid = auth.uid() or public.is_admin());

-- You can only write your own documents.
create policy docs_insert on public.docs for insert to authenticated
  with check (uid = auth.uid() and col not in ('ai_usage','billing') and (
    id = auth.uid()::text
    or col = 'data/users/' || auth.uid()::text
    or (col = 'views' and id = '_founder' and public.is_admin())));

create policy docs_update on public.docs for update to authenticated
  using (uid = auth.uid() or (col = 'views' and id = '_founder' and public.is_admin()))
  with check (uid = auth.uid() and col not in ('ai_usage','billing') and (
    id = auth.uid()::text
    or col = 'data/users/' || auth.uid()::text
    or (col = 'views' and id = '_founder' and public.is_admin())));

create policy docs_delete on public.docs for delete to authenticated
  using ((uid = auth.uid() and col not in ('ai_usage','billing')) or (col = 'reviews' and public.is_admin()));

-- Live updates for leaderboards, friends and reviews.
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;
