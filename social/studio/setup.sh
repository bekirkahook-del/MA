#!/bin/sh
# Rebuild the M&A Prep video studio in a fresh container (idempotent).
# Usage: sh social/studio/setup.sh            (from the repo root)
# Puts the code where the pipelines expect it:
#   /home/user/jake2/eng   PS2 character engine (three.js + Playwright)   build: python build.py <story>
#   /home/user/voicelab    narrator voice (Chatterbox clone + Whisper check)
#   /home/user/ranked-big12 RANKED series template
# The narrator's voice sample (narrator_ref.wav) is Bekir's real voice: it is NOT in this public repo.
# Put it at /home/user/voicelab/refs/narrator_ref.wav yourself (ask Bekir where he keeps it).
set -e
R=$(cd "$(dirname "$0")" && pwd)
mkdir -p /home/user/jake2/eng /home/user/voicelab/refs /home/user/ranked-big12/refs
cp -n "$R"/ps2/*.js "$R"/ps2/*.html "$R"/ps2/*.png "$R"/ps2/package.json /home/user/jake2/eng/ 2>/dev/null || true
cp "$R"/ps2/engine.html "$R"/ps2/common.js "$R"/ps2/dlcommon.js "$R"/ps2/render.js /home/user/jake2/eng/
cp "$R"/ps2/build.py /home/user/jake2/build.py
cp "$R"/voice/*.py "$R"/voice/README_voice.md /home/user/voicelab/
cp -n "$R"/ranked/* /home/user/ranked-big12/ 2>/dev/null || true
# Python env for voice + Whisper checks (large: ~6 GB). Skip if it already exists.
if [ ! -x /home/user/cb-env/bin/python ]; then
  python3 -m venv /home/user/cb-env
  /home/user/cb-env/bin/pip install -q chatterbox-tts faster-whisper jiwer num2words soundfile numpy
fi
# Kokoro voices (Echo/George): separate env
if [ ! -x /home/user/tts-env/bin/python ]; then
  python3 -m venv /home/user/tts-env && /home/user/tts-env/bin/pip install -q kokoro misaki soundfile numpy num2words
fi
# Slide/video renderers
(cd "$R/../gen" && npm install --no-audit --no-fund >/dev/null 2>&1) || true
pip install -q qrcode --break-system-packages 2>/dev/null || true
[ -f /home/user/voicelab/refs/narrator_ref.wav ] || echo "NOTE: narrator_ref.wav missing: voice lines can't be recorded until it's added (see header)."
echo "studio ready"
