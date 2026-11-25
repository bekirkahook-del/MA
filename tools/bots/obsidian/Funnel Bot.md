---
title: Funnel Bot
tags: [ma-prep, bots, growth]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Funnel Bot

Shows where visitors drop: Visited, Started a level, Cleared a level, Saw sign-up, Signed up. Also side funnels (guide CTA, sign-up bar, poll, install, review ask) and traffic sources.

**File:** `tools/bots/funnel.mjs`
**Get the data (read-only SQL):**
`select id, data->'ev' as ev from docs where col='visits' and id >= '2026-11-01'`
**Run:** `node tools/bots/run.mjs funnel rows.json`

## Honesty rule
Under **100 visitors** the report says "too few to conclude" and tells you not to change anything based on it.

## Status
Built and tested on sample data. Not run on live rows yet.

Back to [[Site Bots]].
