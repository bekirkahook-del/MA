---
title: Metricool Puller
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Metricool Puller

Checks the Metricool numbers file exists and is fresh; the scheduled task fills it.

**File:** `tools/bots/grmetri.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (grow issues); [[Today List Bot]] (grow to do)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Today List Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
