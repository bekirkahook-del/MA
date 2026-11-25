---
title: Changelog Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Changelog Bot

Reads the commits waiting on staging and groups them by what a student would notice (learning content, Pro and billing, guides and SEO, site design, backend, bots). It also says whether the batch triggers a Netlify build, using the same "no build" list as `netlify.toml`.

**File:** `tools/bots/changelog.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Verifier Bot]] (bot fix commits join the staging queue); [[Drift Bot]] (what main has that staging lacks)

**Feeds:** [[Release Bot]] (what would ship); [[Reporter Bot]] (plain-English change list)

```dataview-fields
fed_by:: [[Verifier Bot]], [[Drift Bot]]
feeds:: [[Release Bot]], [[Reporter Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
