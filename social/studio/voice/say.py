import sys, numpy as np, soundfile as sf, torch
from kokoro import KPipeline
pipe=KPipeline(lang_code='a')
def voice_tensor(spec):
    # spec like "am_michael:0.6,am_fenrir:0.4" -> blended custom voice
    parts=[p.split(':') for p in spec.split(',')]
    vs=[pipe.load_voice(n)*float(w) for n,w in parts]
    return sum(vs)
def say(text, spec, out, speed=1.0):
    v=voice_tensor(spec) if (',' in spec or ':' in spec) else spec
    audio=[a for _,_,a in pipe(text, voice=v, speed=speed)]
    sf.write(out, np.concatenate(audio), 24000)
if __name__=='__main__':
    say(sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv)>4 else 1.0)
