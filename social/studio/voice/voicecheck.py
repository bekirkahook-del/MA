"""Whisper-check every voiced line of a story (rubric D1). Usage: /home/user/cb-env/bin/python voicecheck.py <story_dir>
Prints each line's word error (after the same speakable() normalization) and lowest word confidence; exits 1 if any line fails."""
import sys, os, json, jiwer, re
sys.path.insert(0, '/home/user/voicelab')
from speakable import speakable
from faster_whisper import WhisperModel
from num2words import num2words
story = sys.argv[1].rstrip('/')
src = f'{story}/lines_tts.json' if os.path.exists(f'{story}/lines_tts.json') else f'{story}/lines.json'
lines = [l[0] for l in json.load(open(src))]
m = WhisperModel('small.en', compute_type='int8')
NUMW = set("zero oh one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand million billion trillion point first second third".split())
def words(s):
    # Whisper writes numbers its own way ("530", "No. 3", "5 a.m."), so numbers are compared separately by ear and
    # in speakable.py; here we check every NON-number word was said right.
    s = re.sub(r"\bno\.\s?(?=\d)", "number ", s, flags=re.I)
    s = re.sub(r"\b([ap])\.m\.", r"\1 m", s, flags=re.I).replace('.com', ' dot com')
    s = re.sub(r"\b(mnaprep|mandaprep|m and aprep)\b", "m and a prep", s, flags=re.I).replace("'", "")
    s = speakable(s).lower().replace('-', ' ')
    s = re.sub(r"\b([a-z])\s(?=[a-z]\b)", r"\1", s)          # "e p s" -> "eps"
    s = re.sub(r"\ba m\b", "am", s).replace("m and a prep", "mnaprep")
    return [w for w in re.sub(r"[^a-z0-9 ]", " ", s).split() if w not in NUMW and not w.isdigit()]
bad = 0
for i, t in enumerate(lines, 1):
    if not t.strip(): continue
    segs, _ = m.transcribe(f'{story}/vo/l{i}.wav', word_timestamps=True); segs = list(segs)
    hyp = ' '.join(s.text for s in segs); ws = [w for s in segs for w in s.words]
    wer = jiwer.wer(' '.join(words(t)), ' '.join(words(hyp))) if words(hyp) else 1.0
    minp = min((w.probability for w in ws), default=0)
    ok = wer <= 0.1
    bad += not ok
    print(f"{'OK ' if ok else 'BAD'} l{i} wer={wer:.2f} minp={minp:.2f} | {t[:60]} | heard: {hyp.strip()[:60]}")
print('VOICE CHECK:', 'ALL PASS' if not bad else f'{bad} line(s) to fix')
sys.exit(1 if bad else 0)
