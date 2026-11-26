---
title: Sitemap Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# Sitemap Bot

sitemap.xml vs the guide pages that really exist, and robots.txt.

**File:** `tools/bots/sitemap.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Redirect Bot]] (redirected URLs should not be in the sitemap); [[Feed Bot]] (feed and llms links need real pages)

**Feeds:** [[Dispatcher Bot]] (issues found); [[SEO Meta Bot]] (pages missing from the sitemap are not indexed)

```dataview-fields
fed_by:: [[Redirect Bot]], [[Feed Bot]]
feeds:: [[Dispatcher Bot]], [[SEO Meta Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
