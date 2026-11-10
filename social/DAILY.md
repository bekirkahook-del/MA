# Daily TikTok run (@bluechipfinancial, via Metricool brand 7259200)

Goal: each day has **10 posts total, from 12:00pm to 11:00pm ET: 4 Blue Chip rankings + 3 "unexpected interview question" brain teasers + 3 quick quiz/tip posts** (Bekir set this on 2026-11-09; before that it was 3/day). Short and quick to digest. Only make what's missing.


## Audience (read first)
Everything is for **people aged 15–30**: high schoolers, college students, new grads. Pick topics they care about and will **comment on**: money, salaries, getting into college, landing internships and first jobs, famous companies and people, "is it worth it?", school rivalries, and things they can rate themselves against. Every post should give people a reason to comment: ask for their score, their pick, their school, their opinion, or a guess before they swipe. Skip dry topics that only bankers care about.

## Video rankings (Bekir, 2026-11-09: carousels felt "low effort", make it more entertaining)
The 4 daily Blue Chip rankings are now **animated videos**, not 2-slide carousels:
- Spec like the Blue Chip spec but for `gen/rankvid.js`: `{key, kicker, hook, sub, title, rows:[[label, value, display, emoji]] (#1 first, 4–6 rows), ask, source}`. Pick a fitting emoji per row (never a logo). Hook = the surprising number/claim; `ask` = a specific comment prompt.
- Render: `node gen/rankvid.js <spec> ../vid/<date>` → `<key>.mp4` (~14s: hook → countdown from last place → mystery #1 → drumroll → reveal with money rain → end card) + `<key>-cover.jpg`. Soundtrack is synthesized by `gen/sfx.py` (original, no licensing). Needs `pip install qrcode numpy --break-system-packages` only for ig.py.
- Check 3 frames (ffmpeg -ss 1 / mid / reveal+1) before posting: nothing cut off, #1 hidden until the reveal.
- TikTok: media = [the mp4 URL], same tiktokData but `autoAddMusic:false`. Instagram: same mp4 as `instagramData {"type":"REEL","showReelOnFeed":true,"isAiGenerated":false}`. Pinterest: `ig.py --pin` on the `-cover.jpg`.
- **Brain teasers and quizzes are videos too** (Bekir: "more like that, videos and pictures"): `node gen/teaservid.js <spec> ../vid/<date>` → `<key>.mp4` (~15s: question pops → 5-second ticking timer ring → TIME'S UP → answer slam → steps one by one → comment prompt → end card) + `<key>-cover.jpg` + `<key>-answer.jpg`. Spec: `{key, label, question (<b>=red), emoji, seconds, options?:[4], correct?:index, answer, steps:[3], ask}`. Open questions use an emoji; multiple-choice uses 4 options (vary the correct letter). Keep the answer under ~22 characters.
- Daily mix: 4 ranking videos + 3 teaser videos (open mental math / estimate / logic) + 3 quiz posts, of which at least 2 are teaservid multiple-choice videos and at most 1 is a carousel (use a "Get creative" format for it). Pinterest pins for teaser videos use `-answer.jpg`.

## Table infographic decks (Bekir, 2026-11-10: "2 slide decks like this should be added in")
Modeled on a viral "Big Ten Schools Most Frequently Hired for Finance" post. **2 every day**, on top of the 10 above (12 TikToks a day).
- Format: slide 1 = skyscraper photo + big green rounded caption box ("BEST BIG 10 FINANCE SCHOOLS") + "—>" box; slide 2 = white newspaper-style ranked table (serif title, subtitle, black header row, rank · logo + name · 3 data columns, #1 row highlighted, sources line, mnaprep.com footer bar); slide 3 = mnaprep.com CTA.
- Render: `node gen/tabledeck.js <spec> ../tbl/<date>` (spec example: tbl/2026-11-10/tbl-bschoolpay.json). Exit code 2 = table runs into the sources line: cut rows (8–10 is right) or shorten cells.
- **Logos are allowed in these decks (Bekir, 2026-11-10).** Put them in gen/logos/<domain>.png, fetched with `curl -sL "https://www.google.com/s2/favicons?domain=<domain>&sz=128"`; check the size is at least 48px and it looks right (try the school/company's main domain or a subdomain like stern.nyu.edu); otherwise omit `logo` and the renderer draws an initials badge. Reuse files already in gen/logos.
- Topics: rankings with 3 real numeric/text columns from ONE source read that run: schools (salary, acceptance, placement), companies (market cap, revenue, profit), banks (fees, profit, headcount), CEO/athlete/creator pay, cities (rent vs pay). Mix one school/career table and one company/money table per day. Never invent filler like "strong placement"; every cell must be sourced or plainly factual.
- Instagram: 4:5 carousel copies with ig.py. Pinterest: slide 2 via `ig.py --pin`, board "Wall Street Salaries & Rankings" (schools/pay) or "Banks, Deals & IPOs" (companies/markets). TikTok autoAddMusic true, commercialContentOwnBrand false.
- Spacing: with 12 TikToks, keep them at least 45 minutes apart (Bekir chose tighter spacing over dropping posts).
- Done: tbl-bschoolpay (top b-schools by grad salary, P&Q), tbl-mktcap (most valuable companies, Nov 9 2026).

## Get creative (Bekir, 2026-11-09: "use all the skills you have, don't be lackluster")
Rotate formats every day so the feed never looks the same. Each day, at least 4 different formats across the 10 posts. Ideas (all must stay accurate, sourced where numbers are real):
- **Guess the salary:** 3 jobs, swipe to reveal which pays most (Blue Chip chart reveal).
- **This or that / Would you rather (money edition):** "$100K in NYC or $70K in Columbus?" with the cost-of-living math on the next slide.
- **Rank these:** show 5 logos/names unranked on slide 1, ranked chart on slide 2. "Comment your ranking first."
- **Myth vs fact:** "You need a 4.0 to get into IB" → fact slide. Keep claims verifiable.
- **Red flag / green flag:** interview answers, resume lines, first-job offers.
- **Day in the life (timeline):** analyst / PE associate / trader typical day using the `.tl` timeline block; label as typical, not a specific person.
- **Starter pack / POV:** "POV: you just got your first bonus" with the real average-bonus number; "IB analyst starter pack" as a text list (no logos or real people's images).
- **Countdown hooks:** "5 numbers every finance student should know", revealed one per slide.
- **What $X buys:** what $1,000 invested 10 years ago in a well-known stock is worth now (source every price).
- **Speed rounds:** 3 brain teasers in one post, 5 seconds each.
- **Aesthetic series:** finance-aesthetic cards in a matching set (e.g. a 5-card "money rules" series across the day) so profiles look curated.
Hooks: lead with a number, a dare ("Only 1 slide. Can you solve it?"), or a surprise. Always end with a specific comment prompt (score, pick, school, guess).

## What works (update this as you learn)
- Bekir's favorite so far: the **bank CEO pay** post. People love **rankings and stats about money and exclusivity**: who gets paid the most, what's hardest to get into, the 1%, record bonuses, elite schools and firms.
- **Less text, quick to digest (Bekir, 2026-11-09):** people want interesting things they get instantly: quantifiable rankings, fast brain teasers, quick tips. Quiz decks 5–6 slides max, one short line per slide, short captions. Cut anything that needs explaining.
- **Copy the winner (Bekir, 2026-11-09: "make posts similar to my most viewed/liked"):** Metricool returns no per-post TikTok stats and TikTok blocks reading the profile, so the best known winner is the bank CEO pay ranking. At least 3 of the 4 daily Blue Chip posts should follow its recipe: famous names + how much money they make/have/earned, a one-number hook ("$9.3 million a day"), "Guess #1 before you swipe", and a surprise at #1 (e.g. 2026-11-09 bc-hfpay). Ideas: highest-paid athletes vs CEOs, richest people under 30, biggest Wall Street bonuses by bank, highest-paid CEOs overall, YouTubers/creators earnings, top PE founders net worth. If Bekir names other top posts, add them here.
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
- **Vary slide counts** (quiz/tip decks 5–6 slides) and **posting minutes** (never the same minutes two days running; keep 60+ minutes between posts).
- **Never repost** an old deck or reuse old images, even partly.
- **Stay accurate and calm**: no misleading claims, no "guaranteed job/money" promises, no fake numbers, no engagement bait like "like if…/share or…". Comment questions are fine.
- **Keep the AI-content setting accurate**: slides are designed graphics, not AI-generated video, so isAigc stays false; if a run ever uses AI-generated imagery, set it to true.
- If insights.md shows views collapsing (most posts under ~200 views for 3+ days in a row), **pause for 48 hours**, then post just 1 strong original post a day for a week, and note it in insights.md.

## 1. Repo
`git clone --depth 1 https://github.com/bekirkahook-del/MA.git` (if that fails, use the add_repo tool for owner `bekirkahook-del`, repo `MA`, access `push`). Then `cd MA/social/gen && npm ci --no-audit --no-fund`.

## 2. What's already scheduled today
Call Metricool `getScheduledPosts` (brandId 7259200, today 00:00–23:59, timezone America/New_York).
- Blue Chip post = media URLs contain `/social/bc/`. Interview-question post = media URLs contain `/social/oddq/`. Quiz post = everything else.
- Need = target − existing for each type (Blue Chip 4, interview-question 3, quiz/tip 3). Media URLs are rewritten to static.metricool.com once scheduled, so classify existing posts by caption/title. If all are 0, stop: "Nothing needed today."

## 2b. Check engagement (keep it quick)
Call Metricool `getAnalyticsDataByMetrics` (brandId 7259200, last 7 days, metrics TKPO02, TKPO05, TKPO07, TKPO08, TKPO09, TKPO10) to get each recent post's views, likes, comments and shares. Rank them by (likes + 3×comments + 2×shares) per view. Note the top 2 and bottom 2 topics/formats, then pick today's topics and hooks to be more like the winners. Add one dated line to `social/insights.md` (e.g. "2026-11-08: CEO pay 4.1k views, best; quiz formats lag"). If Metricool returns no rows (stats sync can lag), skip this and go by the "What works" notes above.

## 3. Pick topics
Read `social/posted.md` (never repeat a topic or deck key) and `social/topics.md` (quiz backlog).

### Quiz posts (M&A Prep style, 7–9 slides)
- Build a spec like `social/2026-11-04/quiz3.spec.json` (follow `gen/README.md`). Strongly prefer the **3-question challenge** format: hook ("3 questions. Can you get all 3 right?") → Q1 Intern → A1 → Q2 Analyst → A2 → Q3 MD 🔥 → A3 → score table (MD/VP/Analyst/Intern) + "Comment your score 👇". Other good formats: single quiz, "5 mistakes", "explained in 60 seconds".
- Topics: DCF, LBO, valuation, M&A math, accounting, IRR. Run every calculation in `node -e` first. The correct answer must not always be the same letter.
- Render: `node render.js <spec> ` → `social/<YYYY-MM-DD>/<key>-NN.jpg`. Exit code 2 = overflow: shorten and re-render.

### "Unexpected interview question" posts (3 every day, keeps things light)
- Inspired by a WSO meme post (1,050 likes): one weird, quick question + a reaction emoji, then the answer. Make 3 per day, each a different kind (mental math, estimate, clock/logic, sneaky finance).
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
- Times: first call Metricool `getBestTimeToPostByNetwork` (brandId 7259200, socialNetwork "tiktok", today 00:00–23:59, timezone America/New_York). Post every day between **12:00pm and 11:00pm ET** (Bekir's choice, 2026-11-09; this replaces the old after-school-only windows). Spread the 10 posts across that window, still in the future, weighting the highest-scoring best-time hours. Evening slots (7–9:30pm ET) also catch Central and Pacific students after school, so put the strongest post there. Use random-looking minutes (never :00 or :30), keep each post at least 60 minutes from any other post that day, and never put two of the same type back to back. If the run starts late and fewer slots remain, fit what you can 60+ min apart before 11pm and skip the rest. Put the strongest hook in the single best hour.
- info: `autoPublish true, draft false, providers [{"network":"tiktok"}], media = the raw.githubusercontent URLs in slide order, publicationDate {dateTime, timezone:"America/New_York"}, tiktokData {privacyOption:"PUBLIC_TO_EVERYONE", title:<hook, ≤60 chars + 1 emoji>, autoAddMusic:true, photoCoverIndex:0, commercialContentOwnBrand: true for quiz posts / false for Blue Chip, disableComment/Duet/Stitch false, commercialContentThirdParty false, isAigc false}`, plus the other default fields.
- Caption (`text`): 1–2 punchy lines + a question that invites comments (👇) + 3–5 hashtags. Follow the caption-variety rules below.

## 5b. Instagram (@mnaprep, same Metricool brand)
Every TikTok also goes to Instagram as a carousel at the same time (Bekir, 2026-11-09).
- Make 4:5 copies: `python3 gen/ig.py ig/<YYYY-MM-DD> <the post's slide jpgs in order>` (run from social/). It trims the empty bottom and fits each slide into 1080x1350. Commit them with the TikTok images.
- Schedule a separate Metricool post per carousel: providers [{"network":"instagram"}], media = the SHA-pinned raw URLs of the ig/ copies in slide order, `instagramData: {"type":"POST","isAiGenerated":false}`, same publication time as the TikTok version.
- Caption: rewrite for Instagram (don't paste the TikTok caption): 1–2 short lines + a comment question + "Free practice at mnaprep.com (link in bio)" + 5–8 hashtags from the pool.

## Always link the website (Bekir, 2026-11-09)
Every post on every platform must point to mnaprep.com: the site's QR code or URL on the image (quiz/Blue Chip/oddq CTA slides, the pin footer) **and/or** the link itself (Pinterest `pinLink`, "mnaprep.com (link in bio)" in TikTok/Instagram captions). No exceptions, including finance-aesthetic pins and stories.

## 5c. Pinterest (account tiktokshopbk29, board "M&A Prep")
One pin per post, same time as the TikTok (Bekir, 2026-11-09).
- Pick the single best slide: the ranking chart (slide 2), the brain teaser's answer slide (slide 2), or the quiz/tip's clearest answer slide. Make it 2:3 with `python3 gen/ig.py --pin pin/<YYYY-MM-DD> <slide.jpg>` (from social/; needs `pip install qrcode --break-system-packages`) and commit it. `--pin` adds a mnaprep.com + QR footer to every pin.
- Metricool post: providers [{"network":"pinterest"}], media = the one SHA-pinned pin URL, `pinterestData: {"boardId":"M&A Prep","pinTitle":<searchable title, ≤100 chars, no emoji>,"pinLink":"https://mnaprep.com/","pinNewFormat":false,"isAiGenerated":false}`, text = 1–2 plain, keyword-rich sentences (Pinterest is search: "starting salary by major", "rule of 72", "investment banking interview questions"). No hashtags needed.
- If the board can't be resolved, skip Pinterest for the run (don't fail the run) and mention it in the summary.

## 5c-2. Pinterest boards, backfill queue and "finance aesthetic" pins
Boards (Bekir creates them on Pinterest; names must match exactly): Wall Street Salaries & Rankings · Banks, Deals & IPOs · Finance Brain Teasers · Investment Banking Interview Questions · DCF, LBO & Valuation Explained · Money Tips for Students · Finance Aesthetic · M&A Prep (catch-all).
- Route each day's pins: Blue Chip pay/school/job rankings → Wall Street Salaries & Rankings; bank/deal/market rankings → Banks, Deals & IPOs; brain teasers → Finance Brain Teasers; interview quizzes → Investment Banking Interview Questions; DCF/LBO/valuation explainers → DCF, LBO & Valuation Explained; money tips → Money Tips for Students. If a board can't be resolved, fall back to "M&A Prep"; if that fails too, skip Pinterest.
- **Backfill:** `social/pin/queue.json` lists ready-made pins (image, board, title, text, link). Every run, schedule up to 8 not-yet-posted items spread 12pm–11pm, set their `"posted": true`, commit.
- **Finance aesthetic (Bekir, 2026-11-09: "doesn't even have to be about the website, just finance vibes with aesthetic pics"):** every day make 5 new cards with `node gen/aesthetic.js <spec> ../pin/aesthetic/<date>` (styles navy, cream, marble, skyline, chart; see pin/aesthetic/2026-11-09.json). Short original lines about money mindset, investing, compounding, Wall Street ambition. Never attribute a quote to a real person; any number must be checked in node. Pin them to "Finance Aesthetic" with `pinLink` https://mnaprep.com/ and "mnaprep.com" at the end of the text. (No Instagram stories: stopped 2026-11-10.)
- Daily Pinterest total: 10 post pins + 5 aesthetic pins + backfill until the queue is empty (that's 10+ a day on every platform).

## 5c-3. "How to get into ___" college guide pins (Bekir, 2026-11-09)
Board: "How to Get Into Business School" (fall back to "M&A Prep" until Bekir creates it). Style reference: Pinterest "How to get into Georgetown" carousels.
- 2 per day: a 7-slide multi-image pin (`pinNewFormat: true`, all 7 images in media) made with `gen/aesthetic.js` from a spec like `pin/college/wharton.json`: cover "How to get into <school>" → the numbers (acceptance rate, average SAT if sourced) → 4–5 concrete steps → recruiting/mnaprep.com slide.
- Pick schools students search for: top undergrad business schools (Wharton, Stern, Ross, McIntire, Dyson, Marshall, Kenan-Flagler, Mendoza, Goizueta, Haas, McCombs, Kelley, Fisher…), plus target schools for Wall Street (Georgetown, Harvard, Columbia, Duke…) and later MBA programs.
- **Bekir, 2026-11-09: the first version "doesn't even explain how to get in."** Each guide must teach the actual process for THAT school, 8 slides: cover → numbers → how you apply there (which app, which school to pick, direct admit or not) → testing policy → the school's real essay prompt(s) quoted with word limits → what that school says it looks for → deadlines/ED options → recruiting/mnaprep.com. Research the school's own admissions pages/blog first (then Common Data Set, student paper, Poets&Quants). See pin/college/wharton.json, ross.json, stern.json.
- Every number must come from a source read that run (school class profile, Common Data Set, or Poets&Quants); name the source on the numbers slide. Never claim to be a certified counselor or admissions officer, never promise admission, and never use school logos, crests or mascots. Steps must be honest, general-but-specific advice (how you apply to that school, course rigor, real business projects, school-specific essay, plan recruiting early).
- Done so far: Wharton, NYU Stern, Michigan Ross (scheduled 2026-11-10 on M&A Prep).

## 5d. Instagram stories: STOPPED
Bekir, 2026-11-10: "Don't post any more stories on insta." Never schedule Instagram stories (type STORY). TikTok stories can't be scheduled through Metricool either.

## 6. Log
Append one line per post to `social/posted.md` (`- YYYY-MM-DD key — [Blue Chip] topic`), commit, push.

## If anything fails
Send ONE SendUserMessage: "TikTok daily run failed: <step> — <exact error>". Don't retry endlessly.
