#!/usr/bin/env python3
"""Voiceover for rankvid.js / teaservid.js using Piper TTS (offline). Voice: en_US-joe-medium (CC0 dataset).
Setup (once per machine): pip install piper-tts numpy --break-system-packages; voice files in ~/.piper/ (see DAILY.md).
  python3 vo.py synth OUTDIR '["line 1", "line 2", ...]'   -> OUTDIR/vo_00.wav ... ; prints JSON list of durations (s)
  python3 vo.py mix MUSIC.wav OUT.wav '[[t, "OUTDIR/vo_00.wav"], ...]'  -> music ducked under the voice"""
import sys, json, os, wave, subprocess
import numpy as np
SR = 44100
VOICE = os.environ.get("PIPER_VOICE", os.path.expanduser("~/.piper/en_US-joe-medium.onnx"))
def read(p):
    w = wave.open(p); sr = w.getframerate(); ch = w.getnchannels()
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    if ch > 1: a = a.reshape(-1, ch).mean(1)
    if sr != SR: a = np.interp(np.arange(int(len(a) * SR / sr)) * sr / SR, np.arange(len(a)), a)
    return a
def write(p, a):
    a = np.clip(a, -1, 1); w = wave.open(p, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((a * 32767).astype(np.int16).tobytes()); w.close()
mode = sys.argv[1]
if mode == "synth":
    out, lines = sys.argv[2], json.loads(sys.argv[3]); os.makedirs(out, exist_ok=True); durs = []
    for i, t in enumerate(lines):
        raw = os.path.join(out, f"_raw_{i:02d}.wav"); p = os.path.join(out, f"vo_{i:02d}.wav")
        subprocess.run([sys.executable, "-m", "piper", "-m", VOICE, "--length-scale", "0.85", "-f", raw], input=t.encode(), check=True, capture_output=True)
        a = read(raw); os.remove(raw)
        nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0] - 400): nz[-1] + 1200] if len(nz) else a  # trim silence
        a = a / (np.abs(a).max() + 1e-9) * 0.9; write(p, a); durs.append(round(len(a) / SR, 3))
    print(json.dumps(durs))
else:
    music, out, ev = read(sys.argv[2]), sys.argv[3], json.loads(sys.argv[4])
    voice = np.zeros(len(music))
    for t, p in ev:
        a = read(p); i = int(t * SR); j = min(len(voice), i + len(a))
        if i < len(voice): voice[i:j] += a[: j - i]
    # duck the music while the voice talks (smoothed envelope)
    env = np.convolve((np.abs(voice) > 0.02).astype(float), np.ones(int(.25 * SR)) / int(.25 * SR), "same")
    duck = 1 - 0.65 * np.clip(env * 3, 0, 1)
    mix = music / (np.abs(music).max() + 1e-9) * 0.55 * duck + voice * 0.95
    write(out, mix / max(1, np.abs(mix).max() / 0.97))
