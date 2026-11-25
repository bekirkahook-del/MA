---
title: Billing Audit Bot
tags: [ma-prep, bots, money]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Billing Audit Bot

Checks that what people **paid** matches what the site **gives** them.

**File:** `tools/bots/billing.mjs`
**Inputs:** billing docs, the Pro list (`views/_pro`), Stripe subscriptions. User ids are shortened, emails never read.

## Findings
| Code | Severity | Meaning |
|---|---|---|
| PAID_NO_ACCESS | critical | Stripe is active but the site tier is free |
| PAID_NO_BILLING_DOC | critical | Subscription with no billing doc |
| ACCESS_NO_STRIPE_SUB | warn | Access with no matching subscription |
| STALE_ACTIVE | warn | Marked active but period ended 3+ days ago |
| MISSING_FROM_PRO_LIST | warn | Pro but not in the Pro list |
| STALE_PRO_LIST | warn | In the Pro list but free |

Read-only: it never grants, refunds or edits.

## Status
Built and tested on sample data. Needs a live pull of billing docs plus Stripe subscriptions.

<!-- circle:start -->
## Connections

**Feeds:** [[Dispatcher Bot]] (issues found)

**Gates:** [[Guard Bot]] (money problem = pause marketing)

```dataview-fields
feeds:: [[Dispatcher Bot]]
gates:: [[Guard Bot]]
```
<!-- circle:end -->

Back to [[Site Bots]].
