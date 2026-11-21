/* "Your deadlines" (Bekir, Nov 21, 2026: recruiting deadline alerts tied to the student's school and year).
   A Home card that matches the live openings list (APP_OPEN in app.js / The Wire) to the student:
   - year  -> which internship class they recruit for (sophomore -> 2028 summer, junior -> 2027 summer, ...)
   - role  -> plan target (IB, PE/buy side, consulting, markets); "Not sure" shows everything
   - school -> their school's own next step from the school plan (real clubs/programs from the guides; no invented dates)
   Sorted by urgency: closing soonest first, then open now, then expected to open. Dates come from the openings data
   only. Once a day per device, a heads-up toast if something they match closes within 3 days. */
(function(){
  const st=document.createElement("style");
  st.textContent=`.dl-card{border:1px solid var(--rule);background:var(--sheet);border-radius:8px;padding:16px 18px;margin:14px 0;text-align:left}
.dl-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap}
.dl-top b{font-size:17px;color:var(--ink)}.dl-top small{font-size:12.5px;color:var(--ink-2)}
.dl-list{list-style:none;padding:0;margin:10px 0 0}
.dl-list li{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;padding:9px 0;border-top:1px solid var(--rule)}
.dl-when{white-space:nowrap;font:700 11px/1.3 var(--mono,monospace);letter-spacing:.02em;padding:3px 7px;border-radius:5px;text-align:center;align-self:start}
.dl-when.hot{background:#fde8e5;color:#a3301f}.dl-when.soon{background:#fff3dc;color:#8a5a00}.dl-when.open{background:#e6f5ec;color:#1f6b40}.dl-when.exp{background:var(--paper);color:var(--ink-2);border:1px solid var(--rule)}
:root[data-theme="dark"] .dl-when.hot{background:#3a1d18;color:#f0998d}:root[data-theme="dark"] .dl-when.soon{background:#2a2314;color:#e9b65c}:root[data-theme="dark"] .dl-when.open{background:#15291f;color:#79D6A2}
.dl-f{font-weight:600;color:var(--ink);font-size:14.5px}.dl-r{font-size:13px;color:var(--ink-2)}
.dl-school{margin-top:10px;padding:10px 12px;border-radius:6px;background:var(--paper);border:1px solid var(--rule);font-size:13.5px;color:var(--ink)}
.dl-school b{color:var(--cobalt)}
.dl-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.dl-empty{font-size:14px;color:var(--ink-2);margin:10px 0 0}`;
  document.head.appendChild(st);
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
  const days=(a,b)=>Math.round((Date.parse(b+"T12:00:00")-Date.parse(a+"T12:00:00"))/864e5);
  const fmt=iso=>{const d=new Date(iso+"T12:00:00");return d.toLocaleDateString("en-US",{month:"short",day:"numeric"})};
  const ROLE={"Investment banking":["IB"],"Restructuring":["IB"],"Private equity":["Buy side"],"Hedge funds & markets":["Buy side","Markets"],"Equity research":["Markets","IB"],"Consulting":["Consulting"]};
  function who(){if(typeof S==="undefined")return null;const yr=(S.plan&&S.plan.year)||(S.profile&&S.profile.year)||"";
    const target=(S.plan&&S.plan.target)||"";const school=(S.profile&&S.profile.school)||"";if(!yr)return null;return {yr,target,school}}
  /* which listings fit this student's class year */
  function fitsYear(r,yr){const t=r[1]||"";const y=(t.match(/20\d\d/)||[])[0];
    if(yr==="Sophomore")return y==="2028"||(!y&&/sophomore/i.test(t));
    if(yr==="Junior")return y==="2027";
    if(yr==="Senior"||yr==="Grad / other")return y==="2027"&&!/summer/i.test(t);
    if(yr==="Freshman"||yr==="High school")return !y&&/freshman|first[- ]year|early insight|discovery/i.test(t);
    return false}
  function matches(){const w=who();if(!w||typeof APP_OPEN==="undefined")return {w,items:[]};const t=today(),types=ROLE[w.target];
    const items=APP_OPEN.filter(r=>fitsYear(r,w.yr)&&(!types||types.includes(r[2]))).map(r=>{
      if(r[3]==="open"&&r[6]){const n=days(t,r[6]);if(n<0)return null;return {r,rank:n,cls:n<=3?"hot":n<=14?"soon":"open",when:n===0?"Closes today":n===1?"Closes tomorrow":`Closes in ${n}d`,sub:`Closes ${fmt(r[6])}${r[7]?" · "+r[7]:""}`}}
      if(r[3]==="open")return {r,rank:1000,cls:"open",when:"Open now",sub:(r[5]||"Open")+(r[7]?" · "+r[7]:"")};
      if(r[3]==="exp"&&r[4]){const n=days(t,r[4]);return {r,rank:2000+Math.max(0,n),cls:"exp",when:n>0?`Opens ~${fmt(r[4])}`:"Opening soon",sub:"Expected"+(r[7]?" · "+r[7]:"")}}
      return null}).filter(Boolean).sort((a,b)=>a.rank-b.rank);
    return {w,items}}
  function schoolStep(w){try{if(!w.school||!window.maRoadSchool||!maRoadSchool())return null;const name=maRoadSchool()[0];
      const g=ROAD.find(g=>g.y===w.yr);if(!g)return null;const it=roadItems(g).find(x=>x.school);return it?{name,t:it.t}:null}catch(e){return null}}
  function draw(){const view=document.querySelector('[data-view="home"]');if(!view)return;let card=document.getElementById("dlCard");
    const {w,items}=matches();
    const land=document.getElementById("homeLand");const onLanding=land&&land.dataset.on&&land.classList.contains("sp-first");
    if(!w||onLanding){if(card)card.remove();return}
    if(!card){card=document.createElement("div");card.id="dlCard";card.className="dl-card"}
    /* signed-out landing: right under the hero/plan card; members: top of Home, above Continue */
    const spot=land&&land.dataset.on&&(land.querySelector(".sp-card")||land.querySelector(".hl-cta"));
    if(spot){if(spot.nextElementSibling!==card)spot.after(card)}
    else{const anchor=document.getElementById("continue");if(!anchor)return;if(anchor.previousElementSibling!==card)anchor.before(card)}
    const roleTxt=w.target&&w.target!=="Not sure yet"?w.target.toLowerCase():"all roles";
    const sc=schoolStep(w);const top=items.slice(0,5);
    card.innerHTML=`<div class="dl-top"><b>⏰ Your deadlines</b><small>${E(w.yr)} · ${E(roleTxt)}${w.school?" · "+E(w.school):""}</small></div>
      ${top.length?`<ul class="dl-list">${top.map(x=>`<li><span class="dl-when ${x.cls}">${E(x.when)}</span><span><span class="dl-f">${E(x.r[0])}</span> <span class="dl-r">${E(x.r[1])}</span><br><span class="dl-r">${E(x.sub)}</span></span></li>`).join("")}</ul>`
        :`<p class="dl-empty">${w.yr==="Freshman"||w.yr==="High school"?"Main internship applications open in your sophomore year. Early-insight programs for your year will show here as they're announced.":"Nothing matching your year and role is open right now. New openings show here the day they're added."}</p>`}
      ${sc?`<div class="dl-school">At <b>${E(sc.name)}</b>: ${E(sc.t)}</div>`:""}
      <div class="dl-acts">${items.length>5?`<button class="ghost" type="button" id="dlAll">See all ${items.length}</button>`:""}<button class="ghost" type="button" id="dlOpen">All openings</button><button class="ghost" type="button" id="dlEdit">Change year or role</button></div>`;
    const all=card.querySelector("#dlAll");if(all)all.onclick=()=>{ev("deadlines_all");const ul=card.querySelector(".dl-list");if(!ul)return;
      ul.innerHTML=items.map(x=>`<li><span class="dl-when ${x.cls}">${E(x.when)}</span><span><span class="dl-f">${E(x.r[0])}</span> <span class="dl-r">${E(x.r[1])}</span><br><span class="dl-r">${E(x.sub)}</span></span></li>`).join("");all.remove()};
    card.querySelector("#dlOpen").onclick=()=>{ev("deadlines_openings");try{showTab("career");showSub("career","open")}catch(e){}};
    card.querySelector("#dlEdit").onclick=()=>{ev("deadlines_edit");try{if(typeof onboarding==="function")onboarding(true)}catch(e){}};
    if(!card.dataset.seen){card.dataset.seen="1";ev("deadlines_shown")}
    /* heads-up once a day per device when something they match closes within 3 days */
    try{const hot=items.filter(x=>x.cls==="hot");const k="ma-dl-ping";if(hot.length&&localStorage.getItem(k)!==today()&&typeof toast==="function"){localStorage.setItem(k,today());
      const h=hot[0];setTimeout(()=>{try{toast(`⏰ ${h.r[0]} ${h.when.toLowerCase()}: ${h.r[1]}`)}catch(e){}},2500);ev("deadlines_ping")}}catch(e){}}
  function hook(n){if(typeof renderHome!=="function"){if(n<40)setTimeout(()=>hook(n+1),250);return}
    if(!renderHome.__dl){const o=renderHome;renderHome=function(){const r=o.apply(this,arguments);try{draw()}catch(e){}return r};renderHome.__dl=1}
    try{draw()}catch(e){}}
  hook(0);
})();
