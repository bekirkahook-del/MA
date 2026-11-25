---
title: Test Runner Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Test Runner Bot

Runs the whole test suite. The Release Bot uses its answer.

**File:** `tools/bots/testrunner.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Release Bot]] (tests passed or failed)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Release Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
