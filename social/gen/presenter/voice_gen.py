import os,re,json,torch,torchaudio as ta,numpy as np
from chatterbox.tts import ChatterboxTTS
src=open("../v3/tts4.py").read(); a=src.index("segs=["); b=src.index("def pause")
ns={}; exec(src[a:b],ns); segs=ns["segs"]
m=ChatterboxTTS.from_pretrained(device="cpu"); torch.manual_seed(5)
os.makedirs("s2",exist_ok=True); k=0
for n,ph in segs:
    for p in ph:
        fn=f"s2/{k:02d}.wav"; k+=1
        if os.path.exists(fn): continue
        ex=0.85 if n=="hook" else (0.75 if n=="cta" else 0.65)
        w=m.generate(p,audio_prompt_path="ref_am_michael.wav",exaggeration=ex,cfg_weight=0.45,temperature=0.8)
        ta.save(fn,w,m.sr); print("done",fn,p[:40],w.shape[-1]/m.sr,flush=True)
print("ALLDONE",flush=True)
