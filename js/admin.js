/* Live presence (everyone) + the owner-only Site stats page. */
(function(){
  const A=window.MA_AUTH;if(!A||!A.sb)return;const sb=A.sb;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let vid="";try{vid=localStorage.getItem("ma-vid")||""}catch(e){}
  if(!vid){vid=Math.random().toString(36).slice(2,10)+Date.now().toString(36);try{localStorage.setItem("ma-vid",vid)}catch(e){}}
  const notrack=()=>{try{return !!localStorage.getItem("ma-notrack")}catch(e){return false}};
  const curTab=()=>{const w=document.getElementById("wire");if(w&&!w.hidden)return"news";const t=document.querySelector('nav.tabs [aria-selected="true"]');return t?t.dataset.tab:"home"};
  const src=(()=>{const q=new URLSearchParams(location.search);const u=q.get("utm_source");if(u)return u.toLowerCase();try{const h=new URL(document.referrer).hostname.replace(/^www\./,"");if(h&&!/mnaprep\.com$/.test(h))return h}catch(e){}return""})();
  const since=Date.now();

  /* ---------- live presence ---------- */
  let chan=null,lastTab="",live={};
  function joinLive(track){
    try{chan=sb.channel("site-live",{config:{presence:{key:vid}}});
      chan.on("presence",{event:"sync"},()=>{live=chan.presenceState();if(window.__maStatsOpen)drawLive()});
      chan.subscribe(st=>{if(st==="SUBSCRIBED"&&track)push()})}catch(e){}}
  function push(){if(!chan||notrack())return;const t=curTab();if(t===lastTab)return;lastTab=t;
    try{chan.track({tab:t,m:/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),src,a:!!A.session,t:since})}catch(e){}}
  setTimeout(()=>{joinLive(!notrack())},2500);
  document.addEventListener("click",()=>setTimeout(push,400));setInterval(push,20000);

  /* ---------- owner check ---------- */
  let owner=false;const startHash=window.MA_START_HASH||location.hash;
  A.ready.then(async s=>{if(!s||!window.claude)return;try{const u=await window.claude.use("user");owner=!!(u&&u.isOwner&&u.isOwner())}catch(e){}
    if(!owner)return;try{localStorage.setItem("ma-notrack","1")}catch(e){}
    try{if(chan)chan.untrack()}catch(e){}
    addLinks();setInterval(addLinks,3000);if(/^#(admin|stats)$/.test(startHash)||/^#(admin|stats)$/.test(location.hash))setTimeout(openStats,800)});
  window.addEventListener("hashchange",()=>{if(owner&&(location.hash==="#admin"||location.hash==="#stats"))openStats()});
  function addHeader(){const top=document.querySelector(".top-r");if(!top||top.querySelector("#statsBtn"))return;const b=document.createElement("button");b.id="statsBtn";b.type="button";b.className="iconbtn";b.title="Site stats (only you)";b.setAttribute("aria-label","Site stats");
    b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>';b.onclick=openStats;const g=top.querySelector("#setBtn");top.insertBefore(b,g||null)}
  function addLinks(){addHeader();const f=document.querySelector("footer");if(f&&!f.querySelector("[data-stats]")){const b=document.createElement("button");b.type="button";b.dataset.stats="1";b.className="fb-link";b.textContent="Site stats";b.title="Only you can see this";b.onclick=openStats;f.appendChild(b)}
    const d=document.querySelector(".dr-foot");if(d&&!d.querySelector("[data-stats]")){const b=document.createElement("button");b.type="button";b.dataset.stats="1";b.textContent="Site stats (only you)";b.onclick=()=>{try{closeDrawer()}catch(e){}openStats()};d.insertBefore(b,d.firstChild)}}

  /* ---------- stats page ---------- */
  const st=document.createElement("style");st.textContent=`
.ms-sec{margin-top:22px}.ms-sec h3{font-size:15px;font-weight:700;margin:0 0 10px;display:flex;justify-content:space-between;align-items:baseline;gap:8px}
.ms-sec h3 small{font-weight:500;color:var(--ink-2);font-size:12px}
.ms-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.ms-tile{border:1px solid var(--rule);border-radius:10px;padding:10px 12px;background:var(--paper)}
.ms-tile b{display:block;font-family:var(--mono);font-size:22px;font-weight:600}.ms-tile span{font-size:11.5px;color:var(--ink-2)}
.ms-bars{display:flex;align-items:flex-end;gap:4px;height:130px;border-bottom:1px solid var(--rule);padding-top:16px}
.ms-bar{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:3px;min-width:0;height:100%}
.ms-bar i{display:block;width:100%;background:var(--cobalt);border-radius:4px 4px 0 0;min-height:2px}
.ms-bar em{font-style:normal;font-family:var(--mono);font-size:10px;color:var(--ink-2)}
.ms-days{display:flex;gap:4px}.ms-days span{flex:1;text-align:center;font-family:var(--mono);font-size:9.5px;color:var(--ink-2);padding-top:4px;min-width:0;overflow:hidden}
.ms-tbl{width:100%;border-collapse:collapse;font-size:13px}.ms-tbl td,.ms-tbl th{padding:7px 6px;border-bottom:1px solid var(--rule);text-align:left}
.ms-tbl th{font-family:var(--mono);font-size:10.5px;font-weight:500;color:var(--ink-2);text-transform:uppercase;letter-spacing:.06em}
.ms-tbl td.n{text-align:right;font-family:var(--mono)}.ms-tbl th.n{text-align:right}
.ms-row{display:grid;grid-template-columns:minmax(0,1fr) 110px 44px;gap:8px;align-items:center;font-size:13px;padding:4px 0}
.ms-row .tr{height:8px;background:var(--paper);border-radius:4px;overflow:hidden}.ms-row .tr i{display:block;height:100%;background:var(--cobalt)}
.ms-row b{font-family:var(--mono);font-weight:500;text-align:right}
.ms-grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.ms-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--good);margin-right:6px;animation:msPulse 1.6s infinite}
@keyframes msPulse{50%{opacity:.35}}
.ms-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px}
.ms-seg{display:inline-flex;border:1px solid var(--rule);border-radius:10px;overflow:hidden}.ms-seg button{font:inherit;font-size:12.5px;font-weight:600;padding:6px 12px;border:0;background:none;color:var(--ink-2);cursor:pointer}
.ms-seg button[aria-pressed=true]{background:var(--ink);color:var(--paper)}
.ms-tiles.five{grid-template-columns:repeat(5,minmax(0,1fr))}
.ms-tile .ch{display:inline-block;font-family:var(--mono);font-size:10.5px;margin-left:6px;padding:1px 5px;border-radius:5px}
.ms-tile .ch.up{color:var(--good);background:color-mix(in srgb,var(--good) 12%,transparent)}.ms-tile .ch.dn{color:var(--bad);background:color-mix(in srgb,var(--bad) 12%,transparent)}
.ms-bar .stk{display:flex;flex-direction:column;justify-content:flex-end;width:100%;height:100%}.ms-bar .stk i{border-radius:0}.ms-bar .stk i:first-child{border-radius:4px 4px 0 0}
.ms-bar .stk i.nw{background:var(--brass)}
.ms-leg{display:flex;gap:14px;font-size:12px;color:var(--ink-2);margin-top:8px}.ms-leg span:before{content:"";display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:5px;vertical-align:-1px;background:var(--cobalt)}.ms-leg span.nw:before{background:var(--brass)}
.ms-hrs{height:90px}.ms-hrs .ms-bar i{background:var(--good)}
.ms-search{font:inherit;font-size:13px;padding:7px 10px;border:1px solid var(--rule);border-radius:9px;background:var(--paper);color:var(--ink);width:200px}
.ms-ins{border:1px solid var(--rule);border-left:3px solid var(--brass);border-radius:10px;padding:10px 14px;background:var(--paper);font-size:13.5px;line-height:1.55}.ms-ins li{margin:2px 0}
@media (max-width:620px){.ms-tiles,.ms-tiles.five{grid-template-columns:repeat(2,minmax(0,1fr))}.ms-grid2{grid-template-columns:1fr}.ms-search{width:100%}}`;document.head.appendChild(st);
  const st2=document.createElement("style");st2.textContent=`
#msBody>.ms-sec,#msBody>.ms-grid2>.ms-sec{background:var(--paper);border:1px solid var(--rule);border-radius:16px;padding:16px 18px;box-shadow:0 1px 2px rgba(0,0,0,.04),0 6px 18px -12px rgba(0,0,0,.18)}
#msBody>.ms-grid2{margin-top:22px}#msBody>.ms-grid2>.ms-sec{margin-top:0}
#msBody .ms-tile{background:color-mix(in srgb,var(--ink) 3%,var(--paper));transition:transform .15s,box-shadow .15s,border-color .15s}
#msBody .ms-tile:hover{transform:translateY(-2px);box-shadow:0 8px 18px -10px rgba(0,0,0,.35);border-color:color-mix(in srgb,var(--cobalt) 45%,var(--rule))}
.ms-tile svg.sp{display:block;width:100%;height:22px;margin-top:6px}.ms-tile svg.sp polyline{fill:none;stroke:var(--cobalt);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;opacity:.85}
.ms-chart{position:relative}.ms-svg{width:100%;height:auto;display:block;touch-action:pan-y;cursor:crosshair}
.ms-gr{stroke:var(--rule);stroke-width:1}.ms-ax{fill:var(--ink-2);font:10px var(--mono)}
.ms-ln{fill:none;stroke:var(--cobalt);stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:msDraw .9s ease forwards}
.ms-pv{fill:none;stroke:var(--ink-2);stroke-width:1.5;stroke-dasharray:4 4;opacity:.55}
.ms-cross{stroke:var(--ink-2);stroke-width:1;stroke-dasharray:3 3;transition:opacity .1s}.ms-pt{fill:var(--paper);stroke:var(--cobalt);stroke-width:2.6;transition:opacity .1s}
@keyframes msDraw{to{stroke-dashoffset:0}}
.ms-leg span.pv:before{background:none;border-top:2px dashed var(--ink-2);height:0;width:14px;border-radius:0;vertical-align:3px}
#msTip{position:fixed;z-index:2147483000;pointer-events:none;background:var(--ink);color:var(--paper);padding:8px 11px;border-radius:10px;font-size:12px;line-height:1.45;box-shadow:0 10px 26px -8px rgba(0,0,0,.5);opacity:0;transition:opacity .12s;max-width:260px}
#msTip b{font-family:var(--mono);font-size:15px}#msTip .tt-d{font-weight:700;margin-bottom:2px}#msTip .tt-p{opacity:.7;font-size:11.5px}#msTip .tt-c{font-family:var(--mono);font-size:11px;opacity:.85}
.ms-row.clk{cursor:pointer;border-radius:8px;padding:4px 6px;margin:0 -6px;transition:background .12s}.ms-row.clk:hover,.ms-row.clk:focus-visible{background:color-mix(in srgb,var(--cobalt) 8%,transparent);outline:none}
.ms-row.on{background:color-mix(in srgb,var(--cobalt) 14%,transparent);font-weight:600}
.ms-chip{font:inherit;font-size:12.5px;font-weight:600;padding:5px 11px;border-radius:99px;border:1px solid var(--cobalt);background:color-mix(in srgb,var(--cobalt) 10%,var(--paper));color:var(--ink);cursor:pointer}
.ms-hint{font-size:12px;color:var(--ink-2);margin:10px 0 0}
.ms-bars .ms-bar i{transform-origin:bottom;animation:msGrow .5s ease backwards;transition:filter .12s}.ms-bar:hover i{filter:brightness(1.2)}
@keyframes msGrow{from{transform:scaleY(0)}}
@media (prefers-reduced-motion:reduce){.ms-ln{animation:none;stroke-dashoffset:0}.ms-bars .ms-bar i{animation:none}#msBody .ms-tile{transition:none}}`;document.head.appendChild(st2);

  const ago=ms=>{const m=Math.round((Date.now()-ms)/60000);if(m<1)return"just now";if(m<60)return m+"m ago";const h=Math.round(m/60);if(h<24)return h+"h ago";return Math.round(h/24)+"d ago"};
  const dayStr=d=>d.toLocaleDateString("en-CA",{timeZone:"America/New_York"});
  const SRC_NAME={tiktok:"TikTok",instagram:"Instagram","l.instagram.com":"Instagram","instagram.com":"Instagram","tiktok.com":"TikTok","google.com":"Google","bing.com":"Bing","linkedin.com":"LinkedIn","lnkd.in":"LinkedIn","t.co":"X / Twitter","x.com":"X / Twitter",social:"Social posts","duckduckgo.com":"DuckDuckGo","reddit.com":"Reddit","facebook.com":"Facebook","m.facebook.com":"Facebook","l.facebook.com":"Facebook","chatgpt.com":"ChatGPT","chat.openai.com":"ChatGPT",chatgpt:"ChatGPT","perplexity.ai":"Perplexity","claude.ai":"Claude","gemini.google.com":"Gemini","copilot.microsoft.com":"Copilot","snapchat.com":"Snapchat","discord.com":"Discord","groupme.com":"GroupMe"};
  const srcName=s=>s?(SRC_NAME[s]||s):"Direct / typed in";
  const TAB_NAME={home:"Home",learn:"Learn",practice:"Practice",compete:"Compete",career:"Career",pro:"Pro",news:"News"};
  const rows=(pairs,total,fk)=>{const mx=Math.max(1,...pairs.map(p=>p[1]));return pairs.length?pairs.map(([k,v])=>`<div class="ms-row${fk?" clk"+(FILT[fk]===k?" on":""):""}"${fk?` data-fk="${fk}" data-fv="${esc(k)}" tabindex="0" role="button" aria-pressed="${FILT[fk]===k}"`:""}><span>${esc(k)}</span><span class="tr"><i style="width:${(v/mx*100).toFixed(0)}%"></i></span><b>${v}</b></div>`).join(""):`<p class="note">Nothing yet.</p>`};
  const tally=(arr,fn,n=6)=>{const m={};arr.forEach(x=>{const k=fn(x);if(k)m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n)};

  function drawLive(){const el=document.getElementById("msLive");if(!el)return;
    const ppl=Object.values(live).map(a=>a[0]).filter(Boolean);
    el.innerHTML=`<h3><span><span class="ms-dot"></span>On the site right now: ${ppl.length}</span><small>updates live</small></h3>
      ${ppl.length?`<table class="ms-tbl"><thead><tr><th>Looking at</th><th>Device</th><th>Came from</th><th class="n">Here for</th></tr></thead><tbody>${ppl.sort((a,b)=>a.t-b.t).slice(0,25).map(p=>`<tr><td>${esc(TAB_NAME[p.tab]||p.tab)}${p.a?" · signed in":""}</td><td>${p.m?"Phone":"Computer"}</td><td>${esc(srcName(p.src))}</td><td class="n">${esc(ago(p.t).replace(" ago",""))}</td></tr>`).join("")}</tbody></table>`:`<p class="note">Nobody else right now. (Your own visits aren't counted.)</p>`}`}

  let RANGE=14,CACHE=null;
  const PAGE_NAME=p=>{p=(p||"/").replace(/\/$/,"")||"/";if(p==="/")return"Home page";const m=p.match(/^\/guides?\/([^/.]+)/);if(m)return"Guide: "+m[1].replace(/-/g," ");return p};
  const etHour=t=>{try{return +new Date(t).toLocaleString("en-US",{hour:"numeric",hour12:false,timeZone:"America/New_York"})%24}catch(e){return -1}};
  const hr=h=>h===0?"12a":h<12?h+"a":h===12?"12p":(h-12)+"p";
  const pct=(a,b)=>b?Math.round(a/b*100):0;
  const chg=(cur,prev)=>{if(!prev)return cur?'<span class="ch up">new</span>':"";const c=Math.round((cur-prev)/prev*100);return c===0?"":`<span class="ch ${c>0?"up":"dn"}">${c>0?"+":""}${c}%</span>`};

  /* ---------- interactive helpers: tooltip, sparkline, line chart ---------- */
  let FILT={src:"",dev:""},METRIC="visits";
  const MET={visits:"Visits",people:"Unique people",new:"New people"};
  const tipEl=document.createElement("div");tipEl.id="msTip";tipEl.setAttribute("role","tooltip");document.body.appendChild(tipEl);
  const tip=(h,x,y)=>{tipEl.innerHTML=h;tipEl.style.opacity=1;const w=tipEl.offsetWidth,hh=tipEl.offsetHeight;let l=x+14,t=y-hh-12;if(l+w>innerWidth-8)l=x-w-14;if(t<8)t=y+18;tipEl.style.left=Math.max(8,l)+"px";tipEl.style.top=t+"px"};
  const untip=()=>{tipEl.style.opacity=0};
  document.addEventListener("pointermove",e=>{const t=e.target;if(!t||!t.closest)return;const el=t.closest("[data-tip]");if(el)tip(esc(el.dataset.tip),e.clientX,e.clientY);else if(!t.closest(".ms-chart"))untip()});
  window.addEventListener("blur",untip);
  const spark=a=>{if(a.length<2)return"";const m=Math.max(1,...a),w=100,h=22;return `<svg class="sp" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline vector-effect="non-scaling-stroke" points="${a.map((v,i)=>(i/(a.length-1)*w).toFixed(1)+","+(h-2-(v/m)*(h-4)).toFixed(1)).join(" ")}"/></svg>`};
  const scroller=el=>{let p=el.parentElement;while(p&&p!==document.body){if(/(auto|scroll)/.test(getComputedStyle(p).overflowY)&&p.scrollHeight>p.clientHeight)return p;p=p.parentElement}return null};
  function lineChart(cur,prv,labs,name){
    const W=720,H=210,L=36,R=12,T=12,B=26,n=cur.length;
    const m0=Math.max(1,...cur,...prv),raw=m0/4,pw=Math.pow(10,Math.floor(Math.log10(raw))),st=Math.max(1,[1,2,2.5,5,10].map(k=>k*pw).find(q=>q>=raw)),mx=st*4;
    const x=i=>L+(n<2?0:i/(n-1)*(W-L-R)),y=v=>T+(1-v/mx)*(H-T-B);
    const pth=a=>a.map((v,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)).join("");
    const grid=[0,1,2,3,4].map(k=>{const v=st*k,yy=y(v).toFixed(1);return `<line class="ms-gr" x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}"/><text class="ms-ax" x="${L-6}" y="${(y(v)+3).toFixed(1)}" text-anchor="end">${v}</text>`}).join("");
    const k=Math.ceil(n/8),xl=labs.map((l,i)=>(n-1-i)%k===0?`<text class="ms-ax" x="${x(i).toFixed(1)}" y="${H-8}" text-anchor="${i===n-1&&n>1?"end":"middle"}">${l.slice(5).replace("-","/")}</text>`:"").join("");
    const html=`<div class="ms-chart" id="msLine"><svg class="ms-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(name)} per day compared with the previous period"><defs><linearGradient id="msG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--cobalt);stop-opacity:.3"/><stop offset="1" style="stop-color:var(--cobalt);stop-opacity:0"/></linearGradient></defs>${grid}${xl}<path d="${pth(cur)}L${x(n-1).toFixed(1)} ${y(0).toFixed(1)}L${x(0).toFixed(1)} ${y(0).toFixed(1)}Z" fill="url(#msG)"/>${prv.some(v=>v)?`<path class="ms-pv" d="${pth(prv)}"/>`:""}<path class="ms-ln" pathLength="1" d="${pth(cur)}"/><line class="ms-cross" y1="${T}" y2="${H-B}" style="opacity:0"/><circle class="ms-pt" r="5" style="opacity:0"/></svg></div>`;
    const bind=root=>{if(!root)return;const svg=root.querySelector("svg"),cr=svg.querySelector(".ms-cross"),pt=svg.querySelector(".ms-pt");
      const at=e=>{const r=svg.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*W;let i=n<2?0:Math.round((px-L)/(W-L-R)*(n-1));i=Math.max(0,Math.min(n-1,i));
        cr.setAttribute("x1",x(i));cr.setAttribute("x2",x(i));pt.setAttribute("cx",x(i));pt.setAttribute("cy",y(cur[i]));cr.style.opacity=1;pt.style.opacity=1;
        const dl=new Date(labs[i]+"T12:00:00").toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"}),pv=prv[i],df=pv?Math.round((cur[i]-pv)/pv*100):null;
        tip(`<div class="tt-d">${dl}</div><div><b>${cur[i]}</b> ${name.toLowerCase()}${df===null?"":` <span class="tt-c">${df>=0?"+":""}${df}%</span>`}</div><div class="tt-p">${pv} in the previous period</div>`,e.clientX,e.clientY)};
      svg.addEventListener("pointermove",at);svg.addEventListener("pointerdown",at);
      svg.addEventListener("pointerleave",()=>{cr.style.opacity=0;pt.style.opacity=0;untip()})};
    return{html,bind}}

  /* The database API returns at most ~1000 rows per request, whatever .limit() says, so read in pages until a page comes back empty. */
  async function pageAll(make,max){const out=[];let from=0;
    while(from<max){const r=await make().range(from,from+999);if(r.error)return{data:out,error:r.error};const n=(r.data||[]).length;if(!n)break;out.push(...r.data);from+=n}
    return{data:out,error:null}}
  async function load(){
    const since=new Date(Date.now()-62*864e5).toISOString();
    const [vr,pr,nr,plr,br,er,fr,rr,qr]=await Promise.all([
      pageAll(()=>sb.from("docs").select("id,data").eq("col","visits").gte("updated_at",since).order("updated_at",{ascending:false}).order("id"),60000),
      pageAll(()=>sb.from("docs").select("col,updated_at,data").like("col","data/users/%").eq("id","progress").order("col"),20000),
      pageAll(()=>sb.from("docs").select("id,data").eq("col","names").order("id"),20000),
      pageAll(()=>sb.from("docs").select("id,data").eq("col","players").order("id"),20000),
      pageAll(()=>sb.from("docs").select("id,data").eq("col","billing").order("id"),20000),
      pageAll(()=>sb.from("docs").select("id,data").eq("col","subscribers").order("id"),60000),
      sb.from("docs").select("id,data,updated_at").eq("col","feedback").order("updated_at",{ascending:false}).limit(200),
      sb.from("docs").select("id,data").eq("col","reviews").limit(1000),
      sb.from("docs").select("id,data,updated_at").eq("col","requests").order("updated_at",{ascending:false}).limit(200)]);
    if(vr.error||pr.error)throw new Error((vr.error||pr.error).message);
    const V=(vr.data||[]).map(r=>Object.assign({vid:String(r.id).slice(11)},r.data||{}));
    const names={};(nr.data||[]).forEach(r=>names[r.id]=(r.data&&r.data.name)||"");
    const players={};(plr.data||[]).forEach(r=>players[r.id]=r.data||{});
    const DK=["daily","grades","resumeLog","drafts","explains","aiEdits","pathAi","xpLog","questXP"],isD=k=>/^\d{4}-\d{2}-\d{2}$/.test(k);
    const accts=(pr.data||[]).map(r=>{const d=r.data||{},set=new Set();DK.forEach(k=>{const o=d[k];if(o&&typeof o==="object")Object.keys(o).forEach(x=>{const y=x.replace(/^cb-(sp-)?/,"");if(isD(y))set.add(y)})});
      Object.keys(d.newsq||{}).forEach(x=>{const t=Date.parse(x);if(t)set.add(dayStr(new Date(t)))});const t=Date.parse(r.updated_at);if(t)set.add(dayStr(new Date(t)));
      const days=[...set].filter(x=>x>="2026-06-01").sort();return{uid:r.col.slice(11),t,days,first:days[0]||""}}).sort((a,b)=>b.t-a.t);
    const bill=(br.data||[]).map(r=>r.data||{}).filter(b=>{const u=typeof b.until==="number"?b.until:Date.parse(b.until||0);return (b.paid||/active|trialing|past_due/.test(b.status||""))&&(!u||u>Date.now())});const pro=bill.length;
    const subs=((er&&er.data)||[]).map(r=>r.data||{});
    return{V,names,players,accts,pro,bill,reqs:((qr&&qr.data)||[]),billAll:Object.fromEntries((br.data||[]).map(r=>[r.id,r.data||{}])),trials:(br.data||[]).filter(r=>((r.data||{}).trialUntil||0)>Date.now()&&!/active|trialing|past_due/.test((r.data||{}).status||"")).length,trialsEver:(br.data||[]).filter(r=>(r.data||{}).trialStart).length,subs,fb:(fr&&fr.data)||[],rev:((rr&&rr.data)||[]).map(r=>r.data||{}).filter(r=>r.rating>=1),at:Date.now()}}

  async function openStats(){if(!owner)return;window.__maStatsOpen=true;
    openPanel(`<div class="label">Only you can see this</div><h2>Site stats</h2><div class="ms-sec" id="msLive"></div><div id="msBody"><p class="note" style="margin-top:18px">Loading…</p></div>`);
    try{panel.classList.add("wide")}catch(e){}
    drawLive();
    const obs=new MutationObserver(()=>{if(!document.getElementById("msLive")){window.__maStatsOpen=false;obs.disconnect()}});obs.observe(document.body,{childList:true,subtree:true});
    try{CACHE=await load()}catch(e){const b=document.getElementById("msBody");if(b)b.innerHTML=`<p class="note">Couldn't load stats: ${esc(e.message)}</p>`;return}
    draw()}


  /* ---------- holistic view: funnel, engagement, money, feedback, content, links ---------- */
  function holistic(cur,prev,N,cut){const C=CACHE,P=Object.values(C.players);
    const ppl=a=>new Set(a.map(v=>v.vid)).size,evP=(a,k)=>new Set(a.filter(v=>v.ev&&v.ev[k]).map(v=>v.vid)).size,evN=(a,k)=>a.reduce((n,v)=>n+((v.ev&&v.ev[k])||0),0);
    const newA=C.accts.filter(a=>a.first>=cut(N)).length,act7=C.accts.filter(a=>Date.now()-a.t<7*864e5).length;
    const subsA=(C.subs||[]).filter(x=>x.status==="active").length;
    const steps=[["Visitors",ppl(cur)],["Cleared a level",evP(cur,"level_clear")],["Saw a sign-up nudge",new Set(cur.filter(v=>v.ev&&(v.ev.prompt_shown||v.ev.bar_shown||v.ev.guide_cta_shown||v.ev.p_any_shown)).map(v=>v.vid)).size],["Clicked a nudge",new Set(cur.filter(v=>v.ev&&(v.ev.prompt_click||v.ev.bar_click||v.ev.guide_cta_click||v.ev.p_any_click)).map(v=>v.vid)).size],["New accounts",newA],["Paying Pro (now)",C.pro]];
    const top=Math.max(1,steps[0][1]);
    const funnel=`<div class="ms-sec"><h3>Growth funnel <small>${N===1?"today":N+" days"} · sign-up nudges started Nov 12 · % = share of visitors (clicks: share who saw one)</small></h3>
      ${steps.map(([l,n],i)=>`<div class="ms-row" style="grid-template-columns:minmax(0,1fr) 160px 70px"><span>${l}</span><span class="tr"><i style="width:${Math.max(2,n/top*100).toFixed(0)}%"></i></span><b>${n}${i&&i<5?` <small style="color:var(--ink-2)">${pct(n,i===3?steps[2][1]:steps[0][1])}%</small>`:""}</b></div>`).join("")}
      <div class="ms-tiles" style="margin-top:10px">
       <div class="ms-tile"><b>${evN(cur,"prompt_shown")} → ${evN(cur,"prompt_click")}</b><span>Level pop-up: shown → clicked</span></div>
       <div class="ms-tile"><b>${evN(cur,"bar_shown")} → ${evN(cur,"bar_click")}</b><span>"Only on this device" bar</span></div>
       <div class="ms-tile"><b>${evN(cur,"guide_cta_shown")} → ${evN(cur,"guide_cta_click")}</b><span>Guide sign-up boxes</span></div>
       <div class="ms-tile"><b>${evN(cur,"from_chatgpt")}</b><span>Visits from ChatGPT (${evN(cur,"from_ai")} from any AI assistant)</span></div>
       ${[["plan","Plan strip on Home"],["planpanel","Plan-ready screen"],["lb","Leaderboard row"],["school","School board strip"],["streak","Streak toast"],["score","Daily score toast"],["rapid","Rapid Fire toast"],["open","Deadline toast"],["deal","Save-deal button"],["fav","Favorite-stock toast"],["fav3","3-favorites toast"]].map(([k,l])=>`<div class="ms-tile"><b>${evN(cur,"p_"+k+"_shown")} → ${evN(cur,"p_"+k+"_click")}</b><span>${l}: shown → clicked</span></div>`).join("")}
       <div class="ms-tile"><b>${evN(cur,"prompt0_shown")} → ${evN(cur,"prompt0_click")}</b><span>Welcome-back pop-up: shown → clicked</span></div>
       <div class="ms-tile"><b>${evN(cur,"signup")}</b><span>Tracked sign-ups (${["prompt0","prompt1","prompt3","bar","guide","chatgpt","plan","planpanel","lb","school","streak","score","rapid","open","deal","fav","fav3"].map(k=>evN(cur,"signup_from_"+k)+" "+k.replace("prompt","pop-up ")).join(", ")})</span></div></div></div>`;
    const sum=(f)=>P.reduce((n,p)=>n+(+f(p)||0),0);
    const xpT=sum(p=>p.xp),lvT=sum(p=>p.levels),mockT=sum(p=>p.mockN),stk=P.filter(p=>(p.streak||0)>=3).length;
    const eng=`<div class="ms-sec"><h3>What members do <small>everyone on the leaderboard (${P.length})</small></h3>
      <div class="ms-tiles five"><div class="ms-tile"><b>${xpT.toLocaleString()}</b><span>Total XP earned</span></div><div class="ms-tile"><b>${P.length?Math.round(xpT/P.length):0}</b><span>Avg XP per member</span></div><div class="ms-tile"><b>${lvT}</b><span>Levels cleared</span></div><div class="ms-tile"><b>${mockT}</b><span>Mock interview answers</span></div><div class="ms-tile"><b>${stk}</b><span>On a 3+ day streak</span></div></div>
      <div class="ms-grid2"><div class="ms-sec"><h3>Recruiting for</h3>${rows(tally(P,p=>(p.target||"").trim(),6))}</div><div class="ms-sec"><h3>Graduation year</h3>${rows(tally(P,p=>String(p.grad||"").trim(),6))}</div></div></div>`;
    const PR={monthly:9,yearly:69/12,founding:49/12,season:29/4,trial:0};const mrr=(C.bill||[]).reduce((n,b)=>n+(PR[b.plan]??0),0);
    const money=`<div class="ms-sec"><h3>Money</h3><div class="ms-tiles five"><div class="ms-tile"><b>${C.pro}</b><span>Active Pro</span></div><div class="ms-tile"><b>$${mrr.toFixed(0)}</b><span>Est. monthly revenue</span></div><div class="ms-tile"><b>$${(mrr*12).toFixed(0)}</b><span>Est. yearly run rate</span></div><div class="ms-tile"><b>${C.accts.length?(C.pro/C.accts.length*100).toFixed(1):0}%</b><span>Accounts that pay</span></div><div class="ms-tile"><b>${subsA}</b><span>Email subscribers</span></div><div class="ms-tile"><b>${C.trials||0}</b><span>On free trial now (${C.trialsEver||0} ever)</span></div></div>
      ${(C.bill||[]).length?`<div style="margin-top:10px">${rows(tally(C.bill,b=>b.plan||"other",6))}</div>`:""}</div>`;
    const rv=C.rev||[],ravg=rv.length?(rv.reduce((n,r)=>n+r.rating,0)/rv.length).toFixed(1):"–";
    const fb=(C.fb||[]).map(r=>r.data||{}),fbN=fb.filter(f=>(f.at||"").slice(0,10)>=cut(N));
    const voice=`<div class="ms-sec"><h3>What people say <small>${rv.length} reviews · ${fb.length} feedback notes</small></h3>
      <div class="ms-tiles"><div class="ms-tile"><b>${ravg}★</b><span>Avg Pro review</span></div><div class="ms-tile"><b>${fbN.length}</b><span>Feedback, ${N===1?"today":N+" days"}</span></div><div class="ms-tile"><b>${fb.filter(f=>f.kind==="question").length}</b><span>Question reports (all time)</span></div><div class="ms-tile"><b>${fb.filter(f=>f.signedIn).length}</b><span>From signed-in users</span></div></div>
      ${fb.length?`<table class="ms-tbl" style="margin-top:10px"><thead><tr><th>When</th><th>Type</th><th>What they said</th><th>Where</th></tr></thead><tbody>${fb.slice(0,12).map(f=>`<tr><td>${esc((f.at||"").slice(5,10).replace("-","/"))}</td><td>${esc(f.kind==="question"?"Question: "+(f.reason||"report"):"Feedback")}</td><td>${esc((f.text||f.question||"").slice(0,160))}</td><td>${esc((f.where||f.page||"").slice(0,40))}</td></tr>`).join("")}</tbody></table>`:`<p class="note">No feedback yet.</p>`}</div>`;
    const g=cur.filter(v=>/^\/guides\//.test(v.p||"")),sch=g.filter(v=>/-investment-banking\/?$/.test(v.p||"")&&!/interview/.test(v.p||""));
    const dow=[0,0,0,0,0,0,0];cur.forEach(v=>{const d=new Date((v.d||"")+"T12:00:00");if(!isNaN(d))dow[d.getDay()]++});const dm=Math.max(1,...dow),DN=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const content=`<div class="ms-grid2"><div class="ms-sec"><h3>Guides &amp; search <small>visits that landed on a page</small></h3>
      <div class="ms-tiles"><div class="ms-tile"><b>${g.length}</b><span>Landed on a guide</span></div><div class="ms-tile"><b>${sch.length}</b><span>School guides</span></div></div>
      <div style="margin-top:8px">${rows(tally(g,v=>PAGE_NAME(v.p).replace("Guide: ",""),8))}</div></div>
      <div class="ms-sec"><h3>Day of week <small>${N===1?"today":N+" days"}</small></h3><div class="ms-bars" style="height:110px">${dow.map((n,i)=>`<div class="ms-bar" data-tip="${DN[i]}: ${n} visit${n===1?"":"s"} · ${pct(n,Math.max(1,cur.length))}% of total"><em>${n||""}</em><i style="height:${(n/dm*100).toFixed(0)}%"></i></div>`).join("")}</div><div class="ms-days">${DN.map(d=>`<span>${d}</span>`).join("")}</div></div></div>
      <div class="ms-sec"><h3>Every guide visited <small>${(()=>{const n=new Set(g.map(v=>(v.p||"").replace(/\/$/,""))).size;return n+" guide"+(n===1?"":"s")+" · "+(N===1?"today":N+" days")})()}</small></h3>${(()=>{const gm={};g.forEach(v=>{const k=(v.p||"").replace(/\/$/,"");const o=gm[k]=gm[k]||{n:0,p:new Set(),s:{},ph:0};o.n++;o.p.add(v.vid);if(v.dev==="Phone")o.ph++;const c=srcName(v.src||v.ref);o.s[c]=(o.s[c]||0)+1});const L=Object.entries(gm).sort((a,b)=>b[1].n-a[1].n);return L.length?`<div style="max-height:460px;overflow:auto"><table class="ms-tbl"><thead><tr><th>Guide</th><th>Visits</th><th>People</th><th>Phones</th><th>Where they came from</th></tr></thead><tbody>${L.map(([k,o])=>`<tr><td><a href="${esc(k)}/" target="_blank" rel="noopener">${esc(PAGE_NAME(k).replace("Guide: ",""))}</a></td><td>${o.n}</td><td>${o.p.size}</td><td>${pct(o.ph,o.n)}%</td><td>${Object.entries(o.s).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([c,n])=>esc(c)+" <b>"+n+"</b>").join(" · ")}</td></tr>`).join("")}</tbody></table></div>`:`<p class="note">No guide visits in this range yet.</p>`})()}<p class="note" style="margin-top:6px">Counts the first page each person opens per day, so this is where they landed from.</p></div>
      `;
    const L=[["Google Search Console","https://search.google.com/search-console?resource_id=sc-domain%3Amnaprep.com"],["Bing Webmaster","https://www.bing.com/webmasters/home?siteUrl=https://mnaprep.com/"],["Metricool (all socials)","https://app.metricool.com/evolution/web?blogId=7259200"],["TikTok Studio","https://www.tiktok.com/tiktokstudio"],["Instagram insights","https://www.instagram.com/mnaprep/"],["YouTube Studio","https://studio.youtube.com/channel/UCecz_zgUGiksG2HpJEt0cTg"],["Pinterest analytics","https://www.pinterest.com/business/hub/"],["Stripe","https://dashboard.stripe.com/"],["Netlify","https://app.netlify.com/"],["Supabase","https://supabase.com/dashboard/project/nbakxpnhcfzdosbzbupd"],["Resend (emails)","https://resend.com/emails"],["Discord server","https://discord.com/channels/1529231349494452365"],["Product Hunt","https://www.producthunt.com/products/m-a-prep"],["AlternativeTo","https://alternativeto.net/software/manda-prep/"],["Quora profile","https://www.quora.com/profile/Bekir-Kahook"]];
    const links=`<div class="ms-sec"><h3>Everything else <small>open the other dashboards</small></h3><div style="display:flex;flex-wrap:wrap;gap:8px">${L.map(([t,u])=>`<a class="btn sm" style="text-decoration:none" href="${u}" target="_blank" rel="noopener">${t} ↗</a>`).join("")}</div></div>`;
    const BA=C.billAll||{},proTil=u=>{const b=BA[u]||{};return Math.max(b.until||0,b.grantUntil||0,b.trialUntil||0,b.passUntil||0)};
    const reqs=(C.reqs||[]).map(r=>({uid:r.id,...(r.data||{})}));
    const reqSec=`<div class="ms-sec"><h3>Free Pro requests <small>${reqs.length} total · tap a button to give Pro</small></h3>${reqs.length?`<table class="ms-tbl"><thead><tr><th>When</th><th>Who</th><th>What they said</th><th>Pro until</th><th></th></tr></thead><tbody>${reqs.slice(0,40).map(q=>{const t=proTil(q.uid);return `<tr><td>${q.at?new Date(q.at).toLocaleDateString(undefined,{month:"numeric",day:"numeric"}):""}</td><td>${esc(C.names[q.uid]||q.name||"(no name)")}</td><td>${esc((q.note||"").slice(0,160))}</td><td>${t>Date.now()?new Date(t).toLocaleDateString(undefined,{month:"short",day:"numeric"}):"–"}</td><td style="white-space:nowrap"><button class="btn sm" data-grant="${esc(q.uid)}" data-days="30">+30 days</button> <button class="ghost outline sm" data-grant="${esc(q.uid)}" data-days="120">+4 months</button></td></tr>`}).join("")}</tbody></table>`:`<p class="note">No requests yet.</p>`}</div>`;
    return funnel+money+eng+content+voice+links}
  /* owner: give Pro (server checks you're the owner) */
  document.addEventListener("click",async e=>{const b=e.target.closest&&e.target.closest("[data-grant]");if(!b)return;e.preventDefault();
    const days=+b.dataset.days;if(!confirm(days?`Give ${days} days of Pro?`:"Remove free Pro?"))return;b.disabled=true;
    try{const sb=window.MA_AUTH&&MA_AUTH.sb,s=sb&&(await sb.auth.getSession()).data.session;const r=await fetch("/.netlify/functions/grant",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+(s?s.access_token:"")},body:JSON.stringify({uid:b.dataset.grant,days})});
      const j=await r.json().catch(()=>({}));b.textContent=r.ok?"✓ Done":(j.error||"Failed")}catch(x){b.textContent="Failed"}});
  function draw(){const body=document.getElementById("msBody");if(!body||!CACHE)return;
    const {V:V0,names,players,accts,pro}=CACHE,N=RANGE,today=dayStr(new Date()),yest=dayStr(new Date(Date.now()-864e5));
    const cut=n=>dayStr(new Date(Date.now()-(n-1)*864e5));
    const fl=(a,skip)=>a.filter(v=>(skip==="src"||!FILT.src||srcName(v.src||v.ref)===FILT.src)&&(skip==="dev"||!FILT.dev||v.dev===FILT.dev));
    const V=fl(V0);
    const cur=V.filter(v=>v.d>=cut(N)),prev=V.filter(v=>v.d>=cut(2*N)&&v.d<cut(N));
    const people=a=>new Set(a.map(v=>v.vid)).size,fresh=a=>a.filter(v=>v.first===v.d).length;
    const signed=a=>a.filter(v=>v.acct).length,phone=a=>a.filter(v=>v.dev==="Phone").length;
    const CN=Math.max(N,7),dayS=i=>dayStr(new Date(Date.now()-i*864e5));
    const days=[];for(let i=CN-1;i>=0;i--){const d=dayS(i),dv=V.filter(v=>v.d===d);days.push([d,dv.length,fresh(dv),people(dv)])}
    const metOf=dv=>METRIC==="visits"?dv.length:METRIC==="people"?people(dv):fresh(dv);
    const curS=days.map(d=>METRIC==="visits"?d[1]:METRIC==="people"?d[3]:d[2]),prvS=[];for(let i=CN-1;i>=0;i--)prvS.push(metOf(V.filter(v=>v.d===dayS(i+CN))));
    const LC=lineChart(curS,prvS,days.map(d=>d[0]),MET[METRIC]);
    const hours=Array(24).fill(0);cur.forEach(v=>{const h=etHour(v.t);if(h>=0)hours[h]++});const hm=Math.max(1,...hours);
    const peak=hours.indexOf(Math.max(...hours));
    const srcs=tally(cur,v=>srcName(v.src||v.ref),8),srcsU=tally(fl(V0.filter(v=>v.d>=cut(N)),"src"),v=>srcName(v.src||v.ref),8),devsU=tally(fl(V0.filter(v=>v.d>=cut(N)),"dev"),v=>v.dev);
    const tk=cur.filter(v=>/tiktok/.test(v.src||v.ref||"")).length;
    const newAccts=accts.filter(a=>a.first>=cut(N)).length,prevAccts=accts.filter(a=>a.first>=cut(2*N)&&a.first<cut(N)).length;
    const act=ms=>accts.filter(a=>Date.now()-a.t<ms).length;
    const returning=cur.length-fresh(cur);
    /* plain-English takeaways */
    const ins=[];
    if(cur.length){ins.push(`<b>${people(cur)}</b> different people visited ${N===1?"today so far":"in the last "+N+" days"}${prev.length?`, ${people(cur)>=people(prev)?"up":"down"} from ${people(prev)} ${N===1?"yesterday (full day)":"the "+N+" days before"}`:""}.`);
      if(srcs[0])ins.push(`Most came from <b>${esc(srcs[0][0])}</b> (${pct(srcs[0][1],cur.length)}% of visits).`);
      if(tk)ins.push(`TikTok sent <b>${tk}</b> visits${CACHE&&cur.some(v=>v.cmp)?`. Best post: <b>${esc(tally(cur.filter(v=>v.cmp),v=>v.cmp,1)[0][0])}</b>`:""}.`);
      if(hours[peak])ins.push(`Busiest hour: <b>${hr(peak)}–${hr((peak+1)%24)} ET</b>.`);
      ins.push(`${pct(returning,cur.length)}% of visits were people coming back; ${pct(phone(cur),cur.length)}% were on phones.`)}
    const t5=(label,val,c,sp)=>`<div class="ms-tile"><b>${val}${c||""}</b><span>${label}</span>${sp||""}</div>`;
    const sp0=scroller(body),sc0=sp0?sp0.scrollTop:0;
    body.innerHTML=`
     <div class="ms-top"><div class="ms-seg" role="group" aria-label="Date range">${[[1,"Today"],[7,"7 days"],[14,"14 days"],[30,"30 days"],[60,"60 days"]].map(([n,l])=>`<button type="button" data-r="${n}" aria-pressed="${n===N}">${l}</button>`).join("")}</div>
      <div style="display:flex;gap:8px"><button class="btn sm" id="msCsv">Download CSV</button><button class="btn sm" id="msRefresh">Refresh</button></div></div>
     ${(FILT.src||FILT.dev)?`<div class="ms-sec" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="note" style="margin:0">Filtering visits (accounts and money aren't filtered):</span>${FILT.src?`<button type="button" class="ms-chip" data-clr="src">${esc(FILT.src)} ✕</button>`:""}${FILT.dev?`<button type="button" class="ms-chip" data-clr="dev">${esc(FILT.dev)} ✕</button>`:""}</div>`:`<p class="ms-hint">Tip: tap a traffic source or device below to filter the whole page.</p>`}
     ${ins.length?`<div class="ms-sec"><div class="ms-ins"><ul style="margin:0;padding-left:18px">${ins.map(x=>`<li>${x}</li>`).join("")}</ul></div></div>`:""}
     ${holistic(cur,prev,N,cut)}
     <div class="ms-sec"><h3>Visitors <small>last ${CN} days vs the ${CN} before · ET · hover or tap the chart</small></h3>
      <div class="ms-tiles five">${t5("Unique people",people(cur),chg(people(cur),people(prev)),spark(days.map(d=>d[3])))}${t5("Visits",cur.length,chg(cur.length,prev.length),spark(days.map(d=>d[1])))}${t5("New people",fresh(cur),chg(fresh(cur),fresh(prev)),spark(days.map(d=>d[2])))}
       ${t5("Today",V.filter(v=>v.d===today).length,chg(V.filter(v=>v.d===today).length,V.filter(v=>v.d===yest).length))}${t5("Signed in",pct(signed(cur),cur.length)+"%")}</div>
      <div class="ms-top" style="margin:12px 0 6px"><div class="ms-seg ms-mseg" role="group" aria-label="Chart metric">${Object.entries(MET).map(([k,l])=>`<button type="button" data-m="${k}" aria-pressed="${k===METRIC}">${l}</button>`).join("")}</div></div>
      ${LC.html}
      <div class="ms-leg"><span>${MET[METRIC]}</span><span class="pv">Previous ${CN} days</span></div></div>
     <div class="ms-sec"><h3>When they visit <small>hour of day, ET · ${N} days</small></h3>
      <div class="ms-bars ms-hrs">${hours.map((n,h)=>`<div class="ms-bar" data-tip="${hr(h)}–${hr((h+1)%24)} ET: ${n} visit${n===1?"":"s"} · ${pct(n,Math.max(1,cur.length))}% of total"><em>${n||""}</em><i style="height:${(n/hm*100).toFixed(0)}%"></i></div>`).join("")}</div>
      <div class="ms-days">${hours.map((_,h)=>`<span>${h%3?"":hr(h)}</span>`).join("")}</div></div>
     ${(()=>{const agg={};let tot=0;const ppl=new Set();cur.forEach(v=>{if(!v.time)return;ppl.add(v.vid);for(const [k,x] of Object.entries(v.time)){const a=agg[k]=agg[k]||{s:0,p:new Set()};a.s+=+x||0;a.p.add(v.vid);tot+=+x||0}});
       const nice=k=>{const L=(typeof PANE_LABEL!=="undefined"&&PANE_LABEL)||{};const cap=w=>w.charAt(0).toUpperCase()+w.slice(1);return k.split(" › ").map((w,i)=>i?(L[w]||cap(w)):cap(w)).join(" › ")};
       const fm=x=>x>=3600?(x/3600).toFixed(1)+" hr":x>=60?Math.round(x/60)+" min":Math.round(x)+" sec";
       const list=Object.entries(agg).map(([k,a])=>({k,s:a.s,p:a.p.size,avg:a.s/a.p.size}));
       if(!list.length)return `<div class="ms-sec"><h3>Time spent <small>${N} days</small></h3><p class="note">No time data yet. It starts counting from today: active time per section, only while the page is open and being used.</p></div>`;
       const most=list.slice().sort((a,b)=>b.s-a.s).slice(0,8),least=list.slice().sort((a,b)=>a.s-b.s).slice(0,8),mx=Math.max(...most.map(x=>x.s));
       const row=x=>`<div class="ms-row" style="grid-template-columns:minmax(0,1fr) 80px 66px"><span title="${esc(x.k)}">${esc(nice(x.k))}</span><span class="tr"><i style="width:${Math.max(3,x.s/mx*100).toFixed(0)}%"></i></span><b>${fm(x.s)}</b></div><div class="note" style="margin:-4px 0 6px;font-size:11.5px">${x.p} ${x.p===1?"person":"people"} · ${fm(x.avg)} avg each</div>`;
       return `<div class="ms-sec"><h3>Time spent <small>${N} days · active time only</small></h3>
        <div class="ms-tiles"><div class="ms-tile"><b>${fm(tot/Math.max(1,ppl.size))}</b><span>Avg time per visitor</span></div><div class="ms-tile"><b>${fm(tot)}</b><span>Total time on site</span></div><div class="ms-tile"><b>${esc(nice(most[0].k).split(" › ").pop())}</b><span>Most-used section</span></div><div class="ms-tile"><b>${list.length}</b><span>Sections visited</span></div></div>
        <div class="ms-grid2" style="margin-top:12px"><div><h3 style="font-size:14px">🔥 Most time spent</h3>${most.map(row).join("")}</div><div><h3 style="font-size:14px">🧊 Least time spent</h3>${least.map(row).join("")}</div></div></div>`})()}
     <div class="ms-grid2">
      <div class="ms-sec"><h3>Where they come from <small>${N} days</small></h3>${rows(srcsU,0,"src")}</div>
      <div class="ms-sec"><h3>TikTok posts <small>visits by QR / link tag</small></h3>${rows(tally(cur.filter(v=>v.cmp),v=>v.cmp,8))}</div>
      <div class="ms-sec"><h3>First page they landed on</h3>${rows(tally(cur,v=>PAGE_NAME(v.p),8))}</div>
      <div class="ms-sec"><h3>Where they are</h3>${rows(tally(cur,v=>v.cc==="US"?(v.region||"United States"):(v.country||v.cc),8))}</div>
      <div class="ms-sec"><h3>Top cities</h3>${rows(tally(cur,v=>v.city?(v.city+(v.cc==="US"&&v.region?", "+v.region:"")):"",8))}</div>
      <div class="ms-sec"><h3>Device</h3>${rows(devsU,0,"dev")}</div></div>
     <div class="ms-sec"><h3>Accounts</h3>
      <div class="ms-tiles five">${t5("Total accounts",accts.length)}${t5(`New, ${N} days`,newAccts,chg(newAccts,prevAccts))}${t5("Active 24h",act(864e5))}${t5("Active 7 days",act(7*864e5))}${t5("Paying Pro",pro)}</div>
      <p class="note" style="margin-top:8px">${cur.length?`About <b>${pct(newAccts,Math.max(1,fresh(cur)))}%</b> of new visitors made an account in this period.`:""}</p></div>
     <div class="ms-sec"><h3>Email list <small>Sunday curveball email</small></h3>${(()=>{const S2=CACHE.subs||[],act2=S2.filter(x=>x.status==="active"),nw=act2.filter(x=>(x.t||"").slice(0,10)>=cut(N)).length;
       return `<div class="ms-tiles"><div class="ms-tile"><b>${act2.length}</b><span>Subscribers</span></div><div class="ms-tile"><b>${nw}</b><span>New, ${N} days</span></div><div class="ms-tile"><b>${S2.length-act2.length}</b><span>Unsubscribed</span></div><div class="ms-tile"><b>${(tally(act2,x=>(x.src||"").split(":")[0],1)[0]||["–"])[0]}</b><span>Top signup spot</span></div></div>
       <div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="btn sm" id="msTestMail">Send me this week's email</button><span class="note" id="msTestMsg"></span> <button class="btn sm" type="button" id="msStuck">Stuck sign-ups</button><span class="note" id="msStuckMsg"></span></div>`})()}</div>
     <div class="ms-sec"><h3>Account history <small>rebuilt from saved progress · back to launch</small></h3>${(()=>{const all=[...new Set(accts.flatMap(a=>a.days))].sort();if(!all.length)return`<p class="note">No dated activity yet.</p>`;
       const start=all[0],list=[];for(let t=Date.parse(start+"T12:00:00");t<=Date.now();t+=864e5){const d=dayStr(new Date(t));list.push([d,accts.filter(a=>a.days.includes(d)).length,accts.filter(a=>a.first===d).length])}
       const L=list.slice(-Math.max(N,14)),m=Math.max(1,...L.map(x=>x[1]));const tot=accts.filter(a=>a.first).length;
       return `<div class="ms-tiles"><div class="ms-tile"><b>${start.slice(5).replace("-","/")}</b><span>First activity</span></div><div class="ms-tile"><b>${tot}</b><span>Accounts that used it</span></div><div class="ms-tile"><b>${Math.max(...list.map(x=>x[1]))}</b><span>Best day (active)</span></div><div class="ms-tile"><b>${(accts.reduce((n,a)=>n+a.days.length,0)/Math.max(1,tot)).toFixed(1)}</b><span>Avg days active</span></div></div>
       <div class="ms-bars" role="img" aria-label="Active accounts per day">${L.map(([d,n,f])=>`<div class="ms-bar" data-tip="${d}: ${n} active · ${f} new · ${n-f} returning"><em>${n||""}</em><span class="stk" style="height:${(n/m*100).toFixed(0)}%">${f?`<i class="nw" style="height:${(f/Math.max(1,n)*100).toFixed(0)}%"></i>`:""}<i style="flex:1"></i></span></div>`).join("")}</div>
       <div class="ms-days">${L.map(([d])=>`<span>${L.length>14?(+d.slice(8)%2?"":+d.slice(8)):+d.slice(8)}</span>`).join("")}</div>
       <div class="ms-leg"><span class="nw">New accounts</span><span>Returning accounts</span></div>`})()}</div>
     <div class="ms-sec"><h3><span>All accounts <small>${accts.length}</small></span><input class="ms-search" id="msFind" type="search" placeholder="Search name or school"></h3>
      <div id="msAcc"></div></div>
     <div class="ms-sec"><h3>Top schools <small>players on the leaderboard</small></h3>${rows(tally(Object.values(players),p=>(p.school||"").trim(),8))}</div>
     <p class="note" style="margin-top:14px">Visits = one per person per day. Your own visits aren't counted. Counting started Nov 4, 2026. Loaded ${new Date(CACHE.at).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}.</p>`;
    const accRows=q=>{q=(q||"").toLowerCase().trim();const L=accts.filter(a=>{if(!q)return true;const p=players[a.uid]||{};return((names[a.uid]||"")+" "+(p.school||"")).toLowerCase().includes(q)});
      return L.length?`<table class="ms-tbl"><thead><tr><th>Name</th><th>School</th><th class="n">XP</th><th class="n">Days active</th><th class="n">First seen</th><th class="n">Last seen</th><th></th></tr></thead><tbody>${L.slice(0,100).map(a=>{const p=players[a.uid]||{};return `<tr><td>${esc(names[a.uid]||"(no name)")}</td><td>${esc(p.school||"")}</td><td class="n">${p.xp||0}</td><td class="n">${a.days.length}</td><td class="n">${a.first?a.first.slice(5).replace("-","/"):""}</td><td class="n">${ago(a.t)}</td><td><button class="ghost outline sm" data-grant="${esc(a.uid)}" data-days="30" title="Give 30 days of Pro">+Pro</button></td></tr>`}).join("")}</tbody></table>${L.length>100?`<p class="note">Showing 100 of ${L.length}. Search to narrow it down.</p>`:""}`:`<p class="note">${q?"No matches.":"No accounts yet."}</p>`};
    const acc=document.getElementById("msAcc");acc.innerHTML=accRows("");
    document.getElementById("msFind").oninput=e=>{acc.innerHTML=accRows(e.target.value)};
    body.querySelectorAll(".ms-seg:not(.ms-mseg) button").forEach(b=>b.onclick=()=>{RANGE=+b.dataset.r;draw()});
    body.querySelectorAll(".ms-mseg button").forEach(b=>b.onclick=()=>{METRIC=b.dataset.m;draw()});
    body.querySelectorAll("[data-fk]").forEach(r=>{const go=()=>{const k=r.dataset.fk,v=r.dataset.fv;FILT[k]=FILT[k]===v?"":v;draw()};r.onclick=go;r.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();go()}}});
    body.querySelectorAll("[data-clr]").forEach(b=>b.onclick=()=>{FILT[b.dataset.clr]="";draw()});
    LC.bind(document.getElementById("msLine"));
    if(sp0)sp0.scrollTop=sc0;
    if(!matchMedia("(prefers-reduced-motion:reduce)").matches)body.querySelectorAll(".ms-tile b").forEach(b=>{const tn=b.firstChild;if(!tn||tn.nodeType!==3||!/^\d[\d,]*$/.test(tn.nodeValue))return;const to=+tn.nodeValue.replace(/,/g,""),com=tn.nodeValue.includes(","),t0=performance.now();if(to<2)return;const tk=t=>{const k=Math.min(1,(t-t0)/600),v=Math.round(to*(1-Math.pow(1-k,3)));tn.nodeValue=com?v.toLocaleString():String(v);if(k<1)requestAnimationFrame(tk)};requestAnimationFrame(tk)});
    document.getElementById("msRefresh").onclick=openStats;
    {const tb=document.getElementById("msTestMail");if(tb)tb.onclick=async()=>{const msg=document.getElementById("msTestMsg");tb.disabled=true;msg.textContent="Sending…";
      try{const tok=A.session&&A.session.access_token||(await sb.auth.getSession()).data.session.access_token;const r=await fetch("/.netlify/functions/email-test",{method:"POST",headers:{Authorization:"Bearer "+tok}});const j=await r.json().catch(()=>({}));
        msg.textContent=r.ok?`Sent to ${j.to}. Check your inbox.`:(j.error||"Couldn't send.")}catch(e){msg.textContent="Couldn't send."}tb.disabled=false}}
    {const sb2=document.getElementById("msStuck");if(sb2)sb2.onclick=async()=>{const msg=document.getElementById("msStuckMsg");msg.textContent="Checking…";
      try{const tok=A.session&&A.session.access_token||(await sb.auth.getSession()).data.session.access_token;const r=await fetch("/.netlify/functions/stuck",{headers:{Authorization:"Bearer "+tok}});const j=await r.json();
        msg.textContent=r.ok?`${j.stuck} of ${j.total} accounts never got in${j.stuck?": "+j.list.map(x=>x.email).join(", "):""}`:(j.error||"Couldn't check.")}catch(e){msg.textContent="Couldn't check."}}}
    document.getElementById("msCsv").onclick=()=>{const cols=["d","t","p","src","cmp","ref","dev","country","region","city","first","acct"];
      const csv=[cols.join(",")].concat(cur.map(v=>cols.map(c=>`"${String(v[c]??"").replace(/"/g,'""')}"`).join(","))).join("\n");
      const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`mnaprep-visits-${N}d-${today}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}}
  window.maStats=()=>owner&&openStats();
})();
