# Daily TikTok run (@bluechipfinancial, via Metricool brand 7259200)

Goal: each day has **3 posts total: 1 quiz + 1 Blue Chip + 1 "unexpected interview question"**, spread across the best hours. Quality over quantity: make each one the strongest possible (Bekir cut from 7/day to 3/day on 2026-11-05). Only make what's missing.


## Audience (read first)
Everything is for **people aged 15–30**: high schoolers, college students, new grads. Pick topics they care about and will **comment on**: money, salaries, getting into college, landing internships and first jobs, famous companies and people, "is it worth it?", school rivalries, and things they can rate themselves against. Every post should give people a reason to comment: ask for their score, their pick, their school, their opinion, or a guess before they swipe. Skip dry topics that only bankers care about.

## What works (update this as you learn)
- Bekir's favorite so far: the **bank CEO pay** post. People love **rankings and stats about money and exclusivity**: who gets paid the most, what's hardest to get into, the 1%, record bonuses, elite schools and firms.
- Keep it simple: one clear number per hook, plain words, no jargon. Think "would a 17-year-old get it in 2 seconds?"
- Keep evolving: lean into the formats and topics that get the most views, likes and comments (see step 2b), and try one new angle each day.

## Always promote M&A Prep
Every post must show **mnaprep.com** on its last slide (automatic in all 3 renderers: big "mnaprep.com" card + "🔗 Link in bio"). **Never put a QR code on a TikTok slide**: TikTok's Community Guidelines make content with QR codes ineligible for the For You feed (checked 2026-11-05). The CTA headline rotates automatically by deck key; set `cta`/`ctaHead` in the spec for a custom one.

## Stay out of shadowban territory (read every run)
TikTok pushes down accounts that look automated or repetitive. Every run, make sure:
- **No QR codes** anywhere in the images.
- **Every caption is written fresh.** Never reuse a caption or the same closing line two posts in a row. Rotate the site mention between styles, and skip it entirely on about 1 in 3 posts (the last slide already shows it): "Free practice: link in bio 🔗" · "More like this on mnaprep.com" · "Full guide in bio" · "Train free: mnaprep.com" · none.
- **Rotate hashtags from this pool, 3–5 per post**, never the same set twice in a row: #finance #financetok #wallstreet #investmentbanking #privateequity #moneytok #careertok #collegelife #college #businessschool #stocks #investing #learnontiktok #interviewtips #mentalmath #brainteaser #money #salary #jobs #internship #highschool #studytok #economics #financialliteracy #mergersandacquisitions. Add 1 topic tag (e.g. #goldmansachs) when it fits. Never use a tag you're unsure about.
- **Vary the look and format.** Don't run the same Blue Chip topic type (e.g. two pay rankings) on back-to-back days; mix rankings, records, "vs." comparisons and "what X makes" posts. Quiz posts rotate formats (3-question challenge, single question, "5 mistakes", "explained in 60 seconds"). Vary hooks: number-led, question-led, surprise-led.
- **Vary slide counts** (quiz decks 6–9 slides) and **posting minutes** (never the same time of day two days running; keep 2+ hours between posts).
- **Never repost** an old deck or reuse old images, even partly.
- **Stay accurate and calm**: no misleading claims, no "guaranteed job/money" promises, no fake numbers, no engagement bait like "like if…/share or…". Comment questions are fine.
- **Keep the AI-content setting accurate**: slides are designed graphics, not AI-generated video, so isAigc stays false; if a run ever uses AI-generated imagery, set it to true.
- If insights.md shows views collapsing (most posts under ~200 views for 3+ days in a row), **pause for 48 hours**, then post just 1 strong original post a day for a week, and note it in insights.md.

## 1. Repo
`git clone --depth 1 https://github.com/bekirkahook-del/MA.git` (if that fails, use the add_repo tool for owner `bekirkahook-del`, repo `MA`, access `push`). Then `cd MA/social/gen && npm ci --no-audit --no-fund`.

## 2. What's already scheduled today
Call Metricool `getScheduledPosts` (brandId 7259200, today 00:00–23:59, timezone America/New_York).
- Blue Chip post = media URLs contain `/social/bc/`. Interview-question post = media URLs contain `/social/oddq/`. Quiz post = everything else.
- Need = 1 − existing for each type (quiz, Blue Chip, interview-question). If all are 0, stop: "Nothing needed today."

## 2b. Check engagement (keep it quick)
Call Metricool `getAnalyticsDataByMetrics` (brandId 7259200, last 7 days, metrics TKPO02, TKPO05, TKPO07, TKPO08, TKPO09, TKPO10) to get each recent post's views, likes, comments and shares. Rank them by (likes + 3×comments + 2×shares) per view. Note the top 2 and bottom 2 topics/formats, then pick today's topics and hooks to be more like the winners. Add one dated line to `social/insights.md` (e.g. "2026-11-08: CEO pay 4.1k views, best; quiz formats lag"). If Metricool returns no rows (stats sync can lag), skip this and go by the "What works" notes above.

## 3. Pick topics
Read `social/posted.md` (never repeat a topic or deck key) and `social/topics.md` (quiz backlog).

### Quiz posts (M&A Prep style, 7–9 slides)
- Build a spec like `social/2026-11-04/quiz3.spec.json` (follow `gen/README.md`). Strongly prefer the **3-question challenge** format: hook ("3 questions. Can you get all 3 right?") → Q1 Intern → A1 → Q2 Analyst → A2 → Q3 MD 🔥 → A3 → score table (MD/VP/Analyst/Intern) + "Comment your score 👇". Other good formats: single quiz, "5 mistakes", "explained in 60 seconds".
- Topics: DCF, LBO, valuation, M&A math, accounting, IRR. Run every calculation in `node -e` first. The correct answer must not always be the same letter.
- Render: `node render.js <spec> ` → `social/<YYYY-MM-DD>/<key>-NN.jpg`. Exit code 2 = overflow: shorten and re-render.

### "Unexpected interview question" posts (1 every day, keeps things light)
- Inspired by a WSO meme post (1,050 likes): one weird, quick question + a reaction emoji, then the answer. Make exactly 1 per day.
- Good questions: quick mental math (13% of 87, 17 × 24, 15% of 360), clock angles, "how many golf balls fit in a bus" style estimates, sneaky finance ones ("a company has negative EV, what does that mean?"). Run the math in `node -e` first. Never claim a specific bank asked it; the label is generic ("IB SUPERDAY").
- Spec: see `social/oddq/sample.json` (key must start with `oddq-`). Render: `node oddq.js <spec> ../oddq/<YYYY-MM-DD>` → 3 slides, slide 3 is the mnaprep.com CTA automatically (no QR).
- Caption: "No calculator. Comment your answer before you swipe 👇" + hashtags. Follow the caption-variety rules below. Title like "Real interview question 😳". commercialContentOwnBrand true. Its own type: media URLs contain `/social/oddq/` (don't count it as a quiz post). Schedule it in the evening (7–10pm) when people are scrolling.

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
- Caption (`text`): 1–2 punchy lines + a question that invites comments (👇) + 3–5 hashtags. Follow the caption-variety rules below.

## 6. Log
Append one line per post to `social/posted.md` (`- YYYY-MM-DD key — [Blue Chip] topic`), commit, push.

## If anything fails
Send ONE SendUserMessage: "TikTok daily run failed: <step> — <exact error>". Don't retry endlessly.
