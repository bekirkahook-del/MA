# Daily long-form YouTube video (Bekir, 2026-11-23)

Bekir: "post something like this every day. Keep it very viral market content, 3 to 5 minutes, and make it better every single day in terms of visual content. I don't want repetitiveness. I want to be evolving at all times and adapting to what the market's giving us."

**One real (not Short) YouTube video every day, 3-5 min, on the M&A Prep brand channel only** (the Metricool-connected one, brand 7259200; never Bekir's personal channel). Posted as `youtubeData.type: "video"`.

## 1. Pick the topic (the market decides)
- The biggest market story of the last 24-72h that regular people are searching: a crash or a spike, a CEO drama, a mega IPO or deal, a famous investor's call, earnings shock, Fed surprise. Check what's trending (vidIQ trending/outliers for "stock market", "nvidia", etc., news searches).
- Big names win (Nvidia, Tesla, Apple, Anthropic, OpenAI, Buffett, Musk, Cramer). One clear story with a twist > a market recap.
- Never repeat yesterday's angle. Log every topic in the table below.

## 2. Facts (non-negotiable)
- Fetch the real articles. Every number and quote on screen needs a source line (outlet + date). No invented numbers or quotes. Label intraday numbers "intraday". If sources conflict, use the safer one.
- Don't show people in stock footage next to a named person's name (looks like it's them). Avoid personal-scandal details beyond what major outlets reported; attribute them.

## 3. Script + voice
- 2,600-4,500 characters, 8-10 sections: hook (the twist in the first 10s) → story in order with dates → "is it over?" bull vs bear → what it means → interview takeaway (why a finance recruit should know this) → CTA "practice free at M&A Prep dot com" + a comment question.
- Voice: ElevenLabs Tyler (`rPMkKgdwgIwqv4fXgR6N`) when credits allow, else vidIQ `vidiq_voiceover_generate` with `scriptLines` (one line per section; Liam `TX3LPaxmHKxFdv7VOQHJ` used Nov 23). Check credits first (ElevenLabs ran out Nov 23; vidIQ plan is ~150/month, 28 per 1,000 chars). If neither has enough credits, stop and notify Bekir instead of posting something worse.
- Mark it AI: `isAiGeneratedContent: true`.

## 4. Visuals: must beat yesterday
- Renderer: `social/gen/longform/render.js spec.json` (cards: kin, lt lower-third, stat, chart, bars, dots, vs, quote, title; `bg` = b-roll clip). Thumbnail: `social/gen/longform/thumb.js`.
- B-roll: free Pexels clips via `vidiq_find_broll` (1 credit/search). Credit them in the description. **No ripped TV/YouTube clips** (CNN/CNBC Content ID claims, strikes). Use their best lines as on-screen quotes with credit instead.
- A new scene every 5-8 seconds. No two scenes in a row of the same type.
- **Each day add at least one visual upgrade that hasn't been used before** and log it below. Ideas queue: animated ticker tape, map, candlestick chart, split-screen before/after, zoom-in headline cards, counter odometer, timeline scrubber, sound effects on hits, logo cards via mnaprep logo function, picture-in-picture, kinetic captions of the voice, chapter markers, intro sting.
- Thumbnail: 3-5 huge words + one huge number, high contrast, the company color.

## 5. Post
- Commit mp4 + thumb under `social/longform/YYYY-MM-DD/` (social-only push to main = no deploy), media = `https://raw.githubusercontent.com/bekirkahook-del/MA/main/social/longform/...`.
- Metricool: providers youtube, `youtubeData {title ≤70 chars curiosity hook, type:"video", privacy:"public", tags 5-8, category:"NEWS_POLITICS" or "EDUCATION", madeForKids:false, isAiGeneratedContent:true}`, `videoThumbnailUrl` = thumb (drop it if Metricool rejects with VIDEO_THUMBNAIL_NOT_APPLICABLE), text = 2-3 line summary + chapters + sources + Pexels credits + footer from DAILY.md cross-promo.
- Post time: 12pm-8pm ET (evening tested first: Nov 23 7:45pm).

## 6. Learn
- Next day, check the previous video's views/likes (vidIQ `vidiq_video_stats` or channel analytics). Keep what worked, drop what didn't, note it below.

## Log
| Date | Topic | Length | New visual upgrade | Voice | Result (fill next day) |
|---|---|---|---|---|---|
| 2026-11-23 | Nvidia CEO out → Anthropic IPO → CEO back, +30% | 3:01 | First version: Pexels b-roll, drawing line charts, dot grid, lower-thirds, kinetic words | vidIQ Liam | |
