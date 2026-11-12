# Trap-style beat synced to story/punch timing: 808 slides, hi-hat rolls, snare on 3, dark bell melody, riser + drop on the reveal.
import sys, json, numpy as np, soundfile as sf
J = json.load(open(sys.argv[1])); SR = 44100; B = J["BEAT"]; END = J["END"]; N = int(END * SR) + SR // 2
out = np.zeros(N); rng = np.random.default_rng(11); tt = lambda n: np.arange(n) / SR
def add(x, at, g=1.0):
    s = int(at * SR); e = min(N, s + len(x))
    if 0 <= s < N: out[s:e] += g * x[:e - s]
def kick(): n = int(.25 * SR); t = tt(n); return np.sin(2*np.pi*(50+140*np.exp(-t*40))*t)*np.exp(-t/.09)
def snare(): n = int(.28 * SR); t = tt(n); return (rng.standard_normal(n)*np.exp(-t/.07)*.7 + np.sin(2*np.pi*185*t)*np.exp(-t/.05)*.5)
def hat(d=.03): n = int(d * SR); x = np.diff(rng.standard_normal(n+1)); return x*np.exp(-tt(n)/(d/3))*.22
def b808(f0, f1, d):
    n = int(d * SR); t = tt(n); f = f0 + (f1-f0)*np.minimum(1, t/.12); ph = 2*np.pi*np.cumsum(f)/SR
    return np.tanh(2.2*np.sin(ph))*np.exp(-t/(d*.8))*np.minimum(1, t/.005)
def bell(f, d):
    n = int(d * SR); t = tt(n); return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.01*t)+.2*np.sin(2*np.pi*f*3.98*t))*np.exp(-t/.6)*.18
roll, rev = J["ROLL"], J["T"][0]
bass = [(43.65, 43.65), (43.65, 49.0), (51.9, 51.9), (38.9, 43.65)]   # F1, F1->G1, Ab1, Eb1->F1
mel = [349.2, 415.3, 466.2, 415.3, 349.2, 311.1, 349.2, 261.6]        # F minor bell line
nb = int(END / B) + 1
for b in range(nb):
    at = b * B
    if roll <= at < rev: continue
    bar, pos = divmod(b, 4)
    if pos in (0,) or (pos == 1 and bar % 2 == 1): add(kick(), at, .9)
    if pos == 2: add(snare(), at, .8)
    if pos == 0: f0, f1 = bass[bar % 4]; add(b808(f0, f1, B*3.6), at, .55)
    # hats: 8ths, with a 32nd-note roll on the last beat of every other bar
    if pos == 3 and bar % 2 == 1:
        for k in range(8): add(hat(.02), at + k*B/8, .8 + .2*(k % 2))
    else:
        add(hat(), at, 1); add(hat(), at + B/2, .7)
    add(bell(mel[b % 8], B*1.5), at, 1 if bar % 2 == 0 else .7)
for i, at in enumerate(J["T"][1:]):
    n = int(.3*SR); x = np.convolve(rng.standard_normal(n), np.ones(40)/40, "same")*np.sin(np.pi*tt(n)/.3)**2; add(x, at-.1, .45)
k = roll
while k < rev - .02:
    p = (k-roll)/(rev-roll); add(snare()*.6, k, .4+.6*p); k += max(.03, .14*(1-p)+.03)
n = int((rev-roll)*SR); t = tt(n); add(np.sin(2*np.pi*(150+1100*(t/t[-1])**2)*t)*(t/t[-1])*.22, roll)
n = int(2*SR); t = tt(n); add(b808(43.65, 32.7, 2.0)*1.1 + rng.standard_normal(n)*np.exp(-t/.06)*.6, rev, 1.0)
for c in J.get("clicks", []):
    n = int(.018*SR); add(np.diff(rng.standard_normal(n+1))*np.exp(-tt(n)/.004)*.18, c, 1)
f = int(.6*SR); out[-f:] *= np.linspace(1, 0, f)
out = np.tanh(out*1.3); out = out/np.abs(out).max()*.89
sf.write(sys.argv[2], np.stack([out, out], 1).astype(np.float32), SR)
