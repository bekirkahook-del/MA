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
    badge(d,sc,seg,t,*( (760,112) if sc.get('chips') else (500,150) ))
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
        ic=bool(sc.get("icon")); mw=540 if ic else 700
        while d.textlength(txt,font=F(fs))>mw and fs>90: fs-=8
        ctext(d,620 if ic else 500,110+(170-fs)//2,txt,F(fs),C(sc.get("color","GOLD")))
        if x>0.6: ctext(d,620 if sc.get("icon") else 500,320,sc["label"],F(36,"Bold"),WHITE)
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
