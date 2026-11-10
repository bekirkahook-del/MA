#!/usr/bin/env python3
"""Synthesized soundtrack for rankvid.js / teaservid.js (original audio, no licensing issues).
Usage: python3 sfx.py out.wav DURATION '{"hits":[t,...],"roll":t,"reveal":t,"end":t,"ticks":[t,...]}'
A punchy 120bpm trap-ish beat + whoosh on each row, snare roll before the reveal, impact + shimmer on #1, ticks for timers."""
import sys, json, wave
import numpy as np
SR = 44100
out, dur, ev = sys.argv[1], float(sys.argv[2]), json.loads(sys.argv[3])
N = int(SR * dur); mix = np.zeros(N)
rng = np.random.default_rng(7)
def add(sig, t, gain=1.0):
    i = int(t * SR)
    if i >= N: return
    j = min(N, i + len(sig)); mix[i:j] += sig[: j - i] * gain
def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def kick():
    n = int(.35 * SR); t = np.arange(n) / SR; f = 50 + 120 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .12)
def hat():
    n = int(.05 * SR); s = rng.standard_normal(n); s = np.diff(s, prepend=0); return s * env(n, .0005, .012) * .5
def snare(d=.12):
    n = int(.25 * SR); t = np.arange(n) / SR
    return (rng.standard_normal(n) * .7 + np.sin(2 * np.pi * 190 * t) * .5) * env(n, .001, d)
def bass(freq, length):
    n = int(length * SR); t = np.arange(n) / SR
    return np.tanh(2 * np.sin(2 * np.pi * freq * t)) * env(n, .005, length * .6) * .35
def whoosh():
    n = int(.35 * SR); s = rng.standard_normal(n); k = np.linspace(0, 1, n)
    s = np.convolve(s, np.ones(8) / 8, 'same'); return s * np.sin(np.pi * k) ** 2 * .35
def pop():
    n = int(.12 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * (900 - 2500 * t) * t) * env(n, .001, .04) * .5
def impact():
    n = int(1.8 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(40 + 80 * np.exp(-t * 8)) / SR) * env(n, .001, .5)
    noise = rng.standard_normal(n) * env(n, .001, .25) * .4
    shimmer = sum(np.sin(2 * np.pi * f * t) for f in (1318.5, 1975.5, 2637)) * env(n, .01, .7) * .08
    return boom + noise + shimmer
def tick():
    n = int(.04 * SR); t = np.arange(n) / SR; return np.sin(2 * np.pi * 2200 * t) * env(n, .0005, .01) * .6
# beat: 120 bpm, stops during the drumroll, comes back harder after the reveal
beat = 0.5; roll, reveal, end = ev.get("roll", dur), ev.get("reveal", dur), ev.get("end", dur)
notes = [55, 55, 65.4, 49]
t = 0.0; k = 0
while t < dur:
    quiet = roll <= t < reveal
    if not quiet:
        if k % 2 == 0: add(kick(), t, .9)
        if k % 2 == 1: add(snare(.08), t, .35)
        add(hat(), t + beat / 2, .5); add(hat(), t, .35)
        if k % 2 == 0: add(bass(notes[(k // 2) % 4], beat * 2), t, 1)
    t += beat; k += 1
for h in ev.get("hits", []): add(whoosh(), h - .1); add(pop(), h + .25)
for h in ev.get("ticks", []): add(tick(), h)
if roll < dur:
    tt = roll; step = .11
    while tt < reveal - .05: add(snare(.05), tt, .25 + .5 * (tt - roll) / max(.1, reveal - roll)); tt += step; step = max(.04, step * .93)
if reveal < dur: add(impact(), reveal, .9)
if end < dur: add(whoosh(), end - .15, 1.2)
mix /= max(1e-6, np.max(np.abs(mix))) / .89
fade = int(.4 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
pcm = (mix * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
