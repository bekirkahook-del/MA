---
title: Daily Email Cap Guard
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Daily Email Cap Guard

Hard-rule check: more than 9 new emails in one day.

**File:** `tools/bots/sfdaycap.mjs`

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
