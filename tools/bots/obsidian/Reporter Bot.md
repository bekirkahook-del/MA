---
title: Reporter Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Reporter Bot

Writes the daily digest in Obsidian format (`tools/bots/state/digest.md`): what needs you, what the bots did, what is being watched, which gates are closed, and the money picture from [[Cost Guard Bot]].

It only asks "Want me to deploy? (~15 credits)" when site changes are actually queued on staging. It never deploys anything itself.

**File:** `tools/bots/circle/reporter.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Dispatcher Bot]] (issues that need a human); [[Cost Guard Bot]] (deploy budget advice); [[Retention Bot]] (dry-run counts); [[Outreach Bot]] (drafts waiting for approval); [[Verifier Bot]] (what changed and what was reverted); [[Strategist Bot]] (ranked build list); [[Changelog Bot]] (plain-English change list); [[Release Bot]] (GO or NO-GO); [[Trend Bot]] (better or worse than yesterday); [[Meta Bot]] (circle health); [[Content Brief Bot]] (the content page); [[Today List Bot]] (do today)

```dataview-fields
fed_by:: [[Dispatcher Bot]], [[Cost Guard Bot]], [[Retention Bot]], [[Outreach Bot]], [[Verifier Bot]], [[Strategist Bot]], [[Changelog Bot]], [[Release Bot]], [[Trend Bot]], [[Meta Bot]], [[Content Brief Bot]], [[Today List Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
