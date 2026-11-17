import os,sys,torch,torchaudio as ta
sys.path.insert(0,"../nke"); from script import segs,spoken
from chatterbox.tts import ChatterboxTTS
m=ChatterboxTTS.from_pretrained(device="cpu"); torch.manual_seed(7)
os.makedirs("nke",exist_ok=True); k=0
for n,ph in segs:
    for p in ph:
        fn=f"nke/{k:02d}.wav"; k+=1
        if os.path.exists(fn): continue
        ex={"hook":0.8,"cta":0.6,"risk":0.55}.get(n,0.68)
        w=m.generate(spoken(p),audio_prompt_path="ref_am_michael.wav",exaggeration=ex,cfg_weight=0.45,temperature=0.8)
        ta.save(fn,w,m.sr); print("done",fn,spoken(p)[:50],round(w.shape[-1]/m.sr,2),flush=True)
print("ALLDONE",flush=True)
