---
title: Duplicate Post Gate
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Duplicate Post Gate

Topics repeated inside 30 days. Your rule: never repeat a topic unless it was a top-3 performer, and then make a sequel.

**File:** `tools/bots/dupegate.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found)

**Gates:** [[Content Brief Bot]] (fix before posting)

```dataview-fields
feeds:: [[Dispatcher Bot]]
gates:: [[Content Brief Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
