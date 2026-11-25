---
title: Site Bots (hub)
tags: [ma-prep, bots, hub]
created: 2026-11-25
project: M&A Prep
circle_role: hub
status: built, not scheduled
---

# Site Bots

Fifteen bots that watch mnaprep.com and **depend on each other**. See [[The Circle]] for how a run works and [[Guardrails]] for what they can never do.

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

| Bot | Role | Job |
|---|---|---|
| [[Question QA Bot]] | Sensor | Audits all 1,248 questions for wrong keys, duplicate options, giveaways. |
| [[Site Health Bot]] | Sensor | Links, function syntax, every level opens, JS errors. |
| [[Content Freshness Bot]] | Sensor | Stale wire data and guides that mention past years. |
| [[Cost Guard Bot]] | Sensor | Netlify credits (15 per deploy) and AI usage vs limits. |
| [[Funnel Bot]] | Sensor | Where visitors drop between landing and sign-up. |
| [[Billing Audit Bot]] | Sensor | Paid vs access mismatches between Stripe and the site. |
| [[Superfeedbackbot]] | Sensor | Judges user feedback with a rubric and a consensus gate. |
| [[Retention Bot]] | Drafter | Plans review-due reminders (dry run, never sends). |
| [[Outreach Bot]] | Drafter | Drafts club and career-center emails (never sends). |
| [[Dispatcher Bot]] | Circle | Dedupes issues, scores priority, routes each to the fixer, a human, or watch. |
| [[Guard Bot]] | Circle | Allows or blocks every action: kill switch, protected files, caps, loop breaker, marketing gates. |
| [[Fixer Bot]] | Circle | Applies the few fixes that are safe to automate. Everything else becomes a packet for a human. |
| [[Verifier Bot]] | Circle | Re-runs the sensor and the tests after a fix. Reverts the patch if either fails. |
| [[Historian Bot]] | Circle | Remembers which fix types worked or got reverted and demotes the ones that fail. |
| [[Reporter Bot]] | Circle | Writes the daily digest for Bekir and says when a deploy question is due. |
| [[SEO Meta Bot]] | Sensor | Titles, descriptions, h1, canonical and og tags on every guide. |
| [[Sitemap Bot]] | Sensor | sitemap.xml vs the guide pages that really exist, and robots.txt. |
| [[Structured Data Bot]] | Sensor | JSON-LD on every guide parses and has the fields search engines need. |
| [[Accessibility Bot]] | Sensor | Missing alt text, unlabeled buttons and fields, lang, viewport, heading order. |
| [[Performance Budget Bot]] | Sensor | File weight and render-blocking scripts against a budget. |
| [[Secrets and Headers Bot]] | Sensor | Live keys committed to the repo (never prints them) and missing security headers. |
| [[Duplicate Content Bot]] | Sensor | Near-identical guide pages that search engines merge or demote. |
| [[Readability Bot]] | Sensor | Reading grade level of lessons and guides. |
| [[Rep Auditor Bot]] | Sensor | Runs every practice-problem generator 300 times and checks each problem is sane. |
| [[Coverage Gap Bot]] | Sensor | Which of the 49 levels lack a lesson, number reps or a model. |
| [[Test Coverage Bot]] | Sensor | Scripts and functions that no test names. |
| [[Dead Code Bot]] | Sensor | Scripts and functions that nothing references. |
| [[Changelog Bot]] | Circle | Plain-English list of what is waiting on staging and whether it triggers a build. |
| [[Release Bot]] | Circle | GO, CAUTION or NO-GO before a deploy. Advises only, never deploys. |
| [[Strategist Bot]] | Circle | Ranks what to build next from the other bots' evidence. |

**Sensors** find problems. **The Circle** routes, fixes, verifies, remembers and reports. **Drafters** prepare emails and never send.

Run it all: `node tools/bots/run.mjs circle` (plan mode, changes nothing). Add `--act` to let the [[Fixer Bot]] apply safe fixes on a non-main branch.
