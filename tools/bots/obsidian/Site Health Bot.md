---
title: Site Health Bot
tags: [ma-prep, bots, quality]
created: 2026-11-25
project: M&A Prep
status: built, not scheduled
---

# Site Health Bot

**File:** `tools/bots/health.mjs`
**Run:** `node tools/bots/run.mjs health --smoke`

## Checks
- Broken internal links and assets in every HTML file (understands the redirects in `netlify.toml`)
- Syntax check of every Netlify function
- Headless browser: loads the site, opens every level briefing, samples 8 guide pages, records JS errors

## First run (Nov 25)
| Item | Result |
|---|---|
| Pages scanned | 1,134 |
| Links and assets checked | 31,860 |
| Functions syntax-checked | 54, all fine |
| Level briefings opened | 49 of 49 |
| Broken links | 0 |

Local-only noise (a Cloudflare analytics CORS message) is expected on `127.0.0.1`.

## Lesson
First version reported 9 "broken" links. All were Netlify redirects (`/youtube`, `/discord`, ...), so the checker now reads `netlify.toml`.

Back to [[Site Bots]].
