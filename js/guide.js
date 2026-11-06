/* Guided start: new visitors see a calm Home with one "Start here" checklist and one big next-step button.
   Features unlock as they make progress, with a short note each time, so the app never dumps everything at once.
   Returning users with real progress (3+ levels) see the full app, unchanged. "Show me everything" turns this off. */
(function(){
  const LS=k=>{try{return localStorage.getItem(k)}catch(e){return null}},SET=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
  const $=s=>document.querySelector(s);
  const ok=()=>{try{return typeof S!=="undefined"&&S&&S.best}catch(e){return false}};
  const levels=()=>{try{let n=0;ORDER.forEach(t=>{n+=clearedCount(t)});return n}catch(e){return 0}};
  const signedIn=()=>!!(window.MA_AUTH&&MA_AUTH.session);
  const curveDone=()=>{try{return !!(S.cb&&S.cb.day)}catch(e){return false}};
  const off=()=>LS("ma-guide-off")==="1";
  /* what's unlocked at each point */
  const UNLOCKS=[
    {key:"compete",need:1,tabs:["compete"],msg:"Compete unlocked 🏆 Race friends and climb the leaderboard."},
    {key:"wire",need:2,els:["#newsBtn",".tape-wrap",".side-brief"],msg:"The Wire unlocked 📰 Daily market news in plain English."},
    {key:"career",need:3,tabs:["career"],msg:"Career tools unlocked 💼 Track applications, networking and deadlines."},
    {key:"extras",need:3,els:["#xpChip","#proBtn",".side-daily",".home-sec.side-up",".ladder",".mini",".stats","#quests"],msg:""}];
  let forced=false;
  function stage(){const n=levels();return off()||forced||n>=3?99:n}
  const STEPS=[
    {t:"Finish your first level",d:"5 minutes. Learn one idea, then answer a few questions.",done:()=>levels()>=1,go:()=>{try{const nx=nextPlanLevel();if(nx)showBrief(nx.tr,nx.i);else showTab("learn")}catch(e){showTab("learn")}},btn:"Start level 1"},
    {t:"Try today's curveball",d:"One weird interview question. No calculator.",done:curveDone,go:()=>{location.hash="curve"},btn:"Try it"},
    {t:"Build your plan",d:"3 quick questions, then a plan made for your goal.",done:()=>{try{return !!S.plan}catch(e){return false}},go:()=>{try{onboarding(true)}catch(e){}},btn:"Build my plan"},
    {t:"Save your progress",d:"Free account. Keeps your XP and streak on every device.",done:signedIn,go:()=>{const b=document.getElementById("authBtn");if(b)b.click()},btn:"Make a free account"},
    {t:"Finish 3 levels",d:"Unlocks everything: Compete, The Wire and Career tools.",done:()=>levels()>=3,go:()=>{try{const nx=nextPlanLevel();if(nx)showBrief(nx.tr,nx.i);else showTab("learn")}catch(e){showTab("learn")}},btn:"Keep going"}];
  const css=`.gd{border:1px solid var(--rule);border-radius:16px;background:var(--sheet);padding:18px 20px;margin:16px 0 4px;box-shadow:0 1px 0 var(--rule)}
.gd-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.gd-k{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass)}
.gd-n{font-family:var(--mono);font-size:12px;color:var(--ink-2)}.gd-bar{height:6px;border-radius:99px;background:color-mix(in srgb,var(--ink) 8%,transparent);margin:10px 0 14px;overflow:hidden}.gd-bar i{display:block;height:100%;background:var(--brass);border-radius:99px;transition:width .4s}
.gd-now{border:1px solid color-mix(in srgb,var(--cobalt) 35%,var(--rule));background:color-mix(in srgb,var(--cobalt) 5%,var(--paper));border-radius:12px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:14px}
.gd-now b{display:block;font-size:17px;color:var(--ink)}.gd-now span{font-size:13.5px;color:var(--ink-2)}.gd-now .btn{flex:none}
.gd-list{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:6px}.gd-list li{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--ink-2)}
.gd-list i{width:20px;height:20px;border-radius:50%;border:1.5px solid var(--rule);display:grid;place-items:center;font-style:normal;font-size:11px;flex:none}
.gd-list li.done{color:var(--ink-2);text-decoration:line-through;opacity:.7}.gd-list li.done i{background:var(--good);border-color:var(--good);color:#fff}.gd-list li.cur{color:var(--ink);font-weight:600}.gd-list li.cur i{border-color:var(--cobalt)}
.gd-foot{margin-top:12px;font-size:12.5px}.gd-foot button{background:none;border:0;padding:0;font:inherit;color:var(--ink-2);text-decoration:underline;cursor:pointer}
.gd-hide{display:none!important}
@media(max-width:520px){.gd-now{flex-direction:column;align-items:flex-start}.gd-now .btn{width:100%}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  function card(){const land=document.querySelector(".hl-land"),proof=land&&land.querySelector(".hl-proof"),compact=!!proof;
    if(land){const how=land.querySelector(".hl-how");if(how)how.classList.add("gd-hide")}
    const anchor=document.getElementById("continue");if(!anchor&&!proof)return;
    let el=document.getElementById("guideCard");const done=STEPS.map(s=>{try{return !!s.done()}catch(e){return false}}),n=done.filter(Boolean).length,cur=done.indexOf(false);
    if(stage()===0)SET("ma-guide-new","1");
    if(cur<0||off()||(stage()===99&&LS("ma-guide-new")!=="1")){if(el)el.remove();return}
    const s=STEPS[cur],sig=done.join("")+cur;
    if(!el){el=document.createElement("div");el.id="guideCard";el.className="gd"}
    if(compact){if(proof.nextElementSibling!==el)proof.after(el)}else if(anchor&&anchor.previousElementSibling!==el)anchor.before(el);
    const sig2=sig+(compact?"c":"");if(el.dataset.sig===sig2)return;el.dataset.sig=sig2;
    el.innerHTML=`<div class="gd-top"><span class="gd-k">Start here</span><span class="gd-n">${n} of ${STEPS.length} done</span></div><div class="gd-bar"><i style="width:${n/STEPS.length*100}%"></i></div>
      ${compact&&cur===0?"":`<div class="gd-now"><div><b>${s.t}</b><span>${s.d}</span></div><button class="btn" id="gdGo">${s.btn} →</button></div>`}
      <ul class="gd-list">${STEPS.map((x,i)=>`<li class="${done[i]?"done":i===cur?"cur":""}"><i>${done[i]?"✓":i+1}</i>${x.t}</li>`).join("")}</ul>
      <div class="gd-foot"><button type="button" id="gdAll">I've used this before, show me everything</button></div>`;
    {const gb=document.getElementById("gdGo");if(gb)gb.onclick=s.go}
    document.getElementById("gdAll").onclick=()=>{SET("ma-guide-off","1");apply();try{toast("Everything's unlocked. Have fun.")}catch(e){}}}

  function apply(){if(!ok())return;const sg=stage();
    UNLOCKS.forEach(u=>{const open=sg>=u.need;
      (u.tabs||[]).forEach(t=>document.querySelectorAll(`[data-tab="${t}"]`).forEach(b=>{if(b.classList.contains("view"))return;b.classList.toggle("gd-hide",!open)}));
      (u.els||[]).forEach(q=>document.querySelectorAll(q).forEach(e=>e.classList.toggle("gd-hide",!open)));
      if(open&&u.msg&&sg!==99&&LS("ma-unl-"+u.key)!=="1"){SET("ma-unl-"+u.key,"1");try{toast(u.msg)}catch(e){}}
      if(open)SET("ma-unl-"+u.key,"1")});
    /* calmer header copy for brand-new visitors */
    const g=document.getElementById("greet"),sub=document.getElementById("homeSub"),c=document.getElementById("continue"),f=document.getElementById("focus");
    if(sg===0){if(g){g.dataset.gd="1";if(g.textContent!=="Welcome to M&A Prep 👋")g.textContent="Welcome to M&A Prep 👋"}if(sub)sub.textContent="Learn investment banking and private equity in 5-minute levels. Start with step 1.";if(c)c.classList.add("gd-hide")}
    else{if(g&&g.dataset.gd==="1"){g.dataset.gd="";try{render()}catch(e){}}if(c)c.classList.toggle("gd-hide",sg<3)}
    card()}

  /* a deep link straight to a locked area (an invite, a shared link) opens everything for that visit */
  const h=(location.hash||"").slice(1).split(/[/?]/)[0];
  if(/^(compete|career|recruit|friends|leagues|lb|wire|news|club|stats|admin)/.test(h))forced=true;
  function start(){apply();setInterval(apply,1500);document.addEventListener("click",()=>setTimeout(apply,250))}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,100));else setTimeout(start,100);
})();
