# Animated presenter videos (quality floor = 78/100, see social/DAILY.md)
Reference: social/vid/2026-11-20/resume-mistakes-a.mp4

1. Script: edit `segs` in script.py (full sentences; one segment per tip: hook, 1-4, cta).
2. Voice: Chatterbox in a venv (`pip install --index-url https://download.pytorch.org/whl/cpu torch torchaudio` then `pip install chatterbox-tts`).
   Make a synthetic reference clip with Kokoro (am_michael for a male presenter), then `python voice_gen.py` (writes s2/NN.wav, ~4 min on CPU).
   Check every clip with Whisper (match >= 0.85) and pitch (male ~110-140 Hz).
3. `python voice_assemble.py` -> voice_raw5.wav + idx5.json, then EQ/compress/loudnorm to voice.wav, Whisper word timestamps -> words.json.
4. `python build.py` -> final.mp4 (aligns script to timings, mixes music/SFX, renders). `python build.py stills 2 8 14` for preview frames.
5. `python qa.py` must print 13/13 passed before posting.
Paths in these copies point at the scratch layout they were built in; adjust the relative paths (../v3/tts4.py etc.) when reusing.
