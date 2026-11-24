# Growth sprint (Nov 23, 2026)

Free items. Nothing here needs a deploy. Rules followed: no invented numbers, quotes or personal stories; no fake reviews.

## 1. Send social traffic to the Superday test (not the homepage)
The test needs no signup: 12 real-style IB final-round questions, a score, and why each answer is right. It also has an optional school picker that counts toward the school board.

- **Link (use this everywhere):** `https://mnaprep.com/tools/superday-readiness-test/?utm_source=tiktok&utm_medium=bio`
  - Instagram bio: swap `utm_source=instagram`. Pinterest: `utm_source=pinterest`. YouTube: `utm_source=youtube`.
- **Bio line (TikTok / IG):** `Free 12-question Superday test. What's your score? 👇`
- **Caption endings (rotate, pick one per post):**
  1. `12 questions. Free. No signup. What's your Superday score? Link in bio.`
  2. `Think you'd pass a banking final round? Take the 12-question test, link in bio.`
  3. `Comment your score and your school. Link in bio.`
- **First comment (where allowed):** `Free test: mnaprep.com/tools/superday-readiness-test`
- Bekir has to change the bio links himself (needs his login). Nothing else is needed.

## 2. Jake: weekly series (next 4 episodes)
Already out: "Jake knew nothing about finance", "Jake vs Chad", "Jake's first coffee chat", "Day in the life: IB analyst". Keep 1 episode every 2-3 days (per `winners.md`). Every episode ends with the same line so people know what to do: **"What's your score?"** (points to the Superday test).

| # | Episode | Hook (first second) | Beat | Ending |
|---|---|---|---|---|
| 5 | Jake's first technical interview | "Jake just got asked how a $10 of depreciation changes the 3 statements." | He freezes, then walks through it in 3 steps on screen | "Could you answer it? What's your score?" |
| 6 | Jake vs the Superday | "Jake has 6 interviews in one day." | Show the day hour by hour, one question each | "Take the 12-question version. What's your score?" |
| 7 | Chad's resume vs Jake's resume | "Same school. Same GPA. One gets the call." | Side by side, 3 differences (specific, not generic) | "Fix yours, then test yourself. What's your score?" |
| 8 | Jake's offer | "Jake got the email." | The recruiting timeline in 4 cuts, ends on the offer | "Where are you on the timeline? What's your score?" |

Rules: full grammatical sentences, strong first-second hook, original wording, expressive voice (Chatterbox), label AI voice (isAigc / isAiGenerated). Score 78+ on the quality rubric in `DAILY.md` or don't post.

## 3. Reddit: r/FinancialCareers ("I built this")
Bekir posts this himself (no logins from here). **Read the sub's self-promo rule first.** If it bans tool posts, ask a mod, or post it as a value-first question instead.

**Title:** I'm a freshman at Ohio State and built a free Superday practice test. Want honest feedback.

**Body:**
> I'm a finance student and I got tired of banking prep being locked behind paywalls, so I built a free 12-question test based on the kinds of things asked in IB final rounds: accounting, EV, valuation, LBOs, M&A, quick math and a deal question. You get a score and a short explanation for each answer. No signup needed.
>
> I'd really like feedback from people who've actually been through recruiting:
> - Are the questions the right difficulty?
> - What topic should I add that I'm missing?
>
> Link: mnaprep.com/tools/superday-readiness-test
>
> Happy to hear what's wrong with it.

Notes: only claims that are true today (free, 12 questions, no signup, explanations, built by Bekir). No user counts, no "trusted by". Reply to every comment; fix anything people flag and say so.

## 4. Real testimonials (no fake quotes)
The app already asks for real reviews (`js/reviewask.js`: a small card after a member has 3+ cleared levels, with 1 free Pro day for any honest rating). The homepage rating strip only appears at 10+ real reviews.

For the first quotes, message real people directly. Draft (send manually from Bekir's own account):

> Hey [name], thanks for trying M&A Prep. Would you be OK with a quick honest review? One or two sentences on what helped and what didn't. Good or bad is fine, and if you rate it you'll get 1 free Pro day. Here's the link: mnaprep.com/#pro
>
> If you're OK with it being shown publicly, tell me how you'd like your name to appear (first name only is fine).

Only post a quote the person actually wrote, with their OK.

## 5. Status of the 1:1 coaching waitlist
Already built and live (`js/coaching.js`): footer link "1:1 coaching" and `mnaprep.com/#coaching`. Students join the waitlist; people who landed offers can apply to coach. Stored as feedback rows with kind `coaching`. Price noted in the code: $80 per 1-hour session, coach gets $50. No payments yet.
