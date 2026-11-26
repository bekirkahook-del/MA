---
title: Meta Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Meta Bot

Audits the circle itself: stale issues, idle sensors, demoted fixers, missing bot files.

**File:** `tools/bots/meta.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Dispatcher Bot]] (the ledger to audit)

**Feeds:** [[Reporter Bot]] (circle health)

```dataview-fields
fed_by:: [[Dispatcher Bot]]
feeds:: [[Reporter Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
