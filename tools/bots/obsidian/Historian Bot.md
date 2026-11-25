---
title: Historian Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Historian Bot

Keeps a record of how each fix type has gone (`state/circle-history.json`). If a fix type has been reverted 2 or more times (and more often than it has worked), it loses the right to run on its own and the [[Guard Bot]] and [[Dispatcher Bot]] send it to a human instead.

This is the circle's way of learning: a bot that keeps failing gets demoted automatically, and a human decides whether to trust it again.

**File:** `tools/bots/circle/historian.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Verifier Bot]] (worked or reverted)

**Teaches:** [[Guard Bot]] (demote fix types that keep failing)

```dataview-fields
fed_by:: [[Verifier Bot]]
teaches:: [[Guard Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
