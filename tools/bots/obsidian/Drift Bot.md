---
title: Drift Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Drift Bot

How far staging is from main and whether merging would conflict.

**File:** `tools/bots/drift.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Changelog Bot]] (what main has that staging lacks)

**Gates:** [[Release Bot]] (a merge conflict blocks a deploy)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Changelog Bot]]
gates:: [[Release Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
