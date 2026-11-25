---
title: Rep Auditor Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Rep Auditor Bot

Runs every practice-problem generator 300 times and checks each problem is sane.

**File:** `tools/bots/reps.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Question QA Bot]] (wrong practice answers are verified defects too)

**Gates:** [[Release Bot]] (a broken practice problem blocks a release)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Question QA Bot]]
gates:: [[Release Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
