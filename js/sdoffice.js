/* Superday offices: replaces the small video tile (interviewer.js) with a full scene.
   - Each interviewer is a different illustrated person in their own office (bullpen, whiteboard room, trading floor,
     VP office, glass conference room, MD corner office). Blinks, breathes, nods while you talk, lip-syncs per word.
   - Live captions to the side: the interviewer's words highlight as they're spoken; your answer streams in as you talk/type.
   - Between rounds you walk down the hallway to the next office (maInterviewerJoin).
   - Voice: prefers natural/neural voices, male/female per character, speaks sentence by sentence (Chrome cuts long ones).
   Same API as interviewer.js: maInterviewer(el,{name,role,roleKey}) -> {say,listen,think,destroy,nod,heard}. Free, no video. */
(function(){
  if(!window.maInterviewer)return; // interviewer.js missing: leave things alone
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const calm=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches||(S.settings&&S.settings.calm)}catch(e){return false}};
  const hasTTS="speechSynthesis" in window&&!!window.SpeechSynthesisUtterance;

  /* the cast: one person + one room per role */
  const CAST={
    "Analyst":{n:"Jordan",sex:"m",skin:"#e9b996",hair:"#3a2618",hs:"short",suit:"#34425c",tie:"#3b6fd6",room:"bullpen",where:"28th floor · Analyst bullpen",pv:[1.05,1.06]},
    "Associate":{n:"Priya",sex:"f",skin:"#c58a5f",hair:"#1a110c",hs:"long",suit:"#1f2b46",glasses:0,room:"board",where:"30th floor · Team room",pv:[1.08,1.03]},
    "Associate (markets)":{n:"Marcus",sex:"m",skin:"#8a5636",hair:"#120b07",hs:"fade",suit:"#2e3a49",tie:"#b8322a",room:"trading",where:"12th floor · Trading floor",pv:[.98,1.1]},
    "Vice President":{n:"Daniel",sex:"m",skin:"#f0c8a4",hair:"#6e3f1f",hs:"side",suit:"#3d2f4b",tie:"#5b4a7a",room:"office",where:"34th floor · VP office",pv:[1,1]},
    "Director":{n:"Mei",sex:"f",skin:"#e8c39e",hair:"#141010",hs:"long",suit:"#253040",glasses:1,room:"glass",where:"36th floor · Conference room B",pv:[.93,.98]},
    "Managing Director":{n:"Grace",sex:"f",skin:"#7d4b2e",hair:"#cfcfcf",hs:"bun",suit:"#14181f",glasses:1,room:"corner",where:"40th floor · Corner office",pv:[.95,.94]}};
  const castOf=k=>CAST[k]||CAST[String(k||"").split(" · ")[0]]||CAST["Analyst"];

  const css=`.panel.wide:has(.sdo){max-width:1020px}
.sdo{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:12px;margin:4px 0 14px}
.sdo-stage{position:relative;border-radius:8px;overflow:hidden;background:#0b1226;aspect-ratio:16/10;box-shadow:0 12px 30px rgba(10,20,50,.25)}
.sdo-stage svg{display:block;width:100%;height:100%}
.sdo-live{position:absolute;left:10px;top:10px;font:700 10.5px/1 var(--mono,monospace);letter-spacing:.08em;color:#fff;background:rgba(220,40,40,.92);padding:4px 7px;border-radius:5px}
.sdo-where{position:absolute;right:10px;top:10px;font:600 11px/1 system-ui,sans-serif;color:#fff;background:rgba(8,14,30,.55);padding:5px 8px;border-radius:5px;max-width:60%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sdo-bar{position:absolute;left:10px;right:10px;bottom:10px;display:flex;align-items:center;gap:8px}
.sdo-st{font:600 12px/1 system-ui,sans-serif;color:#fff;background:rgba(8,14,30,.6);padding:6px 9px;border-radius:5px;display:flex;align-items:center;gap:6px}
.sdo-dot{width:8px;height:8px;border-radius:50%;background:#9aa5be}.sdo-st.on .sdo-dot{background:#3ad07a;animation:sdoP 1.2s infinite}@keyframes sdoP{50%{opacity:.35}}
.sdo-bar button{margin-left:auto;font:600 12px/1 system-ui,sans-serif;background:rgba(8,14,30,.6);color:#fff;border:0;border-radius:5px;padding:6px 9px;cursor:pointer}.sdo-bar button+button{margin-left:0}
.sdo-ring{position:absolute;inset:0;border-radius:8px;box-shadow:inset 0 0 0 3px #3ad07a;opacity:0;transition:opacity .2s;pointer-events:none}.sdo-stage.talk .sdo-ring{opacity:1}
.sdo-cc{border:1px solid var(--rule);border-radius:8px;background:var(--paper);display:flex;flex-direction:column;min-height:0;max-height:100%;overflow:hidden}
.sdo-cch{font:700 10.5px/1 var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--brass);padding:10px 12px 8px;border-bottom:1px solid var(--rule)}
.sdo-ccl{flex:1;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:10px;font-size:14.5px;line-height:1.45;color:var(--ink)}
.sdo-ln b{display:block;font-size:11.5px;letter-spacing:.04em;color:var(--ink-2);margin-bottom:2px}.sdo-ln.you b{color:var(--cobalt,#2448D8)}
.sdo-ln.you span{color:var(--ink-2)}.sdo-ln.live span{font-style:italic}
.sdo-w{transition:color .15s}.sdo-ln.cur .sdo-w{color:var(--ink-2);opacity:.55}.sdo-ln.cur .sdo-w.on,.sdo-ln.cur .sdo-w.done{color:var(--ink);opacity:1}.sdo-w.on{background:rgba(201,162,39,.28);border-radius:3px}
.sdo-hint{font-size:12.5px;color:var(--brass);padding:0 12px 10px;display:none}.sdo-hint.on{display:block}
.sdo-hall{position:relative;border-radius:8px;overflow:hidden;aspect-ratio:16/8;background:#1b2236;margin:6px 0 10px}
.sdo-hall svg{display:block;width:100%;height:100%}
.sdo-walk{animation:sdoWalk var(--d,1.6s) cubic-bezier(.45,.05,.4,1) forwards}@keyframes sdoWalk{to{transform:translateX(-1280px)}}
.sdo-bob{animation:sdoBob .42s ease-in-out infinite alternate}@keyframes sdoBob{to{transform:translateY(4px)}}
.sdo-door{transform-box:fill-box;transform-origin:0 50%;animation:sdoOpen .5s ease-in calc(var(--d,1.6s) - .1s) forwards}@keyframes sdoOpen{to{transform:scaleX(.08)}}
.sdo-hallt{text-align:center}.sdo-hallt b{display:block;font-size:18px;color:var(--ink)}.sdo-hallt span{font-size:13.5px;color:var(--ink-2)}
@media(max-width:720px){.sdo{grid-template-columns:1fr}.sdo-cc{max-height:170px}.sdo-where{display:none}.sdo-bar{left:6px;right:6px;bottom:6px}.sdo-bar button,.sdo-st{padding:4px 7px;font-size:11px}}
@media(prefers-reduced-motion:reduce){.sdo-walk,.sdo-bob,.sdo-door{animation:none}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  /* ---------- drawing (viewBox 640x400) ---------- */
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const skyline=(y0,col,n,minH,maxH,win)=>{let s="",x=-10;while(x<650){const w=24+rnd()*46,h=minH+rnd()*(maxH-minH);s+=`<rect x="${x.toFixed(0)}" y="${(y0-h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h+2).toFixed(0)}" fill="${col}"/>`;
      if(win)for(let wy=y0-h+8;wy<y0-6;wy+=11)for(let wx=x+5;wx<x+w-6;wx+=9)if(rnd()<.32)s+=`<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="4" height="5" fill="${win}" opacity=".8"/>`;x+=w+2}return s};
  function room(t){seed=t.length*977+13;
    if(t==="bullpen")return `<rect width="640" height="400" fill="#dfe6ee"/><rect y="0" width="640" height="18" fill="#cfd8e3"/>${[60,220,380,540].map(x=>`<rect x="${x}" y="6" width="90" height="6" rx="3" fill="#fff" opacity=".9"/>`).join("")}
      <rect x="0" y="40" width="640" height="120" fill="#a9c6e6"/>${skyline(160,"#8aa6c6",0,40,100,"#dce8f5")}<rect x="0" y="40" width="640" height="120" fill="none" stroke="#c4ced9" stroke-width="6"/>${[160,320,480].map(x=>`<rect x="${x-3}" y="40" width="6" height="120" fill="#c4ced9"/>`).join("")}
      <rect x="0" y="160" width="640" height="240" fill="#e7ecf2"/>${[30,130,430,530].map(x=>`<g><rect x="${x}" y="196" width="78" height="48" rx="3" fill="#1d2a40"/><rect x="${x+4}" y="200" width="70" height="40" fill="#3d6fb6"/><path d="M${x+8} 230 L${x+22} 222 L${x+36} 226 L${x+52} 212 L${x+70} 216" stroke="#9fe0b8" stroke-width="2" fill="none"/><rect x="${x+34}" y="244" width="10" height="10" fill="#1d2a40"/><rect x="${x-10}" y="254" width="98" height="8" fill="#b9c3cf"/></g>`).join("")}`;
    if(t==="board")return `<rect width="640" height="400" fill="#ebe5da"/><rect y="300" width="640" height="100" fill="#cfc5b4"/>
      <rect x="40" y="50" width="250" height="160" rx="4" fill="#fbfbf8" stroke="#a7a39a" stroke-width="5"/><text x="58" y="88" font-family="Comic Sans MS,Marker Felt,cursive" font-size="17" fill="#2148a8">EV = Equity + Debt − Cash</text>
      <text x="58" y="118" font-family="Comic Sans MS,Marker Felt,cursive" font-size="15" fill="#b8322a">UFCF → discount @ WACC</text><path d="M60 150 L100 140 L140 156 L180 128 L220 134 L262 112" stroke="#2b7a57" stroke-width="3" fill="none"/><text x="58" y="194" font-family="Comic Sans MS,Marker Felt,cursive" font-size="14" fill="#333">accretion / dilution?</text>
      <rect x="470" y="60" width="130" height="90" fill="#6d8fb3"/>${`<rect x="470" y="60" width="130" height="90" fill="none" stroke="#f4efe6" stroke-width="6"/>`}<circle cx="575" cy="85" r="12" fill="#f7d774"/>
      <g transform="translate(560 214)"><rect x="-16" y="40" width="32" height="40" rx="4" fill="#8b5e3c"/><path d="M0 42 C-30 10,-20 -20,0 -30 C20 -20,30 10,0 42Z" fill="#3f8a4e"/><path d="M0 40 C-40 20,-42 -2,-28 -6 M0 40 C40 20,42 -2,28 -6" stroke="#3f8a4e" stroke-width="10" fill="none"/></g>`;
    if(t==="trading")return `<rect width="640" height="400" fill="#0e1628"/><rect y="0" width="640" height="34" fill="#070c18"/>
      <g class="sdo-tick"><text x="0" y="23" font-family="monospace" font-size="15" fill="#3ad07a">▲ SPX  ▲ NDX  ▼ UST10Y  ▲ WTI  ▼ DXY  ▲ GOLD  ▲ EURUSD  ▼ VIX  ▲ SPX  ▲ NDX  ▼ UST10Y  ▲ WTI  ▼ DXY  ▲ GOLD</text></g>
      ${[0,1,2,3].map(i=>{const x=18+i*156;let p="",y=120;for(let k=0;k<=12;k++){y+=(rnd()-.47)*22;y=Math.max(70,Math.min(170,y));p+=(k?"L":"M")+(x+8+k*11)+" "+y.toFixed(0)}return `<rect x="${x}" y="56" width="144" height="130" rx="4" fill="#111d33" stroke="#24324f" stroke-width="3"/><path d="${p}" stroke="${i%2?"#ff6b6b":"#3ad07a"}" stroke-width="2.4" fill="none"/>${[0,1,2,3,4].map(r=>`<rect x="${x+10+r*26}" y="${170-(rnd()*40)}" width="14" height="${rnd()*14+4}" fill="#2c4878"/>`).join("")}`}).join("")}
      <rect y="200" width="640" height="200" fill="#151f35"/>${[20,520].map(x=>`<rect x="${x}" y="212" width="100" height="62" rx="3" fill="#0a1222" stroke="#2b3b5e" stroke-width="3"/><rect x="${x+6}" y="218" width="88" height="50" fill="#13305a"/>`).join("")}`;
    if(t==="office")return `<rect width="640" height="400" fill="#e4d8c6"/><rect y="300" width="640" height="100" fill="#b99a74"/>
      <rect x="34" y="44" width="200" height="190" fill="#9ec3e6"/>${skyline(234,"#7f9fc2",0,60,150,"#e7f0fa")}<rect x="34" y="44" width="200" height="190" fill="none" stroke="#f4ede1" stroke-width="8"/><rect x="130" y="44" width="8" height="190" fill="#f4ede1"/>
      <rect x="436" y="40" width="180" height="250" fill="#6b4a2f"/>${[0,1,2,3].map(r=>`<rect x="444" y="${98+r*60}" width="164" height="6" fill="#4e341f"/>${Array.from({length:9},(_,k)=>`<rect x="${450+k*17}" y="${58+r*60+(k%3)*3}" width="13" height="${38-(k%3)*3}" fill="${["#8c1a2b","#2b4c7e","#d6b45a","#2b7a57","#5b4a7a","#c9c2b4"][(k+r)%6]}"/>`).join("")}`).join("")}
      <rect x="540" y="232" width="20" height="24" fill="#cfe3f2" opacity=".8"/><rect x="566" y="236" width="20" height="20" fill="#e9f2f8" opacity=".85"/>`;
    if(t==="glass")return `<rect width="640" height="400" fill="#cfd8e0"/>${skyline(250,"#9fb1c4",0,50,170,"#eef3f8")}<rect width="640" height="400" fill="#e7eef4" opacity=".55"/>
      ${[0,160,320,480,640].map(x=>`<rect x="${x-3}" y="0" width="6" height="300" fill="#7d8a99"/>`).join("")}<rect x="0" y="130" width="640" height="26" fill="#ffffff" opacity=".6"/>
      <rect x="400" y="40" width="200" height="118" rx="4" fill="#111a2c"/><rect x="408" y="48" width="184" height="102" fill="#f5f7fb"/>${[0,1,2,3,4].map(k=>`<rect x="${424+k*32}" y="${140-[30,46,38,62,78][k]}" width="20" height="${[30,46,38,62,78][k]}" fill="#2448d8"/>`).join("")}<text x="424" y="66" font-family="system-ui" font-size="12" font-weight="700" fill="#14213d">Pipeline by quarter</text>
      <rect y="300" width="640" height="100" fill="#7d8a99"/>`;
    /* corner: MD */
    return `<defs><linearGradient id="sdoSun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3c74"/><stop offset=".55" stop-color="#e07a5f"/><stop offset="1" stop-color="#f6c177"/></linearGradient></defs>
      <rect width="640" height="400" fill="url(#sdoSun)"/><circle cx="470" cy="214" r="34" fill="#ffd98a" opacity=".9"/>${skyline(300,"#2a2f4a",0,90,230,"#ffd98a")}
      ${[0,213,426,640].map(x=>`<rect x="${x-4}" y="0" width="8" height="300" fill="#1a1a1f"/>`).join("")}<rect y="0" width="640" height="10" fill="#1a1a1f"/>
      <g transform="translate(70 170)"><rect x="-4" y="0" width="8" height="130" fill="#2a2a2a"/><path d="M-30 0 L30 0 L18 -36 L-18 -36Z" fill="#f2e6c9"/></g><rect y="300" width="640" height="100" fill="#3b2a1e"/>`}

  function person(c){const sk=c.skin,hr=c.hair,f=c.sex==="f";
    const hairBack=c.hs==="long"?`<path d="M268 168 Q262 240 280 262 L360 262 Q378 240 372 168Z" fill="${hr}"/>`:"";
    const hair={short:`<path d="M274 166 Q272 108 320 106 Q368 108 366 166 Q358 128 320 126 Q282 128 274 166Z" fill="${hr}"/>`,
      side:`<path d="M274 168 Q270 110 322 106 Q370 110 366 168 Q362 132 342 126 Q300 118 290 140 Q282 150 274 168Z" fill="${hr}"/><path d="M300 116 Q296 124 292 138" stroke="${sk}" stroke-width="2" opacity=".5"/>`,
      fade:`<path d="M276 158 Q278 112 320 110 Q362 112 364 158 Q356 126 320 122 Q284 126 276 158Z" fill="${hr}"/>`,
      receding:`<path d="M274 172 Q272 140 284 128 Q284 150 280 172Z M366 172 Q368 140 356 128 Q356 150 360 172Z" fill="${hr}"/><path d="M290 122 Q320 110 350 122" stroke="${hr}" stroke-width="5" fill="none" opacity=".8"/>`,
      bun:`<circle cx="320" cy="100" r="17" fill="${hr}"/><path d="M272 172 Q268 110 320 108 Q372 110 368 172 Q362 130 320 128 Q278 130 272 172Z" fill="${hr}"/>`,
      long:`<path d="M270 178 Q266 106 320 104 Q374 106 370 178 Q364 130 330 124 Q300 132 284 150 Q276 160 270 178Z" fill="${hr}"/>`}[c.hs]||"";
    const top=f?`<path d="M300 254 Q320 290 340 254Z" fill="#f4f1ea"/>`:`<path d="M296 252 L320 312 L344 252Z" fill="#f7f7f4"/>${c.tie?`<path d="M314 262 L326 262 L331 322 L320 338 L309 322Z" fill="${c.tie}"/><path d="M313 256 L327 256 L325 266 L315 266Z" fill="${c.tie}"/>`:""}`;
    return `<g class="sdo-body">${hairBack}<path d="M200 400 Q204 268 320 252 Q436 268 440 400Z" fill="${c.suit}"/>${top}
      <path d="M296 252 L320 300 L300 400 L262 400 Q270 300 296 252Z M344 252 L320 300 L340 400 L378 400 Q370 300 344 252Z" fill="#000" opacity=".14"/>
      <rect x="304" y="226" width="32" height="34" rx="10" fill="${sk}"/><path d="M304 240 Q320 252 336 240 L336 230 L304 230Z" fill="#000" opacity=".08"/>
      <g class="sdo-head"><ellipse cx="275" cy="176" rx="8" ry="12" fill="${sk}"/><ellipse cx="365" cy="176" rx="8" ry="12" fill="${sk}"/>
      <ellipse cx="320" cy="168" rx="45" ry="54" fill="${sk}"/>${hair}
      <path d="M296 150 Q304 145 313 149" stroke="${hr}" stroke-width="3.4" fill="none" stroke-linecap="round" class="sdo-brow"/><path d="M327 149 Q336 145 344 150" stroke="${hr}" stroke-width="3.4" fill="none" stroke-linecap="round" class="sdo-brow"/>
      <g class="sdo-eyes"><ellipse cx="304" cy="166" rx="7" ry="5.2" fill="#fff"/><ellipse cx="336" cy="166" rx="7" ry="5.2" fill="#fff"/><circle cx="305" cy="166" r="3.6" fill="#2a1c14"/><circle cx="337" cy="166" r="3.6" fill="#2a1c14"/><circle cx="306" cy="164.6" r="1.1" fill="#fff"/><circle cx="338" cy="164.6" r="1.1" fill="#fff"/></g>
      ${c.glasses?`<g fill="none" stroke="#1c1c22" stroke-width="2.4"><rect x="292" y="157" width="25" height="18" rx="6"/><rect x="323" y="157" width="25" height="18" rx="6"/><path d="M317 165 L323 165"/></g>`:""}
      <path d="M320 172 Q316 186 312 188 Q320 192 326 188" stroke="#000" stroke-opacity=".22" stroke-width="2" fill="none"/>
      ${f?`<ellipse cx="298" cy="188" rx="7" ry="4" fill="#e66" opacity=".16"/><ellipse cx="342" cy="188" rx="7" ry="4" fill="#e66" opacity=".16"/>`:""}
      <g class="sdo-mouth" transform="translate(320 203)"><ellipse class="sdo-m" rx="11" ry="1.6" fill="#5b1f22"/><rect class="sdo-teeth" x="-7" y="-3" width="14" height="3" rx="1" fill="#fff" opacity="0"/><path d="M-12 0 Q0 ${f?3:2} 12 0" stroke="${f?"#a8434a":"#7a3b34"}" stroke-width="${f?2.6:1.8}" fill="none" stroke-linecap="round"/></g>
      <g class="sdo-mm" opacity="0"><rect x="356" y="94" width="58" height="24" rx="12" fill="#fff"/><path d="M366 116 L360 126 L374 116Z" fill="#fff"/><text x="385" y="110.5" text-anchor="middle" font-family="system-ui" font-size="12" font-weight="700" fill="#14213d">mm-hm</text></g></g></g>`}

  function desk(c,label){const wood={bullpen:"#c9cfd6",board:"#b88c5a",trading:"#2a3550",office:"#7a5233",glass:"#e9edf1",corner:"#4a2f1c"}[c.room]||"#8a6a4a";
    return `<rect x="0" y="318" width="640" height="82" fill="${wood}"/><rect x="0" y="318" width="640" height="6" fill="#000" opacity=".12"/>
      <path d="M96 318 L112 262 L232 262 L248 318Z" fill="#9aa3ae"/><circle cx="172" cy="290" r="6" fill="#c9cfd6"/>
      <g transform="translate(478 288)"><rect width="30" height="32" rx="4" fill="#f4f1ea"/><path d="M30 8 Q42 8 42 18 Q42 26 30 26" stroke="#f4f1ea" stroke-width="4" fill="none"/></g>
      <g transform="translate(320 352)"><path d="M-96 0 L-86 -26 L86 -26 L96 0Z" fill="#1b2233"/><text y="-9" text-anchor="middle" font-family="system-ui" font-size="13" font-weight="700" fill="#e9d9a6">${esc(label)}</text></g>`}

  /* ---------- voice ---------- */
  let voices=[];const loadV=()=>{try{voices=speechSynthesis.getVoices()}catch(e){}};try{loadV();speechSynthesis.addEventListener("voiceschanged",loadV)}catch(e){}
  const FEM=/female|aria|jenny|samantha|zira|karen|moira|tessa|victoria|allison|ava|susan|emma|libby|sonia|michelle|natasha|serena|joanna|salli|kendra|kimberly|ivy|clara|nancy|ana\b|google us english/i;
  const MAL=/male|guy|davis|andrew|christopher|eric|brian|daniel|aaron|fred|roger|steffan|tony|ryan|thomas|oliver|alex\b|matthew|joey|justin|george|arthur|william|liam|google uk english male/i;
  const quality=v=>(/natural|neural|online|premium|enhanced|siri/i.test(v.name)?3:0)+(/google|microsoft/i.test(v.name)?1:0)+(/en[-_]US/i.test(v.lang)?.5:0);
  const vCache={};
  function pickVoice(c){const key=c.n;if(vCache[key]&&voices.includes(vCache[key]))return vCache[key];
    const en=voices.filter(v=>/^en([-_]|$)/i.test(v.lang));if(!en.length)return null;
    const want=c.sex==="f"?en.filter(v=>FEM.test(v.name)&&!/male/i.test(v.name.replace(/female/i,""))):en.filter(v=>MAL.test(v.name)&&!FEM.test(v.name));
    const pool=(want.length?want:en).slice().sort((a,b)=>quality(b)-quality(a));
    /* different people of the same sex get different voices when there are enough good ones */
    const same=Object.keys(CAST).filter(k=>CAST[k].sex===c.sex).map(k=>CAST[k].n),idx=Math.max(0,same.indexOf(c.n));
    const top=pool.filter(v=>quality(v)>=quality(pool[0])-1);const v=(top.length>1?top:pool)[idx%(top.length>1?top.length:pool.length)];
    vCache[key]=v;return v}

  /* ---------- shared caption log (survives the re-draws within one interview) ---------- */
  const CC={key:"",lines:[],live:"",t:0};
  const resetCC=key=>{if(CC.key!==key||Date.now()-CC.t>20*60e3){CC.key=key;CC.lines=[];CC.live=""}CC.t=Date.now()};
  const flushLive=()=>{const v=(CC.live||"").trim();if(v&&!(CC.lines.length&&CC.lines[CC.lines.length-1].you&&CC.lines[CC.lines.length-1].text===v))CC.lines.push({you:1,text:v});CC.live=""};

  window.maOfficeReset=()=>{CC.key="";CC.lines=[];CC.live=""};
  window.maInterviewer=function(el,o){o=o||{};const c=castOf(o.roleKey||o.name);
    resetCC(o.name||c.n);flushLive();
    const who=`${c.n} · ${(o.roleKey||"Interviewer")}`;
    el.innerHTML=`<div class="sdo"><div class="sdo-stage"><svg viewBox="0 0 640 400" role="img" aria-label="${esc(who)} (fictional interviewer) in their office">${room(c.room)}<g transform="translate(320 400) scale(1.16) translate(-320 -400)">${person(c)}</g>${desk(c,c.n+" · "+(o.roleKey||""))}</svg>
      <span class="sdo-live">● LIVE</span><span class="sdo-where">${esc(c.where)}</span><div class="sdo-ring"></div>
      <div class="sdo-bar"><span class="sdo-st"><span class="sdo-dot"></span><span class="sdo-stt">${esc(o.role||"")}</span></span>${hasTTS?`<button type="button" class="sdo-rep">🔁 Repeat</button><button type="button" class="sdo-mute"></button>`:""}</div></div>
      <aside class="sdo-cc" aria-label="Live captions"><div class="sdo-cch">Live captions</div><div class="sdo-ccl"></div><div class="sdo-hint">Sounds like you're done. Hit the button below when you're ready.</div></aside></div>`;
    const stage=el.querySelector(".sdo-stage"),head=el.querySelector(".sdo-head"),body=el.querySelector(".sdo-body"),eyes=el.querySelector(".sdo-eyes"),m=el.querySelector(".sdo-m"),teeth=el.querySelector(".sdo-teeth"),
      mm=el.querySelector(".sdo-mm"),stBox=el.querySelector(".sdo-st"),stTxt=el.querySelector(".sdo-stt"),ccl=el.querySelector(".sdo-ccl"),hint=el.querySelector(".sdo-hint"),
      mute=el.querySelector(".sdo-mute"),rep=el.querySelector(".sdo-rep"),tick=el.querySelector(".sdo-tick");
    let talking=false,listening=false,open=0,burst=0,mouthT=0,gotB=false,nodStart=-1,lastNod=0,blinkUntil=0,nextBlink=performance.now()+1600,raf=0,alive=true,lastType=0,lastText="",gen=0,mmUntil=0,box=null;
    const voiceOn=()=>LS.get("ma-iv-voice")!=="0";
    const setMute=()=>{if(mute)mute.textContent=voiceOn()?"🔊 Voice on":"🔇 Voice off"};setMute();
    if(mute)mute.onclick=()=>{LS.set("ma-iv-voice",voiceOn()?"0":"1");setMute();if(!voiceOn())stopTalk()};
    if(rep)rep.onclick=()=>{if(lastText)say(lastText,null,true)};
    const setState=(t,on)=>{stTxt.textContent=t;stBox.classList.toggle("on",!!on)};

    /* captions */
    let curWords=null;
    function drawCC(){const L=CC.lines.map((x,j)=>{const last=j===CC.lines.length-1&&!x.you;
        const txt=x.you?esc(x.text):x.text.split(/(\s+)/).map(w=>/\S/.test(w)?`<span class="sdo-w">${esc(w)}</span>`:w).join("");
        return `<div class="sdo-ln${x.you?" you":""}${last&&talking?" cur":""}"><b>${x.you?"You":esc(c.n)}</b><span>${txt}</span></div>`}).join("")
        +(CC.live?`<div class="sdo-ln you live"><b>You · speaking</b><span>${esc(CC.live)}</span></div>`:"");
      ccl.innerHTML=L||`<div class="note">Captions show up here.</div>`;
      const lastI=ccl.querySelectorAll(".sdo-ln:not(.you)");curWords=lastI.length?[...lastI[lastI.length-1].querySelectorAll(".sdo-w")]:null;
      ccl.scrollTop=ccl.scrollHeight}
    function markWord(ch){if(!curWords)return;let n=0,k=0;const t=lastText;for(let i=0;i<ch&&i<t.length;i++)if(/\s/.test(t[i])&&/\S/.test(t[i+1]||""))n++;k=n;
      curWords.forEach((w,i)=>{w.classList.toggle("on",i===k);w.classList.toggle("done",i<k)})}
    drawCC();

    /* animation */
    function loop(now){if(!alive||!el.isConnected){destroy();return}
      const t=now/1000,still=calm();
      let nod=0;if(nodStart>=0){const u=(now-nodStart)/650;if(u>=1)nodStart=-1;else nod=Math.sin(u*Math.PI)}
      const sway=still?0:1.1*Math.sin(t*.8)+.4*Math.sin(t*2.1+1)+(talking?.8*Math.sin(t*3.3):0);
      head.setAttribute("transform",`rotate(${(sway+nod*2).toFixed(2)} 320 240) translate(0 ${(14+nod*6+(still?0:Math.sin(t*1.6))).toFixed(2)})`);
      if(!still)body.setAttribute("transform",`translate(0 ${(Math.sin(t*1.3)*1.4).toFixed(2)})`);
      if(talking){if(gotB){open=Math.max(0,burst-(now-mouthT)/190)}else if(now>mouthT){open=[.2,.5,.9,.6,.3,.8,.1,.7,0][Math.floor(Math.random()*9)];mouthT=now+80+Math.random()*70}}else open*=.8;
      m.setAttribute("ry",(1.6+open*9).toFixed(2));m.setAttribute("rx",(11-open*2).toFixed(2));teeth.setAttribute("opacity",open>.35?".9":"0");
      if(now<blinkUntil)eyes.setAttribute("transform","translate(0 166) scale(1 .12) translate(0 -166)");
      else{eyes.removeAttribute("transform");if(now>nextBlink){blinkUntil=now+130;nextBlink=now+2200+Math.random()*2800}}
      if(listening&&!talking&&now-lastType<1800&&nodStart<0&&now-lastNod>2600+Math.random()*1200){nodStart=now;lastNod=now;if(Math.random()<.45)mmUntil=now+900}
      mm.setAttribute("opacity",now<mmUntil?"1":"0");
      if(tick&&!still)tick.setAttribute("transform",`translate(${-((t*40)%420).toFixed(1)} 0)`);
      if(listening&&box){const words=(box.value.match(/\S+/g)||[]).length;hint.classList.toggle("on",words>=25&&now-lastType>3800&&lastType>0)}
      raf=requestAnimationFrame(loop)}
    raf=requestAnimationFrame(loop);

    function stopTalk(){gen++;talking=false;stage.classList.remove("talk");try{speechSynthesis.cancel()}catch(e){}}
    function say(text,after,isRepeat){stopTalk();lastText=String(text||"");const my=gen;
      if(!isRepeat){CC.lines.push({text:lastText});}talking=true;drawCC();talking=false;setState("Speaking",true);
      const done=()=>{if(my!==gen)return;talking=false;stage.classList.remove("talk");curWords&&curWords.forEach(w=>{w.classList.remove("on");w.classList.add("done")});
        setState(listening?"Listening":o.role||"",listening);after&&after()};
      const start=()=>{if(my!==gen)return;talking=true;stage.classList.add("talk");const all=ccl.querySelectorAll(".sdo-ln:not(.you)");all.length&&all[all.length-1].classList.add("cur")};
      if(!voiceOn()||!hasTTS){start();gotB=false;setTimeout(done,Math.min(5000,700+lastText.split(/\s+/).length*130));return}
      /* sentence by sentence: Chrome stops long utterances after ~15s, and each sentence gets a natural pause */
      const parts=lastText.match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g)||[lastText];let off=0,k=0;const v=pickVoice(c),pv=c.pv||[1,1];
      const next=()=>{if(my!==gen)return;if(k>=parts.length){done();return}const p=parts[k],base=off;off+=p.length;k++;
        try{const u=new SpeechSynthesisUtterance(p.trim());if(v){u.voice=v;u.lang=v.lang}u.pitch=pv[0];u.rate=pv[1];
          u.onstart=start;u.onboundary=e=>{if(my!==gen||(e.name&&e.name!=="word"))return;gotB=true;burst=.75+Math.random()*.3;mouthT=performance.now();markWord(base+(e.charIndex||0)+(p.length-p.trimStart().length))};
          let fired=false;u.onend=u.onerror=()=>{if(fired)return;fired=true;next()};speechSynthesis.speak(u);
          setTimeout(()=>{if(my===gen&&!talking&&!fired){fired=true;done()}},2500)}catch(e){done()}};
      try{speechSynthesis.cancel()}catch(e){}gotB=false;next()}
    function listen(b){box=b;listening=true;setState("Listening",true);
      const bump=()=>{lastType=performance.now();CC.live=box.value;const lv=ccl.querySelector(".sdo-ln.live span");if(lv){lv.textContent=CC.live;ccl.scrollTop=ccl.scrollHeight}else if(CC.live.trim())drawCC()};
      b.addEventListener("input",bump);b.addEventListener("keydown",()=>{lastType=performance.now()})}
    function think(){listening=false;stopTalk();setState("Thinking…",true);if(box){CC.live=box.value}flushLive();drawCC()}
    function destroy(){if(!alive)return;alive=false;cancelAnimationFrame(raf);stopTalk()}
    return {say,listen,think,destroy,nod:()=>{nodStart=performance.now();lastNod=nodStart},heard:()=>{lastType=performance.now()}}};

  /* ---------- the walk to the next office ---------- */
  window.maInterviewerJoin=function(el,name,ms){const c=castOf(name);const d=calm()?0:Math.max(1600,ms||1800);
    const doors=Array.from({length:7},(_,k)=>{const x=140+k*190;return `<g><rect x="${x}" y="96" width="74" height="150" fill="#5a3e2b"/><rect x="${x+8}" y="104" width="58" height="134" fill="#6d4c35"/><circle cx="${x+58}" cy="174" r="3.5" fill="#d6b45a"/><rect x="${x+6}" y="76" width="62" height="14" rx="2" fill="#d8dde6"/></g>`}).join("");
    const fx=140+7*190;
    el.innerHTML=`<div class="sdo-hall"><svg viewBox="0 0 640 320" role="img" aria-label="Walking to the next interview">
      <rect width="640" height="320" fill="#e8e3da"/><rect y="0" width="640" height="40" fill="#d6d0c4"/><rect y="246" width="640" height="74" fill="#8d7b66"/><rect y="246" width="640" height="6" fill="#6e5e4c"/>
      <g class="${d?"sdo-walk":""}" style="--d:${d/1000}s;${d?"":"transform:translateX(-1280px)"}">${[0,1,2,3,4,5,6,7,8,9].map(k=>`<rect x="${60+k*190}" y="14" width="70" height="10" rx="5" fill="#fffbe9"/>`).join("")}${doors}
        <g><rect x="${fx}" y="96" width="74" height="150" fill="#1b2233"/><rect x="${fx-4}" y="92" width="82" height="4" fill="#3a2a1d"/>
          <rect class="${d?"sdo-door":""}" style="--d:${d/1000}s" x="${fx+0}" y="96" width="74" height="150" fill="#7a5233"/><rect x="${fx-26}" y="72" width="126" height="18" rx="3" fill="#14213d"/><text x="${fx+37}" y="85" text-anchor="middle" font-family="system-ui" font-size="11" font-weight="700" fill="#e9d9a6">${esc(c.n)} · ${esc(String(name||"").split(" · ")[0])}</text></g></g>
      <g transform="translate(320 300)"><g class="${d?"sdo-bob":""}"><ellipse cx="0" cy="14" rx="28" ry="6" fill="#000" opacity=".18"/></g></g></svg></div>
      <div class="sdo-hallt"><b>Heading to ${esc(c.where.split(" · ")[1]||"the next office")}…</b><span>${esc(c.n)}, ${esc(String(name||"").split(" · ")[0])}, is ready for you</span></div>`;
    return new Promise(r=>setTimeout(r,d?d+550:300))};
})();
