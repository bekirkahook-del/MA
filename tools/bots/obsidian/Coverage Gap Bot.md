---
title: Coverage Gap Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Coverage Gap Bot

Which of the 49 levels lack a lesson, number reps or a model.

**File:** `tools/bots/coverage.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Readability Bot]] (hard-to-read levels need a simpler lesson)

**Feeds:** [[Dispatcher Bot]] (issues found); [[Strategist Bot]] (levels missing lessons, reps or models)

```dataview-fields
fed_by:: [[Readability Bot]]
feeds:: [[Dispatcher Bot]], [[Strategist Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
