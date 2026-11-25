---
title: The Circle
tags: [ma-prep, bots, circle, hub]
created: 2026-11-25
project: M&A Prep
circle_role: overview
status: built, not scheduled
---

# The Circle

The bots are not independent. Each one's output is another one's input, and a few can stop others. That is what makes it a circle instead of eight scripts.

```mermaid
flowchart LR
  subgraph SENSE[Sensors]
    qa["Question QA Bot"]
    health["Site Health Bot"]
    freshness["Content Freshness Bot"]
    cost["Cost Guard Bot"]
    funnel["Funnel Bot"]
    billing["Billing Audit Bot"]
    feedbot["Superfeedbackbot"]
    seo["SEO Meta Bot"]
    sitemap["Sitemap Bot"]
    schema["Structured Data Bot"]
    a11y["Accessibility Bot"]
    perf["Performance Budget Bot"]
    secrets["Secrets and Headers Bot"]
    duplicate["Duplicate Content Bot"]
    readability["Readability Bot"]
    reps["Rep Auditor Bot"]
    coverage["Coverage Gap Bot"]
    testcov["Test Coverage Bot"]
    deadcode["Dead Code Bot"]
  end
  subgraph CIRCLE[The Circle]
    dispatcher["Dispatcher Bot"]
    guard["Guard Bot"]
    fixer["Fixer Bot"]
    verifier["Verifier Bot"]
    historian["Historian Bot"]
    reporter["Reporter Bot"]
    changelog["Changelog Bot"]
    release["Release Bot"]
    strategist["Strategist Bot"]
  end
  subgraph DRAFT[Drafters - never send]
    retention["Retention Bot"]
    outreach["Outreach Bot"]
  end
  H((Bekir))
  qa -->|issues found| dispatcher
  health -->|issues found| dispatcher
  freshness -->|issues found| dispatcher
  cost -->|issues found| dispatcher
  funnel -->|issues found| dispatcher
  billing -->|issues found| dispatcher
  feedbot -->|issues found| dispatcher
  qa -->|verified defects count as hard evidence| feedbot
  dispatcher ==>|safe, fixable issues| fixer
  dispatcher -->|issues that need a human| reporter
  guard -.->|allow or block every patch| fixer
  health -.->|site broken = freeze all fixes| guard
  billing -.->|money problem = pause marketing| guard
  guard -.->|runs only when health and billing are clean| retention
  guard -.->|runs only when health and billing are clean| outreach
  fixer -->|patch to check| verifier
  verifier -->|re-run after a question fix| qa
  verifier -->|re-run after a data fix| freshness
  verifier -->|worked or reverted| historian
  historian -.->|demote fix types that keep failing| guard
  guard -.->|frozen issues go straight to a human| dispatcher
  cost -->|deploy budget advice| reporter
  retention -->|dry-run counts| reporter
  outreach -->|drafts waiting for approval| reporter
  verifier -->|what changed and what was reverted| reporter
  seo -->|issues found| dispatcher
  sitemap -->|issues found| dispatcher
  schema -->|issues found| dispatcher
  a11y -->|issues found| dispatcher
  perf -->|issues found| dispatcher
  secrets -->|issues found| dispatcher
  duplicate -->|issues found| dispatcher
  readability -->|issues found| dispatcher
  reps -->|issues found| dispatcher
  coverage -->|issues found| dispatcher
  testcov -->|issues found| dispatcher
  deadcode -->|issues found| dispatcher
  secrets -.->|leaked key = freeze all fixes| guard
  reps -.->|a broken practice problem blocks a release| release
  reps -->|wrong practice answers are verified defects too| qa
  duplicate -->|duplicate pages explain weak rankings| seo
  sitemap -->|pages missing from the sitemap are not indexed| seo
  deadcode -->|unreferenced code needs no test| testcov
  readability -->|hard-to-read levels need a simpler lesson| coverage
  coverage -->|levels missing lessons, reps or models| strategist
  funnel -->|where visitors leave| strategist
  dispatcher -->|open issues with evidence| strategist
  feedbot -->|what users ask for| strategist
  strategist -->|ranked build list| reporter
  verifier -->|bot fix commits join the staging queue| changelog
  changelog -->|what would ship| release
  changelog -->|plain-English change list| reporter
  dispatcher -->|open critical issues| release
  cost -->|deploy credits left| release
  release -->|GO or NO-GO| reporter
  guard -.->|kill switch blocks a GO| release
  reporter ==>|digest and deploy question| H
```

## One run, in order
1. [[Site Health Bot]] and [[Billing Audit Bot]] run first, because they can close gates.
2. [[Question QA Bot]], [[Content Freshness Bot]], [[Cost Guard Bot]] and [[Funnel Bot]] run.
3. [[Superfeedbackbot]] runs **after** QA, so a defect QA verified counts as hard evidence for a user report.
4. Every finding goes into one shared ledger (deduped, with history).
5. [[Guard Bot]] decides whether [[Retention Bot]] and [[Outreach Bot]] may run.
6. [[Dispatcher Bot]] ranks the issues and routes them.
7. In act mode only: [[Fixer Bot]] patches, [[Verifier Bot]] re-checks, and the patch is committed or reverted. [[Historian Bot]] records the result.
8. [[Reporter Bot]] writes the digest.

## Loop protection
- An issue that comes back 3 times is **frozen** and sent to a human.
- A fix is tried at most twice.
- A fix type that keeps getting reverted is demoted by the [[Historian Bot]].
- A sensor that crashes becomes a critical issue instead of silently disappearing: the circle watches itself.

## Who depends on whom
| From | Type | To | Why |
|---|---|---|---|
| [[Question QA Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Site Health Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Content Freshness Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Cost Guard Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Funnel Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Billing Audit Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Superfeedbackbot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Question QA Bot]] | feed | [[Superfeedbackbot]] | verified defects count as hard evidence |
| [[Dispatcher Bot]] | act | [[Fixer Bot]] | safe, fixable issues |
| [[Dispatcher Bot]] | feed | [[Reporter Bot]] | issues that need a human |
| [[Guard Bot]] | gate | [[Fixer Bot]] | allow or block every patch |
| [[Site Health Bot]] | gate | [[Guard Bot]] | site broken = freeze all fixes |
| [[Billing Audit Bot]] | gate | [[Guard Bot]] | money problem = pause marketing |
| [[Guard Bot]] | gate | [[Retention Bot]] | runs only when health and billing are clean |
| [[Guard Bot]] | gate | [[Outreach Bot]] | runs only when health and billing are clean |
| [[Fixer Bot]] | feed | [[Verifier Bot]] | patch to check |
| [[Verifier Bot]] | recheck | [[Question QA Bot]] | re-run after a question fix |
| [[Verifier Bot]] | recheck | [[Content Freshness Bot]] | re-run after a data fix |
| [[Verifier Bot]] | feed | [[Historian Bot]] | worked or reverted |
| [[Historian Bot]] | learn | [[Guard Bot]] | demote fix types that keep failing |
| [[Guard Bot]] | gate | [[Dispatcher Bot]] | frozen issues go straight to a human |
| [[Cost Guard Bot]] | feed | [[Reporter Bot]] | deploy budget advice |
| [[Retention Bot]] | feed | [[Reporter Bot]] | dry-run counts |
| [[Outreach Bot]] | feed | [[Reporter Bot]] | drafts waiting for approval |
| [[Verifier Bot]] | feed | [[Reporter Bot]] | what changed and what was reverted |
| [[SEO Meta Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Sitemap Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Structured Data Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Accessibility Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Performance Budget Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Secrets and Headers Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Duplicate Content Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Readability Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Rep Auditor Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Coverage Gap Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Test Coverage Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Dead Code Bot]] | feed | [[Dispatcher Bot]] | issues found |
| [[Secrets and Headers Bot]] | gate | [[Guard Bot]] | leaked key = freeze all fixes |
| [[Rep Auditor Bot]] | gate | [[Release Bot]] | a broken practice problem blocks a release |
| [[Rep Auditor Bot]] | feed | [[Question QA Bot]] | wrong practice answers are verified defects too |
| [[Duplicate Content Bot]] | feed | [[SEO Meta Bot]] | duplicate pages explain weak rankings |
| [[Sitemap Bot]] | feed | [[SEO Meta Bot]] | pages missing from the sitemap are not indexed |
| [[Dead Code Bot]] | feed | [[Test Coverage Bot]] | unreferenced code needs no test |
| [[Readability Bot]] | feed | [[Coverage Gap Bot]] | hard-to-read levels need a simpler lesson |
| [[Coverage Gap Bot]] | feed | [[Strategist Bot]] | levels missing lessons, reps or models |
| [[Funnel Bot]] | feed | [[Strategist Bot]] | where visitors leave |
| [[Dispatcher Bot]] | feed | [[Strategist Bot]] | open issues with evidence |
| [[Superfeedbackbot]] | feed | [[Strategist Bot]] | what users ask for |
| [[Strategist Bot]] | feed | [[Reporter Bot]] | ranked build list |
| [[Verifier Bot]] | feed | [[Changelog Bot]] | bot fix commits join the staging queue |
| [[Changelog Bot]] | feed | [[Release Bot]] | what would ship |
| [[Changelog Bot]] | feed | [[Reporter Bot]] | plain-English change list |
| [[Dispatcher Bot]] | feed | [[Release Bot]] | open critical issues |
| [[Cost Guard Bot]] | feed | [[Release Bot]] | deploy credits left |
| [[Release Bot]] | feed | [[Reporter Bot]] | GO or NO-GO |
| [[Guard Bot]] | gate | [[Release Bot]] | kill switch blocks a GO |

Types: **feed** passes findings, **act** gives work, **gate** can block, **recheck** verifies, **learn** changes future behavior.

## What it will never do
Deploy, push to `main`, send an email, delete anything, touch the Home page, billing code or auth. See [[Guardrails]].

## First live run (Nov 25)
All 7 sensors ran with 0 failures. 7 issues opened, 0 safely fixable, so the Fixer did nothing. That is the honest result: most real problems here need a person.

| Issue | Routed to |
|---|---|
| 164 questions where the right answer is the longest option (13%) | Human |
| 859 visitors saw a guide call-to-action, 2 clicked | Human |
| 98% of 1,864 visitors never start a level | Human |
| Ticker prices 4 days old | Human |
| 79 weak distractors (6%) | Watch |
| 267 guides mention past years near recruiting words | Watch |

Daily output lands in [[Circle digest 2026-11-25]].
