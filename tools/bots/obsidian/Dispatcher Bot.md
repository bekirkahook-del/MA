---
title: Dispatcher Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Dispatcher Bot

Takes every finding from every sensor (already deduped in the shared ledger), scores its priority, and decides who handles it: the [[Fixer Bot]] for safe fixes, a human for anything that needs judgment, or "watch" for low-severity items. It never changes anything itself.

## Priority
Critical = 300, warn = 200, info = 100. Plus 20 per reopening, 3 per day open (max 30), and 25 if a defect is verified.

## Routing rules
| Situation | Goes to |
|---|---|
| Has a safe fix and the fix type is still trusted | Fixer |
| Fix already failed twice | Human |
| Fix type was demoted by the [[Historian Bot]] | Human |
| Came back 3 times (frozen) | Human |
| No safe fix, severity info | Watch |
| No safe fix, severity warn or critical | Human |

**File:** `tools/bots/circle/dispatcher.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Question QA Bot]] (issues found); [[Site Health Bot]] (issues found); [[Content Freshness Bot]] (issues found); [[Cost Guard Bot]] (issues found); [[Funnel Bot]] (issues found); [[Billing Audit Bot]] (issues found); [[Superfeedbackbot]] (issues found); [[SEO Meta Bot]] (issues found); [[Sitemap Bot]] (issues found); [[Structured Data Bot]] (issues found); [[Accessibility Bot]] (issues found); [[Performance Budget Bot]] (issues found); [[Secrets and Headers Bot]] (issues found); [[Duplicate Content Bot]] (issues found); [[Readability Bot]] (issues found); [[Rep Auditor Bot]] (issues found); [[Coverage Gap Bot]] (issues found); [[Test Coverage Bot]] (issues found); [[Dead Code Bot]] (issues found)

**Gated by:** [[Guard Bot]] (frozen issues go straight to a human)

**Directs:** [[Fixer Bot]] (safe, fixable issues)

**Feeds:** [[Reporter Bot]] (issues that need a human); [[Strategist Bot]] (open issues with evidence); [[Release Bot]] (open critical issues)

```dataview-fields
fed_by:: [[Question QA Bot]], [[Site Health Bot]], [[Content Freshness Bot]], [[Cost Guard Bot]], [[Funnel Bot]], [[Billing Audit Bot]], [[Superfeedbackbot]], [[SEO Meta Bot]], [[Sitemap Bot]], [[Structured Data Bot]], [[Accessibility Bot]], [[Performance Budget Bot]], [[Secrets and Headers Bot]], [[Duplicate Content Bot]], [[Readability Bot]], [[Rep Auditor Bot]], [[Coverage Gap Bot]], [[Test Coverage Bot]], [[Dead Code Bot]]
gated_by:: [[Guard Bot]]
directs:: [[Fixer Bot]]
feeds:: [[Reporter Bot]], [[Strategist Bot]], [[Release Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
