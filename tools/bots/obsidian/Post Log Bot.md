---
title: Post Log Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Post Log Bot

Posts old enough to score (48h) that still have no views in the winners log: these are the numbers the whole flywheel runs on.

**File:** `tools/bots/logscore.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Metricool Followers Reader]] (real views from Metricool); [[Metricool Followers Trend]] (real views from Metricool); [[Metricool Views Reader]] (real views from Metricool); [[Metricool Views Trend]] (real views from Metricool); [[Metricool Reach Reader]] (real views from Metricool); [[Metricool Reach Trend]] (real views from Metricool); [[Metricool Likes Reader]] (real views from Metricool); [[Metricool Likes Trend]] (real views from Metricool); [[Metricool Comments Reader]] (real views from Metricool); [[Metricool Comments Trend]] (real views from Metricool); [[Metricool Shares Reader]] (real views from Metricool); [[Metricool Shares Trend]] (real views from Metricool); [[Metricool Saves Reader]] (real views from Metricool); [[Metricool Saves Trend]] (real views from Metricool); [[Metricool Posts published Reader]] (real views from Metricool); [[Metricool Posts published Trend]] (real views from Metricool); [[Metricool Profile visits Reader]] (real views from Metricool); [[Metricool Profile visits Trend]] (real views from Metricool); [[Metricool Link clicks Reader]] (real views from Metricool); [[Metricool Link clicks Trend]] (real views from Metricool)

**Feeds:** [[Dispatcher Bot]] (issues found); [[Slot Planner]] (what won, what flopped)

```dataview-fields
fed_by:: [[Metricool Followers Reader]], [[Metricool Followers Trend]], [[Metricool Views Reader]], [[Metricool Views Trend]], [[Metricool Reach Reader]], [[Metricool Reach Trend]], [[Metricool Likes Reader]], [[Metricool Likes Trend]], [[Metricool Comments Reader]], [[Metricool Comments Trend]], [[Metricool Shares Reader]], [[Metricool Shares Trend]], [[Metricool Saves Reader]], [[Metricool Saves Trend]], [[Metricool Posts published Reader]], [[Metricool Posts published Trend]], [[Metricool Profile visits Reader]], [[Metricool Profile visits Trend]], [[Metricool Link clicks Reader]], [[Metricool Link clicks Trend]]
feeds:: [[Dispatcher Bot]], [[Slot Planner]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
