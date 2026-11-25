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
  end
  subgraph CIRCLE[The Circle]
    dispatcher["Dispatcher Bot"]
    guard["Guard Bot"]
    fixer["Fixer Bot"]
    verifier["Verifier Bot"]
    historian["Historian Bot"]
    reporter["Reporter Bot"]
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

**Sensors** find problems. **The Circle** routes, fixes, verifies, remembers and reports. **Drafters** prepare emails and never send.

Run it all: `node tools/bots/run.mjs circle` (plan mode, changes nothing). Add `--act` to let the [[Fixer Bot]] apply safe fixes on a non-main branch.
