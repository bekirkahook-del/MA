# usage: python3 voiceover.py <video.mp4> <script.json> <voice> <out.mp4>
# script.json = [[start_sec, "line"], ...]. Each line starts at its time; if it would run into the next line,
# it is re-spoken faster (up to 1.35x), then nudged later as a last resort.
import sys, json, subprocess, numpy as np, soundfile as sf, os
from kokoro_onnx import Kokoro
D = os.path.dirname(os.path.abspath(__file__))
vid, scr, voice, out = sys.argv[1:5]
k = Kokoro(f"{D}/kokoro.onnx", f"{D}/voices.bin")
lang = "en-gb" if voice.startswith("b") else "en-us"
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vid]))
lines = json.load(open(scr)); SR = 24000
track = np.zeros(int((dur + 1) * SR), dtype=np.float32); cursor = 0.0
for i, (t, txt) in enumerate(lines):
    slot = (lines[i + 1][0] if i + 1 < len(lines) else dur) - t - 0.15
    sp = 1.12
    while True:
        a, sr = k.create(txt, voice=voice, speed=sp, lang=lang)
        if len(a) / sr <= slot or sp >= 1.35: break
        sp = round(sp + 0.06, 2)
    st = max(t, cursor); s = int(st * SR); a = a[: len(track) - s]
    track[s:s + len(a)] += a; cursor = st + len(a) / SR + 0.08
peak = np.abs(track).max(); track = track / peak * 0.89 if peak else track
track = track[: int(dur * SR)]
sf.write(out + ".wav", track, SR)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", vid, "-i", out + ".wav", "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-movflags", "+faststart", out], check=True)
os.remove(out + ".wav"); print("ok", out, voice, round(cursor, 2), "/", round(dur, 2))
