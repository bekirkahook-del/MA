"""Voice a whole PS2 story with Kokoro (Apache-2.0, free for commercial use). Bekir's picks (Nov 25):
  am_echo   = default narrator (stories, quizzes, market videos)
  bm_george = RANKED / Brawl announcer
Usage: /home/user/tts-env/bin/python voice.py <story_dir> [voice] [speed]
Reads <story>/lines_tts.json if present, else lines.json; writes <story>/vo/l1.wav ...; the previous vo/ is kept as vo_prev/.
Every line goes through speakable.py first, then gets checked word for word by Whisper (run separately: voicecheck.py)."""
import sys, os, json, shutil, subprocess, numpy as np, soundfile as sf
sys.path.insert(0, '/home/user/voicelab')
from speakable import speakable
from kokoro import KPipeline
story = sys.argv[1].rstrip('/'); voice = sys.argv[2] if len(sys.argv) > 2 else 'am_echo'
speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
src = f'{story}/lines_tts.json' if os.path.exists(f'{story}/lines_tts.json') else f'{story}/lines.json'
lines = [l[0] for l in json.load(open(src))]
if os.path.isdir(f'{story}/vo') and not os.path.isdir(f'{story}/vo_prev'):
    shutil.copytree(f'{story}/vo', f'{story}/vo_prev')
os.makedirs(f'{story}/vo', exist_ok=True)
pipe = KPipeline(lang_code=voice[0], repo_id='hexgrad/Kokoro-82M')
for i, t in enumerate(lines, 1):
    out = f'{story}/vo/l{i}.wav'
    if not t.strip():   # silent line (e.g. end card): keep a short silence
        sf.write(out, np.zeros(int(0.6 * 24000)), 24000); continue
    a = np.concatenate([np.asarray(x) for _, _, x in pipe(speakable(t), voice=voice, speed=speed)])
    tmp = out + '.raw.wav'; sf.write(tmp, a, 24000)
    # light polish only (Bekir disliked heavy processing): rumble cut + steady loudness
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp, '-af', 'highpass=f=70,loudnorm=I=-16:TP=-1.5',
                    '-ar', '44100', '-ac', '1', out], check=True); os.remove(tmp)
    print(json.dumps({'line': i, 'text': t, 'spoken': speakable(t)}), flush=True)
print('done', story, voice)
