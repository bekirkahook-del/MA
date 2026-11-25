---
title: Sign-up and Sign-in Diagnostic Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Sign-up and Sign-in Diagnostic Bot

Funnel, code, Supabase settings and the live form for the account flow. Never signs in or submits anything.

**File:** `tools/bots/authdiag.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Funnel Bot]] (sign-up funnel events)

**Feeds:** [[Dispatcher Bot]] (issues found); [[Strategist Bot]] (where the account flow leaks)

**Gates:** [[Release Bot]] (broken sign-up blocks a release)

```dataview-fields
fed_by:: [[Funnel Bot]]
feeds:: [[Dispatcher Bot]], [[Strategist Bot]]
gates:: [[Release Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
