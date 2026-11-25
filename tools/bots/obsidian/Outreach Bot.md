---
title: Outreach Bot
tags: [ma-prep, bots, growth]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Outreach Bot

Drafts first emails to clubs and career centers. **Drafts only: it never sends.**

**File:** `tools/bots/outreach.mjs`
**Input:** a list of `{id, name, org, role, email, kind}`. Sent log: `tools/bots/state/outreach-sent.json`.

## Rules
- Uses only the fields provided: no invented facts, numbers, quotes or experiences
- Claims nothing except "free" and what the site is
- Never guesses an email address
- Skips anyone already contacted
- Max 10 per run, 2 per organization
- Every draft has an opt-out line

## Status
Needs a target list. The earlier club outreach list lives in the M&A Website project docs.

Back to [[Site Bots]].
