---
title: Cost Guard Bot
tags: [ma-prep, bots, money]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Cost Guard Bot

**File:** `tools/bots/cost.mjs`
**Run:** `node tools/bots/run.mjs cost [ai.json]`

## Watches
- Netlify credits: 15 per production deploy, 1,000 per month. Warn at 50%, critical at 80%.
- AI usage vs tier limits (free 3, trial 20, season 40, pro 100, club 15 per day).
- Free users who hit the wall = upsell leads.

## First run (Nov 25)
| Item | Value |
|---|---|
| Deploys this month | 13 |
| Credits used | 195 (20%) |
| Projected month end | 234 |
| Deploys left | 53 |

Status: fine. If Netlify shows a different number, pass `--credits-used N`.

Back to [[Site Bots]].
