# QA score log (rubric: social/RUBRIC.md, 100/100 or it doesn't post)

| Date scored | Slot (ET) | Post | First score | Failed | Fixed | Final |
|---|---|---|---|---|---|---|
| Nov 25 | Wed 10:00 | Equity research DIL video | 100 | (after Nov 24 re-cut) | | 100 |
| Nov 25 | Wed 13:58 | Margin/leverage/buyback quiz (TT+IG) | 97 | F2 no CTA on TikTok, no IG first comment | CTA + first comment | 100 |
| Nov 25 | Wed 18:00 | Big 12 Brawl video | 95 | E1 frozen 3 s end card | live push-in on end card | 100 |
| Nov 25 | Thu 10:00 | Hedge fund DIL video | 100 | | | 100 |
| Nov 25 | Thu 13:17 | Bond yield quiz (TT+IG) | 97 | F2 no CTA on TikTok, no IG first comment | CTA + first comment | 100 |
| Nov 25 | Thu 16:42 | Big 12 business schools video | 87 | B1 fade-in first frame, D2 -22.7 LUFS, F2 no CTA, B3 no cover | trimmed fade, normalized to -15.6 LUFS, CTA, cover | 100 |
| Nov 25 | Thu 20:26 | $275B holiday (TT+IG+Pin) | 97 | F2 no CTA on TikTok, no IG first comment | CTA + first comment | 100 |
| Nov 25 | Fri 10:00 | Superday video | 100 | | | 100 |
| Nov 25 | Fri 13:08 | Black Friday days video | 84 | D2 -20.1 LUFS, A1 "$2B" (is $2.2B), F2 no CTA, B3 no cover | normalized, $2.2B, CTA, cover | 100 |
| Nov 25 | Fri 16:37 | Cyber Monday brainteaser (TT+IG) | 97 | F2 no CTA on TikTok, no IG first comment | CTA + first comment | 100 |
| Nov 25 | Fri 20:14 | Markup trap video | 87 | D2 clipping (+2.3 dB peak), F2 no CTA, B3 no cover | limited to -1.3 dB, CTA, cover | 100 |
| Nov 25 | Wed-Fri | 10 Pinterest pins | 100 | | | 100 |
| Nov 25 (daily gate) | Wed 10:00 | Equity research DIL video (re-voiced: Kokoro Echo) | 100 | | voice-checked ALL PASS | 100 |
| Nov 25 (daily gate) | Wed 13:58 | Margin/leverage/buyback quiz (TT+IG+pin) | 100 | | | 100 |
| Nov 25 (daily gate) | Wed 18:00 | Big 12 Brawl video (re-voiced: Kokoro George) | 100 | | voice-checked ALL PASS, end card no longer frozen | 100 |
| Nov 25 (daily gate) | Wed 17:21-21:52 | 4 Pinterest pins | 100 | | | 100 |
| Nov 25 (pre-check) | Thu 10:00 / Fri 10:00 | Hedge + Superday DIL videos (re-voiced: Echo) | 100 | | voice-checked ALL PASS | 100 |
| Nov 26 (daily gate) | Thu 10:00 | Hedge fund DIL video (FB+IG+TT+YT) | 100 | | auto checks ALL PASS (-14.3 LUFS, 52.8 s); contact sheet clean; labels/CTA/first comment/cover 1000 ms OK. Voice check: env not ready (Whisper model download blocked, no story dir), relied on Nov 25 ALL PASS | 100 |
| Nov 26 (daily gate) | Thu 10:37 | Superday "hour by hour" photo carousel (TT only, 2 slides) | 83 | E2 only 2 slides (needs 3-10), F2 no mnaprep.com in text or slides, F3 37 min after the 10:00 TikTok video (slides need 2 h), A2 generic schedule presented as "what a Superday actually looks like" with unsourced "5 other candidates waiting" | none possible before slot (needs new slides + commit); set draft:true (new id 443072230) | draft (not posting) |
| Nov 26 (daily gate) | Thu 13:17 | Bond yield pin (Pinterest) | 100 | | | 100 |
| Nov 26 (daily gate) | Thu 13:17 | Bond/EBITDA/%-of quiz (TT 9 slides) | 100 | flag: slide 6 + post say "most people / almost everyone say 10%" (unsourced behavior claim, judged soft framing, not deducted) | | 100 |
| Nov 26 (daily gate) | Thu 13:17 | Bond/EBITDA/%-of quiz (IG 9 slides) | 100 | same flag as TT | | 100 |
| Nov 26 (daily gate) | Thu 16:42 | Big 12 business schools punch video (TT) | 100 | dense check: Colorado "#28/#22" frames are count-up mid-roll, settles #33 (matches source); last-line "school" crowds the dots | | 100 |
| Nov 26 (daily gate) | Thu 16:42 | Big 12 business schools punch video (IG Reel) | 100 | same | | 100 |
| Nov 26 (daily gate) | Thu 16:42 | Big 12 pin (Pinterest) | 97 | F2 no mnaprep.com footer on the image (pin link is set) | built social/pin/2026-11-26/punch-big12-footer.jpg (content scaled to 1311 px + standard footer); committed 3fb64c5, media swapped in Metricool (new id 443076444, still 16:42, not draft); footer + link verified | 100 |
| Nov 26 (daily gate) | Thu 19:47 | Apple bull-case presenter video (TT+IG trial+YT+FB+Pin) | 78 | D1 not whisper-verifiable (old Chatterbox + EQ/compress voice, never Echo/Kokoro; Whisper unavailable), B2 first second is an empty panel then a count-up, no hook, B3 no videoCoverMilliseconds (frame 0 shows no number), F2 no mnaprep.com in TT/IG/FB text and no first comment on IG/FB/YT, F3 39 min before the 20:26 slides on TT/IG/Pin (self-score on Nov 24 was 86) | all 5 set draft:true (ids 443072257, 443072282, 443072298, 443072313, 443072325); needs rebuild with Echo + whisper check, cover ~2000 ms, CTA/first comments | draft (not posting) |
| Nov 26 (daily gate) | Thu 20:26 | $275B holiday forecast (TT 3 + IG 3 + Pin 2) | 96 | F3 39 min after the Apple posts on TT/IG/Pin | Apple drafted, spacing now fine; numbers re-checked vs holiday.json (grocery +10.3% fastest, $63.3B/$51.3B/$33.4B/$26.1B/$9.6B/$9.2B, $47.5B, +6.7%) | 100 |
| Nov 27 (daily gate) | Fri 10:00 | Superday DIL video (FB+IG+TT) | 100 | auto ALL PASS (-14.0 LUFS, 53.8 s); contact sheet clean; Whisper re-run on final audio matches script (one small.en pass heard "Sometimes a deal", word-timestamp + medium.en pass confirm "He names a deal"); AI labels, "Jake is fictional. AI voice.", CTA, first comment, cover 1000 ms OK | | 100 |
| Nov 27 (daily gate) | Fri 13:08 | Black Friday days punch video (TT) | 100 | auto ALL PASS (-15.3 LUFS, 8.4 s); dense fps=4 check: count-ups settle $6.9B/$9.9B/$12.9B/$15.1B (match punch-bfdays.json); $15.1B-$12.9B = $2.2B matches caption; mid-slide-in frames clip "Thanksgiving"/"Black Fri" for one frame only | | 100 |
| Nov 27 (daily gate) | Fri 13:08 | Black Friday days punch video (IG Reel) | 100 | same | | 100 |
| Nov 27 (daily gate) | Fri 13:08 | Biggest shopping days pin (Pinterest) | 95 | F2 no mnaprep.com footer on image (image = 9:16 video end frame, no footer) | built social/pin/2026-11-27/punch-bfdays-footer.jpg (committed locally c200ed5, NOT pushed so media URL not live yet); set draft:true (new id 444350695) until pushed + media swapped | draft (not posting) |
| Nov 27 (daily gate) | Fri 16:37 | Cyber Monday per second quiz (TT 3 slides) | 100 | math rechecked: 24x3600=86,400; 15.1B/86,400=$174,769; 15B/90,000=$167K; "Most people freeze" soft framing as on Nov 26 | | 100 |
| Nov 27 (daily gate) | Fri 16:37 | Cyber Monday per second quiz (IG 3 slides) | 100 | same | | 100 |
| Nov 27 (daily gate) | Fri 16:37 | Cyber Monday per second pin (Pinterest) | 100 | footer + QR present, 1000x1500 | | 100 |
| Nov 27 (daily gate) | Fri 19:47 | Apple bull-case presenter video (IG trial reel, leftover not drafted on Nov 26) | 78 | same defects as Nov 26 (old Chatterbox voice, no hook, no cover, no CTA/first comment) | set draft:true (new id 444350526) | draft (not posting) |
| Nov 27 (daily gate) | Fri 20:14 | Markup trap video (TT) | 100 | auto ALL PASS (-14.0 LUFS, 11.9 s); math 1.25x0.80=1.00; cover 2500 ms | | 100 |
| Nov 27 (daily gate) | Fri 20:14 | Markup trap video (IG Reel) | 100 | same | | 100 |
| Nov 27 (daily gate) | Fri 20:14 | Markup trap pin (Pinterest) | 95 | F2 no mnaprep.com footer on image | built social/pin/2026-11-27/type2-markup-footer.jpg (committed locally c200ed5, not pushed); set draft:true (new id 444350987) until pushed + media swapped | draft (not posting) |
| Nov 27 (daily gate) | Fri 21:16 | Negative EV quiz (TT 3 slides) | 90 | F3 TT would be the 5th TikTok today (max 4) and 62 min after the 20:14 TikTok (slides need 2 h) | moved to Sun Nov 29 13:08 (new id 444351159); content itself re-checked: 50+10-80 = -20 OK | 100 (rescheduled) |
| Nov 27 (daily gate) | Fri 21:16 | Negative EV quiz (IG 3 slides) | 87 | F3 62 min after 20:14 IG reel; F2 no IG first comment | moved to Nov 29 13:08, added first comment (new id 444351456) | 100 (rescheduled) |
| Nov 27 (daily gate) | Fri 21:16 | Negative EV pin (Pinterest) | 97 | F3 spacing/day load (grouped with TT+IG move) | moved to Nov 29 13:08 (new id 444351529) | 100 (rescheduled) |
| Nov 27 (daily gate) | Fri 19:21 | Starbucks bull-case (TT/IG x2/YT/FB/Pin) | n/a | already draft:true since Nov 19 (same presenter pipeline as Apple, not re-voiced); not scored, not posting | | draft (not posting) |
