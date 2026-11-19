# Liquid-morph MnA ad: status (Nov 19, 2026)

Done:
- `liquid.html` + `render.js`: WebGL liquid-morph renderer (glossy metaballs in site colors, text melts between scenes). Stills look good. `node render.js scenes.json out.mp4` renders; `--stills 1.5,7.6` previews.
- Bekir's own voice: from Google Drive folder "M&A Prep - Brand Voice & Content Plan" (narrator_ref.wav, narrator.py, humanize.py). NOT ElevenLabs. Setup: `python3.11 -m venv cb-env && . cb-env/bin/activate && pip install chatterbox-tts faster-whisper jiwer num2words`, put files in `voicelab/` (+ `voicelab/refs/narrator_ref.wav`), then `python voicelab/gen_ad.py` (8 lines, writes voicelab/ad/NN.wav). gitignored, so redo in a new session.
- `recapp.js`: records phone clips of the real app's top features into clips/: tracks (level + drill), rapid (Rapid Fire), mock (Mock interview, 301 questions), deals (Marvell→Lumentum breakdown), compete (Collegiate Series + leaderboards).

To do:
1. Concat voice lines (≈0.35s gaps), take sentence times, set the `scenes.json` start times to match. The script is in gen_ad.py.
2. Composite: liquid background + headline text at the top, a phone mockup that plays the clips/ frames per feature, and a PS2-style low-poly host in a suit (three.js is in node_modules, render at low res and upscale with nearest-neighbor) who walks around, points at the phone, and moves his mouth with the voice RMS.
3. Mix: voice, a quiet music bed, whooshes on transitions, -14 LUFS. Output to social/vid/<date>/ad-liquid.mp4. Mark it AI-generated when posting.
Note: when signed out, the mock interview question area renders empty (worth checking on the live site).
