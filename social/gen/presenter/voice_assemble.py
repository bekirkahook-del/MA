import numpy as np, soundfile as sf, json, subprocess
src=open("../v3/tts4.py").read(); a=src.index("segs=["); b=src.index("def pause"); ns={}; exec(src[a:b],ns); segs=ns["segs"]
SR=24000
def load(i):
    x,sr=sf.read(f"s2/{i:02d}.wav",dtype="float32"); x=x if x.ndim==1 else x[:,0]
    if sr!=SR:
        x=np.interp(np.linspace(0,len(x),int(len(x)*SR/sr),endpoint=False),np.arange(len(x)),x).astype(np.float32)
    nz=np.where(np.abs(x)>0.012)[0]; x=x[max(0,nz[0]-int(0.02*SR)):nz[-1]+int(0.06*SR)] if len(nz) else x
    f=int(0.008*SR); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f); return x
def build(gs,gl):
    out=[];idx=[];t=0.0;k=0
    for n,ph in segs:
        s0=t
        for j,p in enumerate(ph):
            x=load(k); k+=1; out.append(x); t+=len(x)/SR
            g=(gl if j==len(ph)-1 and n!="cta" else gs) if not (j==len(ph)-1 and n=="cta") else 0
            out.append(np.zeros(int(g*SR),dtype=np.float32)); t+=g
        idx.append((n,"",s0,t-0.25 if n!="cta" else t))
    return np.concatenate(out),idx,t
a_,idx,t=build(0.26,0.46); print("raw total",t)
sf.write("raw.wav",a_,SR)
rate=1.0
rate=max(0.9,t/47.4) if t<46 else (t/48.2 if t>48.4 else 1.0)
print("stretch",rate)
if abs(rate-1)>0.005:
    subprocess.run(["ffmpeg","-y","-v","error","-i","raw.wav","-filter:a",f"atempo={rate:.4f}","raw_s.wav"],check=True)
    idx=[(n,x,s/rate,e/rate) for n,x,s,e in idx]; sf.write("voice_raw5.wav",sf.read("raw_s.wav",dtype="float32")[0],SR)
else: sf.write("voice_raw5.wav",a_,SR)
json.dump(idx,open("idx5.json","w")); print(idx)
