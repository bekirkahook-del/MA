# Scout Bot: trends, hooks and sounds (weekly, lean)

Runs **once a week (Monday daily run)**, not daily. Max 2 paid calls a week. Output goes to `social/trends.md` (newest week on top, keep 4 weeks).

## Steps
1. **Outlier hooks/formats (main value).** `vidiq_instagram_tiktok_outlier_search`, embeddingType `hook`, query "finance interview question or money math quiz for college students", audienceQuery `Culture/Region: US/American; Global: false; Demographics: college finance and business students 18-24, investment banking recruiting;`, 5 per platform. 5 credits.
2. **Sounds (info only).** `vidiq_tiktok_trending_sound_search`, query "finance tips, investing, career advice for students", limit 8. 5 credits. Our videos keep their original music bed (copyright safe, Metricool can't attach TikTok sounds). Use the list only to match tempo/mood (bpm) of the beat.
3. **Free fallback** if vidIQ is out of credits: WebSearch "TikTok Creative Center trending songs this week" (facts only, no copying).
4. Write to `trends.md`: per outlier, the **pattern** (hook type, length, format), never their words. Then pick **1 test slot** for the week from it (winners.md allows max 1 test slot a day).

## Learn from winners (every daily run, free)
- `node tools/bots/winnerboard.mjs` (is the winners.md ranking stale?), `node tools/bots/hookstats.mjs` (which hook type wins), `node tools/bots/hookwriter.mjs` (hook templates from our own winners).
- Every new hook goes through `social/studio/copygate.py` and must score 4/5+.

## Rules
Facts and patterns only: never copy a creator's lines, footage or audio. No sign-ins, no posting.
