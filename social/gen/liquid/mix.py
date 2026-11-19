# Original music bed + whooshes + voice, loudness -14 LUFS, mux with video.mp4 -> final.mp4
import json, numpy as np, soundfile as sf, subprocess
SR = 44100; spec = json.load(open('spec.json')); END = spec['end']; N = int(END * SR); t = np.arange(N) / SR
rng = np.random.default_rng(7); bpm = 112; beat = 60 / bpm
def tone(f, tt): return np.sin(2 * np.pi * f * tt) + .3 * np.sin(4 * np.pi * f * tt)
chords = [[220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 392], [164.8, 207.7, 246.9, 329.6]]
pad = np.zeros(N); bar = 4 * beat
for i in range(int(END / bar) + 1):
    a, b = int(i * bar * SR), min(N, int((i + 1) * bar * SR)); seg = t[a:b] - i * bar
    env = np.minimum(1, seg / .4) * np.minimum(1, (bar - seg) / .4)
    for f in chords[i % 4]: pad[a:b] += tone(f, t[a:b]) * env * .05
    for k in range(4):  # bass pluck + soft kick each beat
        s = int((i * bar + k * beat) * SR); e = min(N, s + int(.35 * SR))
        if s >= N: continue
        tt = np.arange(e - s) / SR
        pad[s:e] += np.sin(2 * np.pi * chords[i % 4][0] / 2 * tt) * np.exp(-tt * 7) * .22
        pad[s:e] += np.sin(2 * np.pi * (55 + 90 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 14) * .5
        h = int((i * bar + k * beat + beat / 2) * SR); 
        if h + 2000 < N: pad[h:h + 2000] += rng.standard_normal(2000) * np.exp(-np.arange(2000) / 300) * .06
fx = np.zeros(N)
for s in spec['scenes'][1:]:
    a = int((s['t'] - .3) * SR); L = int(.6 * SR)
    if a < 0 or a + L > N: continue
    nz = rng.standard_normal(L); nz = np.convolve(nz, np.ones(6) / 6, 'same'); x = np.linspace(0, 1, L)
    fx[a:a + L] += nz * np.sin(np.pi * x) ** 2 * .22
v, _ = sf.read('voice.wav', dtype='float32'); v = np.pad(v, (0, max(0, N - len(v))))[:N]
venv = np.convolve(np.abs(v), np.ones(4410) / 4410, 'same'); duck = 1 - .55 * np.clip(venv / (venv.max() * .3), 0, 1)
fade = np.minimum(1, t / .5) * np.minimum(1, (END - t) / 1.2)
mixd = v * 1.0 + (pad * duck * .55 + fx) * fade
sf.write('mix.wav', np.clip(mixd, -1, 1).astype(np.float32), SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'video.mp4', '-i', 'mix.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=9', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest', 'final.mp4'], check=True)
print('final.mp4')
