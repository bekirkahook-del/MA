import sys, time, torch, torchaudio as ta
from chatterbox.tts import ChatterboxTTS
m=ChatterboxTTS.from_pretrained(device='cpu')
jobs=[l.split('|') for l in open(sys.argv[1]).read().strip().split('\n')]
for out,ref,ex,cfg,text in jobs:
    t=time.time();w=m.generate(text,audio_prompt_path=ref,exaggeration=float(ex),cfg_weight=float(cfg))
    ta.save(out,w,m.sr);print(out,round(time.time()-t,1),'s',flush=True)
