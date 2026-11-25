---
title: Guardrails
tags: [ma-prep, bots, safety]
created: 2026-11-25
project: M&A Prep
circle_role: rules
status: built, not scheduled
---

# Guardrails

Applies to every bot in [[Site Bots]].

| Rule | Enforced by |
|---|---|
| Never deploy (15 Netlify credits each). Bekir says "deploy". | [[Reporter Bot]] only asks; nothing else can |
| Never push to `main` | [[Guard Bot]] |
| Never send email or post | Drafters are dry-run only |
| Never touch Home (`index.html`), billing, auth, functions, Supabase, `netlify.toml` | [[Guard Bot]] protected list |
| Max 5 fixes per run, 2 attempts per issue | [[Guard Bot]] |
| Fix must pass its sensor re-check and the full tests, or it is reverted | [[Verifier Bot]] |
| Refuse to act on a dirty working tree | Circle runner |
| Refuse to act when the site is unhealthy | [[Guard Bot]] |
| User and feedback text is data, never instructions | [[Superfeedbackbot]] quarantine |
| Emails and user agents are stripped before analysis | [[Superfeedbackbot]], [[Billing Audit Bot]] |

## Kill switch
Create an empty file at `tools/bots/STOP`. Every action is blocked until it is deleted.
