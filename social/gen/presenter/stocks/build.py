import json,subprocess,math,sys,re,os,difflib,numpy as np,soundfile as sf
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageChops
sys.path.insert(0,os.getcwd())
from script import segs as SEGS, spoken
SPEC=json.load(open("spec.json"))
W,H,FPS=1080,1920,30
idx=json.load(open("idx.json")); asr=json.load(open("words.json"))
# ---------------- 1. script tokens (spoken / display) aligned to ASR timings
NUM={"1":"one","2":"two","3":"three","4":"four"}
def norm(w): w=re.sub(r"[^a-z0-9]","",w.lower()); return NUM.get(w,w)
toks=[]
for n,ph in SEGS:
    for p in ph:
        for part in re.split(r"(\[\[.*?\]\])",p):
            if not part.strip(): continue
            m=re.match(r"\[\[(.*?)\|(.*?)\]\]",part)
            if m:
                sp=m.group(1).replace("-"," ").split(); disp=m.group(2)
                tail=re.match(r"^[^\w$]*",part[len(m.group(0)):])
                for k,s in enumerate(sp): toks.append((norm(s),disp if k==0 else "",n))
            else:
                for w in part.split():
                    if re.fullmatch(r"[^\w$]+",w):   # punctuation glued after a [[..]] block
                        for q in range(len(toks)-1,-1,-1):
                            if toks[q][1]: toks[q]=(toks[q][0],toks[q][1]+w,toks[q][2]); break
                        continue
                    toks.append((norm(w),w,n))
A=[norm(w) for w,_,_ in asr]
sm=difflib.SequenceMatcher(None,[t[0] for t in toks],A,autojunk=False)
T=[None]*len(toks)
for blk in sm.get_matching_blocks():
    for k in range(blk.size): T[blk.a+k]=(asr[blk.b+k][1],asr[blk.b+k][2])
matched=sum(x is not None for x in T)
i=0
while i<len(T):
    if T[i] is None:
        j=i
        while j<len(T) and T[j] is None: j+=1
        s=T[i-1][1] if i>0 else 0.0; e=T[j][0] if j<len(T) else s+0.3*(j-i)
        st=(e-s)/(j-i)
        for k in range(i,j): T[k]=(s+st*(k-i),s+st*(k-i+1))
        i=j
    else: i+=1
WORDS=[(d,t[0],t[1],n,sp) for (sp,d,n),t in zip(toks,T)]
DUR=round(math.ceil((WORDS[-1][2]+2.4)*FPS)/FPS,3)
def wt(word,seg,nth=0):
    c=0
    for d,s,e,n,sp in WORDS:
        if n==seg and sp==word:
            if c==nth: return s
            c+=1
    raise KeyError(f"{word} in {seg}")
# ---------------- fonts
FD="/usr/share/fonts/opentype/inter/"; _F={}
def F(size,w="Black"):
    k=(size,w)
    if k not in _F: _F[k]=ImageFont.truetype(FD+("InterDisplay-%s.otf"%w if w in("Black","ExtraBold","Bold") else "Inter-%s.otf"%w),size)
    return _F[k]
_m=ImageDraw.Draw(Image.new("RGB",(10,10)))
# ---------------- 2. captions
CAPF=68
def cap(d): return d.upper().rstrip(",.?!") if d else d
chunks=[];cur=[]
for wd in WORDS:
    if not wd[0]:
        if cur: cur[-1]=(cur[-1][0],cur[-1][1],wd[2],cur[-1][3],cur[-1][4])
        continue
    trial=" ".join(cap(x[0]) for x in cur+[wd])
    if cur and (len(cur)>=3 or _m.textlength(trial,font=F(CAPF,"ExtraBold"))>W-110 or cur[-1][0][-1] in ",.?!" or cur[-1][3]!=wd[3]):
        chunks.append(cur); cur=[]
    cur.append(wd)
chunks.append(cur)
CH=[(c,c[0][1],c[-1][2]) for c in chunks]
# ---------------- 3. word-triggered events (from spec.json)
seg_t={n:s for n,_,s,e in idx}
def W_(seg,w): return wt(w[0],seg,w[1] if len(w)>1 else 0)
EV={}
for seg,sc in SPEC["scenes"].items():
    for key,val in sc.items():
        if key.endswith("word"): EV[f"{seg}.{key}"]=W_(seg,val)
    for k2 in ("items","parts","lines","chips"):
        for q,it in enumerate(sc.get(k2,[])):
            if "word" in it: EV[f"{seg}.{k2}.{q}"]=W_(seg,it["word"])
    for k2 in ("stamp","banner","badge","total"):
        if isinstance(sc.get(k2),dict) and "word" in sc[k2]: EV[f"{seg}.{k2}"]=W_(seg,sc[k2]["word"])
EV["h_bull"]=EV["hook.banner"]; EV["r_card"]=EV["risk.start_word"]; EV["c_follow"]=EV["cta.follow_word"]
NUMT={k:wt(w,k) for k,w in (("1","one"),("2","two"),("3","three"),("4","four"))}
# ---------------- 4. audio
SR=24000; N=int(DUR*SR); t_=np.arange(N)/SR; rng=np.random.default_rng(3)
v,_=sf.read("voice.wav",dtype="float32"); v=v if v.ndim==1 else v[:,0]
voice=np.zeros(N,np.float32); voice[:min(N,len(v))]=v[:N]
bpm=100;beat=60/bpm;bar=4*beat;chs=[(57,60,64),(53,57,60),(48,52,55),(55,59,62)]
hz=lambda m:440*2**((m-69)/12); music=np.zeros(N,np.float32)
for i in range(int(DUR/bar)+1):
    s=i*bar;e=min(s+bar,DUR);a0=int(s*SR);a1=int(e*SR)
    if a0>=N:break
    tt=t_[a0:a1]-s;env=np.minimum(1,tt/0.3)*np.minimum(1,(bar-tt)/0.3);pad=np.zeros(a1-a0)
    for m in chs[i%4]:
        fq=hz(m);pad+=np.sin(2*np.pi*fq*tt)+0.5*np.sin(2*np.pi*fq*1.004*tt)+0.3*np.sin(2*np.pi*2*fq*tt)
    arp=np.zeros(a1-a0)
    for q in range(8):   # soft plucked arpeggio, 8th notes
        o=int(q*beat/2*SR); L=min(int(0.25*SR),a1-a0-o)
        if L<=0: continue
        ft=hz(chs[i%4][q%3]+12); tk=np.arange(L)/SR; arp[o:o+L]+=np.sin(2*np.pi*ft*tk)*np.exp(-tk*14)
    bass=np.sin(2*np.pi*hz(chs[i%4][0]-12)*tt)*np.minimum(1,tt/0.02)*np.exp(-tt*0.9)*0.22
    music[a0:a1]+=(pad*env*0.018+arp*0.035+bass).astype(np.float32)
for b in range(int(DUR/beat)+1):
    s=int(b*beat*SR)
    if s>=N:break
    if b%2==0:
        L=min(int(0.18*SR),N-s);tk=np.arange(L)/SR;music[s:s+L]+=(np.sin(2*np.pi*(120*np.exp(-tk*28)+45)*tk)*np.exp(-tk*18)*0.33).astype(np.float32)
    else:
        L=min(int(0.06*SR),N-s);music[s:s+L]+=(rng.standard_normal(L)*np.exp(-np.arange(L)/SR*80)*0.06).astype(np.float32)
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
    n=int(0.14*SR);tt=np.arange(n)/SR;return (np.sin(2*np.pi*(fq+400*np.exp(-tt*40))*tt)*np.exp(-tt*30)*0.33).astype(np.float32)
def thud():
    n=int(0.3*SR);tt=np.arange(n)/SR;return ((np.sin(2*np.pi*(90*np.exp(-tt*8)+40)*tt)*np.exp(-tt*14)+rng.standard_normal(n)*np.exp(-tt*60)*0.4)*0.5).astype(np.float32)
def ding():
    n=int(0.5*SR);tt=np.arange(n)/SR;return ((np.sin(2*np.pi*1568*tt)+0.4*np.sin(2*np.pi*2349*tt))*np.exp(-tt*7)*0.15).astype(np.float32)
def riser(d=0.9):
    n=int(d*SR);tt=np.arange(n)/n;x=rng.standard_normal(n);y=x-np.r_[0,x[:-1]]*0.6
    return (y*tt**2*0.12).astype(np.float32)
def ticks(d=0.6):
    n=int(d*SR);out=np.zeros(n,np.float32)
    for q in range(10):
        o=int(q*d/10*SR);L=min(int(0.015*SR),n-o);tk=np.arange(L)/SR;out[o:o+L]+=np.sin(2*np.pi*2600*tk)*np.exp(-tk*300)*0.12
    return out
for n,_,s,e in idx:
    if n!="hook": add(whoosh(),s-0.35)
for k,tm in NUMT.items(): add(pop(),tm)
for key,tm in EV.items():
    if key in("h_bull","r_card","c_follow"): continue
    if key.endswith("stamp") or key=="risk.start_word": add(thud(),tm)
    elif key=="hook.banner": add(riser(),tm-0.9); add(ding(),tm)
    elif key.endswith("badge") or key.endswith("total"): add(ding(),tm)
    elif key.endswith("start_word") and not key.startswith(("risk","cta")): add(ticks(),tm)
    elif key=="cta.follow_word": add(pop(1320),tm)
    elif ".items." in key or ".parts." in key or ".chips." in key: add(pop(1175),tm)
env=np.abs(voice);k=int(0.06*SR);env=np.convolve(env,np.ones(k)/k,'same');env=np.minimum(1,env/(np.percentile(env,90)+1e-6))
env=np.convolve(env,np.ones(int(0.15*SR))/int(0.15*SR),'same')
mix=voice+music*0.5*(1-0.8*env)+sfx*0.75
sf.write("mix_raw.wav",np.tanh(mix*1.05),SR)
if not os.environ.get("NOAUDIO"):
    subprocess.run(["ffmpeg","-y","-v","error","-i","mix_raw.wav","-af",f"loudnorm=I=-14:TP=-1.5:LRA=9,afade=t=out:st={DUR-1.2}:d=1.2","-ar","44100","-ac","2","mix.wav"],check=True)
# ---------------- 5. animation drivers
rms=np.array([np.sqrt(np.mean(v[int(i/FPS*SR):int((i+1)/FPS*SR)]**2)+1e-9) if int(i/FPS*SR)<len(v) else 0 for i in range(int(DUR*FPS))])
rm=np.clip(rms/np.percentile(rms,92),0,1); MO=np.zeros_like(rm)
for q in range(len(rm)):
    p_=MO[q-1] if q else 0; MO[q]=rm[q] if rm[q]>p_ else p_*0.38+rm[q]*0.62
gate=rm>0.075; gate=gate|np.r_[False,gate[:-1]]; MO=MO*gate
np.save("mo.npy",MO)
ONS=[(s,min(1.0,0.45+0.1*len(d))) for d,s,e,n,sp in WORDS if d]
def beat(t):
    b=0
    for o,w_ in ONS:
        x=t-o
        if 0<=x<0.7: b+=w_*math.exp(-x/0.16)*(1-math.exp(-x/0.04))
    return min(b,1.3)
def viseme(t):
    for d,s,e,n,sp in WORDS:
        if s<=t<=e and sp:
            fr=(t-s)/max(e-s,1e-3); ch=sp[min(len(sp)-1,int(fr*len(sp)))]
            if fr<0.22 and sp[0] in "mbp": return "closed"
            if ch in "ouwq": return "round"
            if ch in "eiy": return "wide"
            if ch in "fv": return "teeth"
            return "open"
    return "rest"
VIS={"rest":(1,1),"open":(1.0,1.12),"round":(0.62,1.0),"wide":(1.18,0.68),"teeth":(0.95,0.32),"closed":(0.9,0.06)}
def ease(x): x=min(1,max(0,x)); return 1-(1-x)**3
def back(x): x=min(1,max(0,x)); c=1.7; return 1+(c+1)*(x-1)**3+c*(x-1)**2
def since(key,t): return t-EV[key]
# ---------------- palette
NAVY=(8,20,48);GOLD=(232,184,74);WHITE=(255,255,255);MUT=(150,168,205);GREEN=(64,204,120);RED=(238,84,84);BLUE=(80,140,255)
PANEL=(16,32,72);PANEL2=(24,44,92)
SKIN=(214,164,128);SKIN_D=(186,134,100);SKIN_L=(232,186,152);HAIR=(28,22,20);HAIR_L=(70,56,50)
SUIT=(30,46,92);SUIT_D=(18,29,62);SUIT_L=(52,72,128)
TITLES={k:({"1":1,"2":2,"3":3,"4":4}.get(k,0),v) for k,v in SPEC["titles"].items()}
if os.environ.get("HOOK"): TITLES["hook"]=(0,os.environ["HOOK"])
ACC={"hook":RED,"1":GOLD,"2":GOLD,"3":GOLD,"4":GOLD,"risk":RED,"cta":GOLD}
def seg_at(t):
    cur="hook"
    for n,_,s,e in idx:
        st=NUMT[n]-0.08 if n in NUMT else s
        if t>=st: cur=n
    return cur
def seg_start(n): return NUMT[n]-0.08 if n in NUMT else seg_t[n]
def ctext(d,cx,y,txt,font,fill):
    w=d.textlength(txt,font=font); d.text((cx-w/2,y),txt,font=font,fill=fill); return w
def countup(a,b,x): return a+(b-a)*ease(x)
# ---------------- 6. data graphics, generic (driven by spec.json)
GW,GH=1000,700
COL={"GOLD":GOLD,"GREEN":GREEN,"RED":RED,"BLUE":BLUE,"WHITE":WHITE,"GREY":(90,110,160),"MUT":MUT}
def C(c): return COL.get(c,GOLD) if isinstance(c,str) else tuple(c)
def panel(d,box,r=28,fill=PANEL): d.rounded_rectangle(box,radius=r,fill=fill)
def chip(d,x,y,txt,font,fg,bg,pad=18):
    w=d.textlength(txt,font=font); d.rounded_rectangle([x,y,x+w+2*pad,y+font.size+2*pad-6],radius=(font.size+2*pad)//2,fill=bg); d.text((x+pad,y+pad-6),txt,font=font,fill=fg); return w+2*pad
def foot(d,txt):
    if txt: ctext(d,GW/2,GH-34,txt,F(24,"Medium"),MUT)
def since(key,t): return t-EV[key]
def fmtv(fmt,v): return fmt.format(v)
def badge(d,sc,seg,t,cx,cy,r0=74):
    b=sc.get("badge")
    if not b: return
    z=since(f"{seg}.badge",t)
    if z<0: return
    k=back(z/0.3); fnt=F(48); tw=d.textlength(b["text"],font=fnt); w=(tw+56)*k; h=84*k
    if w>8: d.rounded_rectangle([cx-w/2,cy-h/2,cx+w/2,cy+h/2],radius=max(1,int(h/2)),fill=GREEN)
    if k>0.85: ctext(d,cx,cy-31,b["text"],fnt,NAVY)
def icon(d,name,x,y,s,col):
    P=lambda px,py:(x+px*s,y+py*s)
    if name=="phone":
        d.rounded_rectangle([P(0,0),P(80,150)],radius=int(16*s),fill=col); d.rounded_rectangle([P(8,14),P(72,130)],radius=int(8*s),fill=NAVY); d.ellipse([P(34,136),P(46,146)],fill=NAVY)
    elif name=="cup":
        d.polygon([P(10,20),P(90,20),P(80,140),P(20,140)],fill=col); d.rectangle([P(4,8),P(96,24)],fill=WHITE); d.ellipse([P(30,60),P(70,100)],fill=NAVY)
    elif name=="play":
        d.rounded_rectangle([P(0,10),P(150,110)],radius=int(22*s),fill=col); d.polygon([P(58,36),P(58,84),P(100,60)],fill=NAVY)
    elif name=="ticket":
        d.rounded_rectangle([P(0,20),P(160,100)],radius=int(10*s),fill=col); d.ellipse([P(-14,46),P(14,74)],fill=PANEL); d.ellipse([P(146,46),P(174,74)],fill=PANEL); d.line([P(110,28),P(110,92)],fill=NAVY,width=max(2,int(4*s)))
    elif name=="store":
        d.rectangle([P(10,50),P(150,140)],fill=col); d.polygon([P(0,50),P(80,0),P(160,50)],fill=WHITE); d.rectangle([P(62,90),P(98,140)],fill=NAVY)
    elif name=="cash":
        for k in range(3): d.rounded_rectangle([P(10+k*8,40-k*14),P(150+k*8,110-k*14)],radius=int(8*s),fill=col if k==2 else tuple(int(c*0.7) for c in col))
        d.ellipse([P(70,8),P(110,62)],outline=NAVY,width=max(2,int(5*s)))
def g_hook(sc,t):
    im=Image.new("RGBA",(GW,GH),(0,0,0,0)); d=ImageDraw.Draw(im); x=since("hook.start_word",t)
    if x>=0:
        panel(d,[60,20,940,420]); d.text((100,50),sc["label"],font=F(34,"SemiBold"),fill=MUT)
        v=countup(0,sc["value"],x/0.9); ctext(d,500,90,fmtv(sc["fmt"],v),F(196),C(sc.get("color","GREEN")))
        if x>0.6 and sc.get("sub"): ctext(d,500,340,sc["sub"],F(34,"Bold"),WHITE)
    y=since("hook.stamp",t)
    if y>=0:
        s=1+1.4*(1-ease(y/0.16)); st=Image.new("RGBA",(600,120),(0,0,0,0)); sd=ImageDraw.Draw(st)
        sd.rounded_rectangle([4,4,596,116],radius=16,outline=GREEN,width=8); ctext(sd,300,22,sc["stamp"]["text"],F(62),GREEN)
        st=st.rotate(-8,expand=True,resample=Image.BICUBIC); st=st.resize((int(st.width*s),int(st.height*s)),Image.LANCZOS)
        im.alpha_composite(st,(int(500-st.width/2),int(540-st.height/2)) if st.width<GW else (0,0))
    z=since("hook.banner",t)
    if z>=0:
        k=back(z/0.35); bw=int(820*k); bh=int(150*k)
        if bw>10:
            d.rounded_rectangle([500-bw//2,545-bh//2,500+bw//2,545+bh//2],radius=max(1,bh//3),fill=GREEN)
            if k>0.85: ctext(d,470,500,sc["banner"]["text"],F(70),NAVY); d.polygon([(860,575),(900,505),(940,575)],fill=NAVY)
    return im
def g_bars(sc,seg,t):
    im=Image.new("RGBA",(GW,GH),(0,0,0,0)); d=ImageDraw.Draw(im)
    panel(d,[60,10,940,640]); d.text((100,40),sc["title"],font=F(34,"SemiBold"),fill=MUT)
    base=560; mx=sc["max"]; hh=330; its=sc["items"]; n=len(its); span=760/n
    d.line([(120,base),(880,base)],fill=(70,90,140),width=3)
    for q,it in enumerate(its):
        cx=120+span*(q+0.5); bw=min(95,span*0.32)
        x=since(f"{seg}.items.{q}",t); k=ease(x/0.7) if x>=0 else 0
        lo=it.get("lo",it.get("v")); hi=it.get("hi",lo); col=C(it.get("color","GOLD"))
        hl=lo/mx*hh*k; hh_=hi/mx*hh*k
        if k>0: d.rounded_rectangle([cx-bw,base-hl,cx+bw,base],radius=12,fill=col)
        if k>0.05 and hi>lo: d.rectangle([cx-bw,base-hh_,cx+bw,base-hl],fill=tuple(int(c*0.55+20) for c in col))
        if k>0.95: ctext(d,cx,base-hh_-66,it["text"],F(50 if n<=2 else 44),WHITE)
        ctext(d,cx,base+14,it["xlabel"],F(28 if n<=2 else 26,"Bold"),MUT)
    badge(d,sc,seg,t,500,150)
    for q,cp in enumerate(sc.get("chips",[])):
        if since(f"{seg}.chips.{q}",t)>=0: chip(d,100,100,cp["text"],F(36),NAVY,C(cp.get("color","GREEN")))
    foot(d,sc.get("foot",""))
    return im
def ring(d,cx,cy,r,frac,col,lab,sub):
    d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=(40,60,110),width=34)
    if frac>0: d.arc([cx-r,cy-r,cx+r,cy+r],-90,-90+360*frac,fill=col,width=34)
    ctext(d,cx,cy-46,lab,F(60),WHITE); ctext(d,cx,cy+r+28,sub,F(30,"Bold"),MUT)
def g_rings(sc,seg,t):
    im=Image.new("RGBA",(GW,GH),(0,0,0,0)); d=ImageDraw.Draw(im)
    panel(d,[60,10,940,640]); d.text((100,40),sc["title"],font=F(34,"SemiBold"),fill=MUT)
    for q,it in enumerate(sc["items"]):
        x=since(f"{seg}.items.{q}",t); cx=290 if q==0 else 710
        ring(d,cx,320,150,it["frac"]*ease(x/0.7) if x>=0 else 0,C(it.get("color","GOLD")),it["text"] if x>=0 else "?",it["sub"])
    badge(d,sc,seg,t,500,592)
    foot(d,sc.get("foot",""))
    return im
def g_stack(sc,seg,t):
    im=Image.new("RGBA",(GW,GH),(0,0,0,0)); d=ImageDraw.Draw(im)
    panel(d,[60,10,940,640]); d.text((100,40),sc["title"],font=F(34,"SemiBold"),fill=MUT)
    if sc.get("icon"): icon(d,sc["icon"],110,110,1.0,GOLD)
    if sc.get("headline"): d.text((300,120),sc["headline"],font=F(52),fill=WHITE)
    if sc.get("subline"): d.text((300,186),sc["subline"],font=F(32,"Bold"),fill=GREEN)
    tot=sum(p["v"] for p in sc["parts"]); L=780; x0=110; acc_=0
    d.rounded_rectangle([110,300,110+L,400],radius=20,fill=(40,60,110))
    for q,p in enumerate(sc["parts"]):
        x=since(f"{seg}.parts.{q}",t); w=L*p["v"]/tot
        if x>=0:
            k=ease(x/0.5); d.rounded_rectangle([x0+acc_,300,x0+acc_+w*k,400],radius=20,fill=C(p.get("color","GOLD")))
            if k>0.9:
                fs=34 if w>260 else 26
                tx=p["text"];
                while d.textlength(tx,font=F(fs))>w-24 and fs>18: fs-=2
                d.text((x0+acc_+14,350-fs*0.6),tx,font=F(fs),fill=NAVY if p.get("color","GOLD") in("GOLD","GREEN") else WHITE)
        acc_+=w
    if isinstance(sc.get("total"),dict) and since(f"{seg}.total",t)>=0: ctext(d,500,440,sc["total"]["text"],F(56),WHITE)
    if sc.get("note"): d.text((110,540),sc["note"],font=F(28,"Bold"),fill=MUT)
    foot(d,sc.get("foot",""))
    return im
def g_stat(sc,seg,t):
    im=Image.new("RGBA",(GW,GH),(0,0,0,0)); d=ImageDraw.Draw(im)
    panel(d,[60,10,940,640]); d.text((100,40),sc["title"],font=F(34,"SemiBold"),fill=MUT)
    if sc.get("icon"): icon(d,sc["icon"],110,120,1.1,C(sc.get("color","GOLD")))
    x=since(f"{seg}.start_word",t)
    if x>=0:
        v=countup(0,sc["value"],x/0.9); txt=fmtv(sc["fmt"],v); fs=170
        while d.textlength(txt,font=F(fs))>600 and fs>90: fs-=8
        ctext(d,590 if sc.get("icon") else 500,110,txt,F(fs),C(sc.get("color","GOLD")))
        if x>0.6: ctext(d,590 if sc.get("icon") else 500,320,sc["label"],F(36,"Bold"),WHITE)
    for q,cp in enumerate(sc.get("chips",[])):
        y=since(f"{seg}.chips.{q}",t)
        if y>=0 and back(y/0.3)>0.2:
            fnt=F(44); w=d.textlength(cp["text"],font=fnt)+36; chip(d,500-w/2,420+q*96,cp["text"],fnt,NAVY,C(cp.get("color","GREEN")))
    foot(d,sc.get("foot",""))
    return im
def g_risk(sc,seg,t):
    im=Image.new("RGBA",(GW,GH),(0,0,0,0)); d=ImageDraw.Draw(im); x=since("risk.start_word",t)
    if x>=0:
        k=back(x/0.35); sh=int(40*(1-k))
        panel(d,[60,20+sh,940,580+sh],fill=(70,24,34))
        d.polygon([(500,60+sh),(570,190+sh),(430,190+sh)],fill=RED); ctext(d,500,105+sh,"!",F(70),WHITE)
        yy=240
        for q,ln in enumerate(sc["lines"]):
            if since(f"risk.lines.{q}",t)>=0:
                d.text((110,yy+sh),"• "+ln["text"],font=F(44),fill=WHITE)
                if ln.get("sub"): d.text((150,yy+56+sh),ln["sub"],font=F(36,"Bold"),fill=(245,175,175))
            yy+=150 if ln.get("sub") else 100
    return im
def g_cta(sc,seg,t):
    im=Image.new("RGBA",(GW,GH),(0,0,0,0)); d=ImageDraw.Draw(im); x=since("cta.start_word",t)
    if x>=0:
        panel(d,[60,40,940,240]); ctext(d,500,80,"OUR OPINION",F(64),WHITE); ctext(d,500,160,"Not financial advice",F(40,"Bold"),MUT)
    y=since("cta.follow_word",t)
    if y>=0:
        k=back(y/0.35); bw=int(560*k); bh=int(140*k)
        if bw>10: d.rounded_rectangle([500-bw//2,380-bh//2,500+bw//2,380+bh//2],radius=max(1,bh//2),fill=GOLD)
        if k>0.85: ctext(d,500,342,"FOLLOW",F(76),NAVY)
        ctext(d,500,490,"Blue Chip Financial",F(40,"Bold"),WHITE)
    foot(d,sc.get("foot",""))
    return im
TYPES={"bars":g_bars,"rings":g_rings,"stack":g_stack,"stat":g_stat,"risk":g_risk,"cta":g_cta}
ACC={"hook":GREEN,"1":GOLD,"2":GOLD,"3":GOLD,"4":GOLD,"risk":RED,"cta":GOLD}
def illus(n,t):
    sc=SPEC["scenes"][n]
    if n=="hook": return g_hook(sc,t)
    return TYPES[sc["type"]](sc,n,t)

# ---------------- 7. presenter with shading
S=2; CW,CHh=1080,860
DONT=None
def layer(): return Image.new("RGBA",(CW*S,CHh*S),(0,0,0,0))
def shade(base,mask,shape_fn,col,alpha):
    sh=Image.new("L",base.size,0); shape_fn(ImageDraw.Draw(sh))
    a=ImageChops.multiply(sh,mask).point(lambda p:int(p*alpha))
    base.paste(Image.new("RGBA",base.size,col+(255,)),(0,0),a)
def presenter(t,i,n,fingers):
    im=layer(); d=ImageDraw.Draw(im); P=lambda x:int(x*S)
    m=float(MO[i]) if i<len(MO) else 0.0
    em=float(np.clip(np.mean(MO[max(0,i-6):i+1]) if i<len(MO) else 0,0,1)); bt=beat(t); br=math.sin(t*2.0)
    bob=br*5+bt*7; nod=bt*12+math.sin(t*1.9)*4+math.sin(t*0.9+1)*3; sway=math.sin(t*1.1)*14+math.sin(t*0.37)*9
    ds=t-seg_start(n); cx=540+sway*0.4; brow=-12*min(1,bt)
    if n=="risk": brow+=6   # concerned brows
    tilt=0
    hxo=sway*0.4; hyo=bob*0.6+nod
    # torso
    d.rounded_rectangle([P(cx-268),P(585+bob),P(cx+268),P(CHh+200)],radius=P(125),fill=SUIT)
    d.polygon([(P(cx-74),P(585+bob)),(P(cx+74),P(585+bob)),(P(cx),P(775+bob))],fill=(244,244,248))
    d.polygon([(P(cx-74),P(585+bob)),(P(cx-30),P(585+bob)),(P(cx-40),P(640+bob))],fill=(222,224,232))  # collar shade
    d.polygon([(P(cx-182),P(595+bob)),(P(cx-66),P(585+bob)),(P(cx-4),P(785+bob)),(P(cx-100),P(895+bob))],fill=SUIT_D)
    d.polygon([(P(cx+182),P(595+bob)),(P(cx+66),P(585+bob)),(P(cx+4),P(785+bob)),(P(cx+100),P(895+bob))],fill=SUIT_D)
    d.polygon([(P(cx-22),P(652+bob)),(P(cx+22),P(652+bob)),(P(cx+30),P(812+bob)),(P(cx),P(852+bob)),(P(cx-30),P(812+bob))],fill=GOLD)
    d.polygon([(P(cx-2),P(652+bob)),(P(cx+22),P(652+bob)),(P(cx+30),P(812+bob)),(P(cx),P(852+bob))],fill=(206,160,60))   # tie shade
    d.polygon([(P(cx-19),P(622+bob)),(P(cx+19),P(622+bob)),(P(cx+15),P(658+bob)),(P(cx-15),P(658+bob))],fill=(196,148,48))
    d.polygon([(P(cx-152),P(738+bob)),(P(cx-96),P(730+bob)),(P(cx-101),P(755+bob))],fill=GOLD)
    ay=658+bob
    def hand(sx,hx,hy,fing,thumb=False):
        d.line([(P(sx),P(ay)),(P(hx),P(hy+70))],fill=SUIT,width=P(108))
        d.line([(P(sx),P(ay)),(P(hx),P(hy+70))],fill=SUIT_L,width=P(10)) if False else None
        d.ellipse([P(hx-58),P(hy+52),P(hx+58),P(hy+92)],fill=(240,240,246))  # cuff
        if fing==0 and not thumb:
            d.rounded_rectangle([P(hx-56),P(hy-4),P(hx+56),P(hy+96)],radius=P(30),fill=SKIN)
            for k in range(4):
                fx=hx-42+k*28
                d.rounded_rectangle([P(fx-13),P(hy-14),P(fx+13),P(hy+40)],radius=P(13),fill=SKIN)
                d.line([(P(fx+13),P(hy-2)),(P(fx+13),P(hy+34))],fill=SKIN_D,width=P(3))
            d.rounded_rectangle([P(hx-50),P(hy+34),P(hx+18),P(hy+62)],radius=P(14),fill=SKIN_L)   # thumb across
            d.rounded_rectangle([P(hx-56),P(hy+70),P(hx+56),P(hy+96)],radius=P(18),fill=SKIN_D)   # palm shadow
        else:
            d.rounded_rectangle([P(hx-58),P(hy-10),P(hx+58),P(hy+110)],radius=P(40),fill=SKIN)
            d.rounded_rectangle([P(hx+20),P(hy-6),P(hx+58),P(hy+106)],radius=P(30),fill=SKIN_D)
        for k in range(fing):
            fx=hx-44+k*(88/max(fing-1,1)) if fing>1 else hx
            d.rounded_rectangle([P(fx-17),P(hy-105),P(fx+17),P(hy+22)],radius=P(17),fill=SKIN)
            d.line([(P(fx+10),P(hy-90)),(P(fx+10),P(hy+10))],fill=SKIN_D,width=P(4))
        if thumb:
            d.rounded_rectangle([P(hx-20),P(hy-110),P(hx+18),P(hy+20)],radius=P(18),fill=SKIN)
    bull=0<=t-EV["h_bull"]<1.6
    if n=="cta":
        x=t-EV["c_follow"]
        if x<0: hand(cx+268,cx+345+math.sin(t*9)*36,300+bob,5)
        else: r=ease(x/0.3); hand(cx+268,cx+330-r*120,330+bob-r*40,1)
    elif bull: r=ease((t-EV["h_bull"])/0.25); hand(cx+268,cx+330,560+(320-560)*r+bob,0,thumb=True)
    elif fingers>0:
        r=ease(ds/0.35); hand(cx+268,cx+330+(1-r)*30,520+(330-520)*r+bob*1.5-bt*18+math.sin(t*2.6)*7,fingers)
    else: hand(cx+268,cx+345,560+bob-bt*90-em*40,0)
    if n=="risk" and 0<=t-EV["r_card"]<1.8: r=ease((t-EV["r_card"])/0.25); hand(cx-268,cx-340,CHh-250+(300-(CHh-250))*r+bob,5)
    else: hand(cx-268,cx-330+math.sin(t*1.6)*22-bt*14,CHh-250-bt*150-em*110+math.sin(t*1.7)*12,0)
    # neck + head
    d.rectangle([P(cx-50),P(470+hyo),P(cx+50),P(608+bob)],fill=SKIN_D)
    hm=Image.new("L",im.size,0); hd=ImageDraw.Draw(hm)
    for dd,c in ((d,SKIN),(hd,255)):
        dd.ellipse([P(cx-168+hxo),P(130+hyo),P(cx+168+hxo),P(470+hyo)],fill=c)
        dd.rounded_rectangle([P(cx-150+hxo),P(290+hyo),P(cx+150+hxo),P(528+hyo)],radius=P(95),fill=c)
    # cel shading: right side + under-brow + jaw
    shade(im,hm,lambda q:q.ellipse([P(cx+60+hxo),P(140+hyo),P(cx+320+hxo),P(560+hyo)],fill=255),SKIN_D,0.55)
    shade(im,hm,lambda q:q.ellipse([P(cx-140+hxo),P(-120+hyo),P(cx+140+hxo),P(230+hyo)],fill=255),SKIN_L,0.0)
    shade(im,hm,lambda q:q.ellipse([P(cx-120+hxo),P(130+hyo),P(cx+40+hxo),P(300+hyo)],fill=255),SKIN_L,0.45)   # forehead highlight
    d=ImageDraw.Draw(im)
    d.polygon([(P(cx-50),P(520+hyo)),(P(cx+50),P(520+hyo)),(P(cx+50),P(545+hyo)),(P(cx-50),P(545+hyo))],fill=SKIN_D)   # chin shadow on neck
    for side in (-1,1):
        ex0=cx+side*168+hxo
        d.ellipse([P(min(ex0,ex0+side*20)-0),P(305+hyo),P(max(ex0,ex0+side*20)),P(385+hyo)],fill=SKIN_D)
        d.ellipse([P(ex0+side*2-6),P(322+hyo),P(ex0+side*2+6),P(366+hyo)],fill=(170,118,88))
    # hair
    d.pieslice([P(cx-178+hxo),P(105+hyo),P(cx+178+hxo),P(400+hyo)],180,360,fill=HAIR)
    d.rectangle([P(cx-174+hxo),P(245+hyo),P(cx-156+hxo),P(305+hyo)],fill=HAIR); d.rectangle([P(cx+156+hxo),P(245+hyo),P(cx+174+hxo),P(305+hyo)],fill=HAIR)
    d.ellipse([P(cx-110+hxo),P(84+hyo),P(cx+176+hxo),P(232+hyo)],fill=HAIR)
    d.ellipse([P(cx-176+hxo),P(118+hyo),P(cx-10+hxo),P(236+hyo)],fill=HAIR)
    d.arc([P(cx-60+hxo),P(100+hyo),P(cx+150+hxo),P(200+hyo)],200,330,fill=HAIR_L,width=P(8))
    d.arc([P(cx-20+hxo),P(110+hyo),P(cx+130+hxo),P(190+hyo)],210,300,fill=HAIR_L,width=P(5))
    blink=(t%3.6)<0.12 or (t%5.3)<0.1
    look=math.sin(t*0.7)*2
    for ex in (-70,70):
        x=cx+ex+hxo; y=340+hyo
        if blink: d.line([(P(x-26),P(y)),(P(x+26),P(y))],fill=(30,22,20),width=P(8))
        else:
            d.ellipse([P(x-29),P(y-28),P(x+29),P(y+28)],fill=WHITE)
            d.ellipse([P(x-17+look),P(y-17),P(x+17+look),P(y+17)],fill=(92,58,34))   # iris
            d.ellipse([P(x-10+look),P(y-10),P(x+10+look),P(y+10)],fill=(26,16,12))   # pupil
            d.ellipse([P(x-6+look),P(y-12),P(x+3+look),P(y-4)],fill=WHITE)
            d.arc([P(x-31),P(y-32),P(x+31),P(y+10)],200,340,fill=(30,22,20),width=P(6))   # upper lid
            d.arc([P(x-26),P(y+6),P(x+26),P(y+34)],30,150,fill=SKIN_D,width=P(3))       # lower lid
        d.line([(P(x-40),P(y-52+brow+(4 if ex<0 else 0))),(P(x+40),P(y-56+brow-(4 if (n=="risk" and ex<0) else 0)))],fill=HAIR,width=P(13))
    d.line([(P(cx+8+hxo),P(350+hyo)),(P(cx+16+hxo),P(410+hyo))],fill=SKIN_D,width=P(5))   # nose side
    d.arc([P(cx-18+hxo),P(398+hyo),P(cx+18+hxo),P(426+hyo)],10,170,fill=SKIN_D,width=P(5))
    vw,vh=VIS[viseme(t)]; mx,my=cx+hxo,470+hyo
    if m<0.07 and viseme(t)=="rest":
        if n=="risk": d.line([(P(mx-40),P(my)),(P(mx+40),P(my))],fill=(120,60,60),width=P(8))
        else: d.arc([P(mx-52),P(my-32),P(mx+52),P(my+22)],20,160,fill=(120,60,60),width=P(9))
    else:
        oh=(6+m*44)*vh; wd=(32+18*m)*vw
        d.ellipse([P(mx-wd),P(my-oh/2),P(mx+wd),P(my+oh/2)],fill=(96,34,40))
        if oh>18: d.ellipse([P(mx-wd*0.6),P(my+oh/2-16),P(mx+wd*0.6),P(my+oh/2+1)],fill=(200,96,104))
        if oh>14 or viseme(t)=="teeth": d.rectangle([P(mx-wd*0.8),P(my-oh/2),P(mx+wd*0.8),P(my-oh/2+min(9,oh*0.45))],fill=WHITE)
        d.arc([P(mx-wd-3),P(my-oh/2-4),P(mx+wd+3),P(my+oh/2+5)],20,160,fill=(160,90,90),width=P(4))
    return im.resize((CW,CHh),Image.LANCZOS)
# ---------------- 8. compositing
CUTS=list(np.arange(0,120,3.1)); ZS=[1.0,1.08,1.03,1.12]
def zoom_at(t):
    k=max(j for j,c in enumerate(CUTS) if c<=t); return ZS[k%len(ZS)]+0.025*(t-CUTS[k])/3.0
BG=Image.new("RGB",(W,H),NAVY); bd=ImageDraw.Draw(BG)
for y in range(H): c=int(22*y/H); bd.line([(0,y),(W,y)],fill=(8+c//2,20+c,52+c*2))
for gx in range(0,W,90): bd.line([(gx,0),(gx,H)],fill=(14,30,66),width=1)
for gy in range(0,H,90): bd.line([(0,gy),(W,gy)],fill=(14,30,66),width=1)
glow=Image.new("L",(W,H),0); ImageDraw.Draw(glow).ellipse([160,1050,920,1900],fill=70); glow=glow.filter(ImageFilter.GaussianBlur(170))
BG=Image.composite(Image.new("RGB",(W,H),(44,68,130)),BG,glow)
PS=0.80   # presenter scale (data panels get the top 60% of the screen)
def frame(i):
    t=i/FPS; im=BG.copy().convert("RGBA"); d=ImageDraw.Draw(im)
    n=seg_at(t); num,title=TITLES[n]; ds=t-seg_start(n); acc=ACC[n]
    # header
    d.text((56,58),"BLUE CHIP FINANCIAL",font=F(34),fill=GOLD); d.rectangle([56,104,280,109],fill=GOLD)
    tk=SPEC["ticker"]+" · "+SPEC["date"]; chip(d,W-56-d.textlength(tk,font=F(26,"Bold"))-36,48,tk,F(26,"Bold"),WHITE,(30,48,96))
    # title row
    k=ease(ds/0.3); y=150+int((1-k)*40)
    if num:
        s=back(ds/0.35); r=int(44*max(s,0.01)); d.ellipse([90-r+44,y+46-r,90+r+44,y+46+r],outline=GOLD,width=7)
        if s>0.5: ctext(d,134,y+4,str(num),F(64),GOLD)
        d.text((210,y+4),title,font=F(76),fill=WHITE)
    else:
        ctext(d,W/2,y+4,title,F(80),WHITE if n!="risk" else RED)
    # scene wipe on segment change
    if 0<=ds<0.32 and n!="hook":
        wx=int(-W+2*W*ease(ds/0.32)); d.rectangle([wx,140,wx+W,1040],fill=acc)
    # graphic
    g=illus(n,t); sc=max(0.05,back(ds/0.45));
    if sc!=1: g=g.resize((max(1,int(GW*sc)),max(1,int(GH*sc))),Image.LANCZOS)
    if not (0<=ds<0.16 and n!="hook"): im.alpha_composite(g,(int((W-g.width)/2),int(270+(GH-g.height)/2)))
    # presenter
    fing=num if (n in NUMT) else 0
    ch=presenter(t,i,n,fing); zs=zoom_at(t)*PS; ch=ch.resize((int(CW*zs),int(CHh*zs)),Image.LANCZOS)
    im.alpha_composite(ch,(int(540-540*zs),int(1000+330*PS-330*zs)))
    # captions
    for k_,(c,s0,e0) in enumerate(CH):
        nxt=CH[k_+1][1] if k_+1<len(CH) else e0+0.6
        if s0-0.04<=t<min(e0+0.4,nxt):
            ws=[cap(w[0]) for w in c]; fnt=F(CAPF,"ExtraBold"); x=(W-d.textlength(" ".join(ws),font=fnt))/2
            pop_=back((t-s0)/0.12); yy=1712+int((1-pop_)*14)
            act=None
            for q,wd in enumerate(c):
                if wd[1]-0.03<=t: act=q
            if act is not None and t>c[act][2]+0.25: act=None
            for q,(w,wd) in enumerate(zip(ws,c)):
                col=GOLD if q==act else WHITE
                for ox,oy in ((-3,0),(3,0),(0,-3),(0,4),(3,4),(-3,4)): d.text((x+ox,yy+oy),w,font=fnt,fill=(0,0,0))
                d.text((x,yy),w,font=fnt,fill=col); x+=d.textlength(w+" ",font=fnt)
            break
    d.rectangle([0,H-12,W*min(t/DUR,1),H],fill=GOLD)
    return im.convert("RGB")
if __name__=="__main__":
    print("aligned script tokens: %d/%d matched to ASR, DUR=%.2fs"%(matched,len(toks),DUR))
    if len(sys.argv)>1 and sys.argv[1]=="stills":
        for ts in sys.argv[2:]: frame(int(float(ts)*FPS)).resize((360,640),Image.LANCZOS).save(f"p{ts}.png")
        sys.exit()
    out=os.environ.get("OUT","final.mp4")
    p=subprocess.Popen(["ffmpeg","-y","-v","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{W}x{H}","-r",str(FPS),"-i","-","-i","mix.wav","-t",str(DUR),
      "-c:v","libx264","-preset","medium","-crf","17","-pix_fmt","yuv420p","-r",str(FPS),"-c:a","aac","-b:a","192k","-movflags","+faststart","-shortest",out],stdin=subprocess.PIPE)
    for i in range(int(DUR*FPS)): p.stdin.write(frame(i).tobytes())
    p.stdin.close(); p.wait(); print("rendered",out)
