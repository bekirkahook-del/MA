---
title: Retention Bot
tags: [ma-prep, bots, growth]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Retention Bot

Plans "you have N things to review" reminders for people with spaced-review items due. **Dry run only: it never sends.**

**File:** `tools/bots/retention.mjs`
**Relation to existing code:** `engage-mail.mjs` already sends opt-in streak and friend emails. This is a *new* email type.

## Rules
- Only people with `review: true` (a new opt-in)
- 1 email per person per 3 days, max 50 per run
- Needs 3+ items due

## Blocker
Nobody can opt in yet. A new checkbox is needed where streak emails are set (Home page). **Home page changes need Bekir's OK**, so the bot only counts people until then.

<!-- circle:start -->
## Connections

**Gated by:** [[Guard Bot]] (runs only when health and billing are clean)

**Feeds:** [[Reporter Bot]] (dry-run counts)

```dataview-fields
gated_by:: [[Guard Bot]]
feeds:: [[Reporter Bot]]
```
<!-- circle:end -->

Back to [[Site Bots]].
