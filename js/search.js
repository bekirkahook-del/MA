/* Site search (Ctrl K / the Search button), rebuilt Nov 24, 2026.
   - Ranked results instead of "first match in list order": exact phrase > word start > contains > every word found.
   - Typo-tolerant ("golman" finds Goldman, "acretion" finds accretion) and common shorthand (lbo, tmay, ev, ib, pe, nwc).
   - Searches the 1,121 guides too (js/guideidx.js, built by tools/guideidx.py, loaded when search first opens).
   - Matched words are highlighted, each group has an icon, recent searches show when the box is empty.
   - Cleaner Search button (pill on desktop, round icon on phones). Overrides palQuery/drawPal from app.js. */
(function(){
  if(typeof palQuery!=="function"||typeof drawPal!=="function"||typeof palIndex!=="function")return;
  const $=s=>document.querySelector(s);
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};

  /* ---------- guides (lazy) ---------- */
  let GUIDES=null,gP=null;
  function loadGuides(){if(GUIDES)return Promise.resolve();if(gP)return gP;
    gP=new Promise(res=>{const sc=document.createElement("script");sc.src="js/guideidx.js";sc.async=true;
      sc.onload=()=>{GUIDES=String(window.GUIDE_IDX||"").split("\n").filter(Boolean).map(l=>{const i=l.indexOf("|");return {g:"Guides",l:l.slice(i+1),s:"Guide",act:"url|/guides/"+l.slice(0,i)+"/"}});res();
        try{if(!$("#palette").hidden)palQuery($("#palIn").value)}catch(e){}};
      sc.onerror=()=>{gP=null;res()};document.head.appendChild(sc)});return gP}

  /* ---------- matching ---------- */
  const norm=s=>String(s||"").toLowerCase().replace(/&/g," and ").replace(/[’']/g,"").replace(/[^a-z0-9]+/g," ").trim();
  const SYN={lbo:"leveraged buyout",tmay:"tell me about yourself",ev:"enterprise value",ib:"investment banking",pe:"private equity",
    nwc:"working capital",wc:"working capital",ma:"m and a",dcf:"discounted cash flow",fcf:"free cash flow",ufcf:"unlevered free cash flow",
    st:"sales and trading",hf:"hedge funds",er:"equity research",gs:"goldman sachs",ms:"morgan stanley",jpm:"jp morgan",bofa:"bank of america",
    osu:"ohio state",ebitda:"ebitda",eps:"earnings per share",wacc:"wacc",capm:"capm",irr:"irr",moic:"moic"};
  function lev(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let prev=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){const cur=[i];let best=i;for(let j=1;j<=b.length;j++){cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));if(cur[j]<best)best=cur[j]}
      if(best>max)return max+1;prev=cur}return prev[b.length]}
  /* score one query token against a list of words: exact 10, prefix 8, inside 5, typo 3, none 0 */
  function tok(t,words,joined){let b=0;for(const w of words){if(w===t)return 10;if(w.startsWith(t))b=Math.max(b,8)}
    if(b)return b;if(t.length>=3&&joined.includes(t))return 5;
    if(t.length>=4){const m=t.length>=7?2:1;for(const w of words)if(w.length>=3&&w[0]===t[0]&&lev(t,w.length>t.length+2?w.slice(0,t.length+1):w,m)<=m)return 3}
    return 0}
  const BOOST={"Go to":7,"Do":6,"Levels":6,"Firms":6,"Interview sections":5,"Firm packs":4,"Markets":4,"Deals":3,"Challenges":3,"Interview questions":2,"Guides":2,"News":1,"Companies":0};
  function score(x,q,toks){const L=x._n||(x._n=norm(x.l)),Sb=x._s||(x._s=norm(x.s)),LW=x._w||(x._w=L.split(" ")),SW=x._sw||(x._sw=Sb.split(" ").filter(Boolean));
    let sc=0;
    if(L===q)sc=120;else if(L.startsWith(q))sc=100;else if((" "+L).includes(" "+q))sc=85;else if(q.length>=3&&L.includes(q))sc=65;
    if(!sc){let sum=0;for(const t of toks){const a=tok(t,LW,L),b=a?0:tok(t,SW,Sb)*.5;if(!a&&!b)return 0;sum+=a||b}sc=sum*(40/(10*toks.length))}
    return sc+(BOOST[x.g]||0)-Math.min(8,L.length/25)}
  function rank(items,q){const toks=q.split(" ").filter(Boolean);const out=[];
    for(const x of items){const s=score(x,q,toks);if(s>0)out.push([s,x])}return out}

  const CAP={"Guides":6,"Interview questions":6,"Companies":5,"News":3};
  window.palQuery=palQuery=function(raw){
    const q0=norm(raw);
    if(!q0){const rec=recent().map(r=>({g:"Recent searches",l:r,act:"q|"+r}));
      palItems=rec.concat(palIndex().filter(x=>x.g==="Go to"||x.g==="Do")).slice(0,40);palIdx=0;drawPal();return}
    if(!GUIDES)loadGuides();
    const all=palIndex().concat(GUIDES||[]);
    /* expand shorthand: "lbo model" also searches "leveraged buyout model" */
    const qs=[q0];const ex=q0.split(" ").map(t=>SYN[t]||t).join(" ");if(ex!==q0)qs.push(ex);
    const best=new Map();
    qs.forEach(q=>rank(all,q).forEach(([s,x])=>{if(!best.has(x)||best.get(x)<s)best.set(x,s)}));
    /* companies: ticker / name search from the directory */
    if(q0.length>=2&&typeof coSearch==="function"){try{coSearch(raw,8).filter(c=>!(typeof TICKER!=="undefined"&&TICKER.find(t=>t[0]===c.s))).forEach((c,i)=>{
      const x={g:"Companies",l:c.s+" · "+c.n,s:c.e,act:"co|"+c.s},exact=c.s.toLowerCase()===q0;best.set(x,(exact?110:40)-i*2)})}catch(e){}}
    /* group by section, sections ordered by their best hit, a few results each */
    const groups={};best.forEach((s,x)=>{(groups[x.g]=groups[x.g]||[]).push([s,x])});
    const order=Object.keys(groups).map(g=>{groups[g].sort((a,b)=>b[0]-a[0]);return [groups[g][0][0],g]}).sort((a,b)=>b[0]-a[0]);
    palItems=[];order.forEach(([,g])=>groups[g].slice(0,CAP[g]||5).forEach(([,x])=>palItems.push(x)));palItems=palItems.slice(0,40);
    palIdx=0;lastQ=q0;drawPal()};

  /* ---------- recent searches ---------- */
  const recent=()=>{try{return JSON.parse(LS.get("ma-pal-recent")||"[]").slice(0,4)}catch(e){return []}};
  let lastQ="";
  const remember=q=>{q=String(q||"").trim();if(q.length<2)return;LS.set("ma-pal-recent",JSON.stringify([q].concat(recent().filter(r=>r!==q)).slice(0,4)))};
  {const _run=runAct;window.runAct=runAct=function(a){if(a&&a.startsWith("q|")){const q=a.slice(2);openPalette();$("#palIn").value=q;palQuery(q);return}
    if(lastQ)remember($("#palIn")&&$("#palIn").value||lastQ);lastQ="";try{if(window.maEv&&a)maEv("search_pick")}catch(e){}return _run(a)}}

  /* ---------- drawing: icons + highlighted matches ---------- */
  const ICON={"Go to":"→","Do":"⚡","Levels":"◆","Interview sections":"▤","Interview questions":"?","Firms":"🏦","Firm packs":"▣","Markets":"↗","Companies":"$","Deals":"⇄","Challenges":"⚑","News":"▧","Guides":"📘","Recent searches":"↺"};
  function hl(text,q){const s=E(text);if(!q)return s;const toks=q.split(" ").filter(t=>t.length>=2).sort((a,b)=>b.length-a.length);if(!toks.length)return s;
    const re=new RegExp("("+toks.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")+")","ig");return s.replace(/(<[^>]*>)|([^<]+)/g,(m,tag,txt)=>tag||txt.replace(re,"<mark>$1</mark>"))}
  window.drawPal=drawPal=function(){const q=norm($("#palIn")&&$("#palIn").value);let g="";const list=$("#palList");
    list.innerHTML=palItems.length?palItems.map((x,i)=>{const head=x.g!==g?(g=x.g,`<div class="pal-g">${E(x.g)}</div>`):"";
      return head+`<button class="pal-i ${i===palIdx?"on":""}" data-i="${i}" role="option" aria-selected="${i===palIdx}"><i class="pal-ic" aria-hidden="true">${ICON[x.g]||"•"}</i><span class="pal-t">${hl(x.l,q)}</span>${x.s?`<small>${E(x.s)}</small>`:""}</button>`}).join("")
      :`<div class="pal-empty"><b>No results for “${E($("#palIn").value)}”</b><span>Try a firm (Evercore), a topic (WACC, LBO), a school (Ohio State) or a ticker (NVDA).</span></div>`;
    list.querySelectorAll(".pal-i").forEach(b=>{b.onclick=()=>{const x=palItems[+b.dataset.i];if(x.act.startsWith("q|")){runAct(x.act);return}closePalette(true);runAct(x.act)};
      b.onmousemove=()=>{if(palIdx!==+b.dataset.i){palIdx=+b.dataset.i;list.querySelectorAll(".pal-i").forEach((y,j)=>{y.classList.toggle("on",j===palIdx);y.setAttribute("aria-selected",j===palIdx)})}}});
    const on=list.querySelector(".pal-i.on");if(on)on.scrollIntoView({block:"nearest"})};
  /* Enter on a "recent search" row refills the box instead of closing */
  $("#palIn").addEventListener("keydown",e=>{if(e.key==="Enter"){const x=palItems[palIdx];if(x&&x.act.startsWith("q|")){e.preventDefault();e.stopImmediatePropagation();runAct(x.act)}}},true);
  $("#palIn").placeholder="Search guides, interview questions, firms, tickers…";
  {const _o=openPalette;window.openPalette=openPalette=function(){loadGuides();return _o.apply(this,arguments)};const pb=$("#palBtn");if(pb)pb.onclick=openPalette}

  /* ---------- look ---------- */
  const st=document.createElement("style");st.textContent=`
.top-r .palbtn{height:38px;min-width:260px;padding:0 8px 0 14px;border:1px solid var(--rule);border-radius:999px;background:var(--paper);color:var(--ink-2);font-size:14px;gap:9px;box-shadow:inset 0 1px 2px rgba(10,20,50,.05);transition:border-color .15s,box-shadow .15s,background .15s}
.top-r .palbtn:hover{border-color:color-mix(in srgb,var(--cobalt,#2448D8) 45%,var(--rule));background:var(--sheet);box-shadow:0 0 0 4px color-mix(in srgb,var(--cobalt,#2448D8) 10%,transparent)}
.top-r .palbtn svg{width:16px;height:16px;color:var(--ink-2)}
.top-r .palbtn kbd{margin-left:auto;font:600 11px/1 var(--mono,monospace);border:1px solid var(--rule);border-bottom-width:2px;border-radius:6px;padding:4px 7px;background:var(--sheet);color:var(--ink-2)}
@media(max-width:860px){.top-r .palbtn{min-width:0;width:36px;height:36px;padding:0;justify-content:center;border-radius:50%;border:1px solid var(--rule);background:var(--paper)}.top-r .palbtn span,.top-r .palbtn kbd{display:none}}
#palette{border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(10,20,50,.28),0 0 0 1px var(--rule)}
.pal-top{padding:14px 18px}.pal-top input,#palIn{font-size:17px}
.pal-list{padding:6px 8px 10px}
.pal-g{padding:12px 10px 5px}
.pal-i{align-items:center;gap:11px;border-radius:9px;padding:9px 10px}
.pal-i.on{background:color-mix(in srgb,var(--cobalt,#2448D8) 9%,transparent)}
.pal-ic{flex:none;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-style:normal;font-size:13px;font-weight:700;background:var(--paper);border:1px solid var(--rule);color:var(--ink-2)}
.pal-i.on .pal-ic{border-color:color-mix(in srgb,var(--cobalt,#2448D8) 40%,var(--rule));color:var(--cobalt,#2448D8)}
.pal-t{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pal-i small{flex:none;margin-left:auto;font-size:12px;color:var(--ink-2)}
.pal-t mark{background:color-mix(in srgb,var(--brass,#c9a227) 30%,transparent);color:inherit;border-radius:3px;padding:0 1px}
.pal-empty{padding:26px 16px;text-align:center;display:grid;gap:6px}.pal-empty b{color:var(--ink)}.pal-empty span{font-size:13.5px;color:var(--ink-2)}
@media(max-width:560px){.pal-i small{display:none}}`;
  document.head.appendChild(st);
})();
