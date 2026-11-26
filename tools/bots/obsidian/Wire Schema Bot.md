---
title: Wire Schema Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Wire Schema Bot

Shape check on data/wire.json (ticker, calendar, earnings, news, deals).

**File:** `tools/bots/wireschema.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Content Freshness Bot]] (bad rows before stale rows)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Content Freshness Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
