---
title: Quora Mute Guard
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Quora Mute Guard

Hard-rule check: any Quora task that is still queued although Quora is dropped.

**File:** `tools/bots/sfquoramuted.mjs`

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
