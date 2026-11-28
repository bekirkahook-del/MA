# Video quality notes (handoff, Nov 25, 2026)

Everything learned while building the socials pipeline that a fresh session needs. Read with `social/RUBRIC.md` (the 100/100 gate) and `.claude/agents/socials.md` (the playbook).

## Bekir's standing quality rules (his words)
- Nov 24: "Content wise fuck the analytics we need pristine content." Quality is priority #1. Analytics are light bookkeeping only.
- Nov 25: "Quality check big time every day before post. 100/100 only." Re-score everything publishing in the next 24 h every day, even posts that passed before. Below 100 = fix, or set to draft and report. Never round up.
- Quality beats count: never post filler to hit the 6/day target: replace a failed post with another 100/100 one.
- He judges the voice by ear, and his ear wins over any metric. When he says worse, it is worse.
- He did not want the narration slower. Do not add pauses or slow the pace without asking.
- He disliked heavily processed audio (EQ/compression/pitch tricks). Keep voice processing light.

## Voices (decided Nov 25)
- **Echo** (Kokoro `am_echo`, American male) = default narrator: Jake, day-in-the-life series, quizzes, market videos.
- **George** (Kokoro `bm_george`, British male) = announcer for the RANKED / Brawl series.
- Kokoro-82M is Apache-2.0 (free, commercial OK), runs on CPU, and is deterministic (same text = same audio, so best-of-N does nothing; fix the TEXT instead).
- Settings: Kokoro speed 1.0, then build.py's TEMPO speeds it up (research/hedge 1.12, superday 1.1, big12fight 1.04). Effective ~1.1-1.15x: that is the pace Bekir approved. No pitch shift. Processing = `highpass=f=70,loudnorm=I=-16:TP=-1.5` only.
- Setup: `/home/user/tts-env` venv with `kokoro misaki soundfile numpy num2words` (setup.sh does this). First run downloads `hexgrad/Kokoro-82M` from Hugging Face.
- Voice a story: `/home/user/tts-env/bin/python /home/user/voicelab/voice.py <story_dir> am_echo` (or `bm_george`). Reads `lines_tts.json` if present, else `lines.json`. Keeps the old audio in `vo_prev/`.
- RETIRED: the Chatterbox clone of Bekir's voice (`narrator.py`, `narrator2.py`). He rated the Kokoro voices better. Do not bring it back. His voice sample is not in the repo (public repo) and is not needed.
- Things that made the voice WORSE (do not repeat): stitching separately generated phrases (choppy, uneven tone, lost question intonation on short phrases like "Tough?"), rubberband formant pitch shift + EQ/de-ess/compression chain, extra pauses between phrases (made it ~25% slower).

## Pronunciation (speakable.py)
- Every line goes through `voicelab/speakable.py` before TTS. Raw symbols get mangled ("$2.52B" was read as "252B", "$1.10" as "one dollar in ton").
- It converts: money ($15.1B → "fifteen point one billion dollars", $1.04 → "one oh four"), %, 4.0x → "four times", times (7:15 → "seven fifteen", 5:05 → "five oh five"), Q3, #1 → "number one", 1st → "first", years, and ~60 finance/school terms (EPS, EBITDA → "ee-bit-dah", DCF, M&A, PM, IPO, NVIDIA → "en-vidia", TCU/BYU/ASU, JPMorgan, U.S., vs.). American number style ("one hundred fifteen", no "and").
- When a word sounds wrong, add it to `LEX` in speakable.py and push.

## Whisper voice check (rubric D1)
- After voicing: `/home/user/cb-env/bin/python /home/user/voicelab/voicecheck.py <story_dir>` must print `VOICE CHECK: ALL PASS`.
- It compares non-number words only (Whisper writes numbers its own way: "530", "No. 3", "5 a.m.", "$7.15"), so check numbers by ear and trust speakable.py.
- Known false flags (OK to pass): "market's" vs "markets", "5 a.m. a company" heard as "ama company", Whisper writing "mnaprep.com" (that means it heard the brand right).
- Lines that genuinely failed and the fix used:
  - "She rechecks the thesis" sounded like "rejects" → "She checks the thesis again".
  - "walk me through a DCF. He nailed it" ran together into "a DC if he" → "walk me through a D C F model".
  - "So who is? The Big 12, ranked." merged into one question → "So who is? Here's the Big 12, ranked."
  - Earlier Chatterbox-era fixes still worth knowing: "cops" → "comp sheet", "Launch" → "lunch", "Deb" → "Dev".

## Video engine fixes already in place (PS2 engine, /home/user/jake2 = social/studio/ps2)
- Cold open (TEASE dict in build.py): first 1.7 s = the climax shot + big yellow hook text. Fixed the weak "Meet Dev"/dark-skyline openings (IG skip rate was 55-87% on flops vs 39-47% on winners).
- First frame is fully lit (no fade from black); Metricool cover `videoCoverMilliseconds: 1000`.
- Captions sit at bottom 470px (clear of TikTok's bottom UI), bold sans.
- Layout guard in engine.html: chips/stamps/cards are lifted above the caption box; stamps never wrap and shrink to fit 1000px; during the hook only the hook + stamps show.
- CALLBACK dict: the closing line plays over a callback scene with its caption; the QR end card is only the last 1.1 s (it used to be 5-8 s of static QR). Clocks are hidden on callback shots (Hedge showed "4:00 PM" after "7 PM").
- Big 12 Brawl: opens on the knockout (tease at 0.36 of shot 2), survivors line-up camera pulled back, stray grey object on end card removed. The old version had a 3 s frozen end card (failed E1); with George's voice it no longer freezes.
- Superday intro: camera pushes in on Jake (was 8 s of a tiny figure in a dark skyline).
- Always: test frame per shot (`node render.js <story>.js tl_<story>.json <dir> test`) → contact sheet → fix → full render → check every 2 s (`ffmpeg -vf fps=0.5,tile`), plus `fps=4` on count-up numbers (mid-roll frames look like wrong numbers but aren't).

## Slides
- Instagram gets native 4:5 renders: `H=1350 node render.js spec` (quiz decks, output `<date>/ig/`), `H=1350 node bluechip.js spec outdir`, `H=1350 node oddq.js spec outdir`. Never squeeze 9:16 into 4:5 with blurred side bars (that was on every IG carousel before Nov 24).
- Pinterest: native 2:3 = render at H=1415, resize to 1000x1310 and add the mnaprep footer (see the Nov 26 holiday pins). `ig.py --pin` assumes 9:16 input and mangles anything else.
- oddq (brainteasers) template used to print "Real interview / UNEXPECTED Interview Question" by default. That claim was false; the default is now "Quick math check / Interview-style brainteaser". Never claim a question is from a real interview unless sourced.

## What scored badly on the rubric (Nov 25 first run) and why
| Post | First score | Failed |
|---|---|---|
| Big 12 business schools (punch video) | 87 | fade-in first frame, audio -22.7 LUFS, no CTA, no cover |
| Black Friday days | 84 | audio -20.1 LUFS, caption said "$2B" (true: $2.2B), no CTA, no cover |
| Markup trap | 87 | audio clipping (+2.3 dB peak), no CTA, no cover |
| Big 12 Brawl | 95 | 3 s frozen end card |
| Slide posts (x4) | 97 | no mnaprep.com in TikTok text, no IG first comment |
Lessons: punch/countdown videos need `loudnorm=I=-14:TP=-2,alimiter=limit=0.8` (single-pass loudnorm alone can overshoot); every post needs the CTA in the text plus an IG/FB/YT first comment; recompute every number in post text.

## Slot and posting conventions
- Voiced videos at 10 AM and 6 PM ET. Slides at least 2 h from any other post on the same platform. Exactly 6 posts/day per platform, min and max (Bekir, 2026-11-28; overrides the run prompt's "max 4 TikToks" and "3-4 posts").
- Media = commit-pinned raw URLs (`raw.githubusercontent.com/bekirkahook-del/MA/<SHA>/social/...`), never `main` (stale CDN copy).
- `updateScheduledPost` needs the FULL content and returns a new id (uuid stays).
- AI labels: TikTok `isAigc`, IG `isAiGenerated`, YT `isAiGeneratedContent` on anything with an AI voice. Music-only videos (punch/countdowns) are not AI-voiced; label false.
- Fictional characters: "X is fictional. AI voice." in the post text; school characters: "not official mascots".

## Pending
- View logging was skipped on Nov 25 (morning went to re-voicing before the 10 AM slot). Next run: add IG/TT/FB/YT views for posts 48 h+ old to `social/winners.md`.
- Queued and already 100/100 with new voices: Hedge DIL (Thu Nov 26 10 AM, Echo), Superday (Fri Nov 27 10 AM, Echo). Re-score them on their day anyway.
- RANKED series: Ivy is next (Big 12 done Nov 25). Use George.
- Superday's caption says "DCF" while the voice says "D C F model": fine, but keep captions and voice consistent in new videos.
- Nov 26 gate: drafted Superday 2-slide TT carousel (83) and Apple bull-case presenter video, all 5 networks (78: old Chatterbox voice, no hook, no cover, no CTA). Apple needs an Echo re-voice + Whisper check before it can return; give it a 6 PM slot.
- Nov 26 env: tts-env (Kokoro) fails to build on Python 3.13 (spacy/blis). Build it with python3.12 instead. huggingface.co and static.metricool.com are blocked by the network policy, so Whisper/Kokoro models can't download and posted media can't be fetched.
