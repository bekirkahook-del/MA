---
title: Duplicate Email Guard
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Duplicate Email Guard

Hard-rule check: the same address or organization appearing twice in the sent log.

**File:** `tools/bots/sfdupeemail.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found)

**Gates:** [[Content Brief Bot]] (hard-rule check)

```dataview-fields
feeds:: [[Dispatcher Bot]]
gates:: [[Content Brief Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
