# Original beat + sound design synced to punch.js timing: 124bpm kick/clap/hats/bass, whoosh on each cut, riser + drumroll before #1, impact on reveal.
import sys, json, numpy as np, soundfile as sf
J = json.load(open(sys.argv[1])); SR = 44100; B = J["BEAT"]; END = J["END"]; N = int(END * SR) + SR // 2
out = np.zeros(N); rng = np.random.default_rng(7); t = lambda n: np.arange(n) / SR
def add(x, at, g=1.0):
    s = int(at * SR); e = min(N, s + len(x))
    if s < N: out[s:e] += g * x[:e - s]
def kick(): n = int(.32 * SR); tt = t(n); return np.sin(2 * np.pi * (48 + 110 * np.exp(-tt * 30)) * tt) * np.exp(-tt / .12)
def clap(): n = int(.2 * SR); return rng.standard_normal(n) * np.exp(-t(n) / .045) * .6
def hat(): n = int(.05 * SR); return rng.standard_normal(n) * np.exp(-t(n) / .012) * .25
def bass(f, d): n = int(d * SR); tt = t(n); w = np.sign(np.sin(2 * np.pi * f * tt)) * .3 + np.sin(2 * np.pi * f * tt) * .7; return w * np.minimum(1, tt / .01) * np.exp(-tt / .35)
def whoosh(): n = int(.35 * SR); x = rng.standard_normal(n); x = np.convolve(x, np.ones(30) / 30, "same"); env = np.sin(np.pi * t(n) / .35) ** 2; return x * env * 1.4
def impact(): n = int(1.6 * SR); tt = t(n); return (np.sin(2 * np.pi * (40 + 80 * np.exp(-tt * 12)) * tt) * np.exp(-tt / .5) + rng.standard_normal(n) * np.exp(-tt / .08) * .5)
roll, rev = J["ROLL"], J["T"][0]
notes = [55, 55, 65.4, 49]
nb = int(END / B) + 1
for b in range(nb):
    at = b * B
    if roll <= at < rev: continue  # drop out for the drumroll
    if b % 1 == 0: add(kick(), at, .9)
    if b % 2 == 1: add(clap(), at, .7)
    add(hat(), at + B / 2, 1); add(hat(), at + B * .75, .5)
    add(bass(notes[(b // 4) % 4], B * .9), at, .35)
for i, at in enumerate(J["T"]):
    if i > 0: add(whoosh(), at - .12, .5)
# drumroll + riser
k = roll
while k < rev - .02:
    gap = max(.035, .16 * (1 - (k - roll) / (rev - roll)) + .035); add(clap() * .5, k, .5 + .5 * (k - roll) / (rev - roll)); k += gap
n = int((rev - roll) * SR); tt = t(n); add(np.sin(2 * np.pi * (200 + 900 * (tt / tt[-1]) ** 2) * tt) * (tt / tt[-1]) * .25, roll)
add(impact(), rev, 1.2)
fade = np.ones(N); f = int(.6 * SR); fade[-f:] = np.linspace(1, 0, f); out *= fade
out = out / np.abs(out).max() * .89
sf.write(sys.argv[2], np.stack([out, out], 1).astype(np.float32), SR)
