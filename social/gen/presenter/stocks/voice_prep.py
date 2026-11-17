# check every clip (Whisper match + pitch), assemble with natural pauses, master, word timestamps
import sys,re,json,difflib,subprocess,numpy as np,soundfile as sf
sys.path.insert(0,"."); from script import segs,spoken
from faster_whisper import WhisperModel
SRC="../../cb/"+sys.argv[1]; SR=24000
m=WhisperModel("small.en",compute_type="int8")
norm=lambda s:re.sub(r"[^a-z0-9 ]","",s.lower().replace("-"," ")).split()
def dec(fn,sr=16000): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",fn,"-f","f32le","-ac","1","-ar",str(sr),"-"],capture_output=True).stdout,np.float32)
def f0(y,sr):
    F=int(0.04*sr);H=int(0.02*sr);o=[]
    for j in range(0,len(y)-F,H):
        z=y[j:j+F]
        if np.sqrt(np.mean(z**2))<0.02: continue
        z=z-z.mean();c=np.correlate(z,z,'full')[F-1:];lo,hi=int(sr/400),int(sr/70);k=lo+np.argmax(c[lo:hi])
        if c[k]>0.3*c[0]:o.append(sr/k)
    return np.median(o)
k=0;out=[];idx=[];t=0.0;bad=[]
for n,ph in segs:
    s0=t
    for j,p in enumerate(ph):
        fn=f"{SRC}/{k:02d}.wav"; k+=1
        hyp=" ".join(s.text for s in m.transcribe(dec(fn),beam_size=5)[0])
        ref=spoken(p); r=difflib.SequenceMatcher(None,norm(ref),norm(hyp)).ratio()
        x=dec(fn,SR); pf=f0(x,SR)
        print(f"{k-1:02d} match={r:.2f} F0={pf:.0f} | {hyp.strip()[:70]}")
        if r<0.85: bad.append((k-1,hyp))
        nz=np.where(np.abs(x)>0.012)[0]; x=x[max(0,nz[0]-int(0.02*SR)):nz[-1]+int(0.06*SR)].copy()
        f=int(0.008*SR); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f)
        out.append(x); t+=len(x)/SR
        last=j==len(ph)-1
        g=0 if (last and n=="cta") else (0.4 if last else (0.22 if p.endswith("?") else 0.3))
        out.append(np.zeros(int(g*SR),np.float32)); t+=g
    idx.append((n,"",s0,t-0.25 if n!="cta" else t))
print("BAD:",bad); print("voice length %.2fs"%t)
sf.write("voice_raw.wav",np.concatenate(out),SR); json.dump(idx,open("idx.json","w"))
subprocess.run(["ffmpeg","-y","-v","error","-i","voice_raw.wav","-af","highpass=f=70,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80:makeup=2,loudnorm=I=-15:TP=-1.5:LRA=9","-ar","24000","voice.wav"],check=True)
segs_,_=m.transcribe(dec("voice.wav"),word_timestamps=True,beam_size=5)
w=[(q.word.strip(),float(q.start),float(q.end)) for s in segs_ for q in s.words]
json.dump(w,open("words.json","w")); print(len(w),"words; last ends %.2f"%w[-1][2])
