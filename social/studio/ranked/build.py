# Build timeline from VO line lengths, write index.html, make the beat and the final audio mix.
import json, subprocess, soundfile as sf, numpy as np
SR = 44100
dur = [sf.info(f'vo/l{i}.wav').duration for i in range(1, 10)]
# line -> start time
st = {}
t = 0.35; st[1] = t                       # hook
hookEnd = st[1] + dur[0] + 0.45
st[2] = hookEnd + 0.1                       # "so who is" over the list countdown
cd0 = hookEnd + 0.05
listDone = cd0 + 1 * 0.34 + 0.6           # rows 13..3 slide in
h3 = max(listDone, st[2] + dur[1] + 0.3)
st[3] = h3 + 0.25
h2 = st[3] + dur[2] + 0.45; st[4] = h2 + 0.25
h1 = st[4] + dur[3] + 0.45; st[5] = h1 + 0.25
hold = st[5] + dur[4] + 1.6                 # list reprise with all rows
miss = hold + 0.8; st[6] = miss + 0.2
x0 = st[6] + dur[5] + 0.25; st[7] = x0
# times the X lands on each card: spread across line 7
xs = [x0 + 0.1 + k * (dur[6] - 0.2) / 12 for k in range(12)]
cta = st[7] + dur[6] + 0.6; st[8] = cta + 0.25
nxt = st[8] + dur[7] + 0.45; st[9] = nxt + 0.25
end = st[9] + dur[8] + 1.2
TL = dict(hookEnd=round(hookEnd, 2), cd0=round(cd0, 2), heroes=[[2, round(h3, 2)], [1, round(h2, 2)], [0, round(h1, 2)]],
          hold=round(hold, 2), miss=round(miss, 2), xs=[round(x, 2) for x in xs], cta=round(cta, 2), next=round(nxt, 2),
          end=round(end, 2), stan=-99)
s = open('tpl.html', encoding='utf-8').read().replace('__TL__', json.dumps(TL))
open('index.html', 'w', encoding='utf-8').write(s)
json.dump(TL, open('tl.json', 'w'))
# beat: ~124 bpm trap, roll into #1, drop on #1
json.dump({"BEAT": 60 / 124, "END": end, "ROLL": h1 - 1.4, "T": [h1]}, open('beat.json', 'w'))
subprocess.run(['/home/user/cb-env/bin/python', '/home/user/ma/social/gen/punch/beat_trap.py', 'beat.json', 'beat.wav'], check=True)
beat, _ = sf.read('beat.wav'); beat = beat[:, 0] if beat.ndim > 1 else beat
N = int((end + 0.3) * SR); vo = np.zeros(N); bt = np.zeros(N); bt[:min(N, len(beat))] = beat[:N]
for i in range(1, 10):
    x, sr = sf.read(f'vo/l{i}.wav'); x = x[:, 0] if x.ndim > 1 else x
    a = int(st[i] * SR); e = min(N, a + len(x)); vo[a:e] += x[:e - a]
# duck the beat under the voice
env = np.convolve((np.abs(vo) > 0.02).astype(float), np.ones(int(.15 * SR)) / int(.15 * SR), 'same')
duck = 1 - 0.55 * np.clip(env * 3, 0, 1)
bt = bt / (np.abs(bt).max() + 1e-9) * 0.55 * duck
mix = vo / (np.abs(vo).max() + 1e-9) * 0.9 + bt
sf.write('mix_raw.wav', np.stack([mix, mix], 1).astype(np.float32), SR)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', 'mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '44100', 'mix.wav'], check=True)
print(json.dumps(TL), {k: round(v, 2) for k, v in st.items()})
