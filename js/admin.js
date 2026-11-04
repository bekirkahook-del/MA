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
  function addLinks(){const f=document.querySelector("footer");if(f&&!f.querySelector("[data-stats]")){const b=document.createElement("button");b.type="button";b.dataset.stats="1";b.className="fb-link";b.textContent="Site stats";b.title="Only you can see this";b.onclick=openStats;f.appendChild(b)}
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
@media (max-width:620px){.ms-tiles{grid-template-columns:repeat(2,minmax(0,1fr))}.ms-grid2{grid-template-columns:1fr}}`;document.head.appendChild(st);

  const ago=ms=>{const m=Math.round((Date.now()-ms)/60000);if(m<1)return"just now";if(m<60)return m+"m ago";const h=Math.round(m/60);if(h<24)return h+"h ago";return Math.round(h/24)+"d ago"};
  const dayStr=d=>d.toLocaleDateString("en-CA",{timeZone:"America/New_York"});
  const SRC_NAME={tiktok:"TikTok",instagram:"Instagram","l.instagram.com":"Instagram","instagram.com":"Instagram","tiktok.com":"TikTok","google.com":"Google","bing.com":"Bing","linkedin.com":"LinkedIn","lnkd.in":"LinkedIn","t.co":"X / Twitter","x.com":"X / Twitter",social:"Social posts","duckduckgo.com":"DuckDuckGo","reddit.com":"Reddit","facebook.com":"Facebook","m.facebook.com":"Facebook","l.facebook.com":"Facebook"};
  const srcName=s=>s?(SRC_NAME[s]||s):"Direct / typed in";
  const TAB_NAME={home:"Home",learn:"Learn",practice:"Practice",compete:"Compete",career:"Career",pro:"Pro",news:"News"};
  const rows=(pairs,total)=>{const mx=Math.max(1,...pairs.map(p=>p[1]));return pairs.length?pairs.map(([k,v])=>`<div class="ms-row"><span>${esc(k)}</span><span class="tr"><i style="width:${(v/mx*100).toFixed(0)}%"></i></span><b>${v}</b></div>`).join(""):`<p class="note">Nothing yet.</p>`};
  const tally=(arr,fn,n=6)=>{const m={};arr.forEach(x=>{const k=fn(x);if(k)m[k]=(m[k]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,n)};

  function drawLive(){const el=document.getElementById("msLive");if(!el)return;
    const ppl=Object.values(live).map(a=>a[0]).filter(Boolean);
    el.innerHTML=`<h3><span><span class="ms-dot"></span>On the site right now: ${ppl.length}</span><small>updates live</small></h3>
      ${ppl.length?`<table class="ms-tbl"><thead><tr><th>Looking at</th><th>Device</th><th>Came from</th><th class="n">Here for</th></tr></thead><tbody>${ppl.sort((a,b)=>a.t-b.t).slice(0,25).map(p=>`<tr><td>${esc(TAB_NAME[p.tab]||p.tab)}${p.a?" · signed in":""}</td><td>${p.m?"Phone":"Computer"}</td><td>${esc(srcName(p.src))}</td><td class="n">${esc(ago(p.t).replace(" ago",""))}</td></tr>`).join("")}</tbody></table>`:`<p class="note">Nobody else right now. (Your own visits aren't counted.)</p>`}`}

  async function openStats(){if(!owner)return;window.__maStatsOpen=true;
    openPanel(`<div class="label">Only you can see this</div><h2>Site stats</h2><div class="ms-sec" id="msLive"></div><div id="msBody"><p class="note" style="margin-top:18px">Loading…</p></div>`);
    try{panel.classList.add("wide")}catch(e){}
    drawLive();
    const obs=new MutationObserver(()=>{if(!document.getElementById("msLive")){window.__maStatsOpen=false;obs.disconnect()}});obs.observe(document.body,{childList:true,subtree:true});
    const since30=new Date(Date.now()-31*864e5).toISOString();
    const [vr,pr,nr,plr,br]=await Promise.all([
      sb.from("docs").select("id,data").eq("col","visits").gte("updated_at",since30).limit(10000),
      sb.from("docs").select("col,updated_at").like("col","data/users/%").eq("id","progress").limit(5000),
      sb.from("docs").select("id,data").eq("col","names").limit(5000),
      sb.from("docs").select("id,data").eq("col","players").limit(5000),
      sb.from("docs").select("id,data").eq("col","billing").limit(5000)]);
    const body=document.getElementById("msBody");if(!body)return;
    if(vr.error||pr.error){body.innerHTML=`<p class="note">Couldn't load stats: ${esc((vr.error||pr.error).message)}</p>`;return}
    const V=(vr.data||[]).map(r=>r.data||{}),today=dayStr(new Date()),yest=dayStr(new Date(Date.now()-864e5));
    const within=n=>{const c=dayStr(new Date(Date.now()-(n-1)*864e5));return V.filter(v=>v.d>=c)};
    const uniq=a=>new Set(a.map(v=>v.id||v.t)).size;
    const days=[];for(let i=13;i>=0;i--){const d=dayStr(new Date(Date.now()-i*864e5));days.push([d,V.filter(v=>v.d===d).length,V.filter(v=>v.d===d&&v.first===d).length])}
    const mx=Math.max(1,...days.map(d=>d[1]));
    const v30=within(30);
    const names={};(nr.data||[]).forEach(r=>names[r.id]=(r.data&&r.data.name)||"");
    const players={};(plr.data||[]).forEach(r=>players[r.id]=r.data||{});
    const accts=(pr.data||[]).map(r=>({uid:r.col.slice(11),t:Date.parse(r.updated_at)})).sort((a,b)=>b.t-a.t);
    const act=ms=>accts.filter(a=>Date.now()-a.t<ms).length;
    const pro=(br.data||[]).filter(r=>r.data&&r.data.paid&&(!r.data.until||Date.parse(r.data.until)>Date.now())).length;
    const schools=tally(Object.values(players),p=>(p.school||"").trim(),8);
    body.innerHTML=`
     <div class="ms-sec"><h3>Visitors <small>unique people per day · ET</small></h3>
      <div class="ms-tiles"><div class="ms-tile"><b>${V.filter(v=>v.d===today).length}</b><span>Today</span></div><div class="ms-tile"><b>${V.filter(v=>v.d===yest).length}</b><span>Yesterday</span></div>
       <div class="ms-tile"><b>${within(7).length}</b><span>Visits, 7 days</span></div><div class="ms-tile"><b>${v30.length}</b><span>Visits, 30 days</span></div></div>
      <div class="ms-bars" role="img" aria-label="Visitors per day, last 14 days">${days.map(([d,n,f])=>`<div class="ms-bar" title="${d}: ${n} visitors, ${f} new"><em>${n||""}</em><i style="height:${(n/mx*100).toFixed(0)}%"></i></div>`).join("")}</div>
      <div class="ms-days">${days.map(([d])=>`<span>${+d.slice(8)}</span>`).join("")}</div>
      <p class="note" style="margin-top:8px">${v30.filter(v=>v.first===v.d).length} of the last 30 days' visits were first-timers. Counting started Nov 4, 2026.</p></div>
     <div class="ms-grid2">
      <div class="ms-sec"><h3>Where they come from <small>30 days</small></h3>${rows(tally(v30,v=>srcName(v.src||v.ref)))}</div>
      <div class="ms-sec"><h3>Where they are <small>30 days</small></h3>${rows(tally(v30,v=>v.cc==="US"?(v.region||"United States"):(v.country||v.cc)))}</div>
      <div class="ms-sec"><h3>Device</h3>${rows(tally(v30,v=>v.dev))}</div>
      <div class="ms-sec"><h3>TikTok posts <small>by QR / link tag</small></h3>${rows(tally(v30.filter(v=>v.cmp),v=>v.cmp))}</div></div>
     <div class="ms-sec"><h3>Accounts</h3>
      <div class="ms-tiles"><div class="ms-tile"><b>${accts.length}</b><span>Total accounts</span></div><div class="ms-tile"><b>${act(864e5)}</b><span>Active 24h</span></div>
       <div class="ms-tile"><b>${act(7*864e5)}</b><span>Active 7 days</span></div><div class="ms-tile"><b>${pro}</b><span>Paying Pro</span></div></div></div>
     <div class="ms-sec"><h3>Most recently active <small>${Math.min(20,accts.length)} of ${accts.length}</small></h3>
      ${accts.length?`<table class="ms-tbl"><thead><tr><th>Name</th><th>School</th><th class="n">XP</th><th class="n">Last seen</th></tr></thead><tbody>${accts.slice(0,20).map(a=>{const p=players[a.uid]||{};return `<tr><td>${esc(names[a.uid]||"(no name)")}</td><td>${esc(p.school||"")}</td><td class="n">${p.xp||0}</td><td class="n">${ago(a.t)}</td></tr>`}).join("")}</tbody></table>`:`<p class="note">No accounts yet.</p>`}</div>
     <div class="ms-sec"><h3>Top schools <small>players on the leaderboard</small></h3>${rows(schools)}</div>
     <div style="margin-top:18px;display:flex;gap:8px"><button class="btn sm" id="msRefresh">Refresh</button></div>`;
    document.getElementById("msRefresh").onclick=openStats}
  window.maStats=()=>owner&&openStats();
})();
