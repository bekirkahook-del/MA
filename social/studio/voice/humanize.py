"""Humanize BlueChip voices: bootstrap references + best-of-N take selection.
Scores each take on: word accuracy (Whisper), pitch expressiveness (f0 spread),
natural speaking rate, and no long dead air. Picks the most human-sounding take."""
import os, sys, json, re, time, numpy as np, torch, torchaudio as ta, librosa, jiwer
from chatterbox.tts import ChatterboxTTS
from faster_whisper import WhisperModel

torch.manual_seed(0)
D = os.path.dirname(os.path.abspath(__file__))
tts = ChatterboxTTS.from_pretrained(device='cpu')
asr = WhisperModel('small.en', device='cpu', compute_type='int8')

from num2words import num2words
def norm(s):
    s = re.sub(r"(\d+(?:\.\d+)?)", lambda m: " " + num2words(float(m.group(1)) if "." in m.group(1) else int(m.group(1))) + " ", s)
    s = re.sub(r"\b([A-Za-z])\.?\s(?=[A-Za-z]\b)", r"\1", s)   # "U S C" -> "USC"
    s = re.sub(r"\b([A-Z])\s(?=[A-Z]\b)", r"\1", s)
    s = s.replace('$', ' dollars ')
    return re.sub(r"[^a-z0-9 ]", " ", s.lower().replace('-', ' ')).split()

def score(path, text):
    y, sr = librosa.load(path, sr=16000)
    dur = len(y) / sr
    segs, _ = asr.transcribe(path, beam_size=1)
    hyp = " ".join(s.text for s in segs)
    wer = jiwer.wer(" ".join(norm(text)), " ".join(norm(hyp))) if norm(hyp) else 1.0
    f0, vf, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr, frame_length=1024)
    f0 = f0[~np.isnan(f0)]
    spread = float(np.std(12 * np.log2(f0 / np.median(f0)))) if len(f0) > 20 else 0.0  # semitones
    wps = len(norm(text)) / max(dur, .1)
    rms = librosa.feature.rms(y=y, frame_length=1024, hop_length=256)[0]
    quiet = rms < (0.05 * rms.max())
    longest = 0; run = 0
    for q in quiet:
        run = run + 1 if q else 0; longest = max(longest, run)
    gap = longest * 256 / sr
    s = 0.0
    s -= 6 * wer                                   # wrong words = unusable
    s += min(spread, 4.5) * 0.6                    # lively intonation, capped (not chaotic)
    s -= abs(wps - 2.9) * 0.5                      # natural pace ~2.9 words/sec
    s -= max(0, gap - 0.7) * 2                     # dead air / glitches
    return dict(score=round(s, 3), wer=round(wer, 3), spread=round(spread, 2), wps=round(wps, 2), gap=round(gap, 2), hyp=hyp.strip())

def best_of(text, ref, ex, cfg, out, n=3):
    takes = []
    for i in range(n):
        p = out.replace('.wav', f'_t{i}.wav')
        w = tts.generate(text, audio_prompt_path=ref, exaggeration=ex, cfg_weight=cfg)
        ta.save(p, w, tts.sr)
        sc = score(p, text); sc['path'] = p; takes.append(sc)
        print(f"  take {i}: {sc}", flush=True)
    clean = [t for t in takes if t['wer'] <= 0.05]
    best = max(clean or takes, key=lambda t: t['score'])  # never pick a take with wrong words if a clean one exists
    os.replace(best['path'], out)
    return best, takes

if __name__ == '__main__':
    plan = json.load(open(sys.argv[1]))
    log = {}
    for job in plan:
        print(job['out'], flush=True)
        best, takes = best_of(job['text'], job['ref'], job['ex'], job['cfg'], os.path.join(D, job['out']), job.get('n', 3))
        log[job['out']] = dict(best=best, takes=takes)
        print("  BEST:", best, flush=True)
    json.dump(log, open(os.path.join(D, sys.argv[1].replace('.json', '_log.json')), 'w'), indent=1)
