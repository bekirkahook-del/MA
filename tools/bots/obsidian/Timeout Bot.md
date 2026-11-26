---
title: Timeout Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Timeout Bot

Netlify functions that call outside services with no timeout (10 second limit).

**File:** `tools/bots/timeouts.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Site Health Bot]] (slow partners break functions)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Site Health Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
