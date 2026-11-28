# Echo (Kokoro am_echo) version of voice_prep.py: clips from story/vo (already whisper-checked by voicecheck.py),
# natural pauses, TEMPO 1.1 (Bekir-approved pace), light processing only (highpass + loudnorm), word timestamps.
import sys,re,json,subprocess,numpy as np,soundfile as sf
sys.path.insert(0,"."); from script import segs,spoken
from faster_whisper import WhisperModel
SR=24000; TEMPO=1.1
def dec(fn,sr=SR): return np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",fn,"-f","f32le","-ac","1","-ar",str(sr),"-"],capture_output=True).stdout,np.float32)
k=0;out=[];idx=[];t=0.0
for n,ph in segs:
    s0=t
    for j,p in enumerate(ph):
        k+=1; x=dec(f"story/vo/l{k}.wav").copy()
        nz=np.where(np.abs(x)>0.012)[0]; x=x[max(0,nz[0]-int(0.02*SR)):nz[-1]+int(0.06*SR)].copy()
        f=int(0.008*SR); x[:f]*=np.linspace(0,1,f); x[-f:]*=np.linspace(1,0,f)
        out.append(x); t+=len(x)/SR
        last=j==len(ph)-1
        g=0 if (last and n=="cta") else (0.36 if last else (0.22 if p.endswith("?") else 0.26))
        out.append(np.zeros(int(g*SR),np.float32)); t+=g
    idx.append((n,"",s0/TEMPO,(t-0.25 if n!="cta" else t)/TEMPO))
sf.write("voice_raw.wav",np.concatenate(out),SR); json.dump(idx,open("idx.json","w"))
subprocess.run(["ffmpeg","-y","-v","error","-i","voice_raw.wav","-af",f"atempo={TEMPO},highpass=f=70,loudnorm=I=-16:TP=-1.5","-ar","24000","voice.wav"],check=True)
m=WhisperModel("small.en",compute_type="int8")
segs_,_=m.transcribe(dec("voice.wav",16000),word_timestamps=True,beam_size=5)
w=[(q.word.strip(),float(q.start),float(q.end)) for s in segs_ for q in s.words]
json.dump(w,open("words.json","w")); print(len(w),"words; last ends %.2f"%w[-1][2]); print(" ".join(x[0] for x in w))
