---
title: Question QA Bot
tags: [ma-prep, bots, quality]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Question QA Bot

Runs the detective on **every** question, not just flagged ones.

**File:** `tools/bots/qa.mjs`
**Run:** `node tools/bots/run.mjs dump out.json` then `node tools/bots/run.mjs qa out.json`

## Checks
| Check | Kind |
|---|---|
| Answer key not in options | verified |
| Two identical options | verified |
| Lessons support another answer | verified |
| No explanation (under 12 chars) | verified |
| Fewer than 3 options | verified |
| Obviously wrong distractors | heuristic |
| Keyed answer is the longest (20+ chars, 1.5x median) | heuristic |
| Duplicate question across tracks | heuristic |
| Answer in the same slot over 45% of a track | heuristic |

## First run (Nov 25), 1,248 questions
| Finding | Count |
|---|---|
| Verified wrong or broken | **0** |
| Longest-answer giveaway | 164 (13%) |
| Obviously wrong distractors | 79 |
| Duplicate questions | 8 |
| Text glitches | 12 |
| Answer-slot skew (tracks) | 3 |

**Takeaway:** the answers are right. The weakness is that a student can score by picking the longest option on about 1 in 8 questions.

<!-- circle:start -->
## Connections

**Rechecked by:** [[Verifier Bot]] (re-run after a question fix)

**Fed by:** [[Rep Auditor Bot]] (wrong practice answers are verified defects too)

**Feeds:** [[Dispatcher Bot]] (issues found); [[Superfeedbackbot]] (verified defects count as hard evidence)

```dataview-fields
rechecked_by:: [[Verifier Bot]]
fed_by:: [[Rep Auditor Bot]]
feeds:: [[Dispatcher Bot]], [[Superfeedbackbot]]
```
<!-- circle:end -->

Back to [[Site Bots]].
