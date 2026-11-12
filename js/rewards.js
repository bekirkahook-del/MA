/* ================= M&A: Career Ladder rewards + redesigned Pro page ================= */
(function(){
  if(typeof RANKS==="undefined"||typeof S==="undefined")return;
  const PRESTIGE_STEP=400,TOP=RANKS[RANKS.length-1][1];
  /* what each promotion unlocks (index = rank index) */
  const LADDER=[
    {ring:0,perks:[["🎓","Your training starts","Every track, the daily question and Rapid Fire. Free forever."]]},
    {ring:1,accent:"emerald",perks:[["🥉","Bronze ring","A bronze ring around your photo everywhere you appear."],["🎨","Emerald theme","A new accent color for the whole site."]]},
    {ring:1,shields:1,pass:1,perks:[["⭐","1 day of Pro, free","Try unlimited AI grading on us."],["🛡️","1 Streak Shield","Miss a day and your streak survives. Used automatically."]]},
    {ring:2,accent:"plum",perks:[["🥈","Silver ring","Upgrade from bronze. Shows on every board."],["🎨","Plum theme","Another accent color to make it yours."]]},
    {ring:2,shields:2,pass:2,perks:[["⭐","2 days of Pro, free","Another round of unlimited AI feedback."],["🛡️","2 more Streak Shields","Protects your streak through a busy week."]]},
    {ring:3,accent:"crimson",pass:3,perks:[["🥇","Gold ring","Rare air. Only a few reach Director."],["⭐","3 days of Pro, free","Every Pro feature, unlocked automatically."],["🎨","Crimson theme","A bold new accent color."]]},
    {ring:4,accent:"gold",pass:7,shields:3,perks:[["💎","Animated MD ring","The top ring on the site."],["⭐","7 days of Pro, free","A full week of unlimited grading and final rounds."],["🛡️","3 more Streak Shields","Plus 1 more every Prestige level after this."]]}
  ];
  const ACCENTS={cobalt:["Cobalt",0,"#2448D8","#E3E9FC","#7C97FF","#1E2A52"],emerald:["Emerald",1,"#0F7A55","#DDF3EA","#4FD1A0","#123A2D"],plum:["Plum",3,"#7A2FB5","#F0E4FA","#C79BFF","#33204A"],crimson:["Crimson",5,"#C0283C","#FBE3E6","#FF7D8C","#4A1A22"],gold:["Gold",6,"#A87B10","#F6ECD2","#E6BE5A","#3D3114"]};
  const RW=()=>{S.rw=S.rw||{};S.rw.got=S.rw.got||{};S.rw.shields=S.rw.shields||0;S.rw.used=S.rw.used||[];return S.rw};
  const myRank=()=>rankOf(totalXP());
  const prestige=x=>x>=TOP?Math.floor((x-TOP)/PRESTIGE_STEP):0;
    const ringTier=r=>(LADDER[r]||LADDER[0]).ring||0;
  const passLeft=()=>Math.max(0,Math.ceil(((RW().passUntil||0)-Date.now())/864e5));

  /* grant rewards for every rank reached (works retroactively for existing players) */
  function grant(){const w=RW(),r=myRank(),x=totalXP(),got=[];
    for(let i=1;i<=r;i++){if(w.got[i])continue;w.got[i]=Date.now();const L=LADDER[i];
      if(L.shields)w.shields+=L.shields;
      if(L.pass)w.passUntil=Math.max(w.passUntil||0,Date.now())+L.pass*864e5;
      got.push(i)}
    const pr=prestige(x);if((w.prestige||0)<pr){w.shields+=pr-(w.prestige||0);w.prestige=pr;got.push("p"+pr)}
    if(got.length)save();return got}

  /* Streak Shields: fill missed days right before today so the streak survives */
  function useShields(){const w=RW();if(!w.shields)return;const D=S.daily||{},key=d=>d.toLocaleDateString("en-CA");
    const d=new Date();d.setDate(d.getDate()-1);const miss=[];
    while(!(key(d)in D)&&miss.length<=w.shields&&miss.length<4){miss.push(key(d));d.setDate(d.getDate()-1)}
    if(!miss.length||miss.length>w.shields||!(key(d)in D))return;
    let run=0;const c=new Date(d);while(key(c)in D&&run<3){run++;c.setDate(c.getDate()-1)}if(run<2)return;
    miss.forEach(k=>{D[k]="shield";w.used.unshift(k)});w.shields-=miss.length;w.used=w.used.slice(0,20);save();
    setTimeout(()=>{try{toast(`🛡️ Streak Shield used. Your ${streak()}-day streak is safe.`)}catch(e){}},1200)}

  /* Pro pass from ranking up */
  {const _ip=isPro;isPro=function(){return _ip()||((S.rw&&S.rw.passUntil||0)>Date.now())};
   const _pl=proLabel;proLabel=function(){if(!_ip()&&passLeft())return `Pro pass · ${passLeft()} day${passLeft()===1?"":"s"} left`;return _pl()}}

  /* rings around avatars */
  {const _av=avatar;avatar=function(id,name,size){let h=_av(id,name,size);let r=0;
    try{if(id===myId||id==="me")r=myRank();else{const p=(typeof PLAYERS!=="undefined"?PLAYERS:[]).find(q=>q.id===id);r=p?p.rank||0:0}}catch(e){}
    const t=ringTier(r);return t?h.replace('class="av','class="av rr'+t):h}}

  /* accent themes */
  function applyAccent(){const k=RW().accent||"cobalt",a=ACCENTS[k]||ACCENTS.cobalt;let st=document.getElementById("rwAccent");
    if(!st){st=document.createElement("style");st.id="rwAccent";document.head.appendChild(st)}
    st.textContent=k==="cobalt"?"":`:root{--cobalt:${a[2]};--cobalt-soft:${a[3]}}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--cobalt:${a[4]};--cobalt-soft:${a[5]}}}
:root[data-theme="dark"]{--cobalt:${a[4]};--cobalt-soft:${a[5]}}`}

  /* ---------- confetti ---------- */
  function confetti(){if(fxCalm())return;const box=document.createElement("div");box.className="rw-conf";
    const cols=["var(--cobalt)","var(--brass)","var(--good)","#ff7d8c","#c79bff"];
    for(let i=0;i<70;i++){const p=document.createElement("i");p.style.cssText=`left:${Math.random()*100}%;background:${cols[i%5]};--dx:${(Math.random()-.5)*240}px;--r:${Math.random()*720-360}deg;animation-delay:${Math.random()*.35}s;animation-duration:${1.6+Math.random()*1.2}s;width:${6+Math.random()*6}px;height:${8+Math.random()*8}px`;box.appendChild(p)}
    document.body.appendChild(box);setTimeout(()=>box.remove(),3400)}

  /* promotion popup: show what unlocked */
  {const _fx=fxRankUp;fxRankUp=function(from,to){_fx(from,to);try{const i=RANKS.findIndex(r=>r[0]===to),L=LADDER[i];grant();
      const card=document.querySelector(".rankup .ru-card");if(!card||!L)return;
      const box=document.createElement("div");box.className="rw-unl";
      box.innerHTML=`<div class="label">Unlocked</div>${L.perks.map((p,j)=>`<div class="rw-u" style="--j:${j}"><span>${p[0]}</span><div><b>${esc(p[1])}</b><small>${esc(p[2])}</small></div></div>`).join("")}${L.accent?`<button class="ghost outline sm" id="rwTry">Try the ${ACCENTS[L.accent][0]} theme</button>`:""}`;
      card.querySelector(".ru-sub").after(box);
      const t=box.querySelector("#rwTry");if(t)t.onclick=()=>{RW().accent=L.accent;save();applyAccent();t.textContent="Theme on ✓"};
      setTimeout(confetti,600)}catch(e){console.error(e)}}}

  /* ---------- rewards panel ---------- */
  window.maRewards=function(){grant();const x=totalXP(),r=myRank(),w=RW(),pr=prestige(x);
    const rows=RANKS.map((k,i)=>{const L=LADDER[i],have=i<=r,next=i===r+1;const need=k[1]-x;
      return `<li class="rw-step ${have?"have":""} ${next?"next":""}" style="--i:${i}"><div class="rw-dot">${have?"✓":i+1}</div><div class="rw-body"><div class="rw-h"><b>${esc(k[0])}</b><span>${have?"Unlocked":`${k[1].toLocaleString()} XP${next?` · ${need.toLocaleString()} to go`:""}`}</span></div>
        <div class="rw-perks">${L.perks.map(p=>`<span class="rw-chip" title="${esc(p[2])}">${p[0]} ${esc(p[1])}</span>`).join("")}</div></div></li>`}).join("");
    const unl=Object.entries(ACCENTS).filter(([,a])=>r>=a[1]);
    openPanel(`<div class="label">Career ladder</div><h2>Rank up, unlock rewards</h2><p class="sub">Every promotion gives you something real. Nothing here can be bought.</p>
      <div class="rw-stats"><div><b>${w.shields}</b><span>Streak Shields</span></div><div><b>${LADDER.slice(1,r+1).reduce((a,l)=>a+(l.pass||0),0)}</b><span>Pro days earned</span></div><div><b>${passLeft()||"–"}</b><span>Pro pass days left</span></div><div><b>${pr?"★"+pr:"–"}</b><span>Prestige</span></div></div>
      <ol class="rw-ladder">${rows}<li class="rw-step ${pr?"have":""}" style="--i:7"><div class="rw-dot">★</div><div class="rw-body"><div class="rw-h"><b>Prestige</b><span>Every ${PRESTIGE_STEP} XP after MD</span></div><div class="rw-perks"><span class="rw-chip">★ Prestige star on your profile</span><span class="rw-chip">🛡️ +1 Streak Shield each level</span></div></div></li></ol>
      <div class="rw-themes"><div class="label">Your themes</div><div class="rw-sw">${Object.entries(ACCENTS).map(([k,a])=>{const ok=r>=a[1];return `<button class="rw-swatch ${(w.accent||"cobalt")===k?"on":""}" ${ok?"":"disabled"} data-acc="${k}" style="--c:${a[2]}" title="${ok?a[0]:`Unlocks at ${RANKS[a[1]][0]}`}"><i></i><span>${a[0]}${ok?"":" 🔒"}</span></button>`}).join("")}</div></div>`);
    panel.classList.add("wide");
    document.querySelectorAll("[data-acc]").forEach(b=>b.onclick=()=>{RW().accent=b.dataset.acc;save();applyAccent();maRewards()});
    void unl};

  /* ---------- home card: next reward ---------- */
  function homeCard(){const view=document.querySelector('[data-view="home"]');if(!view||view.classList.contains("home-new"))return;
    const x=totalXP(),r=myRank(),nx=RANKS[r+1];let el=$("#rwHome");
    if(!el){el=document.createElement("button");el.id="rwHome";el.className="rw-home";el.type="button";const duo=$("#homeDuo");(duo||$("#continue")).after(el);el.onclick=()=>maRewards()}
    if(nx){const base=RANKS[r][1],pct=Math.round((x-base)/(nx[1]-base)*100),L=LADDER[r+1];
      el.innerHTML=`<div class="rw-hl"><span class="label">Next promotion · ${esc(nx[0])}</span><span class="rw-go">All rewards →</span></div>
        <div class="rw-bar"><i style="width:${pct}%"></i></div><div class="rw-hm"><span><b>${(nx[1]-x).toLocaleString()} XP</b> to go</span><span>${pct}%</span></div>
        <div class="rw-perks">${L.perks.map(p=>`<span class="rw-chip">${p[0]} ${esc(p[1])}</span>`).join("")}</div>`}
    else{const pr=prestige(x),nxt=TOP+(pr+1)*PRESTIGE_STEP,pct=Math.round((x-(TOP+pr*PRESTIGE_STEP))/PRESTIGE_STEP*100);
      el.innerHTML=`<div class="rw-hl"><span class="label">Prestige ${pr?"★"+pr:""} · next ★${pr+1}</span><span class="rw-go">All rewards →</span></div><div class="rw-bar"><i style="width:${pct}%"></i></div><div class="rw-hm"><span><b>${(nxt-x).toLocaleString()} XP</b> to go</span><span>${pct}%</span></div><div class="rw-perks"><span class="rw-chip">🛡️ +1 Streak Shield</span><span class="rw-chip">★ Prestige star</span></div>`}}
  {const _rh=renderHome;renderHome=function(){_rh.apply(this,arguments);try{grant();homeCard()}catch(e){console.error(e)}}}

  /* ---------- redesigned Pro page ---------- */
  renderPro=function(){const el=$("#proPage");if(!el)return;const pro=isPro(),plan=S.pro&&S.pro.plan,r=myRank();
    const plans=[["monthly","Monthly","$9","/month","Flexible. Cancel whenever.",null],["yearly","Yearly","$69","/year","Works out to $5.75 a month. Covers a full recruiting cycle.","Save 36%"],["season","Season Pass","$29","one time","4 months of Pro for recruiting season. Never renews.",null]];
    const rows=[["Every training track, all 1,000+ questions",1,1],["Daily question, Rapid Fire, weekly Gauntlet",1,1],["Profile, friends, clubs, leaderboards",1,1],["LBO and DCF builders, pay ladders, The Wire",1,1],["AI-graded mock interviews",0,"Unlimited"],["AI feedback: Superday debriefs, case judging, mistake explanations",0,1],["AI writing: resume review, networking emails, profile help",0,1],["Interview bank","Basic + Intermediate","Every level"],["Final rounds (Superday)","Self-graded","AI-graded"],["Firm-style packs: EB, PE, RX, markets",0,1],["Weekly plan that targets your weak spots",0,1],["Modeling library","5","All 12+"],["Application tracker","5 apps","Unlimited"],["Who viewed your profile","Count","Names"],["Pro League + profile banners",0,1]];
    const cell=v=>v===1?'<span class="yes">✓</span>':v===0?'<span class="no">–</span>':esc(v);
    const promise=[["📚","Learning stays free","Every track and question is free forever. Pro never locks lessons."],["🏆","Pro can't buy rank","Leaderboards are earned. Pro gives you reps, not points."],["🖱️","Cancel in one click","No emails, no calls, no guilt trip."],["🎓","Can't afford it? Ask.","Students who need it can request free Pro. We read every request."]];
    el.innerHTML=`<section class="pro2-hero">
      <div class="pro2-glow" aria-hidden="true"></div>
      <span class="pro2-pill">${pro?proBadge()+" "+esc(proLabel()):"M&A Pro"}</span>
      <h1>Learn for free.<br><em>Go Pro for the final stretch.</em></h1>
      <p>Free gets you ready. Pro adds AI that grades every answer and tells you exactly what to fix, so you walk into your Superday having already done it 50 times.</p>
      ${pro?"":`<div class="pro2-cta"><button class="btn pro2-go" id="proTrial">Try Pro free for 7 days</button><span>No card needed · nothing to cancel</span></div>`}
    </section>
    <section class="pro2-why">${[["∞","AI grading on every answer","Every mock interview answer gets a score out of 10 and specific feedback on what to fix.","Most-used Pro feature"],["4×","Real Superday rounds","Back-to-back interviewers, timed, then a full debrief across all 4 rounds.","Closest thing to the real day"],["🎯","A plan built on your gaps","Pro tracks your scores by section and builds each week around your weakest topics.","Adapts every week"]].map(([n,t,d,tag],i)=>`<div class="pro2-card" style="--i:${i}"><div class="pro2-n">${n}</div><b>${t}</b><p>${d}</p><span>${tag}</span></div>`).join("")}</section>
    <section class="pro2-earn"><div><span class="label">Or earn it</span><b>Rank up and Pro is on us</b><p>Earn free Pro days as you get promoted: 1 at Analyst, 2 at VP, 3 at Director, 7 at MD. You're ${esc(RANKS[r][0])} now.</p></div><button class="ghost outline" id="proLadder">See the career ladder</button></section>
    <section><div class="sec-head"><h2>Simple, student pricing</h2></div>
     <div class="plans pro2-plans">${plans.map(([k,n,p,per,d,tag])=>`<div class="plan ${k==="yearly"?"best":""}">${tag?`<span class="plan-tag">${tag}</span>`:""}<div class="label">${n}</div><div class="price">${p}<span>${per}</span></div><p>${d}</p><button class="${k==="yearly"?"btn":"ghost outline"}" data-plan="${k}">${pro&&plan===k?"Current plan":"Choose "+n}</button></div>`).join("")}</div>
     <div class="founding"><div><b>Founding Member · $49 a year, locked for life</b><span>For the first 500 members. Permanent founder badge, and your price never goes up.</span></div><button class="ghost outline" data-plan="founding">${pro&&plan==="founding"?"You're a founder":"Claim founding price"}</button></div></section>
    <section class="pro2-promise"><div class="sec-head"><h2>Our promise</h2></div><div class="pro2-pg">${promise.map(([i,t,d])=>`<div><span>${i}</span><b>${t}</b><p>${d}</p></div>`).join("")}</div><button class="ghost outline sm" id="proNeed">Request free Pro</button></section>
    <section><div class="sec-head"><h2>Free vs Pro</h2></div><div class="tbl-wrap"><table class="cmp"><thead><tr><th></th><th>Free</th><th>Pro</th></tr></thead><tbody>${rows.map(([f,a,b])=>`<tr><td>${f}</td><td>${cell(a)}</td><td>${cell(b)}</td></tr>`).join("")}</tbody></table></div><p class="note">Free members can still answer every question and check against the key points. Pro adds the AI feedback.</p></section>
    <div class="club"><div><div class="label">For finance clubs</div><b>Club plan · $399 a year for up to 40 members</b><p>About $10 per member per year. Everyone gets Pro, plus a club leaderboard and an officer view.</p></div><button class="ghost outline" id="clubBtn">Bring it to your club</button></div>
    <div id="reviews" class="reviews"></div>
    <div class="faq">${[["Can I cancel anytime?","Yes. One click in Settings. You keep Pro until the end of what you paid for."],["Will Pro charge extra for new content?","No. New tracks, packs and features are included as they launch."],["Does Pro help my leaderboard rank?","Never. Rankings are earned. Pro gets you reps and feedback, not points."],["Is the free version limited?","Every track, the daily question, Rapid Fire, the Gauntlet, friends, clubs and your profile stay free forever."],["What if I can't afford it?","Hit Request free Pro above. Recruiting is expensive enough already."]].map(([q,a])=>`<details><summary>${q}<span class="chev"></span></summary><p>${a}</p></details>`).join("")}</div>`;
    if($("#proTrial"))$("#proTrial").onclick=()=>startPlan("trial");
    el.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>maCheckout(b.dataset.plan,b));
    $("#proLadder").onclick=()=>maRewards();
    $("#proNeed").onclick=()=>{if(typeof DB==="undefined"||!DB||!myId){if(window.maOpenAuth)maOpenAuth("up");else toast("Sign in first");return}
      openPanel(`<div class="label">Free Pro</div><h2>Request free Pro</h2><p class="sub">If Pro would help but the price doesn't work right now, tell us a little. No proof needed.</p><form class="pform" style="grid-template-columns:1fr" id="needF"><label>Anything you'd like us to know (optional)<textarea id="needT" maxlength="600" style="min-height:120px" placeholder="School, what you're recruiting for, timing…"></textarea></label><div class="actions"><button class="btn">Send request</button></div></form>`);
      $("#needF").onsubmit=async e=>{e.preventDefault();try{await DB.doc("requests/"+myId).set({type:"free_pro",note:$("#needT").value.trim().slice(0,600),name:myName||"",at:Date.now()});closePanel();toast("Request sent. We'll get back to you soon.")}catch(x){toast("Couldn't send. Try again.")}}};
    $("#clubBtn").onclick=()=>openPanel(`<div class="label">Club plan</div><h2>Bring M&A to your club</h2><p class="sub">Clubs get Pro for every member, a private leaderboard, a weekly club Gauntlet and an officer dashboard.</p><ul class="brief"><li>$399 a year for up to 40 members (about $10 each)</li><li>Free pilot for your first month</li><li>Officers see member progress and interview scores</li></ul>`);
    try{renderReviews()}catch(e){}};

  /* ---------- Stripe checkout + billing sync ---------- */
  async function authed(path,body){const A=window.MA_AUTH;const s=A&&A.sb&&(await A.sb.auth.getSession()).data.session;if(!s)return{status:401};
    const r=await fetch("/.netlify/functions/"+path,{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.access_token},body:JSON.stringify(body||{})});
    return{status:r.status,j:await r.json().catch(()=>({}))}}
  window.maCheckout=async function(plan,btn){if(S.pro&&S.pro.paid&&isPro()){maPortal();return}
    if(!(window.MA_AUTH&&MA_AUTH.session)){toast("Create a free account first so Pro is tied to you");window.maOpenAuth&&maOpenAuth("up");return}
    const t=btn&&btn.textContent;if(btn){btn.disabled=true;btn.textContent="Opening checkout…"}
    try{const r=await authed("checkout",{plan});if(r.j&&r.j.url){location.href=r.j.url;return}
      toast(r.status===503?"Payments are almost live. Start the free trial for now.":(r.j&&r.j.error)||"Couldn't open checkout. Try again.")}
    catch(e){toast("Couldn't open checkout. Try again.")}
    if(btn){btn.disabled=false;btn.textContent=t}};
  window.maPortal=async function(){try{const r=await authed("portal");if(r.j&&r.j.url){location.href=r.j.url;return}toast((r.j&&r.j.error)||"Couldn't open billing.")}catch(e){toast("Couldn't open billing.")}};
  /* the billing record (written only by the server) decides the tier: free / trial / season / pro */
  const tierOf=b=>{b=b||{};const now=Date.now();if((b.paid||["active","trialing","past_due"].includes(b.status))&&(b.until||0)>now)return b.plan==="season"?"season":"pro";if((b.trialUntil||0)>now)return"trial";return"free"};
  window.MA_TIER="free";
  async function syncBilling(again){const A=window.MA_AUTH;if(!A||!A.sb)return;const s=await A.ready;if(!s)return;
    try{const {data}=await A.sb.from("docs").select("data").eq("col","billing").eq("id",s.user.id).maybeSingle();const b=(data&&data.data)||{};
      const tier=tierOf(b);window.MA_TIER=tier;const live=tier==="pro"||tier==="season";
      if(live){S.pro={plan:b.plan,start:b.start||Date.now(),paid:true,until:b.until,cancelAtEnd:!!b.cancelAtEnd};S.proEver=true}
      else if(tier==="trial"){S.pro={plan:"trial",start:b.trialStart,until:b.trialUntil,srv:true};S.trialUsed=b.trialStart;S.proEver=true}
      else if(S.pro&&S.pro.plan==="trial"&&!b.trialStart&&!again&&(Date.now()-(S.pro.start||0))<7*864e5){ // trial started before trials moved to the server
        const r=await authed("trial");if(r.status===200)return syncBilling(true);S.pro={}}
      else if(S.pro&&(S.pro.paid||S.pro.plan==="trial"))S.pro={};
      if(b.trialStart)S.trialUsed=b.trialStart;
      save();applyProUI();renderPro();try{render()}catch(e){}gateAI();return live||tier==="trial"}catch(e){}}
  {const _ip2=isPro;isPro=function(){if(S.pro&&S.pro.paid&&(S.pro.until||0)<Date.now()&&!((S.rw&&S.rw.passUntil||0)>Date.now()))return false;return _ip2()}}
  document.addEventListener("click",e=>{const c=e.target.closest&&e.target.closest("#proCancel");if(c&&S.pro&&S.pro.paid){e.preventDefault();e.stopImmediatePropagation();maPortal()}},true);
  (async()=>{const q=new URLSearchParams(location.search).get("checkout");
    if(q)history.replaceState(null,"",location.pathname+location.hash);
    if(q==="success"){toast("Payment received. Unlocking Pro…");let ok=false;for(let i=0;i<8&&!ok;i++){ok=await syncBilling();if(!ok)await new Promise(r=>setTimeout(r,2000))}
      if(ok){confetti();toast("Welcome to Pro 🎉")}else toast("Payment went through. Pro will unlock in a minute. Refresh if it doesn't.")}
    else{if(q==="cancel")toast("Checkout canceled. Nothing was charged.");syncBilling()}})();

  /* AI is Pro-only: hide the AI client from non-Pro users */
  /* AI works for every signed-in account; the server caps uses per day by tier (free 8, trial 20, season 40, pro 100) */
  let REAL_AI=null;const AI_WRAP={async json(p,o){try{return await REAL_AI.json(p,o)}catch(e){if(e.code==="limit"){try{upgrade(MA_TIER==="free"?"You've used today's free AI uses. Pro is unlimited":"You've hit today's AI limit for your plan")}catch(x){}}throw e}}};
  function gateAI(){try{SAMPLE=REAL_AI&&window.MA_AUTH&&MA_AUTH.session?AI_WRAP:null}catch(e){}}
  samplePromise.then(s=>{REAL_AI=s;gateAI()});setInterval(gateAI,1500);
  /* paid plans always go through Stripe; the free trial works once per account */
  {const _sp=startPlan;startPlan=async function(plan){
    if(plan!=="trial"){maCheckout(plan);return}
    if(!(window.MA_AUTH&&MA_AUTH.session)){toast("Make a free account to start your 7-day trial");window.maOpenAuth&&maOpenAuth("up");return}
    if(isPro()){toast("You already have Pro");return}
    const r=await authed("trial");
    if(r.status===200){await syncBilling(true);try{confetti()}catch(e){}toast("Your 7-day free trial has started. No card, nothing to cancel.");return}
    if(r.status===409){toast((r.j&&r.j.code)==="paid"?"You already have Pro":"You've already used your free trial. Pick a plan to keep Pro.");try{showTab("pro")}catch(e){}return}
    toast((r.j&&r.j.error)||"Couldn't start the trial. Try again.")}}
  /* clean up old "preview" Pro from before payments were live */
  if(S.pro&&S.pro.plan&&S.pro.plan!=="trial"&&!S.pro.paid){S.pro={};save();try{applyProUI()}catch(e){}}
  if(S.pro&&S.pro.plan==="trial"&&!S.trialUsed){S.trialUsed=S.pro.start||Date.now();save()}

  /* quiet Pro: no popups when someone taps a Pro feature, just a soft hint */
  upgrade=function(reason){try{toast(`${reason}. You can try it free anytime.`)}catch(e){}const b=$("#proBtn");if(b){b.classList.remove("pro-hint");void b.offsetWidth;b.classList.add("pro-hint")}};

  /* ---------- styles ---------- */
  const st=document.createElement("style");st.textContent=`
.ai-lock{color:var(--ink-2)}.ai-lock a{color:var(--ink-2);text-decoration:underline;text-underline-offset:3px}.ai-lock a:hover{color:var(--cobalt)}
.probtn:not(.on){border:0!important;color:var(--ink-2)!important;background:none!important;font-weight:500!important;padding:4px 6px!important}
.probtn:not(.on):hover{color:var(--ink)!important}
.probtn.pro-hint{animation:proHint 1.4s ease 2}
@keyframes proHint{0%,100%{color:var(--ink-2)}50%{color:var(--brass)}}
.upsell{border:1px dashed var(--rule)!important;background:var(--paper)}
.upsell b{font-weight:600}
.gopro{color:var(--ink-2)!important;font-weight:500;text-decoration:underline;text-decoration-color:var(--rule);text-underline-offset:3px}
.gopro:hover{color:var(--brass)!important}
.av.rr1{box-shadow:0 0 0 2px var(--sheet),0 0 0 4px #B07A45}
.av.rr2{box-shadow:0 0 0 2px var(--sheet),0 0 0 4px #9EA7B8}
.av.rr3{box-shadow:0 0 0 2px var(--sheet),0 0 0 4px #D9A825,0 0 12px rgba(217,168,37,.45)}
.av.rr4{position:relative;box-shadow:0 0 0 2px var(--sheet)}
.av.rr4::before{content:"";position:absolute;inset:-4px;border-radius:50%;background:conic-gradient(from var(--a,0deg),#7C97FF,#C79BFF,#FF7D8C,#E6BE5A,#4FD1A0,#7C97FF);z-index:-1;animation:rwSpin 4s linear infinite}
.av.rr4{isolation:isolate}
@property --a{syntax:"<angle>";inherits:false;initial-value:0deg}
@keyframes rwSpin{to{--a:360deg}}
.rw-home{display:flex;flex-direction:column;gap:8px;text-align:left;width:100%;margin-top:12px;border:1px solid var(--rule);border-radius:14px;padding:14px 16px;background:linear-gradient(135deg,var(--cobalt-soft),transparent 60%),var(--sheet);font:inherit;color:inherit;cursor:pointer;transition:border-color .2s,transform .2s cubic-bezier(.2,.8,.2,1),box-shadow .2s;animation:plSwap .45s cubic-bezier(.2,.8,.2,1) both}
.rw-home:hover{border-color:var(--cobalt);transform:translateY(-2px);box-shadow:0 10px 24px color-mix(in srgb,var(--cobalt) 18%,transparent)}
.rw-hl{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.rw-go{font-size:12.5px;color:var(--cobalt);white-space:nowrap}
.rw-bar{height:10px;border-radius:6px;background:var(--paper);overflow:hidden;border:1px solid var(--rule)}
.rw-bar i{display:block;height:100%;border-radius:6px;background:linear-gradient(90deg,var(--cobalt),color-mix(in srgb,var(--cobalt) 55%,var(--brass)));transform-origin:left;animation:plGrow .9s cubic-bezier(.2,.8,.2,1) both}
.rw-hm{display:flex;justify-content:space-between;font-size:12.5px;color:var(--ink-2)}.rw-hm b{color:var(--ink)}
.rw-perks{display:flex;flex-wrap:wrap;gap:6px}
.rw-chip{font-size:12px;border:1px solid var(--rule);background:var(--sheet);border-radius:99px;padding:3px 10px;white-space:nowrap}
.rw-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:14px 0}
.rw-stats div{border:1px solid var(--rule);border-radius:12px;padding:10px;text-align:center;display:flex;flex-direction:column}
.rw-stats b{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums}.rw-stats span{font-size:11.5px;color:var(--ink-2)}
.rw-ladder{list-style:none;margin:0;padding:0;position:relative}
.rw-ladder::before{content:"";position:absolute;left:15px;top:16px;bottom:16px;width:2px;background:var(--rule)}
.rw-step{display:flex;gap:12px;padding:8px 0;position:relative;animation:plIn .4s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i)*45ms)}
.rw-dot{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700;background:var(--sheet);border:2px solid var(--rule);color:var(--ink-2);z-index:1}
.rw-step.have .rw-dot{background:var(--good);border-color:var(--good);color:#fff}
.rw-step.next .rw-dot{border-color:var(--cobalt);color:var(--cobalt);box-shadow:0 0 0 4px var(--cobalt-soft)}
.rw-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.rw-h{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.rw-h span{font-size:12px;color:var(--ink-2)}
.rw-step:not(.have):not(.next) .rw-chip{opacity:.65}
.rw-step.next .rw-chip{border-color:var(--cobalt)}
.rw-themes{margin-top:16px}.rw-sw{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
.rw-swatch{display:flex;align-items:center;gap:6px;border:1px solid var(--rule);background:var(--sheet);color:var(--ink);border-radius:99px;padding:5px 12px 5px 6px;font:inherit;font-size:13px;cursor:pointer}
.rw-swatch i{width:18px;height:18px;border-radius:50%;background:var(--c)}
.rw-swatch.on{border-color:var(--ink);font-weight:600}.rw-swatch:disabled{opacity:.5;cursor:default}
.rw-unl{text-align:left;display:flex;flex-direction:column;gap:8px;margin:0 0 18px;padding:14px;border:1px solid var(--rule);border-radius:12px;background:var(--paper)}
.rw-u{display:flex;gap:10px;align-items:flex-start;animation:plIn .45s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--j)*140ms + 900ms)}
.rw-u>span{font-size:22px;line-height:1}.rw-u b{display:block;font-size:14px}.rw-u small{font-size:12.5px;color:var(--ink-2)}
.rw-unl .ghost{align-self:flex-start}
.rw-conf{position:fixed;inset:0;pointer-events:none;z-index:80;overflow:hidden}
.rw-conf i{position:absolute;top:-20px;border-radius:2px;animation:rwFall linear forwards}
@keyframes rwFall{to{transform:translate(var(--dx),110vh) rotate(var(--r));opacity:.9}}
.pro2-hero{position:relative;text-align:center;padding:36px 16px 28px;border-radius:20px;overflow:hidden;background:linear-gradient(160deg,var(--cobalt-soft),transparent 70%);border:1px solid var(--rule)}
.pro2-glow{position:absolute;inset:-40% -10% auto;height:120%;background:radial-gradient(closest-side,color-mix(in srgb,var(--cobalt) 22%,transparent),transparent);pointer-events:none}
.pro2-pill{position:relative;display:inline-flex;gap:6px;align-items:center;font-size:12.5px;font-weight:600;border:1px solid var(--rule);background:var(--sheet);border-radius:99px;padding:4px 12px}
.pro2-hero h1{position:relative;font-family:var(--body);font-weight:700;font-stretch:100%;text-transform:none;font-size:clamp(28px,4.6vw,44px);line-height:1.12;margin:14px 0 10px;letter-spacing:-.01em}
.pro2-hero h1 em{font-style:normal;color:var(--cobalt)}
.pro2-hero p{position:relative;color:var(--ink-2);max-width:52ch;margin:0 auto;font-size:15.5px}
.pro2-cta{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:20px}.pro2-cta span{font-size:12.5px;color:var(--ink-2)}
.pro2-go{padding:13px 24px!important;font-size:15.5px;font-weight:600;background:var(--cobalt)!important;color:#fff!important;border-radius:10px;box-shadow:0 10px 26px color-mix(in srgb,var(--cobalt) 38%,transparent)}
.pro2-why{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:18px 0}
.pro2-card{border:1px solid var(--rule);border-radius:16px;padding:18px;background:var(--sheet);display:flex;flex-direction:column;gap:6px;animation:plIn .5s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i)*90ms)}
.pro2-n{font-size:30px;font-weight:800;color:var(--cobalt);line-height:1}.pro2-card b{font-size:16px}.pro2-card p{margin:0;font-size:13.5px;color:var(--ink-2);flex:1}
.pro2-card>span{font-size:11.5px;font-family:var(--mono);color:var(--brass);text-transform:uppercase;letter-spacing:.06em}
.pro2-earn{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;border:1px dashed var(--brass);background:var(--brass-soft);border-radius:14px;padding:16px 18px;margin-bottom:20px}
.pro2-earn b{display:block;font-size:16px}.pro2-earn p{margin:2px 0 0;font-size:13.5px;color:var(--ink-2)}
.pro2-plans{margin-bottom:14px}
.pro2-promise{margin:22px 0}.pro2-pg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}
.pro2-pg div{border:1px solid var(--rule);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:4px}
.pro2-pg span{font-size:22px}.pro2-pg b{font-size:14.5px}.pro2-pg p{margin:0;font-size:13px;color:var(--ink-2)}
@media (max-width:860px){.pro2-pg{grid-template-columns:1fr 1fr}}
@media (max-width:760px){.pro2-why{grid-template-columns:1fr}.rw-stats{grid-template-columns:1fr 1fr}}
@media (max-width:480px){.pro2-pg{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.av.rr4::before,.rw-step,.rw-u,.pro2-card,.rw-home,.rw-bar i{animation:none}}`;document.head.appendChild(st);

  /* boot */
  try{grant();useShields();applyAccent();renderHome();renderPro();applyProUI()}catch(e){console.error(e)}
  setInterval(()=>{try{const g=grant();if(g.some(x=>String(x).startsWith("p"))){confetti();toast(`★ Prestige ${prestige(totalXP())}! +1 Streak Shield`)}}catch(e){}},5000);
})();
