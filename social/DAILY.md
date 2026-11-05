# Daily TikTok run (@bluechipfinancial, via Metricool brand 7259200)

Goal: each day has **3 quiz posts + 3 Blue Chip posts + 1 "unexpected interview question" post**, spread at random-looking times. Only make what's missing.


## Audience (read first)
Everything is for **people aged 15–30**: high schoolers, college students, new grads. Pick topics they care about and will **comment on**: money, salaries, getting into college, landing internships and first jobs, famous companies and people, "is it worth it?", school rivalries, and things they can rate themselves against. Every post should give people a reason to comment: ask for their score, their pick, their school, their opinion, or a guess before they swipe. Skip dry topics that only bankers care about.

## What works (update this as you learn)
- Bekir's favorite so far: the **bank CEO pay** post. People love **rankings and stats about money and exclusivity**: who gets paid the most, what's hardest to get into, the 1%, record bonuses, elite schools and firms.
- Keep it simple: one clear number per hook, plain words, no jargon. Think "would a 17-year-old get it in 2 seconds?"
- Keep evolving: lean into the formats and topics that get the most views, likes and comments (see step 2b), and try one new angle each day.

## Always promote M&A Prep
Every post must show **mnaprep.com and a QR code**. Quiz carousels get it automatically on the last slide. Blue Chip posts get an automatic **separate 3rd slide** with the QR code and mnaprep.com (built into bluechip.js). Never put the QR or link on the 2 content slides. Optional spec fields for slide 3: `ctaKicker` (default "WANT TO WORK HERE?") and `cta` (default "Break into Wall Street <em>for free.</em>"). So Blue Chip media = 3 URLs: -01, -02, -03. Every caption ends with "Free interview prep: mnaprep.com 🔗".

## 1. Repo
`git clone --depth 1 https://github.com/bekirkahook-del/MA.git` (if that fails, use the add_repo tool for owner `bekirkahook-del`, repo `MA`, access `push`). Then `cd MA/social/gen && npm ci --no-audit --no-fund`.

## 2. What's already scheduled today
Call Metricool `getScheduledPosts` (brandId 7259200, today 00:00–23:59, timezone America/New_York).
- Blue Chip post = media URLs contain `/social/bc/`. Interview-question post = media URLs contain `/social/oddq/`. Quiz post = everything else.
- Need = 3 − existing for quiz and Blue Chip, 1 − existing for interview-question. If all are 0, stop: "Nothing needed today."

## 2b. Check engagement (keep it quick)
Call Metricool `getAnalyticsDataByMetrics` (brandId 7259200, last 7 days, metrics TKPO02, TKPO05, TKPO07, TKPO08, TKPO09, TKPO10) to get each recent post's views, likes, comments and shares. Rank them by (likes + 3×comments + 2×shares) per view. Note the top 2 and bottom 2 topics/formats, then pick today's topics and hooks to be more like the winners. Add one dated line to `social/insights.md` (e.g. "2026-11-08: CEO pay 4.1k views, best; quiz formats lag"). If Metricool returns no rows (stats sync can lag), skip this and go by the "What works" notes above.

## 3. Pick topics
Read `social/posted.md` (never repeat a topic or deck key) and `social/topics.md` (quiz backlog).

### Quiz posts (M&A Prep style, 7–9 slides)
- Build a spec like `social/2026-11-04/quiz3.spec.json` (follow `gen/README.md`). Strongly prefer the **3-question challenge** format: hook ("3 questions. Can you get all 3 right?") → Q1 Intern → A1 → Q2 Analyst → A2 → Q3 MD 🔥 → A3 → score table (MD/VP/Analyst/Intern) + "Comment your score 👇". Other good formats: single quiz, "5 mistakes", "explained in 60 seconds".
- Topics: DCF, LBO, valuation, M&A math, accounting, IRR. Run every calculation in `node -e` first. The correct answer must not always be the same letter.
- Render: `node render.js <spec> ` → `social/<YYYY-MM-DD>/<key>-NN.jpg`. Exit code 2 = overflow: shorten and re-render.

### "Unexpected interview question" posts (1 every day, keeps things light)
- Inspired by a WSO meme post (1,050 likes): one weird, quick question + a reaction emoji, then the answer. Make exactly 1 per day, on top of the 3 quiz + 3 Blue Chip.
- Good questions: quick mental math (13% of 87, 17 × 24, 15% of 360), clock angles, "how many golf balls fit in a bus" style estimates, sneaky finance ones ("a company has negative EV, what does that mean?"). Run the math in `node -e` first. Never claim a specific bank asked it; the label is generic ("IB SUPERDAY").
- Spec: see `social/oddq/sample.json` (key must start with `oddq-`). Render: `node oddq.js <spec> ../oddq/<YYYY-MM-DD>` → 3 slides, slide 3 is the QR/mnaprep.com CTA automatically.
- Caption: "No calculator. Comment your answer before you swipe 👇" + hashtags, ending with "Free interview prep: mnaprep.com 🔗". Title like "Real interview question 😳". commercialContentOwnBrand true. Its own type: media URLs contain `/social/oddq/` (don't count it as a quiz post). Schedule it in the evening (7–10pm) when people are scrolling.

### Blue Chip posts (2 content slides: building photo + title, then ranked bar chart; plus the auto CTA slide 3)
- TOP 5/6 rankings 15–30 year-olds care about: highest-paying entry-level jobs, highest-paying internships, hardest internships/jobs to get, best business schools, colleges that send the most grads to Wall Street, starting salary by major, what bankers make by age/level, richest people under 35, most valuable brands Gen Z uses (Apple, Nike, Netflix…), biggest IPOs, cities where your salary goes furthest, rent vs pay in big cities, how long to save for a house by city, top stocks over the last 10 years, etc. Comment-bait in the caption: "Which would you pick?", "Did your school make it?", "Guess #1 before you swipe".
- Research with WebSearch, then WebFetch only URLs that came back in search results (typed URLs are blocked). **Every number needs a source you read this run.** Prefer one source per chart. Never guess; skip a topic if data is weak.
- Slide 1 hook: short, surprising, specific (e.g. "Internships that are harder to get than Harvard", "JPMorgan made $15.3 billion in 3 months"). Add a teaser `sub` and a `swipe` line ("Swipe to see #1 →").
- Spec format: see `social/bc/2026-11-05/spec.json` (rows = [label, number, display, highlight?]; negative numbers show red). Render: `node bluechip.js <spec> ../bc/<YYYY-MM-DD>`.

## 4. Publish images
Commit only files under `social/` (including insights.md), then `git push origin HEAD:main` (`git pull --rebase` and retry if rejected). Deploys are skipped for social-only commits. Check one image returns 200 at `https://raw.githubusercontent.com/bekirkahook-del/MA/main/social/...`.

## 5. Schedule (Metricool createScheduledPost, blogId 7259200)
- Times: first call Metricool `getBestTimeToPostByNetwork` (brandId 7259200, socialNetwork "tiktok", today 00:00–23:59, timezone America/New_York). Put each new post in one of the highest-scoring hours that is still in the future, between 8:00am and 10:30pm ET. Use random-looking minutes (never :00 or :30), keep each post at least 75 minutes from any other post that day, and alternate quiz and Blue Chip. Put the strongest hook in the single best hour.
- info: `autoPublish true, draft false, providers [{"network":"tiktok"}], media = the raw.githubusercontent URLs in slide order, publicationDate {dateTime, timezone:"America/New_York"}, tiktokData {privacyOption:"PUBLIC_TO_EVERYONE", title:<hook, ≤60 chars + 1 emoji>, autoAddMusic:true, photoCoverIndex:0, commercialContentOwnBrand: true for quiz posts / false for Blue Chip, disableComment/Duet/Stitch false, commercialContentThirdParty false, isAigc false}`, plus the other default fields.
- Caption (`text`): 1–2 punchy lines + a question that invites comments (👇) + 6–8 hashtags. Every caption ends with "Free interview prep: mnaprep.com 🔗".

## 6. Log
Append one line per post to `social/posted.md` (`- YYYY-MM-DD key — [Blue Chip] topic`), commit, push.

## If anything fails
Send ONE SendUserMessage: "TikTok daily run failed: <step> — <exact error>". Don't retry endlessly.
