---
title: Secrets and Headers Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Secrets and Headers Bot

Live keys committed to the repo (never prints them) and missing security headers.

**File:** `tools/bots/secrets.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Env Var Bot]] (which secrets the code reads); [[Dependency Bot]] (vulnerable dependencies); [[Privacy Bot]] (public personal data)

**Feeds:** [[Dispatcher Bot]] (issues found)

**Gates:** [[Guard Bot]] (leaked key = freeze all fixes)

```dataview-fields
fed_by:: [[Env Var Bot]], [[Dependency Bot]], [[Privacy Bot]]
feeds:: [[Dispatcher Bot]]
gates:: [[Guard Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
