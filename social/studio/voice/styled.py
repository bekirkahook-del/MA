"""Narrator style: ~174 wpm, sentence-by-sentence, ~0.7s pauses, calm authority. Best-of-N per sentence."""
import sys, os, json, numpy as np, soundfile as sf, torch, torchaudio as ta
sys.argv_backup=sys.argv; sys.argv=['x']
code=open('humanize.py').read()
exec(code[:code.index("if __name__")])
def score_style(path,text):
    s=score(path,text)
    # retarget pace to 174 wpm = 2.9 wps, stronger penalty; calmer spread target ~3 semitones
    s['score']=round(-6*s['wer'] - abs(s['wps']-2.9)*1.5 - abs(s['spread']-3.0)*0.4 - max(0,s['gap']-0.7)*2,3)
    return s
def line(text, ref, ex, cfg, out, n=3):
    takes=[]
    for i in range(n):
        p=out.replace('.wav',f'_t{i}.wav')
        w=tts.generate(text,audio_prompt_path=ref,exaggeration=ex,cfg_weight=cfg) if ref else tts.generate(text,exaggeration=ex,cfg_weight=cfg)
        ta.save(p,w,tts.sr); sc=score_style(p,text); sc['path']=p; takes.append(sc)
    clean=[t for t in takes if t['wer']<=0.05]
    best=max(clean or takes,key=lambda t:t['score']); print(os.path.basename(out),best['score'],best['wer'],best['wps'],best['spread'],flush=True)
    return best['path']
script=["Most people think you need an Ivy League degree to work on Wall Street.",
 "But the reality? Some of the biggest feeder schools aren't Ivies at all.",
 "And if you pick a school without knowing this, you could pay for it later.",
 "So today, I'll show you which schools actually place students at the top banks,",
 "and the one number that matters more than prestige."]
for tag,ref in [('default',None),('ours','ref2_announcer.wav')]:
    parts=[]
    for k,s in enumerate(script):
        parts.append(line(s,ref,0.45,0.5,f'sty_{tag}_{k}.wav',n=3))
    sr=tts.sr; out=[]
    rng=np.random.default_rng(1)
    for k,p in enumerate(parts):
        y,_=sf.read(p); out.append(y)
        if k<len(parts)-1:
            pause=0.35 if script[k].endswith(',') else rng.uniform(0.55,0.8)
            out.append(np.zeros(int(pause*sr)))
    sf.write(f'styled_{tag}.wav',np.concatenate(out),sr)
    total=sum(len(x) for x in out)/sr; words=sum(len(s.split()) for s in script)
    print(tag,'duration',round(total,1),'s, wpm',round(words/total*60),flush=True)
