---
title: SEO Meta Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: sensor
status: built, not scheduled
---

# SEO Meta Bot

Titles, descriptions, h1, canonical and og tags on every guide.

**File:** `tools/bots/seo.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Duplicate Content Bot]] (duplicate pages explain weak rankings); [[Sitemap Bot]] (pages missing from the sitemap are not indexed); [[Broken Image Bot]] (missing social preview images); [[Internal Link Bot]] (orphan pages are not crawled); [[Thin Content Bot]] (thin pages rank badly); [[Keyword Cannibalization Bot]] (same headline, split rankings); [[External Link Bot]] (outbound link quality)

**Feeds:** [[Dispatcher Bot]] (issues found)

```dataview-fields
fed_by:: [[Duplicate Content Bot]], [[Sitemap Bot]], [[Broken Image Bot]], [[Internal Link Bot]], [[Thin Content Bot]], [[Keyword Cannibalization Bot]], [[External Link Bot]]
feeds:: [[Dispatcher Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
