# Assemble voice, timings, lip-sync amp, clip lists -> spec.json/amp.json/clips.json, voice.wav
import json, glob, os, subprocess, numpy as np, soundfile as sf
SR = 44100; LEAD, GAP = 0.45, [0.25, 0.35, 0.3, 0.3, 0.35, 0.3, 0.35]
parts, starts, t = [np.zeros(int(LEAD * SR))], [], LEAD
for i in range(8):
    y, sr = sf.read(f'voicelab/ad/{i:02d}.wav', dtype='float32'); y = y if y.ndim == 1 else y[:, 0]
    assert sr == SR, sr
    nz = np.where(np.abs(y) > 0.01)[0]; y = y[max(0, nz[0] - 800): nz[-1] + 2000]
    starts.append([t, t + len(y) / SR]); parts.append(y); t += len(y) / SR
    if i < 7: parts.append(np.zeros(int(GAP[i] * SR))); t += GAP[i]
END = round(t + 1.6, 2)
v = np.concatenate(parts + [np.zeros(int(1.6 * SR))]); sf.write('voice.wav', v, SR)
hop = SR // 30; env = np.array([np.sqrt(np.mean(v[i:i + hop] ** 2)) for i in range(0, len(v), hop)])
env = np.clip(env / (np.percentile(env, 95) + 1e-6), 0, 1); env = np.convolve(env, [.25, .5, .25], 'same')
json.dump([round(float(x), 3) for x in env], open('amp.json', 'w'))
S = [s for s, e in starts]; E = [e for s, e in starts]
L = lambda a, f, sz, c, g=14: [a, f, sz, c, g]
Y = 230
sc = [
 dict(t=0, y=Y, lines=[L('WANT A JOB IN', 'IX', 84, '#B9C4E0', 6), L('INVESTMENT', 'IB', 140, '#fff', 0), L('BANKING?', 'IB', 140, '#7CF0C8')]),
 dict(t=S[1] - .15, y=Y + 20, lines=[L('M&A PREP', 'IB', 170, '#fff'), L('turns interview prep into a game', 'IX', 62, '#7CF0C8')]),
 dict(t=S[2] - .15, y=Y - 20, lines=[L('5-MINUTE LEVELS', 'IB', 104, '#fff', 4), L('clear them, earn stars', 'IX', 58, '#7CF0C8')], clip='tracks', tag='Learn › Tracks'),
 dict(t=S[3] - .15, y=Y - 20, lines=[L('RAPID FIRE', 'IB', 128, '#fff', 4), L('beat the clock', 'IX', 62, '#7CF0C8')], clip='rapid', tag='Practice › Rapid Fire'),
 dict(t=S[4] - .15, y=Y - 20, lines=[L('MOCK INTERVIEW', 'IB', 104, '#fff', 4), L('300+ real questions, graded', 'IX', 58, '#7CF0C8')], clip='mock', tag='Practice › Interview'),
 dict(t=S[5] - .15, y=Y - 20, lines=[L('REAL DEALS', 'IB', 128, '#fff', 4), L('broken down in plain English', 'IX', 58, '#7CF0C8')], clip='deals', tag='Learn › Deals'),
 dict(t=S[6] - .15, y=Y - 20, lines=[L('REP YOUR SCHOOL', 'IB', 104, '#fff', 4), L('climb the leaderboard', 'IX', 60, '#7CF0C8')], clip='compete', tag='Compete'),
 dict(t=S[7] - .15, y=Y + 10, lines=[L("IT'S FREE.", 'IB', 150, '#7CF0C8', 10), L('mnaprep.com', 'IB', 118, '#fff')]),
]
for i, s in enumerate(sc):
    if s.get('clip'): s['tEnd'] = sc[i + 1]['t'] - .05
# character keyframes [t, cx, feetY, face, mode, size]
C = [[0, -260, 1880, 0, '', 1.05], [1.3, 540, 1880, 0, 'wave', 1.05], [S[1] - .3, 540, 1880, 0, 'talk', 1.05],
     [S[1] + .1, 540, 1880, 0, 'hop', 1.05], [S[2] - .4, 540, 1880, 0, 'talk', 1.05], [S[2] + .3, 235, 1900, .45, 'point', .92]]
for k in (3, 4, 5, 6): C += [[S[k] - .2, 235, 1900, .45, 'talk', .92], [S[k] + .5, 235, 1900, .45, 'point', .92]]
C += [[S[7] - .3, 235, 1900, .45, 'talk', .92], [S[7] + .5, 540, 1880, 0, 'wave', 1.05], [END, 540, 1880, 0, 'wave', 1.05]]
json.dump(dict(end=END, scenes=sc, char=C), open('spec.json', 'w'))
cl = {}
for n in ['tracks', 'rapid', 'mock', 'deals', 'compete']:
    f = sorted(glob.glob(f'clips/{n}/*.jpg')); tm = json.load(open(f'clips/{n}/times.json'))
    k = [s for s in sc if s.get('clip') == n][0]; dur = k['tEnd'] - k['t']
    cl[n] = dict(files=f, times=tm, rate=max(1.0, (tm[-1] - .3) / max(dur, .5)), off=0)
json.dump(cl, open('clips.json', 'w'))
print('END', END, 'starts', [round(x, 2) for x in S])
