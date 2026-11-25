---
title: Strategist Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Strategist Bot

Ranks what to build next. Every line cites the evidence from another bot (funnel drop-offs weigh double, then severity, then how many users, pages or levels it touches). It never invents an impact number: the score is a rank, not a forecast. Feeds the "Build next" section of the digest.

**File:** `tools/bots/strategist.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Coverage Gap Bot]] (levels missing lessons, reps or models); [[Funnel Bot]] (where visitors leave); [[Dispatcher Bot]] (open issues with evidence); [[Superfeedbackbot]] (what users ask for)

**Feeds:** [[Reporter Bot]] (ranked build list)

```dataview-fields
fed_by:: [[Coverage Gap Bot]], [[Funnel Bot]], [[Dispatcher Bot]], [[Superfeedbackbot]]
feeds:: [[Reporter Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
