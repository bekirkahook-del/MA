---
title: Explanation Quality Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Explanation Quality Bot

Explanations that are too short or only repeat the answer.

**File:** `tools/bots/explain.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Question QA Bot]] (weak explanations teach nothing)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Question QA Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
