---
title: Service Worker Fixer
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Service Worker Fixer

Finds service worker cache version older than the last site change and writes the exact fix. Proposals only.

**File:** `tools/bots/fxswver.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Today List Bot]] (exact fix text)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Today List Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
