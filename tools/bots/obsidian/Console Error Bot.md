---
title: Console Error Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Console Error Bot

Opens the real site in a headless browser and records JavaScript errors.

**File:** `tools/bots/consoleerrors.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Site Health Bot]] (script errors are health problems)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Site Health Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
