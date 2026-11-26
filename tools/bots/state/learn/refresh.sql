-- Read-only. Run in Supabase (project nbakxpnhcfzdosbzbupd) by the daily snapshot task, then write the numbers into snapshot.json.
-- Anonymous aggregates only: never copy uids, emails or free text into the repo.
-- 1) users and how many cleared any level
select count(*) as users,
       count(*) filter (where (data->>'s') ~ '"best":\{"') as with_any_level
from docs where col like 'data/users/%';
-- 2) event totals (visit rows hold data.ev as {event: count})
select e.key as event, sum((e.value)::int) as n
from docs d, jsonb_each_text(d.data->'ev') e
where d.col = 'visits' group by e.key order by n desc;
-- 3) billing (counts only)
select count(*) as docs,
       count(*) filter (where data->>'status' = 'active') as active,
       count(*) filter (where (data->>'cancelAtPeriodEnd') = 'true') as cancel_at_end
from docs where col = 'billing';
