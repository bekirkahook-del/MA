# Post Quality Rubric: 100/100 or it doesn't post

Bekir, Nov 25: "Quality check big time every day before post. 100/100 only."

Every item is **pass/fail** (full points or zero). A post publishes only at **100/100**.
Anything less: fix it and re-score. If it can't be fixed before its slot, set it to draft (`draft:true`) and say so in the daily summary. Never "round up".

Run `python3 social/studio/qa.py <file>` first: it checks the measurable items (marked 🤖) automatically. Score the rest by looking at the contact sheet and the post text.

## A. Truth and compliance (25)
| # | Item | Pts |
|---|---|---|
| A1 | Every number is real, matches its source, and the source is on screen (or in the caption for slides) | 5 |
| A2 | No invented claims: no "real interview question", quotes or experiences unless sourced | 5 |
| A3 | Math is correct everywhere (recompute every calculation shown) | 5 |
| A4 | AI labels set: TikTok `isAigc`, Instagram `isAiGenerated`, YouTube `isAiGeneratedContent` (whenever there's an AI voice or AI visuals) | 5 |
| A5 | Fictional characters say "X is fictional"; real-people events say "illustration of reported events"; school characters say "not official mascots" | 5 |

## B. Hook (15)
| # | Item | Pts |
|---|---|---|
| B1 | 🤖 First frame is lit (no black/fade-in start) and readable as a thumbnail | 5 |
| B2 | Hook in second 1: big text with a number, conflict or surprise (video: TEASE cold open; slides: slide 1 headline) | 5 |
| B3 | Cover set on the hook frame (`videoCoverMilliseconds` ~1000) or slide 1 is the strongest slide | 5 |

## C. Visual craft (25)
| # | Item | Pts |
|---|---|---|
| C1 | Nothing overlaps: captions, chips, stamps, cards, bubbles, faces, other text | 5 |
| C2 | Nothing cut off at the edges; captions and key text sit in the safe zone (clear of TikTok/Reels bottom UI) | 5 |
| C3 | Characters and subjects fully framed; no stray objects, glitches, or broken models | 5 |
| C4 | Text is legible: size, contrast, stamps on one line, no orphan words, emoji render in color | 5 |
| C5 | 🤖 Native size per platform: TikTok/Reels/Shorts 1080×1920, Instagram carousel 1080×1350, Pinterest 1000×1500 (no squeezed 9:16 or blurred side bars) | 5 |

## D. Audio (10)
| # | Item | Pts |
|---|---|---|
| D1 | Every voice line whisper-verified word for word (faster-whisper small.en); no stray syllables or "uh" | 5 |
| D2 | 🤖 Mix: integrated loudness -18 to -10 LUFS, true peak ≤ -0.5 dBTP, voice clearly over the music | 5 |

## E. Story and pacing (15)
| # | Item | Pts |
|---|---|---|
| E1 | 🤖 No dead air: no frozen/static stretch over 2.5 s; end card ≤ 1.5 s | 5 |
| E2 | 🤖 Length fits the format: story videos 25-60 s, countdown/punch 8-30 s; carousels 3-10 slides | 5 |
| E3 | Every line earns its place, the story has a clear payoff, and it's actually interesting (would a finance student stop scrolling?) | 5 |

## F. Packaging (10)
| # | Item | Pts |
|---|---|---|
| F1 | Post text and on-screen text: perfect spelling and grammar, consistent with the video | 3 |
| F2 | CTA: mnaprep.com in the text (link in bio) + first comment where the platform supports it | 3 |
| F3 | Scheduled at a best hour (10 AM / 6 PM ET), right platforms for the idea type, commit-pinned media URL, platform title set | 4 |

## Score log
Record every scored post in `social/qa-log.md`: date, slot, post, score, what failed, what you fixed. A post that went from 95 to 100 counts as a pass only after the re-score.
