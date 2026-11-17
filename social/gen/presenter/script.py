import soundfile as sf, numpy as np, json, random, sys
from kokoro_onnx import Kokoro
k=Kokoro("kokoro.onnx","voices.bin"); VOICE=sys.argv[1] if len(sys.argv)>1 else "af_heart"
segs=[("hook",["Four resume mistakes will get you rejected from banking before anyone reads past the top."]),
("1",["Number one is going past one page.","Bankers expect a single page, so cut anything that isn't earning its spot."]),
("2",["Number two is listing duties instead of results.","Don't say you helped with research.","Say what you built, and the number it moved."]),
("3",["Number three is typos and messy formatting.","Keep your font, dates, and spacing consistent.","Banking is a detail job, and your resume is your first test."]),
("4",["Number four is burying the good stuff.","Put your school, GPA, and finance experience at the very top, where recruiters will see it."]),
("cta",["Fix these four, and your resume survives the skim.","Follow Blue Chip Financial for more tips, and get free prep at M and A prep dot com."])]
def pause(p,last):
    if last: return 0.55
    return 0.32
def build(speed):
    random.seed(11); out=[];idx=[];t=0.0
    for n,ph in segs:
        s0=t
        for j,p in enumerate(ph):
            sp=speed*(1+random.uniform(-0.03,0.03))
            a,sr=k.create(p,voice=VOICE,speed=sp,lang="en-us"); a=a.astype(np.float32)
            f=int(0.01*sr); a[:f]*=np.linspace(0,1,f); a[-f:]*=np.linspace(1,0,f)
            out.append(a); t+=len(a)/sr
            g=pause(p,j==len(ph)-1 and n!="cta"); out.append(np.zeros(int(g*sr),dtype=np.float32)); t+=g
        idx.append((n,"",s0,t-0.3 if n!="cta" else t))
    return np.concatenate(out),idx,t
speed=1.08
for _ in range(7):
    a,idx,t=build(speed); print(round(speed,3),round(t,2))
    if 47.8<=t<=48.8: break
    speed*=t/48.3
sf.write("voice_raw4.wav",a,24000); json.dump(idx,open("idx4.json","w"))
