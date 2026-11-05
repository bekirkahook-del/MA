# Daily TikTok run (@bluechipfinancial, via Metricool brand 7259200)

Goal: each day has **3 quiz posts + 3 Blue Chip posts**, spread at random-looking times. Only make what's missing.

## 1. Repo
`git clone --depth 1 https://github.com/bekirkahook-del/MA.git` (if that fails, use the add_repo tool for owner `bekirkahook-del`, repo `MA`, access `push`). Then `cd MA/social/gen && npm ci --no-audit --no-fund`.

## 2. What's already scheduled today
Call Metricool `getScheduledPosts` (brandId 7259200, today 00:00–23:59, timezone America/New_York).
- Blue Chip post = its media URLs contain `/social/bc/`. Quiz post = everything else.
- Need = 3 − existing for each type. If both are 0, stop: "Nothing needed today."

## 3. Pick topics
Read `social/posted.md` (never repeat a topic or deck key) and `social/topics.md` (quiz backlog).

### Quiz posts (M&A Prep style, 7–9 slides)
- Build a spec like `social/2026-11-04/quiz3.spec.json` (follow `gen/README.md`). Strongly prefer the **3-question challenge** format: hook ("3 questions. Can you get all 3 right?") → Q1 Intern → A1 → Q2 Analyst → A2 → Q3 MD 🔥 → A3 → score table (MD/VP/Analyst/Intern) + "Comment your score 👇". Other good formats: single quiz, "5 mistakes", "explained in 60 seconds".
- Topics: DCF, LBO, valuation, M&A math, accounting, IRR. Run every calculation in `node -e` first. The correct answer must not always be the same letter.
- Render: `node render.js <spec> ` → `social/<YYYY-MM-DD>/<key>-NN.jpg`. Exit code 2 = overflow: shorten and re-render.

### Blue Chip posts (2 slides: building photo + title, then ranked bar chart)
- Topics students love, as TOP 5/6 rankings: hardest internships, highest-paying entry-level jobs, best business schools, best feeder schools, biggest deals/IPOs, bank profits/fees/pay, richest finance people, highest-paying firms, Wall Street salaries by level, etc.
- Research with WebSearch, then WebFetch only URLs that came back in search results (typed URLs are blocked). **Every number needs a source you read this run.** Prefer one source per chart. Never guess; skip a topic if data is weak.
- Slide 1 hook: short, surprising, specific (e.g. "Internships that are harder to get than Harvard", "JPMorgan made $15.3 billion in 3 months"). Add a teaser `sub` and a `swipe` line ("Swipe to see #1 →").
- Spec format: see `social/bc/2026-11-05/spec.json` (rows = [label, number, display, highlight?]; negative numbers show red). Render: `node bluechip.js <spec> ../bc/<YYYY-MM-DD>`.

## 4. Publish images
Commit only files under `social/`, then `git push origin HEAD:main` (`git pull --rebase` and retry if rejected). Deploys are skipped for social-only commits. Check one image returns 200 at `https://raw.githubusercontent.com/bekirkahook-del/MA/main/social/...`.

## 5. Schedule (Metricool createScheduledPost, blogId 7259200)
- Times: first call Metricool `getBestTimeToPostByNetwork` (brandId 7259200, socialNetwork "tiktok", today 00:00–23:59, timezone America/New_York). Put each new post in one of the highest-scoring hours that is still in the future, between 8:00am and 10:30pm ET. Use random-looking minutes (never :00 or :30), keep each post at least 75 minutes from any other post that day, and alternate quiz and Blue Chip. Put the strongest hook in the single best hour.
- info: `autoPublish true, draft false, providers [{"network":"tiktok"}], media = the raw.githubusercontent URLs in slide order, publicationDate {dateTime, timezone:"America/New_York"}, tiktokData {privacyOption:"PUBLIC_TO_EVERYONE", title:<hook, ≤60 chars + 1 emoji>, autoAddMusic:true, photoCoverIndex:0, commercialContentOwnBrand: true for quiz posts / false for Blue Chip, disableComment/Duet/Stitch false, commercialContentThirdParty false, isAigc false}`, plus the other default fields.
- Caption (`text`): 1–2 punchy lines + a question that invites comments (👇) + 6–8 hashtags. Quiz captions mention mnaprep.com; Blue Chip captions don't.

## 6. Log
Append one line per post to `social/posted.md` (`- YYYY-MM-DD key — [Blue Chip] topic`), commit, push.

## If anything fails
Send ONE SendUserMessage: "TikTok daily run failed: <step> — <exact error>". Don't retry endlessly.
