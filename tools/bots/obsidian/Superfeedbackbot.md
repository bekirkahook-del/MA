---
title: Superfeedbackbot
tags: [ma-prep, bots, feedback]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Superfeedbackbot

Reads user feedback, checks whether each complaint is real (the detective), scores it with a rubric, and only changes the site when enough independent people agree.

**Files:** `tools/feedbot/triage.mjs`, `RULES.md`, `RUN.md`, `state.json`, `LOG.md`
**Run:** `node tools/feedbot/triage.mjs rows.json`

## Rubric (100 points)
| Part | Max | How |
|---|---|---|
| Corroboration | 40 | 20 per independent user (anonymous counts half, capped at 1) |
| Evidence | 40 | What the detective verifies in the code |
| Reach | 20 | Signed-in reporter, live learner-facing item |

Fix needs **60+ AND consensus** (2+ independent users, or one report plus a verified defect). Polls need 5+ votes and a 40% share. Coaching requests always go to Bekir.

## Guardrails
Quarantines instruction-like text, links and spam. Drops emails and user agents. Never touches Home, pricing, auth or billing.

## First run (Nov 25)
3 rows, 0 fixes. The "non-target school" question was flagged "Too easy" by 1 signed-in user: verdict **watch** (3 of 3 wrong options read as obviously wrong, but no consensus).

## Bug found and fixed
The duplicate-option check treated "+$20" and "−$20" as the same answer, which would have counted as a *verified defect*. Now plain-text equality only, with regression tests.

<!-- circle:start -->
## Connections

**Fed by:** [[Question QA Bot]] (verified defects count as hard evidence)

**Feeds:** [[Dispatcher Bot]] (issues found); [[Strategist Bot]] (what users ask for)

```dataview-fields
fed_by:: [[Question QA Bot]]
feeds:: [[Dispatcher Bot]], [[Strategist Bot]]
```
<!-- circle:end -->

Back to [[Site Bots]].
