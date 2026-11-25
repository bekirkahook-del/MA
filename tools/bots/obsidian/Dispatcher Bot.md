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

**Fed by:** [[Question QA Bot]] (issues found); [[Site Health Bot]] (issues found); [[Content Freshness Bot]] (issues found); [[Cost Guard Bot]] (issues found); [[Funnel Bot]] (issues found); [[Billing Audit Bot]] (issues found); [[Superfeedbackbot]] (issues found); [[SEO Meta Bot]] (issues found); [[Sitemap Bot]] (issues found); [[Structured Data Bot]] (issues found); [[Accessibility Bot]] (issues found); [[Performance Budget Bot]] (issues found); [[Secrets and Headers Bot]] (issues found); [[Duplicate Content Bot]] (issues found); [[Readability Bot]] (issues found); [[Rep Auditor Bot]] (issues found); [[Coverage Gap Bot]] (issues found); [[Test Coverage Bot]] (issues found); [[Dead Code Bot]] (issues found); [[Internal Link Bot]] (issues found); [[Thin Content Bot]] (issues found); [[Keyword Cannibalization Bot]] (issues found); [[Typo Bot]] (issues found); [[Encoding Bot]] (issues found); [[Broken Image Bot]] (issues found); [[Redirect Bot]] (issues found); [[Feed Bot]] (issues found); [[Duplicate ID Bot]] (issues found); [[Leftover Debug Bot]] (issues found); [[Localhost Bot]] (issues found); [[External Link Bot]] (issues found); [[Install (PWA) Bot]] (issues found); [[Timeout Bot]] (issues found); [[Env Var Bot]] (issues found); [[Dependency Bot]] (issues found); [[Wire Schema Bot]] (issues found); [[Company List Bot]] (issues found); [[Privacy Bot]] (issues found); [[Pricing Consistency Bot]] (issues found); [[Claims Bot]] (issues found); [[Question Length Bot]] (issues found); [[Stale Year Bot]] (issues found); [[Explanation Quality Bot]] (issues found); [[Test Runner Bot]] (issues found); [[Drift Bot]] (issues found); [[Console Error Bot]] (issues found); [[Mobile Layout Bot]] (issues found); [[Sign-up and Sign-in Diagnostic Bot]] (issues found); [[Post Log Bot]] (issues found); [[Scoreboard Sync Bot]] (issues found); [[Idea Average Bot]] (issues found); [[Growth Rate Bot]] (issues found); [[Compounding Bot]] (issues found); [[Spike Bot]] (issues found); [[Flop Bot]] (issues found); [[Loser Watch Bot]] (issues found); [[Saturation Bot]] (issues found); [[Repost Bot]] (issues found); [[Hook Bot]] (issues found); [[Style Rotation Bot]] (issues found); [[Winner Board Bot]] (issues found); [[Experiment Bot]] (issues found); [[Promotion Bot]] (issues found); [[Retirement Bot]] (issues found); [[Final Numbers Bot]] (issues found); [[Slot Planner]] (issues found); [[Topic Backlog Bot]] (issues found); [[Question Mine Bot]] (issues found); [[Newsjack Bot]] (issues found); [[Series Queue Bot]] (issues found); [[Character Series Bot]] (issues found); [[Timing Bot]] (issues found); [[Caption Ending Bot]] (issues found); [[Hook Template Bot]] (issues found); [[Repurpose Bot]] (issues found); [[Platform Router Bot]] (issues found); [[Daily Mix Bot]] (issues found); [[Gap Day Bot]] (issues found); [[Video Streak Bot]] (issues found); [[CTA Gate]] (issues found); [[Source Gate]] (issues found); [[Render Gate]] (issues found); [[Blackout Gate]] (issues found); [[TikTok Cap Gate]] (issues found); [[Link Gate]] (issues found); [[Video Log Bot]] (issues found); [[Duplicate Post Gate]] (issues found); [[Placeholder Gate]] (issues found); [[Slide Readability Gate]] (issues found); [[Quora Cadence Bot]] (issues found); [[Quora Repeat Bot]] (issues found); [[Quora Link Rule Bot]] (issues found); [[Quora Log Bot]] (issues found); [[Directory Bot]] (issues found); [[Listing Copy Bot]] (issues found); [[Product Hunt Ready Bot]] (issues found); [[Share Card Bot]] (issues found); [[Social Link Bot]] (issues found); [[Outreach Bump Bot]] (issues found); [[Pending Outreach Bot]] (issues found); [[Deploy Planner]] (issues found); [[Staging Age Bot]] (issues found); [[Free Merge Bot]] (issues found); [[Credit Burn Bot]] (issues found); [[Home Page Guard]] (issues found); [[Calendar Freshness Bot]] (issues found); [[Earnings Freshness Bot]] (issues found); [[News Age Bot]] (issues found); [[Deals Freshness Bot]] (issues found); [[Deal Value Bot]] (issues found); [[News Quiz Bot]] (issues found); [[Ticker Gap Bot]] (issues found); [[Testimonial Slot Bot]] (issues found); [[Mailing Address Bot]] (issues found); [[Refund Window Bot]] (issues found); [[Sender Address Bot]] (issues found); [[Feedback Bot Idle Bot]] (issues found); [[Digest Age Bot]] (issues found); [[Canonical Tag Bot]] (issues found); [[Guide Share Image Bot]] (issues found); [[Answer Position Bot]] (issues found)

**Gated by:** [[Guard Bot]] (frozen issues go straight to a human)

**Directs:** [[Fixer Bot]] (safe, fixable issues)

**Feeds:** [[Reporter Bot]] (issues that need a human); [[Strategist Bot]] (open issues with evidence); [[Release Bot]] (open critical issues); [[Trend Bot]] (open issue counts); [[Meta Bot]] (the ledger to audit); [[Today List Bot]] (open issues)

```dataview-fields
fed_by:: [[Question QA Bot]], [[Site Health Bot]], [[Content Freshness Bot]], [[Cost Guard Bot]], [[Funnel Bot]], [[Billing Audit Bot]], [[Superfeedbackbot]], [[SEO Meta Bot]], [[Sitemap Bot]], [[Structured Data Bot]], [[Accessibility Bot]], [[Performance Budget Bot]], [[Secrets and Headers Bot]], [[Duplicate Content Bot]], [[Readability Bot]], [[Rep Auditor Bot]], [[Coverage Gap Bot]], [[Test Coverage Bot]], [[Dead Code Bot]], [[Internal Link Bot]], [[Thin Content Bot]], [[Keyword Cannibalization Bot]], [[Typo Bot]], [[Encoding Bot]], [[Broken Image Bot]], [[Redirect Bot]], [[Feed Bot]], [[Duplicate ID Bot]], [[Leftover Debug Bot]], [[Localhost Bot]], [[External Link Bot]], [[Install (PWA) Bot]], [[Timeout Bot]], [[Env Var Bot]], [[Dependency Bot]], [[Wire Schema Bot]], [[Company List Bot]], [[Privacy Bot]], [[Pricing Consistency Bot]], [[Claims Bot]], [[Question Length Bot]], [[Stale Year Bot]], [[Explanation Quality Bot]], [[Test Runner Bot]], [[Drift Bot]], [[Console Error Bot]], [[Mobile Layout Bot]], [[Sign-up and Sign-in Diagnostic Bot]], [[Post Log Bot]], [[Scoreboard Sync Bot]], [[Idea Average Bot]], [[Growth Rate Bot]], [[Compounding Bot]], [[Spike Bot]], [[Flop Bot]], [[Loser Watch Bot]], [[Saturation Bot]], [[Repost Bot]], [[Hook Bot]], [[Style Rotation Bot]], [[Winner Board Bot]], [[Experiment Bot]], [[Promotion Bot]], [[Retirement Bot]], [[Final Numbers Bot]], [[Slot Planner]], [[Topic Backlog Bot]], [[Question Mine Bot]], [[Newsjack Bot]], [[Series Queue Bot]], [[Character Series Bot]], [[Timing Bot]], [[Caption Ending Bot]], [[Hook Template Bot]], [[Repurpose Bot]], [[Platform Router Bot]], [[Daily Mix Bot]], [[Gap Day Bot]], [[Video Streak Bot]], [[CTA Gate]], [[Source Gate]], [[Render Gate]], [[Blackout Gate]], [[TikTok Cap Gate]], [[Link Gate]], [[Video Log Bot]], [[Duplicate Post Gate]], [[Placeholder Gate]], [[Slide Readability Gate]], [[Quora Cadence Bot]], [[Quora Repeat Bot]], [[Quora Link Rule Bot]], [[Quora Log Bot]], [[Directory Bot]], [[Listing Copy Bot]], [[Product Hunt Ready Bot]], [[Share Card Bot]], [[Social Link Bot]], [[Outreach Bump Bot]], [[Pending Outreach Bot]], [[Deploy Planner]], [[Staging Age Bot]], [[Free Merge Bot]], [[Credit Burn Bot]], [[Home Page Guard]], [[Calendar Freshness Bot]], [[Earnings Freshness Bot]], [[News Age Bot]], [[Deals Freshness Bot]], [[Deal Value Bot]], [[News Quiz Bot]], [[Ticker Gap Bot]], [[Testimonial Slot Bot]], [[Mailing Address Bot]], [[Refund Window Bot]], [[Sender Address Bot]], [[Feedback Bot Idle Bot]], [[Digest Age Bot]], [[Canonical Tag Bot]], [[Guide Share Image Bot]], [[Answer Position Bot]]
gated_by:: [[Guard Bot]]
directs:: [[Fixer Bot]]
feeds:: [[Reporter Bot]], [[Strategist Bot]], [[Release Bot]], [[Trend Bot]], [[Meta Bot]], [[Today List Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
