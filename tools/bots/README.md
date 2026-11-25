# Site bots
Run: `node tools/bots/run.mjs <qa|health|funnel|retention|freshness|cost|billing|outreach|dump> [args]`. Notes for each bot are in `obsidian/` (Site Bots.md is the hub).
All read-only. Nothing deploys, sends, deletes or edits the live site. Fixes go to `staging` only. Tests: `tests/bots.test.mjs`.

## The circle
`node tools/bots/run.mjs circle` runs every bot in dependency order (plan mode: changes nothing). `--act` lets the Fixer apply safe fixes on a non-main branch. Never pushes, never deploys. Dependency graph: `circle/graph.mjs`. Obsidian notes are generated from it: `node tools/bots/obsidian/build.mjs`.
