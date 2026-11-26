---
title: Timing Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Timing Bot

Post times for tomorrow, spaced at least 2 hours apart between 12pm and 10pm ET, with a small daily jitter so the schedule does not look robotic.

**File:** `tools/bots/timing.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Content Brief Bot]] (tomorrow's plan)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Content Brief Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
