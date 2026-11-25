# M&A Prep narrator voice: how to rebuild it

The voice is fully defined by:
- `narrator_ref.wav`: 15s clean clip of the owner's own voice (the clone source)
- `narrator.py`: Variant B settings (+1 semitone, ~10% slower) and the best-of-3 quality pipeline
- `humanize.py`: the take generator and scorer (Whisper word check, pitch naturalness, pace, dead air)

## Setup (Linux, Python 3.11)
```
python3.11 -m venv cb-env && . cb-env/bin/activate
pip install chatterbox-tts faster-whisper jiwer num2words
mkdir -p voicelab/refs && cp narrator_ref.wav voicelab/refs/ && cp narrator.py humanize.py voicelab/
```
Also needs ffmpeg.

## Use
```
python voicelab/narrator.py "Your line here." out.wav 0.6
```
The last number is energy: 0.4 = calm explainer, 0.9 = hype reveal.
