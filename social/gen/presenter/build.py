import json,subprocess,math,sys,re,difflib,numpy as np,soundfile as sf
from PIL import Image,ImageDraw,ImageFont,ImageFilter
W,H,FPS,DUR=1080,1920,30,50.0
src=open("../v3/tts4.py").read(); a_=src.index("segs=["); b_=src.index("def pause"); ns={}; exec(src[a_:b_],ns); SEGS=ns["segs"]
idx=json.load(open("idx.json")); asr=json.load(open("words.json"))
# ---------- 1. script tokens with display text, aligned to ASR timings
NUM={"1":"one","2":"two","3":"three","4":"four"}
def norm(w): w=re.sub(r"[^a-z0-9]","",w.lower()); return NUM.get(w,w)
toks=[]  # (spoken_norm, display, seg)
for n,ph in SEGS:
    for p in ph:
        p2=p.replace("M and A prep dot com.","\x00")
        for w in p2.split():
            if w=="\x00":
                for k,s in enumerate(["m","and","a","prep","dot","com"]): toks.append((s,"MNAPREP.COM" if k==0 else "",n))
            else: toks.append((norm(w),w,n))
A=[norm(w) for w,_,_ in asr]
# whisper often fuses "mnaprep .com" -> split for matching
sm=difflib.SequenceMatcher(None,[t[0] for t in toks],A,autojunk=False)
T=[None]*len(toks)
for blk in sm.get_matching_blocks():
    for k in range(blk.size): T[blk.a+k]=(asr[blk.b+k][1],asr[blk.b+k][2])
matched=sum(x is not None for x in T)
# interpolate gaps
i=0
while i<len(T):
    if T[i] is None:
        j=i
        while j<len(T) and T[j] is None: j+=1
        s=T[i-1][1] if i>0 else 0.0; e=T[j][0] if j<len(T) else s+0.35*(j-i)
        step=(e-s)/(j-i)
        for k in range(i,j): T[k]=(s+step*(k-i),s+step*(k-i+1))
        i=j
    else: i+=1
WORDS=[(d,t[0],t[1],n,sp) for (sp,d,n),t in zip(toks,T)]
def wt(word,seg,nth=0):
    c=0
    for d,s,e,n,sp in WORDS:
        if n==seg and sp==word:
            if c==nth: return s
            c+=1
    raise KeyError(word)
# ---------- 2. caption chunks: break on punctuation, max 3 words, max width
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"; FONTS={}
def f(s):
    if s not in FONTS: FONTS[s]=ImageFont.truetype(FB,s)
    return FONTS[s]
_m=ImageDraw.Draw(Image.new("RGB",(10,10)))
CAPF=70
def cap(d): return d.upper().rstrip(",.?!") if d else d
chunks=[];cur=[]
for wd in WORDS:
    if not wd[0]:  # silent continuation of a multi-token display word: extend timing
        if cur: cur[-1]=(cur[-1][0],cur[-1][1],wd[2],cur[-1][3],cur[-1][4])
        continue
    trial=" ".join(cap(x[0]) for x in cur+[wd])
    if cur and (len(cur)>=3 or _m.textlength(trial,font=f(CAPF))>W-100 or cur[-1][0][-1] in ",.?!" or cur[-1][3]!=wd[3]):
        chunks.append(cur); cur=[]
    cur.append(wd)
chunks.append(cur)
CH=[(c,c[0][1],c[-1][2]) for c in chunks]
# ---------- 3. timed reveal events (driven by the spoken words)
seg_t={n:s for n,_,s,e in idx}
EV={"hook_stamp":wt("rejected","hook"),
    "1_check":wt("single","1"),
    "2_bad":wt("dont","2"),"2_good":wt("built","2"),
    "3_fix":wt("keep","3"),
    "4_hl":wt("top","4"),
    "cta_follow":wt("follow","cta"),"cta_url":wt("m","cta")}
NUMT={k:wt(w,k) for k,w in (("1","one"),("2","two"),("3","three"),("4","four"))}
json.dump({"EV":EV,"NUMT":NUMT,"seg":seg_t},open("events.json","w"))
# ---------- 4. audio: voice + music bed (ducked) + word-synced SFX
SR=24000; N=int(DUR*SR); t_=np.arange(N)/SR; rng=np.random.default_rng(3)
v,_=sf.read("voice.wav",dtype="float32"); v=v if v.ndim==1 else v[:,0]
voice=np.zeros(N,np.float32); voice[:min(N,len(v))]=v[:N]
bpm=96;beat=60/bpm;bar=4*beat;chs=[(57,60,64),(53,57,60),(48,52,55),(55,59,62)]
hz=lambda m:440*2**((m-69)/12); music=np.zeros(N,np.float32)
for i in range(int(DUR/bar)+1):
    s=i*bar;e=min(s+bar,DUR);a0=int(s*SR);a1=int(e*SR)
    if a0>=N:break
    tt=t_[a0:a1]-s;env=np.minimum(1,tt/0.25)*np.minimum(1,(bar-tt)/0.3);pad=np.zeros(a1-a0)
    for m in chs[i%4]:
        fq=hz(m);pad+=np.sin(2*np.pi*fq*tt)+0.5*np.sin(2*np.pi*fq*1.004*tt)+0.25*np.sin(2*np.pi*2*fq*tt)
    bass=np.sin(2*np.pi*hz(chs[i%4][0]-12)*tt)*np.minimum(1,tt/0.02)*np.exp(-tt*0.9)*0.22
    music[a0:a1]+=(pad*env*0.02+bass).astype(np.float32)
for b in range(int(DUR/beat)+1):
    s=int(b*beat*SR)
    if s>=N:break
    if b%2==0:
        L=min(int(0.18*SR),N-s);tk=np.arange(L)/SR;music[s:s+L]+=(np.sin(2*np.pi*(120*np.exp(-tk*28)+45)*tk)*np.exp(-tk*18)*0.35).astype(np.float32)
    else:
        L=min(int(0.05*SR),N-s);music[s:s+L]+=(rng.standard_normal(L)*np.exp(-np.arange(L)/SR*90)*0.05).astype(np.float32)
    h=s+int(beat*SR/2)
    if h<N:
        L=min(int(0.03*SR),N-h);music[h:h+L]+=(rng.standard_normal(L)*np.exp(-np.arange(L)/SR*140)*0.03).astype(np.float32)
sfx=np.zeros(N,np.float32)
def add(x,at):
    s=int(max(0,at)*SR);L=min(len(x),N-s)
    if L>0: sfx[s:s+L]+=x[:L]
def whoosh(d=0.45):
    n=int(d*SR);x=rng.standard_normal(n);y=np.cumsum(x);y-=np.convolve(y,np.ones(200)/200,'same');y/=np.max(np.abs(y))+1e-9
    return (y*np.sin(np.pi*np.arange(n)/n)**2*0.3).astype(np.float32)
def pop(fq=880):
    n=int(0.14*SR);tt=np.arange(n)/SR;return (np.sin(2*np.pi*(fq+400*np.exp(-tt*40))*tt)*np.exp(-tt*30)*0.35).astype(np.float32)
def thud():
    n=int(0.3*SR);tt=np.arange(n)/SR;return ((np.sin(2*np.pi*(90*np.exp(-tt*8)+40)*tt)*np.exp(-tt*14)+rng.standard_normal(n)*np.exp(-tt*60)*0.4)*0.55).astype(np.float32)
def ding():
    n=int(0.5*SR);tt=np.arange(n)/SR;return ((np.sin(2*np.pi*1568*tt)+0.4*np.sin(2*np.pi*2349*tt))*np.exp(-tt*7)*0.16).astype(np.float32)
for n,_,s,e in idx:
    if n!="hook": add(whoosh(),s-0.35)
for k,tm in NUMT.items(): add(pop(),tm)
add(thud(),EV["hook_stamp"]); add(ding(),EV["1_check"]); add(ding(),EV["2_good"]); add(ding(),EV["3_fix"]); add(pop(1175),EV["4_hl"]); add(pop(1320),EV["cta_follow"])
env=np.abs(voice);k=int(0.06*SR);env=np.convolve(env,np.ones(k)/k,'same');env=np.minimum(1,env/(np.percentile(env,90)+1e-6))
env=np.convolve(env,np.ones(int(0.15*SR))/int(0.15*SR),'same')
mix=voice+music*0.5*(1-0.8*env)+sfx*0.75
sf.write("mix_raw.wav",np.tanh(mix*1.05),SR)
subprocess.run(["ffmpeg","-y","-v","error","-i","mix_raw.wav","-af","loudnorm=I=-14:TP=-1.5:LRA=9,afade=t=out:st=48.8:d=1.2","-ar","44100","-ac","2","mix.wav"],check=True)
# ---------- 5. animation drivers
rms=np.array([np.sqrt(np.mean(v[int(i/FPS*SR):int((i+1)/FPS*SR)]**2)+1e-9) if int(i/FPS*SR)<len(v) else 0 for i in range(int(DUR*FPS))])
rm=np.clip(rms/np.percentile(rms,92),0,1); MO=np.zeros_like(rm)
for q in range(len(rm)):
    p_=MO[q-1] if q else 0; MO[q]=rm[q] if rm[q]>p_ else p_*0.38+rm[q]*0.62
gate=rm>0.075; gate=gate|np.r_[False,gate[:-1]]; MO=MO*gate
np.save("mo.npy",MO)
ONS=[(s,min(1.0,0.45+0.1*len(d))) for d,s,e,n,sp in WORDS if d]
def beat(t):
    b=0
    for o,wt_ in ONS:
        x=t-o
        if 0<=x<0.7: b+=wt_*math.exp(-x/0.16)*(1-math.exp(-x/0.04))
    return min(b,1.3)
def viseme(t):
    for d,s,e,n,sp in WORDS:
        if s<=t<=e and sp:
            word=sp if d!="MNAPREP.COM" else sp; fr=(t-s)/max(e-s,1e-3); ch=word[min(len(word)-1,int(fr*len(word)))]
            if fr<0.22 and word[0] in "mbp": return "closed"
            if ch in "ouwq": return "round"
            if ch in "eiy": return "wide"
            if ch in "fv": return "teeth"
            return "open"
    return "rest"
VIS={"rest":(1,1),"open":(1.0,1.12),"round":(0.62,1.0),"wide":(1.18,0.68),"teeth":(0.95,0.32),"closed":(0.9,0.06)}
def ease(x): x=min(1,max(0,x)); return 1-(1-x)**3
def back(x): x=min(1,max(0,x)); c=1.7; return 1+(c+1)*(x-1)**3+c*(x-1)**2
NAVY=(8,20,48);GOLD=(232,184,74);WHITE=(255,255,255);MUT=(150,168,205);GREEN=(70,200,120);RED=(235,80,80)
SKIN=(214,164,128);SKIN2=(190,140,104);HAIR=(28,22,20);HAIR2=(48,38,34);SUIT=(30,46,92);SUIT2=(19,31,66)
import os
TITLES={"hook":(0,os.environ.get("HOOK","4 RESUME MISTAKES")),"1":(1,"ONE PAGE ONLY"),"2":(2,"SHOW RESULTS"),"3":(3,"ZERO TYPOS"),"4":(4,"BEST STUFF FIRST"),"cta":(0,"FIX THESE 4")}
def seg_at(t):
    cur="hook"
    for n,_,s,e in idx:
        st=NUMT.get(n,s)-0.08 if n in NUMT else s
        if t>=st: cur=n
    return cur
def seg_start(n): return NUMT[n]-0.08 if n in NUMT else seg_t[n]
def ctr(d,y,txt,font,fill,sp=10):
    for line in txt.split("\n"):
        w=d.textlength(line,font=font); d.text(((W-w)/2,y),line,font=font,fill=fill); y+=font.size+sp
    return y
# ---------- 6. illustrations
def resume(d,x,y,w,h,hl_top=0):
    d.rounded_rectangle([x,y,x+w,y+h],radius=10,fill=(248,248,250)); d.rectangle([x+w*0.12,y+h*0.08,x+w*0.6,y+h*0.14],fill=(60,70,100))
    for r in range(5):
        yy=y+h*(0.24+r*0.13); d.rectangle([x+w*0.12,yy,x+w*(0.88 if r%2==0 else 0.7),yy+h*0.05],fill=(190,196,210))
    if hl_top>0: d.rounded_rectangle([x+w*0.08,y+h*0.19,x+w*0.92,y+h*0.43],radius=8,outline=GOLD,width=max(1,int(6*hl_top)))
def stamp(im,text,col,ang,pos,sc=1.0):
    s=Image.new("RGBA",(470,116),(0,0,0,0)); d=ImageDraw.Draw(s); d.rounded_rectangle([3,3,467,113],radius=12,outline=col,width=8)
    fn=f(66); w=d.textlength(text,font=fn); d.text(((470-w)/2,20),text,font=fn,fill=col)
    s=s.rotate(ang,expand=True,resample=Image.BICUBIC)
    if sc!=1: s=s.resize((int(s.width*sc),int(s.height*sc)),Image.LANCZOS)
    im.paste(s,(int(pos[0]-s.width/2),int(pos[1]-s.height/2)),s)
def check(d,x,y,r=35):
    d.ellipse([x-r,y-r,x+r,y+r],fill=GREEN); d.line([(x-r*0.45,y),(x-r*0.1,y+r*0.38),(x+r*0.5,y-r*0.4)],fill=WHITE,width=9)
def illus(n,t):
    im=Image.new("RGBA",(900,280),(0,0,0,0)); d=ImageDraw.Draw(im)
    if n=="hook":
        resume(d,330,0,240,240); x=t-EV["hook_stamp"]
        if x>=0: stamp(im,"REJECTED",RED,14,(450,150),sc=1+1.2*(1-ease(x/0.16)))
    elif n=="1":
        resume(d,100,10,150,220); resume(d,265,30,150,220); d.text((165,95),"2",font=f(80),fill=RED); d.line([(80,10),(450,235)],fill=RED,width=14)
        x=t-EV["1_check"]
        if x>=0:
            s=back(x/0.35); d.text((505,60),"→",font=f(90),fill=MUT)
            ww=int(170*s); resume(d,735-ww//2,10+int(220*(1-s)/2),max(ww,2),max(int(220*s),2)); 
            if x>0.2: check(d,820,40)
    elif n=="2":
        x=t-EV["2_bad"]
        d.rounded_rectangle([40,10,860,100],radius=18,fill=(70,24,34)); d.text((70,28),"Helped with research",font=f(48),fill=(245,175,175))
        if x>=0: d.line([(60,58),(60+430*ease(x/0.3),58)],fill=RED,width=7)
        y=t-EV["2_good"]
        if y>=0:
            s="Built 12 comps, cut time 30%"; k=ease(y/0.6)
            d.rounded_rectangle([40,130,860,230],radius=18,fill=(18,64,46)); d.text((70,150),s[:max(1,int(len(s)*k))],font=f(40),fill=(175,242,205))
            if y>0.6: check(d,812,180,30)
    elif n=="3":
        d.rounded_rectangle([60,10,840,110],radius=18,fill=(70,24,34)); d.text((100,26),"Recieved",font=f(64),fill=(245,175,175))
        for xx in range(100,360,22): d.line([(xx,92),(xx+11,104),(xx+22,92)],fill=RED,width=4)
        x=t-EV["3_fix"]
        if x>=0:
            s=back(x/0.35); d.rounded_rectangle([60,130,840,230],radius=18,fill=(18,64,46)); d.text((100,146),"Received",font=f(64),fill=(175,242,205)); check(d,775,180,int(35*s)+1)
    elif n=="4":
        x=t-EV["4_hl"]; resume(d,260,0,380,240,hl_top=ease(x/0.3) if x>=0 else 0)
        if x>=0: d.text((660,40),"SCHOOL\nGPA\nFINANCE",font=f(34),fill=GOLD)
    elif n=="cta":
        x=t-EV["cta_follow"]
        if x>=0:
            s=back(x/0.35); bw=int(460*s); bh=int(120*s)
            if bw>4: d.rounded_rectangle([450-bw//2,90-bh//2,450+bw//2,90+bh//2],radius=max(1,bh//2),fill=GOLD)
            if s>0.8: w=d.textlength("FOLLOW",font=f(66)); d.text((450-w/2,57),"FOLLOW",font=f(66),fill=NAVY)
        if t>=EV["cta_url"]: w=d.textlength("mnaprep.com",font=f(46)); d.text((450-w/2,170),"mnaprep.com",font=f(46),fill=WHITE)
    out=Image.new("RGBA",(940,320),(0,0,0,0)); out.paste(im,(20,20),im); return out
# ---------- 7. male presenter
S=2; CW,CHh=1080,860
def word_active(word,seg):
    try: s=wt(word,seg)
    except KeyError: return None
    return s
DONT=wt("dont","2")
def presenter(t,i,n,fingers):
    im=Image.new("RGBA",(CW*S,CHh*S),(0,0,0,0)); d=ImageDraw.Draw(im); P=lambda x:x*S
    m=float(MO[i]) if i<len(MO) else 0.0
    em=float(np.clip(np.mean(MO[max(0,i-6):i+1]) if i<len(MO) else 0,0,1)); bt=beat(t); br=math.sin(t*2.0)
    bob=br*5+bt*7; nod=bt*13+math.sin(t*1.9)*4+math.sin(t*0.9+1)*3; sway=math.sin(t*1.1)*16+math.sin(t*0.37)*10
    ds=t-seg_start(n); cx=540+sway*0.4; brow=-12*min(1,bt)-(8 if n=="hook" else 0)
    shake=math.sin((t-DONT)*15)*20*max(0,1-(t-DONT)/0.9) if 0<=t-DONT<0.9 else 0
    hxo=sway*0.4+shake; hyo=bob*0.6+nod
    # torso
    d.rounded_rectangle([P(cx-265),P(585+bob),P(cx+265),P(CHh+200)],radius=P(120),fill=SUIT)
    d.polygon([(P(cx-72),P(585+bob)),(P(cx+72),P(585+bob)),(P(cx),P(770+bob))],fill=(244,244,248))
    d.polygon([(P(cx-180),P(595+bob)),(P(cx-64),P(585+bob)),(P(cx-4),P(780+bob)),(P(cx-98),P(890+bob))],fill=SUIT2)
    d.polygon([(P(cx+180),P(595+bob)),(P(cx+64),P(585+bob)),(P(cx+4),P(780+bob)),(P(cx+98),P(890+bob))],fill=SUIT2)
    d.polygon([(P(cx-22),P(650+bob)),(P(cx+22),P(650+bob)),(P(cx+30),P(810+bob)),(P(cx),P(850+bob)),(P(cx-30),P(810+bob))],fill=GOLD)
    d.polygon([(P(cx-19),P(620+bob)),(P(cx+19),P(620+bob)),(P(cx+15),P(656+bob)),(P(cx-15),P(656+bob))],fill=(200,150,50))
    d.polygon([(P(cx-150),P(735+bob)),(P(cx-95),P(728+bob)),(P(cx-100),P(752+bob))],fill=GOLD)  # pocket square
    ay=655+bob
    def hand(sx,hx,hy,fing):
        d.line([(P(sx),P(ay)),(P(hx),P(hy+70))],fill=SUIT,width=P(108))
        d.ellipse([P(hx-62),P(hy-10),P(hx+62),P(hy+120)],fill=SKIN)
        for k in range(fing):
            fx=hx-44+k*(88/max(fing-1,1)) if fing>1 else hx
            d.rounded_rectangle([P(fx-17),P(hy-105),P(fx+17),P(hy+22)],radius=P(17),fill=SKIN)
    if n=="cta":
        x=t-EV["cta_follow"]
        if x<0: hand(cx+265,cx+345+math.sin(t*9)*40,300+bob,5)          # wave on "fix these four"
        else: r=ease(x/0.3); hand(cx+265,cx+330-r*120,330+bob-r*40,1)   # point at viewer on "follow"
    elif fingers>0:
        r=ease(ds/0.35); hand(cx+265,cx+330+(1-r)*30,520+(330-520)*r+bob*1.5-bt*18+math.sin(t*2.6)*7,fingers)
    else: hand(cx+265,cx+345,560+bob-bt*90-em*40,0)
    if 0<=t-DONT<1.4: r=ease((t-DONT)/0.25); hand(cx-265,cx-340,CHh-250+(260-(CHh-250))*r+bob,5)   # palm-out "don't"
    else: hand(cx-265,cx-330+math.sin(t*1.6)*22-bt*14,CHh-250-bt*150-em*110+math.sin(t*1.7)*12,0)
    # neck + head (squarer jaw)
    d.rectangle([P(cx-50),P(470+hyo),P(cx+50),P(605+bob)],fill=SKIN2)
    d.ellipse([P(cx-168+hxo),P(130+hyo),P(cx+168+hxo),P(470+hyo)],fill=SKIN)
    d.rounded_rectangle([P(cx-150+hxo),P(290+hyo),P(cx+150+hxo),P(528+hyo)],radius=P(95),fill=SKIN)
    d.ellipse([P(cx-186+hxo),P(305+hyo),P(cx-150+hxo),P(385+hyo)],fill=SKIN2); d.ellipse([P(cx+150+hxo),P(305+hyo),P(cx+186+hxo),P(385+hyo)],fill=SKIN2)
    # short hair, side part + quiff
    d.pieslice([P(cx-178+hxo),P(105+hyo),P(cx+178+hxo),P(400+hyo)],180,360,fill=HAIR)
    d.rectangle([P(cx-174+hxo),P(245+hyo),P(cx-156+hxo),P(305+hyo)],fill=HAIR); d.rectangle([P(cx+156+hxo),P(245+hyo),P(cx+174+hxo),P(305+hyo)],fill=HAIR)
    d.ellipse([P(cx-110+hxo),P(84+hyo),P(cx+176+hxo),P(232+hyo)],fill=HAIR)
    d.ellipse([P(cx-176+hxo),P(118+hyo),P(cx-10+hxo),P(236+hyo)],fill=HAIR)
    d.arc([P(cx-60+hxo),P(100+hyo),P(cx+150+hxo),P(200+hyo)],200,330,fill=HAIR2,width=P(7))
    d.line([(P(cx-70+hxo),P(125+hyo)),(P(cx-90+hxo),P(240+hyo))],fill=HAIR2,width=P(6))   # part line
    blink=(t%3.6)<0.12 or (t%5.3)<0.1
    for ex in (-70,70):
        x=cx+ex+hxo; y=340+hyo
        if blink: d.line([(P(x-26),P(y)),(P(x+26),P(y))],fill=(30,22,20),width=P(8))
        else:
            d.ellipse([P(x-28),P(y-30),P(x+28),P(y+30)],fill=WHITE); px=math.sin(t*2.1)*2
            d.ellipse([P(x-16+px),P(y-17),P(x+16+px),P(y+17)],fill=(48,32,24)); d.ellipse([P(x-4+px),P(y-12),P(x+5+px),P(y-4)],fill=WHITE)
        d.line([(P(x-40),P(y-52+brow+(4 if ex<0 else 0))),(P(x+40),P(y-56+brow))],fill=HAIR,width=P(13))   # thick straight brows
    d.arc([P(cx-14+hxo),P(390+hyo),P(cx+14+hxo),P(430+hyo)],20,160,fill=SKIN2,width=P(6))
    vw,vh=VIS[viseme(t)]; mx,my=cx+hxo,468+hyo
    if m<0.07 and viseme(t)=="rest": d.arc([P(mx-52),P(my-32),P(mx+52),P(my+22)],20,160,fill=(120,60,60),width=P(9))
    else:
        oh=(6+m*44)*vh; wd=(32+18*m)*vw
        d.ellipse([P(mx-wd),P(my-oh/2),P(mx+wd),P(my+oh/2)],fill=(96,34,40))
        if oh>18: d.ellipse([P(mx-wd*0.6),P(my+oh/2-16),P(mx+wd*0.6),P(my+oh/2+1)],fill=(200,96,104))
        if oh>14 or viseme(t)=="teeth": d.rectangle([P(mx-wd*0.8),P(my-oh/2),P(mx+wd*0.8),P(my-oh/2+min(9,oh*0.45))],fill=WHITE)
    return im.resize((CW,CHh),Image.LANCZOS)
CUTS=[0,2.6,5.5,8.4,11.3,14.2,17.5,20.6,23.9,27.1,30.2,33.4,36.5,39.6,42.7,45.6]; ZS=[1.0,1.14,1.04,1.2,1.0,1.12,1.06,1.18]
def zoom_at(t):
    k=max(j for j,c in enumerate(CUTS) if c<=t); return ZS[k%len(ZS)]+0.03*(t-CUTS[k])/3.0
BG=Image.new("RGB",(W,H),NAVY); bd=ImageDraw.Draw(BG)
for y in range(H): c=int(20*y/H); bd.line([(0,y),(W,y)],fill=(8+c//2,20+c,52+c*2))
glow=Image.new("L",(W,H),0); ImageDraw.Draw(glow).ellipse([140,760,940,1560],fill=60); glow=glow.filter(ImageFilter.GaussianBlur(160))
BG=Image.composite(Image.new("RGB",(W,H),(40,62,120)),BG,glow)
def frame(i):
    t=i/FPS; im=BG.copy(); d=ImageDraw.Draw(im)
    for k in range(-3,12): x=(k*220+t*18)%(W+400)-200; d.line([(x,0),(x-500,H)],fill=(16,34,74),width=3)
    n=seg_at(t); num,title=TITLES[n]; ds=t-seg_start(n)
    d.text((60,70),"BLUE CHIP FINANCIAL",font=f(38),fill=GOLD); d.rectangle([60,125,300,131],fill=GOLD)
    s=back(ds/0.35); y=190+int((1-ease(ds/0.3))*50)
    if num:
        r=int(58*max(s,0.01)); d.ellipse([W/2-r,y+68-r,W/2+r,y+68+r],outline=GOLD,width=8)
        if s>0.5: ctr(d,y+20,str(num),f(92),GOLD,0)
        y+=150
    else: y+=60
    ctr(d,y,title,f(80),WHITE)
    ill=illus(n,t); sc=max(0.05,back(ds/0.4))
    if sc!=1: ill=ill.resize((max(1,int(ill.width*sc)),max(1,int(ill.height*sc))),Image.LANCZOS)
    im.paste(ill,(int((W-ill.width)/2),int(470+(300-ill.height)/2)),ill)
    fing=num if (n in NUMT and t<idx[-1][2]) else 0
    ch=presenter(t,i,n,fing); zs=zoom_at(t); ch=ch.resize((int(CW*zs),int(CHh*zs)),Image.LANCZOS)
    im.paste(ch,(int(540-540*zs),int(740+330-330*zs)),ch)
    for k,(c,s0,e0) in enumerate(CH):
        nxt=CH[k+1][1] if k+1<len(CH) else e0+0.6
        if s0-0.04<=t<min(e0+0.4,nxt):
            ws=[cap(w[0]) for w in c]; fnt=f(CAPF); x=(W-d.textlength(" ".join(ws),font=fnt))/2
            pop_=back((t-s0)/0.12); yy=1650+int((1-pop_)*14)
            act=None
            for q,wd in enumerate(c):
                if wd[1]-0.03<=t: act=q
            if act is not None and t>c[act][2]+0.25: act=None
            for q,(w,wd) in enumerate(zip(ws,c)):
                col=GOLD if q==act else WHITE
                for ox,oy in ((-3,0),(3,0),(0,-3),(0,4)): d.text((x+ox,yy+oy),w,font=fnt,fill=(0,0,0))
                d.text((x,yy),w,font=fnt,fill=col); x+=d.textlength(w+" ",font=fnt)
            break
    d.rectangle([0,H-14,W*min(t/DUR,1),H],fill=GOLD)
    return im
if __name__=="__main__":
    print("aligned script tokens: %d/%d matched to ASR"%(matched,len(toks)))
    if len(sys.argv)>1 and sys.argv[1]=="stills":
        for ts in sys.argv[2:]: frame(int(float(ts)*FPS)).resize((360,640)).save(f"p{ts}.png")
        sys.exit()
    p=subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-i","mix.wav","-t",str(DUR),
      "-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p","-r",str(FPS),"-c:a","aac","-b:a","192k","-movflags","+faststart","-shortest",os.environ.get("OUT","final.mp4")],stdin=subprocess.PIPE)
    for i in range(int(DUR*FPS)): p.stdin.write(frame(i).tobytes())
    p.stdin.close(); p.wait(); print("rendered")
