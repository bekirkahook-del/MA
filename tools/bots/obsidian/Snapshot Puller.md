---
title: Snapshot Puller
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Snapshot Puller

Warns when the usage snapshot is over a day old. The daily scheduled task refreshes it with the read-only SQL in state/learn/refresh.sql.

**File:** `tools/bots/grsnap.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (grow issues); [[Today List Bot]] (grow to do)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Today List Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
