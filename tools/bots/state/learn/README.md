# Learn data (anonymous)
- `snapshot.json`: aggregate usage and feedback from Supabase. No user ids, emails or free text.
- `competitors.json`: facts from public competitor pages (structure and prices only).
Refresh the snapshot with read-only SQL on `docs` (col `feedback`; col `data/users/*` -> data->>'s' ->'best' and ->'qstat'), aggregated before saving.
