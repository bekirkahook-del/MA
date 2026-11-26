---
title: Fixer Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Fixer Bot

The only bot that changes files, and it only knows a short list of safe fixes. Everything else becomes a "packet" (what, where, suggested next step) for a human or a Claude session.

## Fixes it can make
| Fix | What it does |
|---|---|
| `wire-past-rows` | Removes past calendar and earnings rows from `data/wire.json` |
| `text-glitch` | Fixes double spaces, space before comma, repeated words inside one question's text |

## How it works
1. [[Guard Bot]] approves the run
2. Apply the patch
3. Guard checks the files that actually changed
4. [[Verifier Bot]] re-checks, then the Fixer commits (or the patch is reverted)

It never pushes and never deploys. Commits are local on a non-main branch, and you decide what goes live.

## Honest limit
Most real problems (the 164 length giveaways, stale guides, the guide-page funnel leak) need judgment, so they go to a human, not the Fixer.

**File:** `tools/bots/circle/fixer.mjs`

<!-- circle:start -->
## Connections

**Directed by:** [[Dispatcher Bot]] (safe, fixable issues)

**Gated by:** [[Guard Bot]] (allow or block every patch)

**Feeds:** [[Verifier Bot]] (patch to check)

```dataview-fields
directed_by:: [[Dispatcher Bot]]
gated_by:: [[Guard Bot]]
feeds:: [[Verifier Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
