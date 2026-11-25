"""M&A Prep narrator v2 (free upgrades over narrator.py):
- real best-of-N takes (default 4; v1 silently made 1), picked by Whisper word accuracy + naturalness
- formant-preserving pitch/tempo (rubberband) instead of asetrate, which made the voice slightly chipmunk
- broadcast mastering: de-noise, EQ (warmth cut, presence and air lift), de-ess, compression, -16 LUFS
- PRONUNCIATION: text goes through speakable.py first ($15.1B, EBITDA, Q3, 7:15 said like a banker), and
  takes are also scored on Whisper's per-word confidence, so oddly pronounced words lose
- PHRASE MODE (default, Bekir Nov 25 "best of 3 for each second of voice"): the line is split at natural pauses
  (. ? ! , ;) into ~1-3 s phrases; each phrase gets its own best of 3 takes; winners are trimmed, level-matched
  and stitched with natural pauses (0.35 s after . ? !, 0.18 s after , ;). Never cuts inside a word.
Usage: python narrator2.py "text" out.wav [energy 0.4-0.9] [takes per phrase, default 3] [--line = whole-line mode]"""
import sys, os, subprocess, json
sys.argv_in = sys.argv[1:]; sys.argv = ['x']
code = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'humanize.py')).read()
exec(code[:code.index("if __name__")])
from speakable import speakable
# pronunciation scoring: Whisper is unsure about words that are said wrong or oddly, even when it
# transcribes them right, so every take also pays for its least-confident word (and gains for overall clarity)
_base_score = score
def score(path, text):
    r = _base_score(path, text)
    segs, _ = asr.transcribe(path, beam_size=1, word_timestamps=True)
    pr = [w.probability for s_ in segs for w in (s_.words or [])]
    minp = min(pr) if pr else 0.0; meanp = sum(pr) / len(pr) if pr else 0.0
    r['score'] = round(r['score'] + 4 * (meanp - 0.85) - 6 * max(0.0, 0.65 - minp), 3)
    r['minp'], r['meanp'] = round(minp, 3), round(meanp, 3)
    return r
PITCH, TEMPO = 1.059, 0.9   # +1 semitone, ~10% slower (same character as v1)
MASTER = ("highpass=f=70,afftdn=nf=-25,"
          "equalizer=f=250:t=q:w=1.2:g=-2.5,equalizer=f=3500:t=q:w=1.0:g=3,equalizer=f=10000:t=q:w=0.8:g=2,"
          "deesser=i=0.4:m=0.5:f=0.5,"
          "acompressor=threshold=-20dB:ratio=3:attack=8:release=150:makeup=2,"
          "loudnorm=I=-16:TP=-1.5:LRA=7,alimiter=limit=0.89:level=false")
import re, numpy as np, soundfile as sf
def phrases(text):
    parts = re.findall(r"[^.?!,;]+[.?!,;]*", text)
    out = []
    for p in (x.strip() for x in parts if x.strip()):
        # keep tiny fragments (1 word after a comma) attached so prosody stays natural
        if out and len(p.split()) < 2 and out[-1][-1] in ',;':
            out[-1] += ' ' + p
        else:
            out.append(p)
    return out
def trim(y, sr, thr=0.02):
    a = np.abs(y); idx = np.where(a > thr * a.max())[0]
    if not len(idx): return y
    pad = int(0.04 * sr)
    return y[max(0, idx[0] - pad): idx[-1] + pad]
def narrate_phrases(text, out, energy=0.6, n=3):
    ref = os.path.join(D, 'refs/narrator_ref.wav'); pieces = []; report = []
    for k, ph in enumerate(phrases(speakable(text))):
        raw = out.replace('.wav', f'_p{k}.wav')
        best, _ = best_of(ph, ref, energy, 0.45, raw, n)
        if best['wer'] > 0.05:
            best, _ = best_of(ph, ref, energy, 0.45, raw, n)
        y, sr = sf.read(raw)
        if y.ndim > 1: y = y.mean(1)
        y = trim(y, sr); y = y / (np.sqrt(np.mean(y ** 2)) + 1e-9) * 0.08   # level-match phrases
        gap = 0.35 if ph.rstrip()[-1:] in '.?!' else 0.18
        pieces += [y, np.zeros(int(gap * sr))]
        report.append({'phrase': ph, 'wer': best['wer'], 'minp': best.get('minp'), 'spread': best['spread']}); os.remove(raw)
    joined = out.replace('.wav', '_joined.wav'); sf.write(joined, np.concatenate(pieces[:-1]), sr)
    chain = f"aresample=44100,rubberband=pitch={PITCH}:tempo={TEMPO}:formant=preserved:pitchq=quality,{MASTER}"
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', joined, '-af', chain, '-ac', '1', '-ar', '44100', out], check=True)
    os.remove(joined)
    print(json.dumps({'out': out, 'words_ok': all(r['wer'] <= 0.05 for r in report), 'phrases': report}))
def narrate(text, out, energy=0.6, n=4):
    text = speakable(text); raw = out.replace('.wav', '_raw.wav')
    best, _ = best_of(text, os.path.join(D, 'refs/narrator_ref.wav'), energy, 0.45, raw, n)
    if best['wer'] > 0.05:
        best, _ = best_of(text, os.path.join(D, 'refs/narrator_ref.wav'), energy, 0.45, raw, n)
    chain = f"aresample=44100,rubberband=pitch={PITCH}:tempo={TEMPO}:formant=preserved:pitchq=quality,{MASTER}"
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', chain, '-ac', '1', '-ar', '44100', out], check=True)
    print(json.dumps({'out': out, 'words_ok': best['wer'] <= 0.05, 'wer': best['wer'], 'pitch_spread': best['spread']}))
if __name__ == '__main__':
    t, o = sys.argv_in[0], sys.argv_in[1]
    e = float(sys.argv_in[2]) if len(sys.argv_in) > 2 else 0.6
    n = int(sys.argv_in[3]) if len(sys.argv_in) > 3 and sys.argv_in[3].isdigit() else 3
    (narrate if '--line' in sys.argv_in else narrate_phrases)(t, o, e, n)
