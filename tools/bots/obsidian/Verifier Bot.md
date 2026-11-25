---
title: Verifier Bot
tags: [ma-prep, bots, circle]
created: 2026-11-25
project: M&A Prep
circle_role: circle
status: built, not scheduled
---

# Verifier Bot

Trust, but verify. After the [[Fixer Bot]] patches something, the Verifier re-runs the sensor that found the issue ([[Question QA Bot]] or [[Content Freshness Bot]]) **and** the full test suite.

| Result | What happens |
|---|---|
| Issue gone and tests pass | Fix is committed, issue marked fixed |
| Issue still reported | Patch reverted |
| Tests fail | Patch reverted |

Every outcome is sent to the [[Historian Bot]] and the [[Reporter Bot]].

**File:** `tools/bots/circle/verifier.mjs`

<!-- circle:start -->
## Connections

**Fed by:** [[Fixer Bot]] (patch to check)

**Rechecks:** [[Question QA Bot]] (re-run after a question fix); [[Content Freshness Bot]] (re-run after a data fix)

**Feeds:** [[Historian Bot]] (worked or reverted); [[Reporter Bot]] (what changed and what was reverted); [[Changelog Bot]] (bot fix commits join the staging queue)

```dataview-fields
fed_by:: [[Fixer Bot]]
rechecks:: [[Question QA Bot]], [[Content Freshness Bot]]
feeds:: [[Historian Bot]], [[Reporter Bot]], [[Changelog Bot]]
```
<!-- circle:end -->

Back to [[The Circle]] · [[Site Bots]].
