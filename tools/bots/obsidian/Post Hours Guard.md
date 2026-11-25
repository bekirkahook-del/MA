---
title: Post Hours Guard
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Post Hours Guard

Hard-rule check: posts planned outside 12pm-10pm ET.

**File:** `tools/bots/sfhours.mjs`

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
