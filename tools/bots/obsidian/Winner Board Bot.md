---
title: Winner Board Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Winner Board Bot

Rebuilds the idea ranking from the log and says when the 'Idea types ranked' table in winners.md is out of date.

**File:** `tools/bots/winnerboard.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Slot Planner]] (what won, what flopped)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Slot Planner]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
