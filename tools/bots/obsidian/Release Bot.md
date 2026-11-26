---
title: Release Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Release Bot

A GO / CAUTION / NO-GO check before Bekir says "deploy". It reads the same ledger as the digest, so the two always agree. It only advises. It never deploys.

## Verdict rules
| Situation | Verdict |
|---|---|
| Nothing waiting on staging | NOTHING TO SHIP |
| Tests failing | NO-GO |
| Open critical issue from health, reps, secrets, sitemap, schema, billing or a crashed bot | NO-GO |
| A verified wrong answer from the [[Question QA Bot]] | NO-GO |
| Tests not run, warnings from a11y/seo/perf, or under 5 deploys left this month | CAUTION |
| Everything else | GO |

The batch's cost comes from the [[Changelog Bot]]: a batch that only touches bots, tests, social or notes is free.

**File:** `tools/bots/release.mjs`

<!-- circle:start -->
## Connections

**Gated by:** [[Rep Auditor Bot]] (a broken practice problem blocks a release); [[Guard Bot]] (kill switch blocks a GO); [[Sign-up and Sign-in Diagnostic Bot]] (broken sign-up blocks a release); [[Drift Bot]] (a merge conflict blocks a deploy)

**Fed by:** [[Changelog Bot]] (what would ship); [[Dispatcher Bot]] (open critical issues); [[Cost Guard Bot]] (deploy credits left); [[Test Runner Bot]] (tests passed or failed)

**Feeds:** [[Reporter Bot]] (GO or NO-GO)

```dataview-fields
gated_by:: [[Rep Auditor Bot]], [[Guard Bot]], [[Sign-up and Sign-in Diagnostic Bot]], [[Drift Bot]]
fed_by:: [[Changelog Bot]], [[Dispatcher Bot]], [[Cost Guard Bot]], [[Test Runner Bot]]
feeds:: [[Reporter Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
