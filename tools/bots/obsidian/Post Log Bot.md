---
title: Post Log Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Post Log Bot

Posts old enough to score (48h) that still have no views in the winners log: these are the numbers the whole flywheel runs on.

**File:** `tools/bots/logscore.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Slot Planner]] (what won, what flopped)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Slot Planner]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
