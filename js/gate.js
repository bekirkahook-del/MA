/* Account + onboarding gate (Bekir, Nov 22, 2026: "Nobody can use any feature until they have an account and have
   finished onboarding").
   - No session          -> full-screen "Make my plan" (school, year / high school grade, what to pursue).
                            "Save my plan" keeps the answers in localStorage (ma-pending-plan) and opens sign-up (openAuth "up").
   - Session, pending plan -> after sign-up the page reloads; the answers are saved to the profile (save + syncSoon) and
                            the student lands on Home with a welcome and "what's next".
   - Session, no plan    -> "Make my plan" again, but Save finishes right away (no sign-up step).
   - Session + plan      -> straight to Home.
   While the gate is up, every tab / deep link / feature is blocked (showTab is wrapped, the page behind is inert). */
(function(){
  const PEND="ma-pending-plan",WEL="ma-welcome",TOK="sb-nbakxpnhcfzdosbzbupd-auth-token";
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},del:k=>{try{localStorage.removeItem(k)}catch(e){}}};
  const ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  /* the plan now comes first: the old "profile setup first" popup for brand-new accounts is retired */
  LS.set("ma-prof-first","1");
  const YEARS=["Freshman","Sophomore","Junior","Senior","High school"],GRADES=["9th","10th","11th","12th"];
  const ROLES=[["Investment banking","Investment banking"],["Private equity","Private equity"],["Hedge funds & markets","Hedge funds"],["Restructuring","Restructuring"],["Consulting","Consulting"]];

  const st=document.createElement("style");
  st.textContent=`html.gate-pre body>*:not(#mkPlan):not(.auth-ov){visibility:hidden}
body.gate-on{overflow:hidden}
#mkPlan{position:fixed;inset:0;z-index:9995;overflow:auto;background:var(--paper,#EEF1F5);color:var(--ink,#13203B);font-family:var(--body,system-ui,sans-serif);-webkit-overflow-scrolling:touch}
#mkPlan[hidden]{display:none}
.mp-wrap{max-width:560px;margin:0 auto;padding:calc(28px + env(safe-area-inset-top,0px)) 16px calc(40px + env(safe-area-inset-bottom,0px));box-sizing:border-box;min-height:100%;display:flex;flex-direction:column;justify-content:center}
.mp-top{display:flex;align-items:center;justify-content:space-between;margin:0 0 22px}
.mp-brand{font-weight:900;font-size:20px;letter-spacing:-.02em;color:var(--ink,#13203B)}.mp-brand span{color:var(--cobalt,#2448D8)}
.mp-in{font:inherit;font-size:14px;font-weight:600;background:none;border:1px solid var(--rule,#D3D9E4);color:var(--ink,#13203B);border-radius:999px;padding:7px 14px;cursor:pointer}
.mp-head{text-align:center;margin:0 0 18px}.mp-head .k{font:700 11.5px/1 var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:var(--cobalt,#2448D8)}
.mp-head h1{font-size:34px;line-height:1.1;margin:10px 0 8px;letter-spacing:-.02em}.mp-head p{margin:0;font-size:15.5px;color:var(--ink-2,#4A5672)}
.mp-card{background:var(--sheet,#fff);border:1px solid var(--rule,#D3D9E4);border-radius:8px;padding:22px 20px;box-shadow:0 14px 40px rgba(19,32,59,.08);display:flex;flex-direction:column;gap:18px}
.mp-f{display:flex;flex-direction:column;gap:8px}.mp-f>span{font-size:13px;font-weight:700;color:var(--ink-2,#4A5672);letter-spacing:.02em}
.mp-card input{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:12px 13px;border:1px solid var(--rule,#D3D9E4);border-radius:6px;background:var(--paper,#EEF1F5);color:var(--ink,#13203B)}
.mp-grid{display:grid;gap:8px}.mp-g5{grid-template-columns:repeat(5,1fr)}.mp-g4{grid-template-columns:repeat(4,1fr)}.mp-g2{grid-template-columns:1fr 1fr}.mp-g2 button:last-child{grid-column:1/-1}
.mp-grid button{font:inherit;font-size:14.5px;font-weight:600;min-height:46px;padding:8px 6px;border-radius:6px;border:1px solid var(--rule,#D3D9E4);background:var(--paper,#EEF1F5);color:var(--ink,#13203B);cursor:pointer;line-height:1.2}
#mkPlan .mp-grid button[aria-pressed=true]{background:var(--cobalt,#2448D8)!important;border-color:var(--cobalt,#2448D8)!important;color:#fff!important;opacity:1!important}
.mp-go{font:inherit;font-size:17px;font-weight:800;padding:15px;border:0;border-radius:6px;background:var(--cobalt,#2448D8);color:#fff;cursor:pointer;width:100%}
.mp-go:disabled{opacity:.45;cursor:not-allowed}
.mp-g{font:inherit;font-size:16px;font-weight:700;padding:13px;border:1px solid var(--rule,#D3D9E4);border-radius:6px;background:#fff;color:var(--ink,#13203B);cursor:pointer;width:100%;display:flex;align-items:center;justify-content:center;gap:10px}
.mp-g:disabled{opacity:.5;cursor:wait}
.mp-msg{min-height:18px;text-align:center;font-size:13.5px;color:#b3261e;margin:-6px 0 -8px}
.mp-foot{text-align:center;font-size:13px;color:var(--ink-2,#4A5672);margin:16px 0 0}
.mp-load{text-align:center;color:var(--ink-2,#4A5672);font-size:15px}
@media(max-width:560px){.mp-head h1{font-size:28px}.mp-g5{grid-template-columns:repeat(2,1fr)}.mp-g5 button:last-child{grid-column:1/-1}}
/* nudges and prompts never sit on top of the plan page */
body.gate-on .gw-tc,body.gate-on .gw-ov,body.gate-on .gw-bar,body.gate-on .ej-g,body.gate-on .em-sl,body.gate-on .rk-bar,body.gate-on .ra-card,body.gate-on .ux-hint,body.gate-on #overlay{display:none!important}
.mp-wel{border:1px solid var(--rule);background:var(--sheet);border-radius:8px;padding:18px 18px 16px;margin:14px 0;text-align:left}
.mp-wel h2{font-size:21px;margin:0 0 4px;letter-spacing:-.01em;text-transform:none}.mp-wel .sub{font-size:14px;color:var(--ink-2);margin:0 0 12px}
.mp-next{list-style:none;padding:0;margin:0;display:grid;gap:10px}
.mp-next li{display:grid;grid-template-columns:30px 1fr auto;gap:12px;align-items:center;padding:12px;border:1px solid var(--rule);border-radius:6px;background:var(--paper)}
.mp-next .n{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--cobalt);color:#fff;font-weight:800;font-size:14px}
.mp-next b{display:block;font-size:15px;color:var(--ink)}.mp-next small{display:block;font-size:13px;color:var(--ink-2);margin-top:2px}
.mp-next button{font:inherit;font-size:13.5px;font-weight:700;white-space:nowrap;padding:8px 12px;border-radius:6px;border:1px solid var(--cobalt);background:var(--cobalt);color:#fff;cursor:pointer}
.mp-wel .mp-edit{font:inherit;font-size:13px;background:none;border:0;color:var(--ink-2);text-decoration:underline;cursor:pointer;padding:0;margin-top:10px}
@media(max-width:560px){.mp-next li{grid-template-columns:30px 1fr}.mp-next button{grid-column:1/-1;width:100%}}`;
  document.head.appendChild(st);

  let state="checking";/* checking | gate | ok */
  const hasTok=()=>{try{const t=JSON.parse(LS.get(TOK)||"null");return !!(t&&(t.refresh_token||(t.currentSession&&t.currentSession.refresh_token)))}catch(e){return false}};
  const onboarded=()=>{try{return !!((S.onb&&S.onb.done)||(S.plan&&S.plan.order&&S.plan.year&&S.plan.target))&&complete()}catch(e){return false}};
  /* a name is required on every account; school and year are optional (Bekir, Nov 23, 2026) */
  const okName=v=>{v=String(v||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,40);return v.length>=2&&/[a-z]/i.test(v)?v:""};
  const complete=()=>{try{const pr=S.profile||{};return !!okName(pr.name)}catch(e){return false}};
  const metaName=()=>{try{const u=window.MA_AUTH&&MA_AUTH.session&&MA_AUTH.session.user,md=(u&&u.user_metadata)||{};return okName(LS.get("ma-pending-name"))||okName(md.full_name||md.name)}catch(e){return ""}};
  const pending=()=>{try{return JSON.parse(LS.get(PEND)||"null")}catch(e){return null}};

  /* ---------- the Make my plan page ---------- */
  let root=null,signed=false,editing=false;
  function build(){if(root)return root;root=document.createElement("div");root.id="mkPlan";root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-labelledby","mpTitle");root.hidden=true;document.body.appendChild(root);return root}
  function draw(mode){build();
    if(mode==="loading"){root.innerHTML=`<div class="mp-wrap"><p class="mp-load">Loading your account…</p></div>`;return}
    const p=pending()||{},pr=(typeof S!=="undefined"&&S.profile)||{},pl=(typeof S!=="undefined"&&S.plan)||{};
    let name=p.name||okName(pr.name)||metaName()||"",school=p.school||pr.school||window.MA_PLAN_PARAM||"",year=p.year||(YEARS.includes(pr.year)?pr.year:"")||"",grade=p.grade||pr.grade||"",
      role=p.role||(ROLES.some(r=>r[0]===pl.target)?pl.target:"");
    const names=window.maSchoolNames||[];
    root.innerHTML=`<div class="mp-wrap">
      <div class="mp-top"><div class="mp-brand">M<span>&amp;</span>A Prep</div>${signed?(editing?`<button type="button" class="mp-in" id="mpBack">Back</button>`:""):`<button type="button" class="mp-in" id="mpIn">Sign in</button>`}</div>
      <div class="mp-head"><span class="k">Free · 30 seconds</span><h1 id="mpTitle">${editing?"Edit my plan":"Make my plan"}</h1><p>Your step-by-step path to an offer, built around your school and your year.</p></div>
      <form class="mp-card" id="mpForm" novalidate>
        <label class="mp-f"><span>Your name</span><input id="mpNm" maxlength="40" placeholder="First and last name" autocomplete="name" value="${esc(name)}"></label>
        <label class="mp-f"><span>School <small style="font-weight:500">(optional)</small></span><input id="mpSch" list="mpSchL" maxlength="80" placeholder="e.g. Ohio State" autocomplete="organization" value="${esc(school)}"></label>
        <datalist id="mpSchL">${names.map(n=>`<option value="${esc(n)}">`).join("")}</datalist>
        <div class="mp-f"><span id="mpYl">Year <small style="font-weight:500">(optional)</small></span><div class="mp-grid mp-g5" role="group" aria-labelledby="mpYl">${YEARS.map(y=>`<button type="button" data-y="${y}" aria-pressed="${y===year}">${y}</button>`).join("")}</div></div>
        <div class="mp-f" id="mpGr" ${year==="High school"?"":"hidden"}><span id="mpGl">Grade</span><div class="mp-grid mp-g4" role="group" aria-labelledby="mpGl">${GRADES.map(g=>`<button type="button" data-g="${g}" aria-pressed="${g===grade}">${g}</button>`).join("")}</div></div>
        <div class="mp-f"><span id="mpRl">What do you want to pursue?</span><div class="mp-grid mp-g2" role="group" aria-labelledby="mpRl">${ROLES.map(r=>`<button type="button" data-r="${esc(r[0])}" aria-pressed="${r[0]===role}">${esc(r[1])}</button>`).join("")}</div></div>
        <p class="mp-msg" id="mpMsg" role="alert"></p>
        <button type="submit" class="mp-go" id="mpGo">${signed?"Save my plan →":"Save my plan →"}</button>
        ${signed?"":'<button type="button" class="mp-g" id="mpGg"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.5-4.1 7-10.2 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg> Continue with Google</button>'}
      </form>
      <p class="mp-foot">${signed?"Saved to your account. You can change it any time.":"Free account. No card. Your plan is saved when you sign up."}</p></div>`;
    const $=s=>root.querySelector(s),msg=$("#mpMsg");
    const pick=(sel,attr,val)=>root.querySelectorAll(sel).forEach(b=>b.setAttribute("aria-pressed",b.dataset[attr]===val));
    root.querySelectorAll("[data-y]").forEach(b=>b.onclick=()=>{year=b.dataset.y;pick("[data-y]","y",year);$("#mpGr").hidden=year!=="High school";if(year!=="High school")grade="";msg.textContent=""});
    root.querySelectorAll("[data-g]").forEach(b=>b.onclick=()=>{grade=b.dataset.g;pick("[data-g]","g",grade);msg.textContent=""});
    root.querySelectorAll("[data-r]").forEach(b=>b.onclick=()=>{role=b.dataset.r;pick("[data-r]","r",role);msg.textContent=""});
    const ib=$("#mpIn");if(ib)ib.onclick=()=>{ev("gate_signin");(window.maOpenAuth||(()=>{}))("in")};
    const bk=$("#mpBack");if(bk)bk.onclick=()=>{editing=false;hide()};
    /* one tap: same checks as "Save my plan", then straight to Google (the plan waits in localStorage and is saved after sign-in) */
    const gg=$("#mpGg");if(gg)gg.onclick=async()=>{
      const sc=$("#mpSch").value.trim().replace(/[<>]/g,"").slice(0,80),nm=okName($("#mpNm").value);
      if(!nm){msg.textContent="Add your name.";$("#mpNm").focus();return}
      if(year==="High school"&&!grade){msg.textContent="Pick your grade.";return}
      if(!role){msg.textContent="Pick what you want to pursue.";return}
      const m=sc&&window.maSchoolFind&&maSchoolFind(sc);
      LS.set(PEND,JSON.stringify({name:nm,school:(m&&m[0])||sc,year,grade:year==="High school"?grade:"",role,at:Date.now()}));
      ev("gate_plan_saved");ev("gate_google_click");ev("auth_oauth_google");LS.set("ma-gw-from","plan");
      const sbc=window.MA_AUTH&&MA_AUTH.sb;if(!sbc){msg.textContent="Sign-up is still loading. Try again in a second.";return}
      gg.disabled=true;const r=await sbc.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+"/"}});
      if(r&&r.error){gg.disabled=false;msg.textContent=r.error.message||"Google sign-in failed. Try again."}};
    $("#mpForm").onsubmit=e=>{e.preventDefault();
      const sc=$("#mpSch").value.trim().replace(/[<>]/g,"").slice(0,80);
      const nm=okName($("#mpNm").value);
      if(!nm){msg.textContent="Add your name.";$("#mpNm").focus();return}
      if(year==="High school"&&!grade){msg.textContent="Pick your grade.";return}
      if(!role){msg.textContent="Pick what you want to pursue.";return}
      const m=sc&&window.maSchoolFind&&maSchoolFind(sc);
      const plan={name:nm,school:(m&&m[0])||sc,year,grade:year==="High school"?grade:"",role,at:Date.now()};
      LS.set(PEND,JSON.stringify(plan));ev("gate_plan_saved");
      if(signed){finish(plan);return}
      ev("gate_signup_open");LS.set("ma-gw-from","plan");
      if(window.maOpenAuth)maOpenAuth("up");else msg.textContent="Sign-up is still loading. Try again in a second."}}

  /* ---------- save the plan to the profile ---------- */
  function apply(p){S.profile=S.profile||{};if(okName(p.name)){S.profile.name=okName(p.name);try{myName=S.profile.name}catch(e){}
      try{MA_AUTH.pushName&&MA_AUTH.pushName(S.profile.name)}catch(e){}LS.del("ma-pending-name");
      try{const u=MA_AUTH.session.user,md=u.user_metadata||{};if(md.full_name!==S.profile.name)MA_AUTH.sb.auth.updateUser({data:{full_name:S.profile.name,name:S.profile.name}})}catch(e){}}
    if(p.school)S.profile.school=p.school;if(p.year)S.profile.year=p.year;if(p.grade)S.profile.grade=p.grade;else delete S.profile.grade;
    S.profile.target=(ROLES.find(r=>r[0]===p.role)||[p.role,p.role])[1];S.profile._t=Date.now();
    const order=(typeof PLAN_ORDER!=="undefined"&&PLAN_ORDER[p.role])||(S.plan&&S.plan.order)||["f","b","ib"];
    S.plan={...(S.plan||{}),year:p.year||(S.plan&&S.plan.year)||"",target:p.role,order,focus:order.length,perWeek:(S.plan&&S.plan.perWeek)||5,created:(S.plan&&S.plan.created)||new Date().toISOString().slice(0,10)};
    S.onb={done:true,at:Date.now()};S.onboardSkip=false;
    try{maRoadBust()}catch(e){}try{save()}catch(e){}try{syncSoon()}catch(e){}}
  function finish(p){apply(p);LS.del(PEND);if(!editing)LS.set(WEL,"1");editing=false;ev("gate_onboarded");
    ["render","renderHome","renderRoad","renderPlan"].forEach(f=>{try{typeof window[f]==="function"&&window[f]()}catch(e){}});
    open_();try{origShowTab("home")}catch(e){}try{scrollTo(0,0)}catch(e){}}

  /* ---------- show / hide + guard ---------- */
  function inert(on){[...document.body.children].forEach(el=>{if(el.id==="mkPlan"||el.classList.contains("auth-ov")||el.classList.contains("ma-cn")||el.tagName==="SCRIPT"||el.tagName==="STYLE")return;
    if(on){if(!el.hasAttribute("inert")){el.setAttribute("inert","");el.dataset.gateInert="1"}}else if(el.dataset.gateInert){el.removeAttribute("inert");delete el.dataset.gateInert}})}
  function show(mode){build();draw(mode);root.hidden=false;document.body.classList.add("gate-on");document.documentElement.classList.remove("gate-pre");inert(true);
    if(mode!=="loading"){state=editing?"ok":"gate";if(!editing){try{const h=location.hash;if(h&&h!=="#plan")history.replaceState(null,"","/#plan");else if(!h)history.replaceState(null,"","/#plan")}catch(e){}}ev(editing?"gate_edit_open":"gate_shown")}}
  function hide(){if(root)root.hidden=true;document.body.classList.remove("gate-on");document.documentElement.classList.remove("gate-pre");inert(false)}
  function open_(){state="ok";hide();try{if(/^#plan$/.test(location.hash))history.replaceState(null,"","/#home")}catch(e){}}
  window.maEditPlan=()=>{editing=true;signed=true;show("form")};

  const origShowTab=window.showTab;
  if(typeof origShowTab==="function"){window.showTab=function(){if(state!=="ok"){if(state==="gate")show("form");return}return origShowTab.apply(this,arguments)};showTab=window.showTab}
  /* the old one-question-at-a-time onboarding popup is replaced by this page (forced calls like "change year" still work) */
  if(typeof window.onboarding==="function"){const o=window.onboarding;window.onboarding=function(force){if(!force)return;return o.apply(this,arguments)};onboarding=window.onboarding}
  window.addEventListener("hashchange",()=>{if(state==="gate")show("form")});

  /* ---------- decide ---------- */
  if(!hasTok()){document.documentElement.classList.add("gate-pre");signed=false;show("form")}else show("loading");
  setTimeout(()=>document.documentElement.classList.remove("gate-pre"),6000);
  const A=window.MA_AUTH;
  (A&&A.ready?A.ready:Promise.resolve(null)).then(s=>{signed=!!s;
    if(!s){show("form");return}
    /* signed in: wait for the account's progress to come down from the cloud before judging onboarding (new device) */
    const t0=Date.now();(function wait(){let done=true;try{done=typeof cloudState==="undefined"||cloudOn||cloudState==="error"||cloudState==="toobig"}catch(e){}
      if(!done&&Date.now()-t0<7000){setTimeout(wait,150);return}
      const p=pending();
      if(p&&p.role&&(okName(p.name)||okName((S.profile||{}).name)||metaName())){if(!okName(p.name))p.name=okName((S.profile||{}).name)||metaName();finish(p);return}
      if(onboarded()){open_();return}
      show("form")})()}).catch(()=>show("form"));

  /* ---------- Home: welcome + what's next (from the plan) ---------- */
  function trackFor(){try{const order=(S.plan&&S.plan.order)||["f"];for(const id of order){const tr=T(id);if(!tr)continue;let ok=true;try{ok=trackUnlocked(tr)}catch(e){}if(!ok)continue;
      for(let i=0;i<tr.levels.length;i++)if(!cleared(tr.id,i))return {tr,i}}}catch(e){}return null}
  function roadNext(){try{const yr=S.plan.year;const g=ROAD.find(g=>g.y===yr)||ROAD[0];const its=roadItems(g);return its.find(it=>!(S.road&&S.road[it.id]))||null}catch(e){return null}}
  /* Bekir, Nov 22, 2026: "Don't add something to the home page unless I say" - the welcome card is off */
  const WELCOME_CARD=false;
  function welcome(){const old=document.getElementById("mpWel");if(!WELCOME_CARD){if(old)old.remove();return}if(state!=="ok")return;const view=document.querySelector('[data-view="home"]');if(!view)return;let c=document.getElementById("mpWel");
    if(!(S.plan&&S.plan.year)){if(c)c.remove();return}
    /* first thing on Home: above the hero (new members) and above "Continue" (everyone) */
    const anchor=view.querySelector(".hero")||document.getElementById("continue");if(!anchor)return;
    if(!c){c=document.createElement("section");c.id="mpWel";c.className="mp-wel";c.setAttribute("aria-label","What's next")}
    if(anchor.previousElementSibling!==c)anchor.parentNode.insertBefore(c,anchor);
    const first=LS.get(WEL)==="1";let nm="";try{nm=((typeof myName!=="undefined"&&myName)||(S.profile&&S.profile.name)||"").split(" ")[0]}catch(e){}
    const pr=S.profile||{},yr=S.plan.year+(pr.grade?` (${pr.grade})`:""),role=(ROLES.find(r=>r[0]===S.plan.target)||[0,S.plan.target])[1];
    const lv=trackFor(),rd=roadNext();
    const items=[];
    if(lv)items.push({n:`${lv.tr.name}: Level ${lv.i+1}`,s:"5 minutes. Learn it, then answer real interview questions.",b:"Start",go:()=>{try{showBrief(lv.tr,lv.i)}catch(e){showTab("learn")}}});
    if(rd)items.push({n:rd.t,s:`Next step on your ${esc(pr.school||"")} roadmap`,b:"Open roadmap",go:()=>showTab("recruit")});
    const PL={"Freshman":"freshmen","Sophomore":"sophomores","Junior":"juniors","Senior":"seniors"};
    items.push({n:`Openings for ${S.plan.year==="High school"?"high schoolers (early insight)":PL[S.plan.year]||"your year"}`,s:"What's open now and what's closing soon",b:"See openings",go:()=>{showTab("career");try{showSub("career","open")}catch(e){}}});
    c.innerHTML=`<h2>${first?`Welcome to M&amp;A Prep${nm?", "+esc(nm):""}!`:`Welcome back${nm?", "+esc(nm):""}`}</h2>
      <p class="sub">Your plan: <b>${esc(role)}</b> · ${esc(yr)} · ${esc(pr.school||"")}. Here's what's next.</p>
      <ol class="mp-next">${items.slice(0,3).map((it,i)=>`<li><span class="n">${i+1}</span><span><b>${esc(it.n)}</b><small>${it.s}</small></span><button type="button" data-i="${i}">${it.b} →</button></li>`).join("")}</ol>
      <button type="button" class="mp-edit" id="mpEdit">Change my plan</button>`;
    c.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{ev("welcome_next_"+b.dataset.i);LS.del(WEL);items[+b.dataset.i].go()});
    c.querySelector("#mpEdit").onclick=()=>window.maEditPlan()}
  (function hook(n){if(typeof renderHome!=="function"){if(n<40)setTimeout(()=>hook(n+1),250);return}if(renderHome.__mp)return;
    const o=renderHome;renderHome=function(){const r=o.apply(this,arguments);try{welcome()}catch(e){}return r};renderHome.__mp=1;window.renderHome=renderHome;try{welcome()}catch(e){}})(0);
  const _open=open_;open_=function(){_open();try{welcome()}catch(e){}};
})();
