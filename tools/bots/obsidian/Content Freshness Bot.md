---
title: Content Freshness Bot
tags: [ma-prep, bots, content]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Content Freshness Bot

**File:** `tools/bots/freshness.mjs`
**Run:** `node tools/bots/run.mjs freshness`

## Checks
| Item | Limit |
|---|---|
| Wire feed updated | 1.5 days |
| Ticker prices | 4 days |
| News | 3 days |
| Deals | 10 days |
| Application openings | 14 days |
| Past calendar and earnings rows | any |
| Guides mentioning old years near recruiting words | any |
| "Updated" dates older than | 180 days |

## First run (Nov 25)
1,121 guides checked: **212 warnings, 56 info.** Most are guides that mention 2022 to 2024 near recruiting words. Those are leads to check, not proof they are wrong.

Back to [[Site Bots]].
