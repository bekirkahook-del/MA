---
title: Guard Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Guard Bot

Every action in the circle goes through here. The Guard can say no to the [[Fixer Bot]], and it can switch off the drafting bots.

## It blocks when
- the file `tools/bots/STOP` exists (kill switch: create it to freeze everything)
- the branch is `main` (the circle only acts on staging or a working branch)
- site health is critical (no patching a broken site)
- 5 fixes were already made this run
- the patch touches a protected file: `index.html` (Home), `netlify.toml`, `netlify/functions/*`, `supabase/*`, `js/auth.js`, `js/backend.js`, `js/rewards.js`, `js/gate.js`, `js/pro-plus.js`, `js/checklist.js`, `js/grow.js`, `CLAUDE.md`, `tools/deploy.sh`
- an issue was already tried twice, or came back 3 times

## Marketing gate
A critical billing problem or a critical health problem **pauses** [[Retention Bot]] and [[Outreach Bot]]. The reasoning: don't pull more people into a site that is broken or mis-charging.

**File:** `tools/bots/circle/guard.mjs`

<!-- circle:start -->
## Connections

**Gated by:** [[Site Health Bot]] (site broken = freeze all fixes); [[Billing Audit Bot]] (money problem = pause marketing)

**Taught by:** [[Historian Bot]] (demote fix types that keep failing)

**Gates:** [[Fixer Bot]] (allow or block every patch); [[Retention Bot]] (runs only when health and billing are clean); [[Outreach Bot]] (runs only when health and billing are clean); [[Dispatcher Bot]] (frozen issues go straight to a human)

```dataview-fields
gated_by:: [[Site Health Bot]], [[Billing Audit Bot]]
taught_by:: [[Historian Bot]]
gates:: [[Fixer Bot]], [[Retention Bot]], [[Outreach Bot]], [[Dispatcher Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
