/* ================= engage: reasons to join and come back every day (Nov 2026) =================
   1) "Today" card at the top of Home: streak, daily goal ring, one big next step, road to offer
   2) Opt-in streak-reminder + friend-nudge emails (server: engage-prefs / engage-mail)
   3) "Promoted!" share card after a rank-up (coffee chat score share lives in coffee.js)
   Self-contained: delete its script tag to turn it all off. */
(function(){
  const $=(s,r)=>(r||document).querySelector(s);
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const css=`.td{box-sizing:border-box;max-width:100%;min-width:0;border:1px solid var(--rule);border-radius:16px;background:var(--sheet);padding:16px;margin:0 0 14px;display:grid;gap:14px}
.td>*{min-width:0}.td-top{display:flex;align-items:center;gap:14px}
.td-ring{--p:0;width:64px;height:64px;border-radius:50%;flex:none;display:grid;place-items:center;background:conic-gradient(var(--cobalt) calc(var(--p)*1%),var(--rule) 0)}
.td-ring i{width:50px;height:50px;border-radius:50%;background:var(--sheet);display:grid;place-items:center;font-style:normal;font-weight:700;font-size:15px}
.td-t{flex:1;min-width:0}.td-t b{display:block;font-size:17px}.td-t span{font-size:13.5px;color:var(--ink-2)}
.td-fire{font-weight:700;white-space:nowrap}
.td-go{width:100%;font:inherit;font-weight:700;font-size:16px;padding:13px;border:0;border-radius:12px;background:var(--cobalt);color:#fff;cursor:pointer}
.td-road{display:flex;align-items:center;gap:0;overflow-x:auto;padding:2px 0 4px;scrollbar-width:none}.td-road::-webkit-scrollbar{display:none}
.td-st{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:62px;font-size:11px;color:var(--ink-2);text-align:center}
.td-st i{width:14px;height:14px;border-radius:50%;background:var(--rule);display:block}
.td-st.done i{background:var(--good)}.td-st.cur i{background:var(--cobalt);box-shadow:0 0 0 4px var(--cobalt-soft)}.td-st.cur{color:var(--ink);font-weight:700}
.td-ln{flex:1;min-width:10px;height:2px;background:var(--rule);margin-bottom:18px}.td-ln.done{background:var(--good)}
.td-mail{display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:13.5px;color:var(--ink-2);border-top:1px solid var(--rule);padding-top:12px}
.td-mail button{font:inherit;font-size:13px;font-weight:700;padding:7px 12px;border-radius:9px;border:1px solid var(--rule);background:none;color:var(--ink);cursor:pointer}
.td-cap{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2)}
.rk-bar{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9997;width:min(460px,calc(100% - 24px));display:flex;align-items:center;gap:10px;padding:11px 12px 11px 14px;border-radius:14px;background:#13203B;color:#fff;font-size:14.5px;box-shadow:0 14px 40px rgba(0,0,0,.35)}
.rk-bar span{flex:1}.rk-bar button{font:inherit;font-size:13.5px;font-weight:700;padding:8px 12px;border:0;border-radius:9px;background:#2448D8;color:#fff;cursor:pointer}.rk-bar .x{background:none;color:#B8C2DA;font-size:20px;padding:0 2px}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  const g=n=>{try{return (0,eval)(n)}catch(e){return undefined}};          // read classic-script globals safely
  const signedIn=()=>{const A=window.MA_AUTH;return !!(A&&A.session)};
  const tok=async()=>{const A=window.MA_AUTH;return A&&A.sb?(await A.sb.auth.getSession()).data.session?.access_token:null};
  const optIn=()=>LS.get("ma-engage")==="1";
  async function setEngage(on){const t=await tok();if(!t){const b=$("#authBtn");if(b)b.click();return}
    try{const r=await fetch("/.netlify/functions/engage-prefs",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+t},body:JSON.stringify({streak:on,nudge:on})});
      if(r.ok){LS.set("ma-engage",on?"1":"0");const toast=g("toast");toast&&toast(on?"Done. We'll email you before your streak ends 🔥":"Emails off");draw(true)}}catch(e){}}

  let last="";
  function draw(force){
    const host=$("#quests");if(!host||!host.parentNode)return;
    const S=g("S"),totalXP=g("totalXP"),streak=g("streak"),todayQuests=g("todayQuests"),RANKS=g("RANKS"),rankOf=g("rankOf");
    if(!S||!totalXP||!RANKS||!todayQuests)return;
    let xp=0,sk=0,Q=[],nd=0;try{xp=totalXP();sk=streak();Q=todayQuests();nd=Q.filter(q=>S.quests.done[q.id]).length}catch(e){return}
    const ri=rankOf(xp),next=RANKS[ri+1],fz=S.freezes||0,newbie=xp===0;
    const key=[xp,sk,nd,Q.length,fz,signedIn(),optIn()].join("|");if(!force&&key===last&&$("#todayCard"))return;last=key;
    let el=$("#todayCard");if(!el){el=document.createElement("section");el.id="todayCard";el.className="td";host.parentNode.insertBefore(el,host)}
    const vw=$('[data-view="home"]');el.hidden=!!(vw&&vw.classList.contains("home-new"));  // brand-new visitors already get the big "Start Level 1" landing
    const pct=Q.length?Math.round(nd/Q.length*100):0;
    const road=RANKS.map((r,i)=>(i?`<div class="td-ln ${i<=ri?"done":""}"></div>`:"")+`<div class="td-st ${i<ri?"done":i===ri?"cur":""}"><i></i>${r[0]}</div>`).join("");
    el.innerHTML=`<div class="td-top"><div class="td-ring" style="--p:${pct}"><i>${nd}/${Q.length||3}</i></div>
      <div class="td-t"><span class="td-cap">Today</span><b>${newbie?"Start here: your first 5 minutes":nd>=Q.length&&Q.length?"Daily goal done 🎉":"Finish today's goals"}</b><span>${newbie?"Answer a few real interview questions. No account needed.":next?`${next[1]-xp} XP to ${next[0]}`:"Top rank reached"}</span></div>
      <div class="td-fire">🔥 ${sk}${fz?` · ❄️ ${fz}`:""}</div></div>
      <button class="td-go" id="tdGo" type="button">${newbie?"Start the 60-second round →":"Continue training →"}</button>
      <div><div class="td-cap" style="margin-bottom:6px">Road to offer</div><div class="td-road">${road}</div></div>
      ${signedIn()&&!optIn()?`<div class="td-mail"><span>📧 Want a nudge before your streak ends, or when a friend passes you?</span><button type="button" id="tdMail">Email me</button></div>`:""}
      ${signedIn()&&optIn()?`<div class="td-mail"><span>📧 Streak and friend emails are on.</span><button type="button" id="tdMailOff">Turn off</button></div>`:""}`;
    $("#tdGo").onclick=()=>{try{const nx=g("nextLevel")();if(nx)g("showBrief")(nx.tr,nx.i);else{g("showTab")("learn")}}catch(e){}};
    const m=$("#tdMail");if(m)m.onclick=()=>setEngage(true);const mo=$("#tdMailOff");if(mo)mo.onclick=()=>setEngage(false);
  }

  /* streak freezes: finish all daily goals on 3 different days to earn one (max 2 saved) */
  function qFreeze(){try{const S=g("S"),Q=g("todayQuests")(),t=g("today")();if(!Q.length||!Q.every(q=>S.quests.done[q.id])||S.qLast===t)return;
    S.qLast=t;S.qDays=(S.qDays||0)+1;if(S.qDays%3===0&&(S.freezes||0)<2){S.freezes=(S.freezes||0)+1;g("toast")("All daily goals done 3 times: you earned a streak freeze ❄️")}g("save")()}catch(e){}}
  /* rank-up share */
  function rankWatch(){try{const xp=g("totalXP")(),ri=g("rankOf")(xp),R=g("RANKS"),seen=LS.get("ma-rk");
    if(seen===null||seen===undefined){LS.set("ma-rk",String(ri));return}
    if(ri>+seen){LS.set("ma-rk",String(ri));if(document.querySelector(".rk-bar")||!window.shareCard)return;
      const b=document.createElement("div");b.className="rk-bar";b.innerHTML=`<span>🎉 Promoted to <b>${R[ri][0]}</b>!</span><button type="button">Share it</button><button class="x" type="button" aria-label="Close">×</button>`;
      b.querySelector("button").onclick=()=>{window.shareCard({kicker:"M&A PREP",big:R[ri][0],title:"Promoted on M&A Prep",sub:"Train for banking and PE free",path:"/",file:"my-rank.png",text:"I just got promoted to "+R[ri][0]+" on M&A Prep. Train for finance recruiting free: https://mnaprep.com"});b.remove()};
      b.querySelector(".x").onclick=()=>b.remove();document.body.appendChild(b);setTimeout(()=>b.remove(),20000)}}catch(e){}}

  const tick=()=>{try{qFreeze();draw();rankWatch()}catch(e){console.warn("engage",e)}};
  setTimeout(tick,800);setInterval(()=>{if(!document.hidden)tick()},2000);document.addEventListener("click",()=>setTimeout(tick,300),true);
})();
