---
title: Readability Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Readability Bot

Reading grade level of lessons and guides.

**File:** `tools/bots/readability.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Typo Bot]] (typos hurt trust and readability); [[Encoding Bot]] (garbled text is unreadable)

**Feeds:** [[Dispatcher Bot]] (issues found); [[Coverage Gap Bot]] (hard-to-read levels need a simpler lesson)

```dataview-fields
fed_by:: [[Typo Bot]], [[Encoding Bot]]
feeds:: [[Dispatcher Bot]], [[Coverage Gap Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
