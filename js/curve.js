/* Curveballs: the weird, "unexpected" interview questions (mental math, brainteasers, estimates).
   Practice → Curveballs: question of the day, a 60-second mental math sprint, and a brainteaser deck.
   Home gets a small "Curveball of the day" card. XP goes into S.questXP so it counts toward totals. */
(function(){
  const $=s=>document.querySelector(s);
  /* q, a = answer, tol = allowed error, u = unit shown, steps = how to do it fast */
  const Q=[
    ["What's 13% of 87?",11.31,.05,"","10% = 8.7, 3% = 2.61","8.7 + 2.61 = 11.31"],
    ["What's 17 × 24?",408,0,"","17 × 25 = 425","425 − 17 = 408"],
    ["What's the angle between the clock hands at 3:15?",7.5,0,"°","Minute hand points at the 3 (90°)","Hour hand moved 15 min × 0.5° = 7.5° past the 3 → 7.5°"],
    ["What's 15% of 360?",54,0,"","10% = 36, 5% = 18","36 + 18 = 54"],
    ["At 8% a year, roughly how many years until your money doubles?",9,.5,"years","Rule of 72: 72 ÷ rate","72 ÷ 8 = 9 years"],
    ["What's 25 × 48?",1200,0,"","25 × 4 = 100","48 = 4 × 12 → 100 × 12 = 1,200"],
    ["What's 7/8 as a percent?",87.5,0,"%","1/8 = 12.5%","7 × 12.5 = 87.5%"],
    ["What's the angle between the clock hands at 3:40?",130,0,"°","Minute hand: 40 × 6° = 240°","Hour hand: 90° + 40 × 0.5° = 110° → 240 − 110 = 130°"],
    ["What's 45% of 220?",99,0,"","50% = 110, 5% = 11","110 − 11 = 99"],
    ["What's 99 × 99?",9801,0,"","99 × 100 = 9,900","9,900 − 99 = 9,801"],
    ["Add up every number from 1 to 100.",5050,0,"","Pair them: 1+100, 2+99… each = 101","50 pairs × 101 = 5,050"],
    ["A bat and ball cost $1.10. The bat costs $1 more than the ball. What does the ball cost?",.05,0,"$","Ball = x, bat = x + 1","2x + 1 = 1.10 → x = $0.05 (not 10¢!)"],
    ["Lily pads double every day and cover the lake on day 48. When is it half covered?",47,0,"day","It doubles each day","So one day earlier it was half: day 47"],
    ["5 machines make 5 widgets in 5 minutes. How long for 100 machines to make 100 widgets?",5,0,"min","Each machine makes 1 widget in 5 minutes","100 machines → 100 widgets in 5 minutes"],
    ["A $100 stock goes up 10%, then down 10%. Where is it now?",99,0,"$","Up 10% → $110","Down 10% of 110 = 11 → $99"],
    ["What's 2 to the 10th power?",1024,0,"","2⁵ = 32","32 × 32 = 1,024"],
    ["What's 6% of 450?",27,0,"","1% = 4.5","6 × 4.5 = 27"],
    ["Equity value $500M, debt $200M, cash $50M. What's enterprise value ($M)?",650,0,"$M","EV = equity + debt − cash","500 + 200 − 50 = 650"],
    ["What's 1/3 of 1/4 of 600?",50,0,"","1/4 of 600 = 150","1/3 of 150 = 50"],
    ["What's 18 squared?",324,0,"","18 × 20 = 360","360 − 36 = 324"],
    ["You double your money in 5 years. Roughly what's the IRR?",15,1,"%","Rule of 72: 72 ÷ 5 ≈ 14.4","Exact is about 14.9% → ~15%"],
    ["You triple your money in 5 years. Roughly what's the IRR?",25,1.5,"%","3x in 5 years is a classic PE number","About 24.6% → ~25%"],
    ["What's 12.5% of 64?",8,0,"","12.5% = 1/8","64 ÷ 8 = 8"],
    ["What's 35 squared?",1225,0,"","Ends in 5 trick: 3 × 4 = 12","Then add 25 → 1,225"],
    ["How many times do the clock hands overlap in 12 hours?",11,0,"","Not 12! They miss at 12–1","They overlap every ~65.5 min → 11 times"],
    ["$1,000 at 5% a year, compounded for 2 years. What's it worth?",1102.5,.5,"$","Year 1: $1,050","Year 2: 1,050 × 1.05 = $1,102.50"],
    ["What's 0.4 × 0.25?",.1,0,"","0.25 = 1/4","0.4 ÷ 4 = 0.1"],
    ["Revenue grows from $80M to $100M. What's the growth rate?",25,0,"%","Change = 20","20 ÷ 80 = 25% (not 20%)"],
    ["A company trades at 10x EBITDA with $30M EBITDA and no debt or cash. What's EV ($M)?",300,0,"$M","EV = multiple × EBITDA","10 × 30 = 300"],
    ["What's 11 × 47?",517,0,"","11 trick: 4 _ 7, middle = 4 + 7 = 11","Carry the 1 → 517"]
  ];
  const T=[ /* estimation / logic: no single right number, show the approach */
    ["How many golf balls fit in a school bus?","Bus ≈ 8ft × 6ft × 20ft ≈ 1,000 cubic ft. A golf ball is ~1.7 in wide, so ~350 per cubic ft packed. 1,000 × 350 ≈ 350,000, minus seats → ~300,000. The structure matters more than the number."],
    ["How many gas stations are in the U.S.?","~330M people, ~1 car per 1.2 people ≈ 270M cars. Each fills up ~once a week. A station serves ~2,000 fill-ups a week → 270M ÷ 2,000 ≈ 135,000. (Real answer: about 145,000.)"],
    ["Why are manhole covers round?","A round cover can't fall through its own hole, it's easy to roll, and it fits any way you turn it. Interviewers want reasons, not a single answer."],
    ["You have 8 balls, one is heavier. With a balance scale, find it in 2 weighings.","Weigh 3 vs 3. If equal, the heavy one is in the last 2: weigh them. If not, take the heavy side's 3 and weigh 1 vs 1: equal means it's the third."],
    ["How much would you charge to wash every window in New York City?","Estimate buildings × windows per building × minutes per window × hourly rate. Say 1M buildings × 30 windows × 2 min ≈ 1M hours × $30 ≈ $30M. Walk through each assumption out loud."],
    ["Would you rather have $1M today or a penny doubled every day for 30 days?","A penny doubled 30 times = $0.01 × 2²⁹ ≈ $5.4M on day 30. Take the penny. This is compounding, the same idea as a DCF."]
  ];
  const today=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
  const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*60000)/864e5);
  const dq=()=>Q[dayNum()%Q.length];
  const gS=()=>{try{return typeof S!=="undefined"&&S&&!Array.isArray(S)?S:null}catch(e){return null}};
  const st=()=>{const s=gS();if(s){s.cb=s.cb||{};return s.cb}return(window.__cb=window.__cb||{})};
  function xp(key,n){try{const s=gS();if(!s)return;s.questXP=s.questXP||{};s.questXP[key]=(s.questXP[key]||0)+n;if(window.save)save();if(window.render)render()}catch(e){}}
  const num=v=>{v=String(v).replace(/[$,%°\s]|years?|days?|min/gi,"").replace(/^day/i,"");const n=parseFloat(v);return isNaN(n)?null:n};
  const ok=(v,a,t)=>v!==null&&Math.abs(v-a)<=Math.max(t,1e-9)+1e-9;
  const fmt=(n,u)=>u==="$"?"$"+n.toLocaleString(undefined,{minimumFractionDigits:n%1?2:0}):u==="$M"?"$"+n.toLocaleString()+"M":n.toLocaleString()+(u&&u!=="day"?(u.length<3?u:" "+u):"");

  const css=`.cb-wrap{display:grid;gap:18px;max-width:860px}
.cb-card{border:1px solid var(--rule);border-radius:16px;background:var(--sheet);padding:22px}
.cb-k{font-family:var(--mono);font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--bad,#c33)}
.cb-q{font-size:22px;line-height:1.3;font-weight:600;margin:10px 0 16px;color:var(--ink)}
.cb-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.cb-in{font:inherit;font-size:16px;padding:10px 12px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink);width:180px}
.cb-btn{font:inherit;font-size:14px;font-weight:600;padding:10px 16px;border-radius:10px;border:1px solid var(--rule);background:none;color:var(--ink);cursor:pointer}
.cb-btn.p{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.cb-res{margin-top:14px;font-size:15px;line-height:1.5;color:var(--ink-2)}.cb-res b{color:var(--ink)}
.cb-res ol{margin:8px 0 0 18px;padding:0}.cb-good{color:#1f9d55!important}.cb-bad{color:var(--bad,#c33)!important}
.cb-sp{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.cb-big{font-family:var(--mono);font-size:30px;font-weight:600;color:var(--ink)}
.cb-meta{font-size:13px;color:var(--ink-2)}
.cb-list details{border-top:1px solid var(--rule);padding:12px 0}.cb-list details:first-child{border-top:0}
.cb-list summary{cursor:pointer;font-weight:600;color:var(--ink);font-size:15.5px}.cb-list p{margin:8px 0 0;color:var(--ink-2);font-size:14.5px;line-height:1.5}
.cb-home{display:flex;justify-content:space-between;align-items:center;gap:12px;border:1px solid var(--rule);border-radius:14px;background:var(--sheet);padding:14px 16px;margin:12px 0}
.cb-home b{display:block;font-size:15px;color:var(--ink);margin-top:3px}
@media(max-width:520px){.cb-q{font-size:19px}.cb-in{width:100%}}`;
  const sty=document.createElement("style");sty.textContent=css;document.head.appendChild(sty);

  function daily(){const [q,a,t,u,s1,s2]=dq(),c=st(),done=c.day===today();
    return `<div class="cb-card" id="cbDaily"><div class="cb-k">Curveball of the day · no calculator</div><div class="cb-q">${q}</div>
      <div class="cb-row"><input class="cb-in" id="cbIn" inputmode="decimal" placeholder="Your answer" ${done?"disabled":""}><button class="cb-btn p" id="cbGo" ${done?"disabled":""}>Check</button><button class="cb-btn" id="cbShow">Show answer</button></div>
      <div class="cb-res" id="cbRes">${done?result(c.dayOk,a,u,s1,s2):""}</div></div>`}
  function result(good,a,u,s1,s2){return `<b class="${good?"cb-good":"cb-bad"}">${good?"Nailed it. +10 XP":"Answer: "+fmt(a,u)}</b>${good?" ("+fmt(a,u)+")":""}<ol><li>${s1}</li><li>${s2}</li></ol><div class="cb-meta" style="margin-top:8px">New curveball tomorrow.</div>`}
  function bindDaily(){const go=$("#cbGo"),inp=$("#cbIn"),res=$("#cbRes"),sh=$("#cbShow");if(!go)return;
    const [,a,t,u,s1,s2]=dq();
    const fin=good=>{const c=st();if(c.day!==today()){c.day=today();c.dayOk=good;if(good)xp("cb-"+today(),10);else if(window.save)save()}
      res.innerHTML=result(good,a,u,s1,s2);inp.disabled=go.disabled=true;homeCard()};
    go.onclick=()=>{const v=num(inp.value);if(v===null){inp.focus();return}fin(ok(v,a,t))};
    inp.onkeydown=e=>{if(e.key==="Enter")go.click()};sh.onclick=()=>{if(st().day!==today())fin(false);else res.innerHTML=result(st().dayOk,a,u,s1,s2)}}

  /* 60-second mental math sprint */
  const R=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  function gen(){const k=R(0,4);
    if(k===0){const p=[5,10,15,20,25,30,40,50,75][R(0,8)],y=R(2,40)*20;return[`${p}% of ${y}`,p*y/100]}
    if(k===1){const a=R(12,49),b=R(3,9);return[`${a} × ${b}`,a*b]}
    if(k===2){const b=R(3,12),a=b*R(6,25);return[`${a} ÷ ${b}`,a/b]}
    if(k===3){const a=R(11,19),b=R(11,19);return[`${a} × ${b}`,a*b]}
    const a=R(120,980),b=R(110,890);return[`${a} + ${b}`,a+b]}
  let sp=null;
  function sprint(){const best=st().best||0;
    return `<div class="cb-card" id="cbSprint"><div class="cb-sp"><div><div class="cb-k" style="color:var(--brass)">Mental math sprint</div><div class="cb-meta" style="margin-top:6px">60 seconds. As many as you can. Best: <b id="cbBest">${best}</b></div></div><button class="cb-btn p" id="cbStart">Start</button></div>
      <div id="cbPlay" hidden style="margin-top:16px"><div class="cb-sp"><div class="cb-big" id="cbProb"></div><div class="cb-meta"><b id="cbT">60</b>s · <b id="cbN">0</b> right</div></div>
      <div class="cb-row" style="margin-top:12px"><input class="cb-in" id="cbA" inputmode="decimal" placeholder="Answer + Enter" autocomplete="off"><button class="cb-btn" id="cbSkip">Skip</button></div></div>
      <div class="cb-res" id="cbSRes"></div></div>`}
  function bindSprint(){const b=$("#cbStart");if(!b)return;
    b.onclick=()=>{if(sp)return;sp={n:0,t:60,p:gen()};$("#cbPlay").hidden=false;$("#cbSRes").textContent="";b.disabled=true;show();$("#cbA").focus();
      sp.iv=setInterval(()=>{sp.t--;$("#cbT").textContent=sp.t;if(sp.t<=0)end()},1000)};
    const show=()=>{$("#cbProb").textContent=sp.p[0]+" = ?";$("#cbN").textContent=sp.n;$("#cbA").value=""};
    $("#cbA").oninput=e=>{if(!sp)return;const v=num(e.target.value);if(v!==null&&Math.abs(v-sp.p[1])<1e-9){sp.n++;sp.p=gen();show()}};
    $("#cbA").onkeydown=e=>{if(e.key==="Enter"&&sp){sp.p=gen();show()}};
    $("#cbSkip").onclick=()=>{if(sp){sp.p=gen();show();$("#cbA").focus()}};
    function end(){clearInterval(sp.iv);const n=sp.n;sp=null;const c=st(),nb=n>(c.best||0);if(nb)c.best=n;
      const k="cb-sp-"+today(),have=((gS()||{}).questXP||{})[k]||0,gain=Math.max(0,Math.min(n,15-have));if(gain)xp(k,gain);else if(window.save)save();
      $("#cbPlay").hidden=true;b.disabled=false;b.textContent="Play again";$("#cbBest").textContent=c.best||0;
      $("#cbSRes").innerHTML=`<b>${n} right in 60 seconds.</b> ${nb?"New best! ":""}${gain?"+"+gain+" XP":"(XP for sprints maxes at 15 a day)"} · ${n>=20?"Analyst-level speed 🔥":n>=12?"Solid. Keep going.":"Warm-up round. Try again."}`}}

  function deck(){return `<div class="cb-card"><div class="cb-k" style="color:var(--ink-2)">Brainteasers & estimates</div><p class="cb-meta" style="margin:6px 0 10px">No single right number. Interviewers want to hear how you think. Try it out loud, then open.</p>
    <div class="cb-list">${T.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div>`}

  function draw(){const el=$("#curve");if(!el)return;
    el.innerHTML=`<div class="cb-wrap"><p class="cb-meta" style="margin:0">The questions that catch people off guard on superdays: quick math with no calculator, brainteasers and estimates.</p>${daily()}${sprint()}${deck()}</div>`;
    bindDaily();bindSprint()}
  function homeCard(){const anchor=document.getElementById("daily");if(!anchor)return;let h=document.getElementById("cbHome");
    const done=st().day===today();
    if(!h){h=document.createElement("button");h.type="button";h.id="cbHome";h.className="cb-home";h.style.cssText+="width:100%;text-align:left;font:inherit;cursor:pointer;color:inherit";
      h.onclick=()=>{setTimeout(()=>{try{showSub("practice","curve")}catch(e){}const i=$("#cbIn");if(i&&!i.disabled)i.focus()},120)};
      anchor.closest("section").after(h)}
    h.innerHTML=`<span><span class="cb-k">Curveball of the day</span><b>${dq()[0]}</b></span><span class="cb-meta" style="white-space:nowrap">${done?(st().dayOk?"✓ Done":"Seen"):"Try it →"}</span>`}

  function init(){draw();homeCard()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,50));else setTimeout(init,50);
})();
