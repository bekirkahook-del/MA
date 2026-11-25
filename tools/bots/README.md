# Site bots
Run: `node tools/bots/run.mjs <qa|health|funnel|retention|freshness|cost|billing|outreach|dump> [args]`. Notes for each bot are in `obsidian/` (Site Bots.md is the hub).
All read-only. Nothing deploys, sends, deletes or edits the live site. Fixes go to `staging` only. Tests: `tests/bots.test.mjs`.
