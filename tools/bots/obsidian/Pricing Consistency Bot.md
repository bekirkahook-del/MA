---
title: Pricing Consistency Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Pricing Consistency Bot

The same plan must show the same price everywhere.

**File:** `tools/bots/pricing.mjs`

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found); [[Billing Audit Bot]] (price text must match Stripe)

```dataview-fields
feeds:: [[Dispatcher Bot]], [[Billing Audit Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
