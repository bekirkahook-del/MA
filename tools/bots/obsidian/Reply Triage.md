---
title: Reply Triage
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Reply Triage

Sorts email replies (opt-out, interest, question, decline, auto) from state/learn/replies.json and finds opt-outs not yet on the suppression list.

**File:** `tools/bots/grreply.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (grow issues); [[Today List Bot]] (grow to do)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Today List Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
