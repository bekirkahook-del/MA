# Scout Bot: trends, hooks and sounds (weekly, lean)

Runs **once a week (Monday daily run)**, not daily. Free sources only. Output goes to `social/trends.md` (newest week on top, keep 4 weeks).

## Steps (free only: NO vidIQ, Bekir Nov 28 "Fuck vidiq do scouting urself")
Runs **once a week (Monday daily run)**, about 4 WebSearch/WebFetch calls total, no paid tools.
1. **Trending sounds:** WebFetch the public TikTok Creative Center songs page (`ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en`) or WebSearch "TikTok trending sounds this week". Note name, bpm feel, mood. Our videos keep their original beat (copyright safe, Metricool can't attach TikTok sounds), so use it to match tempo/mood only.
2. **Trending hashtags/topics:** WebFetch the Creative Center hashtags page (same site, `.../popular/hashtag/pc/en`, filter Finance/Education if shown) or WebSearch "trending finance TikTok topics this week".
3. **Outlier hooks:** WebSearch "viral finance TikTok interview question" and "viral investing reel hook" (last 7 days). From the top results, write down the **pattern** only (hook type, length, format).
4. **Our own winners (best signal, free):** run `node tools/bots/winnerboard.mjs` and `node tools/bots/hookstats.mjs`; the top idea type beats anything from outside.
5. Write to `trends.md`: patterns, sounds/bpm, 1 test idea for the week (winners.md allows max 1 test slot a day). Skip any page WebFetch declines; no sign-ins.

## Learn from winners (every daily run, free)
- `node tools/bots/winnerboard.mjs` (is the winners.md ranking stale?), `node tools/bots/hookstats.mjs` (which hook type wins), `node tools/bots/hookwriter.mjs` (hook templates from our own winners).
- Every new hook goes through `social/studio/copygate.py` and must score 4/5+.

## Rules
Facts and patterns only: never copy a creator's lines, footage or audio. No sign-ins, no posting.
