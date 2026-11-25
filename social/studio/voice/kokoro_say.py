"""Kokoro (Apache-2.0, free for commercial use) narrator. Usage: python kokoro_say.py VOICE "text" out.wav [speed]"""
import sys, numpy as np, soundfile as sf
sys.path.insert(0, '/home/user/voicelab')
from speakable import speakable
from kokoro import KPipeline
voice, text, out = sys.argv[1], sys.argv[2], sys.argv[3]
speed = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
pipe = KPipeline(lang_code=voice[0], repo_id='hexgrad/Kokoro-82M')
audio = np.concatenate([np.asarray(a) for _, _, a in pipe(speakable(text), voice=voice, speed=speed)])
sf.write(out, audio, 24000)
