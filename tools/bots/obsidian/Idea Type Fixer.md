---
title: Idea Type Fixer
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Idea Type Fixer

Finds post-log rows whose idea type matches no family and writes the exact fix. Proposals only.

**File:** `tools/bots/fxfamily.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Today List Bot]] (exact fix text)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Today List Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
