import os,json,subprocess,re,numpy as np,soundfile as sf,io,sys
import build as B
from PIL import ImageDraw,Image
R=[]
def ok(name,cond,detail): R.append((("PASS" if cond else "FAIL"),name,detail))
# 1 format
p=json.loads(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate,channels","-of","json",os.environ.get("OUT",os.environ.get("OUT","final.mp4"))],capture_output=True,text=True).stdout)
v=[s for s in p["streams"] if s.get("width")][0]; a=[s for s in p["streams"] if s.get("sample_rate")][0]; dur=float(p["format"]["duration"])
ok("Format 1080x1920 / 30fps / H.264+AAC",v["width"]==1080 and v["height"]==1920 and v["r_frame_rate"]=="30/1" and v["codec_name"]=="h264" and a["codec_name"]=="aac",f'{v["width"]}x{v["height"]} {v["r_frame_rate"]} {v["codec_name"]}/{a["codec_name"]} {a["channels"]}ch')
ok("Length = 50.0s",abs(dur-50.0)<0.05,f"{dur:.2f}s")
# 2 loudness
e=subprocess.run(["ffmpeg","-v","info","-nostats","-i",os.environ.get("OUT",os.environ.get("OUT","final.mp4")),"-af","ebur128=peak=true","-f","null","-"],capture_output=True,text=True).stderr
I=float(re.findall(r"I:\s+(-?[\d.]+) LUFS",e)[-1]); TP=float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS",e)[-1])
ok("Loudness (social target -14 LUFS ±1)",abs(I+14)<=1.0,f"{I:.1f} LUFS")
ok("True peak <= -1 dBTP (no clipping)",TP<=-1.0,f"{TP:.1f} dBTP")
# 3 audio sync: final mp4 audio vs source voice envelope
raw=subprocess.run(["ffmpeg","-v","error","-i",os.environ.get("OUT",os.environ.get("OUT","final.mp4")),"-f","f32le","-ac","1","-ar","8000","-"],capture_output=True).stdout
fa=np.frombuffer(raw,np.float32); vv,sr=sf.read("voice.wav",dtype="float32"); vv=vv if vv.ndim==1 else vv[:,0]
vv=np.interp(np.arange(0,len(vv),sr/8000),np.arange(len(vv)),vv)
def env(x): k=80; return np.convolve(np.abs(x),np.ones(k)/k,'same')[::80]
ea,ev=env(fa),env(vv); n=min(len(ea),len(ev)); ea,ev=ea[:n]-ea[:n].mean(),ev[:n]-ev[:n].mean()
lags=range(-20,21); cc=[np.dot(np.roll(ev,l),ea) for l in lags]; lag=list(lags)[int(np.argmax(cc))]*10
ok("A/V audio offset = 0 ms",abs(lag)<=20,f"{lag} ms")
# 4 captions == script word for word
script=[d for d,s,e,n,sp in B.WORDS if d]; shown=[w[0] for c,_,_ in B.CH for w in c]
ok("Captions match script word-for-word",script==shown,f"{len(shown)} words, {sum(x!=y for x,y in zip(script,shown))} mismatches")
# 5 every spoken word is on screen while spoken
miss=[]
for d,s,e,n,sp in B.WORDS:
    if not d: continue
    mid=(s+e)/2; hit=False
    for k,(c,s0,e0) in enumerate(B.CH):
        nxt=B.CH[k+1][1] if k+1<len(B.CH) else e0+0.6
        if s0-0.04<=mid<min(e0+0.4,nxt) and any(w[0]==d for w in c): hit=True;break
    if not hit: miss.append(d)
ok("Every word on screen while spoken",not miss,f"missing: {miss[:5]}" if miss else f"{len(script)}/{len(script)}")
# 6 text fits the frame
dr=ImageDraw.Draw(Image.new("RGB",(10,10)))
capw=max(dr.textlength(" ".join(B.cap(w[0]) for w in c),font=B.f(B.CAPF)) for c,_,_ in B.CH)
tw=max(dr.textlength(t,font=B.f(80)) for _,t in B.TITLES.values())
ok("No text runs off screen (60px margin)",capw<=B.W-120 and tw<=B.W-120,f"widest caption {capw:.0f}px, title {tw:.0f}px of {B.W}")
# 7 graphics not clipped
clip=[]
for n,_,s,e in B.idx:
    im=B.illus(n,e-0.01); al=np.array(im)[:,:,3]
    if al[0].any() or al[-1].any() or al[:,0].any() or al[:,-1].any(): clip.append(n)
ok("No graphics clipped at edges",not clip,f"clipped: {clip}" if clip else "6/6 scenes clean")
# 8 tip cards switch when the number is spoken
dl=[abs(B.seg_start(k)+0.08-B.NUMT[k]) for k in B.NUMT]
ok("Tip card appears on 'Number X' (±100ms)",max(dl)<=0.1,f"max offset {max(dl)*1000:.0f} ms")
# 9 mouth closed in silence / moving in speech
mo=np.load("mo.npy"); vr=np.array([np.sqrt(np.mean(B.v[int(i/30*B.SR):int((i+1)/30*B.SR)]**2)) if int(i/30*B.SR)<len(B.v) else 0 for i in range(len(mo))])
sil0=vr<0.01; sil=sil0&np.r_[False,sil0[:-1]]; spk=vr>0.05
ok("Mouth shut during pauses (2+ silent frames)",np.mean(mo[sil]<0.12)>0.95,f"{np.mean(mo[sil]<0.12)*100:.0f}% of silent frames closed")
ok("Mouth moves with speech (correlation)",np.corrcoef(mo,vr/vr.max())[0,1]>0.8,f"r = {np.corrcoef(mo,vr/vr.max())[0,1]:.2f}")
# 10 no dead air
gaps=[];prev=0
for d,s,e,n,sp in B.WORDS:
    if s-prev>1.0: gaps.append(round(s-prev,2))
    prev=max(prev,e)
ok("No dead air > 1.0s while talking",not gaps,f"longest pause {max([0]+[s-pe for (pe,(d,s,e,n,sp)) in zip([0]+[w[2] for w in B.WORDS],B.WORDS)]):.2f}s")
for r in R: print(f"{r[0]} | {r[1]} | {r[2]}")
print(f"\n{sum(r[0]=='PASS' for r in R)}/{len(R)} passed")
