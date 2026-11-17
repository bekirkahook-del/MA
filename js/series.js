/* M&A Prep National Collegiate Series: a 2-week live event.
   Case Competition + Stock Pitch, school vs school.
   Gate (all required before competing): confirmed .edu account -> school -> official school club.
   Change the dates here. Everything else follows. */
(function(){
  if(typeof S==="undefined"||typeof openPanel!=="function")return;

  const SERIES={
    name:"National Collegiate Series",
    start:Date.parse("2026-11-17T12:00:00-05:00"),
    end:Date.parse("2026-12-01T12:00:00-05:00"),
    pitchTries:3
  };

  /* ---------- state helpers ---------- */
  const q=(s,r)=>(r||document).querySelector(s);
  const E=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const sess=()=>window.MA_AUTH&&window.MA_AUTH.session;
  const email=()=>{const s=sess();return(s&&s.user&&s.user.email)||""};
  const eduOK=()=>{const s=sess();return !!(s&&s.user&&s.user.email_confirmed_at&&/@[^@]+\.edu$/i.test(s.user.email||""))};
  const domain=()=>{const m=email().toLowerCase().match(/@([^@]+)$/);return m?m[1].split(".").slice(-2).join("."):""};
  const ser=()=>(S.series=S.series||{});
  const phase=()=>{const n=Date.now();return n<SERIES.start?"pre":n<SERIES.end?"live":"ended"};
  const hasSchool=()=>!!(S.profile&&(S.profile.school||"").trim());
  const officerOf=code=>(typeof PLAYERS!=="undefined"?PLAYERS:[]).find(p=>p.club===code&&p.clubOfficer);
  const clubSchool=()=>{const c=S.club&&S.club.code;if(!c)return"";if(S.club.officer)return domain();const o=officerOf(c);return(o&&o.sd)||S.club.sd||""};
  const clubOK=()=>{const d=domain();return !!(d&&S.club&&S.club.code&&clubSchool()===d&&(!window.maClubMod||maClubMod.approved()))};
  const step=()=>!sess()||!eduOK()?1:!hasSchool()?2:!clubOK()?3:4;
  const ready=()=>step()===4;
  const eligible=()=>ready()&&phase()==="live";
  window.maSeries={eligible,ready,phase,step,SERIES};

  /* ---------- scores that ride on the player doc (public leaderboard) ---------- */
  function caseBest(){let b=0;Object.values(S.cases||{}).forEach(r=>{if(r&&typeof r.score==="number"&&r.at>=SERIES.start&&r.at<=SERIES.end)b=Math.max(b,r.score)});return b}
  function pitchBest(){const p=ser().pitch;return p&&typeof p.score==="number"?p.score:0}
  if(typeof myStats==="function"){const _ms=myStats;myStats=function(){const o=_ms.apply(this,arguments);
    try{o.sd=eduOK()?domain():"";
      const cs=caseBest(),ps=pitchBest();
      o.ser={cs,ps,tk:(ser().pitch&&ser().pitch.tk)||"",dir:(ser().pitch&&ser().pitch.dir)||"",ok:ready()?1:0};
    }catch(e){}return o}}

  /* ---------- leaderboards ---------- */
  function rows(kind){ /* kind: cs | ps */
    const list=(typeof PLAYERS!=="undefined"?PLAYERS.slice():[]);
    if(typeof myId!=="undefined"&&myId&&!list.find(p=>p.id===myId)&&typeof myStats==="function")list.push({id:myId,...myStats()});
    return list.filter(p=>p.sd&&p.ser&&p.ser.ok&&p.ser[kind]>0).map(p=>({id:p.id,sd:p.sd,school:p.school||"",score:p.ser[kind],tk:p.ser.tk,dir:p.ser.dir}))}
  function schoolBoard(kind){const g={};
    rows(kind).forEach(r=>{(g[r.sd]=g[r.sd]||{sd:r.sd,names:{},s:[]}).s.push(r.score);if(r.school)g[r.sd].names[r.school]=(g[r.sd].names[r.school]||0)+1});
    return Object.values(g).map(x=>{const top=x.s.sort((a,b)=>b-a).slice(0,5);
      const name=Object.entries(x.names).sort((a,b)=>b[1]-a[1])[0];
      return{sd:x.sd,name:name?name[0]:x.sd,n:x.s.length,best:top[0],avg:Math.round(top.reduce((a,b)=>a+b,0)/top.length*10)/10}})
      .sort((a,b)=>b.avg-a.avg||b.n-a.n)}

  /* ---------- time ---------- */
  function parts(ms){ms=Math.max(0,ms);const s=Math.floor(ms/1000);return{d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60}}
  const pad=n=>String(n).padStart(2,"0");
  function target(){const p=phase();return p==="pre"?SERIES.start:p==="live"?SERIES.end:0}

  /* ---------- styles ---------- */
  const st=document.createElement("style");st.textContent=`
.sr-ban{position:relative;overflow:hidden;border-radius:18px;margin:0 0 20px;padding:24px 26px;color:#fff;background:radial-gradient(700px 360px at 100% -10%,rgba(245,184,61,.22),transparent 60%),linear-gradient(135deg,#07122b,#14275a);border:1px solid #243a73}
.sr-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-family:var(--mono);font-size:11.5px;letter-spacing:.14em;text-transform:uppercase;color:#f5b83d;font-weight:700}
.sr-live{display:inline-flex;align-items:center;gap:7px;background:rgba(255,64,64,.14);color:#ff6b6b;border:1px solid rgba(255,64,64,.45);border-radius:999px;padding:3px 10px}
.sr-live i{width:8px;height:8px;border-radius:50%;background:#ff4040;box-shadow:0 0 0 0 rgba(255,64,64,.7);animation:srPulse 1.4s infinite}
.sr-live.pre{color:#f5b83d;background:rgba(245,184,61,.12);border-color:rgba(245,184,61,.45)}.sr-live.pre i{background:#f5b83d;animation:none}
.sr-live.end{color:#9fb0d0;background:rgba(159,176,208,.12);border-color:rgba(159,176,208,.35)}.sr-live.end i{background:#9fb0d0;animation:none}
@keyframes srPulse{70%{box-shadow:0 0 0 9px rgba(255,64,64,0)}100%{box-shadow:0 0 0 0 rgba(255,64,64,0)}}
.sr-ban h2{margin:12px 0 6px;font-family:var(--body);font-size:clamp(26px,4.4vw,40px);line-height:1.05;letter-spacing:-.02em;font-weight:900;text-transform:none;color:#fff}
.sr-ban h2 em{font-style:normal;color:#f5b83d}
.sr-sub{margin:0;max-width:560px;font-size:14.5px;line-height:1.5;color:#c6d2ea}
.sr-clock{display:flex;gap:10px;margin:18px 0 6px}
.sr-box{flex:1;max-width:96px;min-width:62px;text-align:center;border-radius:12px;padding:10px 4px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14)}
.sr-box b{display:block;font-family:var(--mono);font-size:clamp(24px,5vw,34px);line-height:1.05;font-variant-numeric:tabular-nums;color:#fff}
.sr-box span{font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#9fb0d0}
.sr-cap{font-size:12px;color:#9fb0d0;margin:0 0 14px}
.sr-act{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
.sr-btn{font:inherit;font-weight:800;font-size:15px;border:0;border-radius:11px;padding:12px 20px;cursor:pointer;background:#f5b83d;color:#07122b}
.sr-btn.ghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.35)}
.sr-btn:hover{filter:brightness(1.08)}
.sr-steps{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.sr-chip{font-size:12px;font-weight:700;border-radius:999px;padding:5px 11px;border:1px solid rgba(255,255,255,.25);color:#c6d2ea}
.sr-chip.on{background:rgba(47,224,138,.15);border-color:rgba(47,224,138,.55);color:#2fe08a}
.sr-chip.now{border-color:#f5b83d;color:#f5b83d}
/* panel */
.sr-pn h2{font-size:26px;margin:2px 0 6px;text-transform:none}
.sr-prog{display:flex;gap:6px;margin:14px 0 18px}.sr-prog i{flex:1;height:5px;border-radius:3px;background:var(--rule)}.sr-prog i.on{background:var(--cobalt)}
.sr-kv{font-size:13px;color:var(--ink-2);margin:0 0 12px}.sr-kv b{color:var(--ink)}
.sr-in{width:100%;font:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--rule);border-radius:9px;background:var(--paper);color:var(--ink);margin:4px 0 10px}
textarea.sr-in{min-height:120px;resize:vertical;line-height:1.45}
.sr-lab{font-size:12.5px;font-weight:600;color:var(--ink-2)}
.sr-row{display:flex;align-items:center;gap:10px;border:1px solid var(--rule);border-radius:12px;padding:10px 12px;margin:8px 0;background:var(--sheet)}
.sr-row .t{flex:1;min-width:0}.sr-row b{display:block;font-size:14.5px}.sr-row small{font-size:12px;color:var(--ink-2)}
.sr-ok{display:inline-block;font-size:11px;font-weight:800;color:var(--good,#1e8e3e);border:1px solid currentColor;border-radius:999px;padding:1px 8px;margin-left:6px}
.sr-msg{font-size:13px;margin:6px 0;color:var(--ink-2)}.sr-msg.err{color:var(--bad,#c0392b)}
.sr-trk{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
@media(max-width:520px){.sr-trk{grid-template-columns:1fr}}
.sr-tk{border:1px solid var(--rule);border-radius:14px;padding:14px;background:var(--sheet);text-align:left;cursor:pointer;font:inherit;color:var(--ink)}
.sr-tk:hover{border-color:var(--cobalt)}.sr-tk b{display:block;font-size:16px}.sr-tk span{font-size:12.5px;color:var(--ink-2)}
.sr-tbl{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px}.sr-tbl th{text-align:left;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2);padding:6px 8px;border-bottom:1px solid var(--rule)}
.sr-tbl td{padding:9px 8px;border-bottom:1px solid var(--rule)}.sr-tbl tr.me td{background:var(--cobalt-soft,rgba(40,80,200,.08));font-weight:700}
.sr-res{border:1px solid var(--rule);border-radius:12px;padding:14px;margin-top:12px;background:var(--sheet)}.sr-res .big{font-family:var(--mono);font-size:34px;font-weight:800;color:var(--cobalt)}

.sr-ban{display:flex;align-items:center;flex-wrap:wrap;gap:12px 22px;padding:12px 16px;margin:0 0 14px;border-radius:14px}
.sr-ban .sr-l{flex:1 1 280px;min-width:0}
.sr-ban .sr-top{font-size:10.5px;gap:8px}
.sr-ban .sr-live{padding:2px 8px}
.sr-h{margin:5px 0 0;font-size:19px;line-height:1.15;font-weight:900;letter-spacing:-.01em;color:#fff}
.sr-h em{font-style:normal;color:#f5b83d}
.sr-h small{display:block;font-size:12px;font-weight:500;letter-spacing:0;color:#9fb0d0;margin-top:3px}
.sr-ban .sr-clock{margin:0;gap:6px}
.sr-ban .sr-box{min-width:44px;max-width:54px;padding:4px 2px;border-radius:9px}
.sr-ban .sr-box b{font-size:18px}
.sr-ban .sr-box span{font-size:8.5px}
.sr-ban .sr-act{margin:0;gap:8px;flex-wrap:nowrap}
.sr-ban .sr-btn{font-size:13.5px;padding:9px 14px;border-radius:9px;white-space:nowrap}
@media(max-width:560px){.sr-ban{padding:10px 12px}.sr-ban .sr-clock{order:3}.sr-ban .sr-act{order:2}.sr-h{font-size:17px}}
`;document.head.appendChild(st);

  /* ---------- home banner ---------- */
  function bannerHTML(){const p=phase(),n=step(),done=ready();
    const badge=p==="live"?`<span class="sr-live"><i></i>LIVE</span>`:p==="pre"?`<span class="sr-live pre"><i></i>OPENS SOON</span>`:`<span class="sr-live end"><i></i>FINAL</span>`;
    const clock=p==="ended"?"":`<div class="sr-clock" id="srClock" title="${p==="pre"?"Opens":"Closes"} ${new Date(p==="pre"?SERIES.start:SERIES.end).toLocaleString([],{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"})}">${["d","h","m","s"].map((k,i)=>`<div class="sr-box"><b data-k="${k}">00</b><span>${["day","hr","min","sec"][i]}</span></div>`).join("")}</div>`;
    const btn=p==="ended"?`<button class="sr-btn" data-sr="board">Final results</button>`
      :done?`<button class="sr-btn" data-sr="hub">${p==="live"?"Enter":"You're in"}</button>`
      :`<button class="sr-btn" data-sr="begin">${n===1&&!sess()?"Begin":"Continue · step "+n+" of 4"}</button>`;
    return `<div class="sr-l"><div class="sr-top">${badge}<span>${E(SERIES.name)} · 2 weeks only</span></div>
      <div class="sr-h">Rep your school. <em>Win the Cup.</em><small>Case comp + stock pitch. .edu sign-in and official club required.</small></div></div>
      ${clock}<div class="sr-act">${btn}${p==="ended"?"":`<button class="sr-btn ghost" data-sr="board">Leaderboard</button>`}</div>`}
  function paintBanner(){const home=q('section.view[data-view="home"]');if(!home)return;let b=q("#seriesBanner");
    if(!b){b=document.createElement("section");b.id="seriesBanner";b.className="sr-ban";b.dataset.sig="";home.insertBefore(b,home.firstChild);
      b.addEventListener("click",e=>{const a=e.target.closest("[data-sr]");if(!a)return;const k=a.dataset.sr;
        if(k==="begin")onboard();else if(k==="hub")hub("overview");else if(k==="board")hub("schools")})}
    const sig=[phase(),step(),sess()?1:0].join("|");
    if(b.dataset.sig!==sig){b.innerHTML=bannerHTML();b.dataset.sig=sig}
    tick()}
  function tick(){const p=phase();const t=target();
    const cap=q("#srCap");if(cap)cap.textContent=p==="pre"?"Competition opens "+new Date(SERIES.start).toLocaleString([],{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"})+". Register now.":"Closes "+new Date(SERIES.end).toLocaleString([],{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit",timeZoneName:"short"})+".";
    if(!t)return;const v=parts(t-Date.now());
    document.querySelectorAll("#srClock [data-k],#srHubClock [data-k]").forEach(el=>{const k=el.dataset.k;el.textContent=k==="d"?String(v.d):pad(v[k])})}
  setInterval(paintBanner,1000);

  /* ---------- onboarding (the gate) ---------- */
  function prog(n){return `<div class="sr-prog">${[1,2,3,4].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}</div>`}
  function onboard(force){const n=force||step();
    if(n===1)return stepAccount();if(n===2)return stepSchool();if(n===3)return stepClub();return stepGo()}

  function stepAccount(){
    let body;
    if(!sess()){
      body=`<h2>Step 1: sign in with your school email</h2><p class="sr-kv">The Series is for verified students only. Create a free account with your <b>.edu</b> email, confirm it from the email we send, then come back and hit Continue.</p>
        <div class="sr-act"><button class="sr-btn" id="srUp">Create account</button><button class="sr-btn ghost" style="color:var(--ink);border-color:var(--rule)" id="srIn">I have an account</button></div>`}
    else if(!/@[^@]+\.edu$/i.test(email())){
      body=`<h2>Use your school email</h2><p class="sr-kv">You're signed in as <b>${E(email())}</b>, which isn't a .edu address. To compete, create an account with your school email.</p>
        <div class="sr-act"><button class="sr-btn" id="srOut">Sign out and use my .edu</button></div>`}
    else{
      body=`<h2>Confirm your school email</h2><p class="sr-kv"><b>${E(email())}</b> isn't confirmed yet. Open the confirmation email, click the link, then sign in again.</p>
        <div class="sr-act"><button class="sr-btn" id="srOut">Sign out</button></div>`}
    openPanel(`<div class="sr-pn"><div class="label">${E(SERIES.name)}</div>${prog(1)}${body}</div>`);
    const up=q("#srUp"),inn=q("#srIn"),out=q("#srOut");
    if(up)up.onclick=()=>{closePanel();window.maOpenAuth&&maOpenAuth("up")};
    if(inn)inn.onclick=()=>{closePanel();window.maOpenAuth&&maOpenAuth("in")};
    if(out)out.onclick=async()=>{try{await window.MA_AUTH.sb.auth.signOut()}catch(e){}closePanel();setTimeout(()=>window.maOpenAuth&&maOpenAuth("up"),400)}}

  function stepSchool(){
    openPanel(`<div class="sr-pn"><div class="label">${E(SERIES.name)}</div>${prog(2)}<h2>Step 2: your school</h2>
      <p class="sr-kv">Verified: <b>${E(email())}</b> <span class="sr-ok">✓ .edu</span></p>
      <label class="sr-lab">School name</label><input class="sr-in" id="srSch" placeholder="e.g. The Ohio State University" value="${E(S.profile.school||"")}" autocomplete="organization">
      <div class="sr-msg" id="srM"></div><div class="sr-act"><button class="sr-btn" id="srGo">Save and continue</button></div></div>`);
    q("#srGo").onclick=()=>{const v=q("#srSch").value.trim();if(v.length<3){q("#srM").className="sr-msg err";q("#srM").textContent="Enter your school's name.";return}
      S.profile.school=v;try{S.settings.noSchool=false}catch(e){}save();try{syncProfile()}catch(e){}onboard()}}

  function clubsAtMySchool(){const d=domain(),seen={},list=[];
    (typeof PLAYERS!=="undefined"?PLAYERS:[]).forEach(p=>{if(p.clubOfficer&&p.club&&p.sd===d&&!seen[p.club]){seen[p.club]=1;
      list.push({code:p.club,name:p.clubName||"School club",members:PLAYERS.filter(x=>x.club===p.club).length})}});
    return list}
  function joinClub(code,name){try{maJoinClub(code,name)}catch(e){S.club={code,name,officer:false};save();try{syncProfile()}catch(x){}}
    S.club=S.club||{};S.club.sd=domain();save();try{syncProfile()}catch(e){}}
  function stepClub(){const list=clubsAtMySchool();
    openPanel(`<div class="sr-pn"><div class="label">${E(SERIES.name)}</div>${prog(3)}<h2>Step 3: join your school's official club</h2>
      <p class="sr-kv">You compete as part of a club at <b>${E(S.profile.school)}</b> (${E(domain())}). Clubs here were created by verified students from your school.</p>
      ${list.length?list.map(c=>`<div class="sr-row"><div class="t"><b>${E(c.name)}<span class="sr-ok">✓ ${E(domain())}</span></b><small>${c.members} member${c.members===1?"":"s"}</small></div><button class="sr-btn" data-j="${E(c.code)}" data-n="${E(c.name)}">Join</button></div>`).join("")
        :`<p class="sr-msg">No club from ${E(domain())} is registered yet. Register yours below, or ask your club officer to.</p>`}
      <label class="sr-lab">Have a club code?</label><div style="display:flex;gap:8px"><input class="sr-in" id="srCode" placeholder="6-letter code" maxlength="8" style="margin:4px 0 10px"><button class="sr-btn" id="srCodeGo" style="margin:4px 0 10px">Join</button></div>
      <hr style="border:0;border-top:1px solid var(--rule);margin:10px 0 14px">
      <label class="sr-lab">Officer or founder? Register your club</label><input class="sr-in" id="srNew" placeholder="e.g. Buckeye Capital Investors">
      <label class="sr-lab" style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="srOff"> I'm an officer or founder of this club</label>
      <div class="sr-msg" id="srM"></div><div class="sr-act"><button class="sr-btn ghost" style="color:var(--ink);border-color:var(--rule)" id="srReg">Register club</button></div></div>`);
    const err=t=>{const m=q("#srM");m.className="sr-msg err";m.textContent=t};
    document.querySelectorAll("[data-j]").forEach(b=>b.onclick=()=>{joinClub(b.dataset.j,b.dataset.n);onboard()});
    q("#srCodeGo").onclick=()=>{const c=q("#srCode").value.trim().toLowerCase();if(!/^[a-z0-9]{4,8}$/.test(c)){err("Enter the code your club officer shared.");return}
      const o=officerOf(c);if(!o){err("Club not found. Ask the officer to open M&A Prep once so it shows up.");return}
      if(o.sd!==domain()){err(o.sd?"That club belongs to a different school.":"That club's school isn't verified yet. Ask the officer to open M&A Prep once.");return}
      joinClub(c,o.clubName||"School club");onboard()};
    q("#srReg").onclick=()=>{const n=q("#srNew").value.trim();if(n.length<3){err("Name your club first.");return}
      if(!q("#srOff").checked){err("Only an officer or founder can register a club. Everyone else joins one.");return}
      if(list.some(c=>c.name.toLowerCase()===n.toLowerCase())){err("That club already exists. Join it above.");return}
      S.club={code:typeof randCode==="function"?randCode(6):Math.random().toString(36).slice(2,8),name:n,officer:true,sd:domain()};save();try{syncProfile()}catch(e){}onboard()}}

  function stepGo(){ser().joined=ser().joined||Date.now();save();
    const p=phase();
    openPanel(`<div class="sr-pn"><div class="label">${E(SERIES.name)}</div>${prog(4)}<h2>You're in. Pick your event.</h2>
      <p class="sr-kv"><b>${E(S.profile.school)}</b> · ${E(S.club.name||"your club")} <span class="sr-ok">✓ verified</span></p>
      ${p==="pre"?`<p class="sr-msg">Registered. Competition opens ${new Date(SERIES.start).toLocaleString([],{weekday:"long",hour:"numeric",minute:"2-digit",timeZoneName:"short"})}. Come back then.</p>`:""}
      ${p==="ended"?`<p class="sr-msg">The Series has ended. See the final results.</p>`:""}
      <div class="sr-trk"><button class="sr-tk" data-go="case"><b>Case Competition</b><span>Solve a real M&A case. Graded 0-100 by AI judges.</span></button>
      <button class="sr-tk" data-go="pitch"><b>Stock Pitch</b><span>Long or short. Thesis, valuation, risk. Graded 0-100.</span></button></div>
      <div class="sr-act"><button class="sr-btn ghost" style="color:var(--ink);border-color:var(--rule)" data-go="board">School leaderboard</button></div></div>`);
    document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{const k=b.dataset.go;
      if(k==="board")return hub("schools");
      if(phase()!=="live"){toast(phase()==="pre"?"Opens "+new Date(SERIES.start).toLocaleString([],{weekday:"short",hour:"numeric",minute:"2-digit"}):"The Series has ended");return}
      if(k==="pitch")return pitch();
      closePanel();try{runAct("sub|practice|cases")}catch(e){try{showTab("practice")}catch(x){}}})}

  /* ---------- hub: overview + school leaderboards ---------- */
  let hubTab="overview";
  function boardTable(kind){const b=schoolBoard(kind),mine=domain();
    return b.length?`<table class="sr-tbl"><thead><tr><th>#</th><th>School</th><th>Entries</th><th>Top</th><th>School score</th></tr></thead><tbody>${b.map((x,i)=>`<tr class="${x.sd===mine?"me":""}"><td>${i+1}</td><td>${E(x.name)}</td><td>${x.n}</td><td>${x.best}</td><td><b>${x.avg}</b></td></tr>`).join("")}</tbody></table><p class="sr-kv" style="margin-top:10px">School score = average of its top 5 entries. Only verified .edu students in official school clubs count.</p>`
      :`<p class="sr-msg">No schools on the board yet. Be the first to put yours up.</p>`}
  function hub(tab){hubTab=tab||hubTab;const p=phase();
    const tabs=[["overview","Overview"],["schools","Case boards"],["pitch","Pitch boards"]].map(([k,l])=>`<button class="chip" data-ht="${k}" aria-pressed="${k===hubTab||(hubTab==="schools"&&k==="schools")}">${l}</button>`).join(" ");
    let body;
    if(hubTab==="overview"){const cs=caseBest(),pb=ser().pitch;
      body=`${p==="ended"?"":`<div class="sr-clock" id="srHubClock" style="display:flex;gap:10px;margin:8px 0 12px">${["d","h","m","s"].map((k,i)=>`<div class="sr-box" style="background:var(--sheet);border-color:var(--rule)"><b data-k="${k}" style="color:var(--ink)">00</b><span style="color:var(--ink-2)">${["days","hrs","min","sec"][i]}</span></div>`).join("")}</div><p class="sr-kv">${p==="pre"?"until the competition opens":"until the Series closes"}</p>`}
        <div class="sr-res"><div class="sr-lab">Your Case score</div><div class="big">${cs||"—"}</div></div>
        <div class="sr-res"><div class="sr-lab">Your Stock Pitch score${pb&&pb.tk?" ("+E(pb.dir)+" "+E(pb.tk)+")":""}</div><div class="big">${pitchBest()||"—"}</div></div>
        <div class="sr-act" style="margin-top:12px">${ready()?`<button class="sr-btn" data-hg="case">Case Competition</button><button class="sr-btn" data-hg="pitch">Stock Pitch</button>`:`<button class="sr-btn" data-hg="on">Finish setup</button>`}</div>`}
    else body=boardTable(hubTab==="pitch"?"ps":"cs");
    openPanel(`<div class="sr-pn"><div class="label">${E(SERIES.name)}</div><h2>${p==="ended"?"Final results":"The Series"}</h2><div style="display:flex;gap:6px;flex-wrap:wrap;margin:10px 0">${tabs}</div>${body}</div>`);
    document.querySelectorAll("[data-ht]").forEach(b=>b.onclick=()=>hub(b.dataset.ht));
    document.querySelectorAll("[data-hg]").forEach(b=>b.onclick=()=>{const k=b.dataset.hg;if(k==="on")return onboard();
      if(p!=="live"){toast(p==="pre"?"The competition hasn't opened yet":"The Series has ended");return}
      if(k==="pitch")return pitch();closePanel();try{runAct("sub|practice|cases")}catch(e){try{showTab("practice")}catch(x){}}});
    tick()}

  /* ---------- stock pitch ---------- */
  const wc=s=>(s.trim().match(/\S+/g)||[]).length;
  function pitch(){
    if(!eligible()){if(phase()==="live")return onboard();toast(phase()==="pre"?"The competition hasn't opened yet":"The Series has ended");return}
    const sp=ser().pitch||{},used=sp.tries||0;
    openPanel(`<div class="sr-pn"><div class="label">${E(SERIES.name)} · Stock Pitch</div><h2>Pitch a stock</h2>
      <p class="sr-kv">Long or short, one stock. ${used}/${SERIES.pitchTries} submissions used. Your best score counts.</p>
      <div style="display:flex;gap:10px"><div style="flex:1"><label class="sr-lab">Ticker</label><input class="sr-in" id="spT" maxlength="6" placeholder="AAPL" value="${E(sp.tk||"")}"></div>
      <div style="flex:1"><label class="sr-lab">Direction</label><select class="sr-in" id="spD"><option>Long</option><option ${sp.dir==="Short"?"selected":""}>Short</option></select></div>
      <div style="flex:1"><label class="sr-lab">Price target ($)</label><input class="sr-in" id="spP" inputmode="decimal" placeholder="250" value="${E(sp.pt||"")}"></div></div>
      <label class="sr-lab">Thesis and valuation (80-350 words)</label><textarea class="sr-in" id="spX" placeholder="Why this stock, what it's worth, and what the market is missing. Use numbers.">${E(sp.thesis||"")}</textarea>
      <label class="sr-lab">Biggest risk and how you'd manage it (20+ words)</label><textarea class="sr-in" id="spR" style="min-height:70px">${E(sp.risk||"")}</textarea>
      <div class="sr-msg" id="spM"></div><div class="sr-act"><button class="sr-btn" id="spGo" ${used>=SERIES.pitchTries?"disabled":""}>Submit pitch</button></div><div id="spOut"></div></div>`);
    q("#spGo").onclick=submitPitch}
  async function submitPitch(){
    const m=q("#spM"),err=t=>{m.className="sr-msg err";m.textContent=t};
    const tk=q("#spT").value.trim().toUpperCase().replace(/[^A-Z.]/g,""),dir=q("#spD").value,pt=q("#spP").value.trim().replace(/[^0-9.]/g,""),th=q("#spX").value.trim(),rk=q("#spR").value.trim();
    if(!tk){err("Enter a ticker.");return}if(!pt||!(+pt>0)){err("Enter a price target.");return}
    const n=wc(th);if(n<80){err("Write at least 80 words on your thesis.");return}if(n>350){err("Keep the thesis under 350 words.");return}
    if(wc(rk)<20){err("Add a real risk, at least 20 words.");return}
    if(!eligible()){err("The Series isn't open for your account right now.");return}
    const used=(ser().pitch&&ser().pitch.tries)||0;if(used>=SERIES.pitchTries){err("You've used all your submissions.");return}
    try{await samplePromise}catch(e){}
    if(typeof SAMPLE==="undefined"||!SAMPLE){err("AI judging isn't available right now. Try again in a minute.");return}
    const btn=q("#spGo");btn.disabled=true;btn.textContent="The judges are reading…";m.textContent="";
    const prompt=`You are a panel of judges at a national undergraduate stock pitch competition (think buy-side analysts and PMs). Score this student's pitch strictly and fairly. Judge the quality of reasoning, valuation logic and risk thinking, not whether you personally expect the stock to rise or fall. Check that the price target is consistent with the stated numbers and direction. Reward specific, quantified, decisive pitches; penalize vague claims, hype, internal contradictions, and facts you are confident are wrong. A typical solid student pitch scores 55-70; 85+ is exceptional.

TICKER: ${tk}   DIRECTION: ${dir}   PRICE TARGET: $${pt}
THESIS AND VALUATION: """${th.slice(0,3000)}"""
RISK AND MITIGATION: """${rk.slice(0,1200)}"""

RUBRIC: thesis (clarity, edge, what the market is missing) 0-30; valuation (numbers, method, target consistency) 0-25; catalysts and analysis (what moves the stock, timing) 0-20; risks (real risks plus mitigation) 0-15; communication (concise, structured) 0-10.
Return ONLY JSON: {"parts":{"thesis":int,"valuation":int,"analysis":int,"risks":int,"communication":int},"verdict":"one short sentence","strengths":[1-3 short strings],"fixes":[1-3 short, specific strings],"judge_q":"one tough question a judge would ask"}`;
    const MAX={thesis:30,valuation:25,analysis:20,risks:15,communication:10};
    try{const r=await SAMPLE.json(prompt,{modelTier:"complex"});let tot=0;const pp={};
      Object.keys(MAX).forEach(k=>{const v=Math.max(0,Math.min(MAX[k],Math.round(+((r.parts||{})[k])||0)));pp[k]=v;tot+=v});
      const prev=ser().pitch||{},best=prev.score||0,tries=(prev.tries||0)+1;
      const keep=tot>=best;
      ser().pitch=keep?{tk,dir,pt,thesis:th,risk:rk,score:tot,parts:pp,verdict:r.verdict||"",at:Date.now(),tries}:{...prev,tries};
      save();try{syncProfile()}catch(e){}
      q("#spOut").innerHTML=`<div class="sr-res"><div class="sr-lab">${keep?"Your score":"Scored "+tot+". Your best ("+best+") still counts."}</div><div class="big">${tot}/100</div><p class="sr-kv">${E(r.verdict||"")}</p>
        ${(r.strengths||[]).slice(0,3).map(s=>`<div class="sr-msg">✓ ${E(s)}</div>`).join("")}${(r.fixes||[]).slice(0,3).map(s=>`<div class="sr-msg">→ ${E(s)}</div>`).join("")}
        ${r.judge_q?`<p class="sr-kv" style="margin-top:8px"><b>Judge's question:</b> ${E(r.judge_q)}</p>`:""}</div>`;
      btn.textContent="Submit pitch";btn.disabled=tries>=SERIES.pitchTries;toast("Scored "+tot+"/100");
    }catch(e){btn.disabled=false;btn.textContent="Try again";err(e&&e.code==="rate_limited"?"The judges are busy. Try again in a minute.":"Couldn't grade right now. Your pitch wasn't counted; try again.")}}

  /* ---------- gate the case competition ---------- */
  if(typeof submitCase==="function"){const _sc=submitCase;submitCase=function(c,f,practice){
    if(!practice&&phase()!=="ended"){
      if(!ready()){onboard();return Promise.resolve()}
      if(phase()==="pre"){toast("The Series opens "+new Date(SERIES.start).toLocaleString([],{weekday:"short",hour:"numeric",minute:"2-digit"}));return Promise.resolve()}}
    return _sc.apply(this,arguments)}}

  /* ---------- boot ---------- */
  function boot(){paintBanner();
    const go=()=>{if(/^#series/i.test(location.hash)){history.replaceState(null,"",location.pathname+location.search);setTimeout(()=>{ready()?hub("overview"):onboard()},600)}};
    go();window.addEventListener("hashchange",go)}
  const A=window.MA_AUTH;
  if(A&&A.ready)A.ready.then(()=>setTimeout(boot,300));else boot();
  if(typeof render==="function"){const _r=render;render=function(){const x=_r.apply(this,arguments);try{paintBanner()}catch(e){}return x}}
})();
