/* Superday simulator (Pro): 4 or 6 back-to-back AI interviewers. Each asks a real question for the student's path, then a
   follow-up based on what they said. Each round is graded right after it (fast model, code fallback from the question's key
   points), the decision is computed in code, and progress is saved so a refresh or slow AI never loses the run. */
(function(){
  const $=s=>document.querySelector(s);
  const ROLES=[
    {r:"Analyst",who:"a friendly 2nd-year analyst",cats:["Accounting","Enterprise Value"],style:"technical basics, quick and fair"},
    {r:"Associate",who:"a sharp associate who checks the details",cats:["Valuation & DCF","M&A"],style:"deeper technicals, pushes on why"},
    {r:"Vice President",who:"a VP who runs deals day to day",cats:null,style:"applies concepts to a real deal or the student's path"},
    {r:"Managing Director",who:"a senior MD deciding whether to hire",cats:["Behavioral"],style:"story, motivation, judgment, why this firm"}];
  const PATHCAT={"Private equity":"LBO & PE","Hedge funds & markets":"Markets & Hedge Funds","Restructuring":"Restructuring","Consulting":"Consulting"};
  const css=`.sd-card{border:1px solid var(--rule);border-radius:16px;background:var(--sheet);padding:18px 20px;margin:0 0 20px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.sd-card .k{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass)}.sd-card b{display:block;font-size:18px;margin:4px 0;color:var(--ink)}.sd-card p{margin:0;font-size:14px;color:var(--ink-2)}
.sd-who{display:flex;align-items:center;gap:10px;margin:6px 0 10px}.sd-av{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--cobalt);flex:none}
.sd-q{font-size:18px;line-height:1.4;font-weight:600;color:var(--ink);margin:6px 0 12px}.sd-fu{border-left:3px solid var(--brass);padding:4px 0 4px 12px;margin:0 0 12px;font-size:16px;color:var(--ink)}
.sd-dec{font-size:26px;font-weight:800;margin:4px 0}.sd-row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--rule);font-size:14px}.sd-row b{white-space:nowrap}
.sd-list{margin:6px 0 0;padding-left:18px;font-size:14.5px;line-height:1.5}.sd-best{background:var(--paper);border:1px solid var(--rule);border-radius:10px;padding:12px 14px;font-size:14.5px;line-height:1.5}
@media(max-width:560px){.sd-card{flex-direction:column;align-items:flex-start}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  const pick=(f,avoid)=>{let p=MOCK_QS.filter(x=>f(x)&&!(avoid||[]).includes(x.q));if(!p.length)p=MOCK_QS.filter(f);return p[Math.floor(Math.random()*p.length)]};
  const goal=()=>{try{return (S.plan&&S.plan.target)||"Investment banking"}catch(e){return "Investment banking"}};
  async function ai(prompt,tier){await samplePromise;if(!SAMPLE)throw new Error("signin");return SAMPLE.json(prompt,{modelTier:tier})}
  const FULL=[ROLES[0],ROLES[1],{r:"Associate (markets)",who:"an associate who loves markets and brain teasers",cats:["Markets & Hedge Funds","Brain Teasers"],style:"quick thinking, current markets, mental math"},
    ROLES[2],{r:"Director",who:"a director who staffs the team and checks fit",cats:["Behavioral"],style:"teamwork, pressure, why this group"},ROLES[3]];
  const fmtT=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const words=s=>String(s||"").toLowerCase().match(/[a-z0-9]+/g)||[];
  const STOPW=new Set("the a an and or of to in on for with is are be by as at it its this that from your you their they than then into about such like rather only every shows clear".split(" "));
  /* code grade: how many of the question's key points the two answers actually touch (works with no AI) */
  function keyHits(q,text){const have=new Set(words(text));return (q.k||[]).map(k=>{const w=words(k).filter(x=>x.length>3&&!STOPW.has(x));const hit=w.length?w.filter(x=>have.has(x)||have.has(x.replace(/s$/,""))).length/w.length:0;return {k,ok:hit>=0.35}})}
  function codeGrade(q,L){const all=L.a+" "+L.fa,hits=keyHits(q,all),cov=hits.length?hits.filter(h=>h.ok).length/hits.length:0.5,n=words(all).length;
    let sc=3+6*cov;if(n<35)sc-=2;else if(n>90)sc+=1;sc=Math.max(1,Math.min(10,Math.round(sc)));
    return {score:sc,note:cov>=0.7?"Covered most of what they were listening for.":cov>=0.4?"Got part of it; missed some key points.":"Missed most of the key points.",missed:hits.filter(h=>!h.ok).map(h=>h.k),src:"code"}}

  function start(){if(!isPro()){upgrade("The Superday simulator is part of Pro");return}
    const dr=S.sdDraft&&Date.now()-S.sdDraft.t<3*864e5?S.sdDraft:null;
    openPanel(`<div class="label">Superday simulator · Pro</div><h2>Your final round</h2>
      <p class="sub">Back-to-back interviewers. Each asks a question, then follows up on what you actually said. You're graded after every interview, and at the end you get the team's decision and a scorecard.</p>
      ${dr?`<div class="sd-best" style="margin:0 0 14px"><b>You have an unfinished Superday</b>${dr.firm?` at ${esc(dr.firm)}`:""} (interview ${dr.i+1} of ${dr.qs.length}). <button class="btn sm" id="sdResume" style="margin-left:8px">Resume</button></div>`:""}
      <label class="note" for="sdFirm">Which firm are you interviewing with? (optional)</label><input id="sdFirm" type="text" maxlength="40" placeholder="e.g. Evercore" style="width:100%;font:inherit;font-size:16px;padding:11px 13px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink);margin:6px 0 10px">
      <div class="seg" role="group" aria-label="Length" id="sdLen"><button data-n="4" aria-pressed="true">Standard · 4 interviews (~15 min)</button><button data-n="6" aria-pressed="false">Full day · 6 interviews (~25 min)</button></div>
      <label class="note" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="sdClock" checked> Show a clock (real interviews give you about 2 minutes per answer)</label>
      <p class="note">Path: <b>${esc(goal())}</b>. Type your answers like you'd say them out loud.</p>
      <div class="actions"><button class="btn" id="sdGo">Start the Superday →</button><button class="ghost" id="sdX">Not now</button></div>`);
    let n=4;panel.querySelectorAll("#sdLen [data-n]").forEach(b=>b.onclick=()=>{n=+b.dataset.n;panel.querySelectorAll("#sdLen [data-n]").forEach(x=>x.setAttribute("aria-pressed",x===b))});
    $("#sdGo").onclick=()=>run({firm:($("#sdFirm").value||"").trim().slice(0,40),n,clock:$("#sdClock").checked});$("#sdX").onclick=closePanel;
    if(dr)$("#sdResume").onclick=()=>run(null,dr);else $("#sdFirm").focus()}

  function run(opt,resume){
    const pc=PATHCAT[goal()];let firm,R,qs,log,i,phase,clock;
    if(resume){firm=resume.firm;R=resume.n===6?FULL:ROLES;qs=resume.qs.map(t=>MOCK_QS.find(x=>x.q===t)).filter(Boolean);log=resume.log;i=resume.i;phase=resume.phase;clock=resume.clock;if(qs.length!==R.length){S.sdDraft=null;save();start();return}}
    else{firm=opt.firm;clock=opt.clock;R=opt.n===6?FULL:ROLES;const prev=(S.sdSeen||[]).slice(-40);
      qs=R.map((ro,j)=>{const cats=ro.cats||[pc||"M&A"];return pick(x=>cats.includes(x.c)&&(ro.r==="Managing Director"||ro.r==="Director"||x.d>=(j===0?1:2)),prev)||pick(x=>cats.includes(x.c),prev)||pick(()=>true)});
      log=R.map(()=>({a:"",fu:"",fa:"",secs:0}));i=0;phase=0;S.sdSeen=(S.sdSeen||[]).concat(qs.map(q=>q.q)).slice(-60)}
    const grades=R.map((_,j)=>log[j].g?Promise.resolve(log[j].g):null);
    const persist=()=>{S.sdDraft={t:Date.now(),firm,n:R.length,qs:qs.map(q=>q.q),log,i,phase,clock};save()};
    let t0=Date.now(),tick=null,spoken="";
    const gradeRound=j=>{const q=qs[j],L=log[j];
      grades[j]=ai(`You are ${R[j].who} at ${firm||"an investment bank"} grading one Superday interview for a ${goal()} summer analyst. Be strict but fair, like a real banker.
Question: "${q.q}". Strong answers cover: ${(q.k||[]).join("; ")}.
Answer: """${L.a.slice(0,1200)}"""
Your follow-up: "${L.fu}"
Answer to follow-up: """${L.fa.slice(0,1000)}"""
Return JSON: {"score": integer 1-10, "note": "one sentence verdict", "missed": ["up to 2 key points they missed"]}`,"quick")
        .then(r=>({score:Math.max(1,Math.min(10,Math.round(+r.score||0)))||codeGrade(q,L).score,note:String(r.note||""),missed:(r.missed||[]).slice(0,2),src:"ai"}))
        .catch(()=>codeGrade(q,L)).then(g=>{L.g=g;persist();return g})};
    const head=()=>`<div class="label">Superday${firm?` · ${esc(firm)}`:""} · Interview ${i+1} of ${R.length}${clock?` · <span id="sdT">0:00</span>`:""}</div><div class="dots">${R.map((_,j)=>`<i class="${j<i?'ok':j===i?'cur':''}"></i>`).join("")}</div>
      <div id="sdIv"><div class="sd-who"><span class="sd-av">${R[i].r[0]}</span><div><b>${R[i].r}</b><div class="note">${esc(qs[i].c)}</div></div></div></div>`;
    const draw=(busy)=>{const q=qs[i],L=log[i];clearInterval(tick);
      openPanel(`${head()}<div class="sd-q">${esc(q.q)}</div>${phase?`<div class="note" style="margin:-4px 0 8px">You said: ${esc(L.a.length>140?L.a.slice(0,140)+"…":L.a)}</div><div class="sd-fu">${esc(L.fu)}</div>`:""}
        <textarea id="sdA" aria-label="Your answer" placeholder="Answer as you would out loud…" ${busy?"disabled":""}>${esc(phase?L.fa:L.a)}</textarea>
        <div class="actions"><button class="btn" id="sdNext" ${busy?"disabled":""}>${busy?"The interviewer is thinking…":phase?(i<R.length-1?"Next interviewer →":"Finish and get the decision →"):"Answer →"}</button><button class="ghost" id="sdQuit">Save and exit</button></div>`);
      try{panel.classList.add("wide")}catch(e){}
      /* live interviewer: reads the question (or follow-up) out loud once, then nods while you answer */
      let iv=null;const ivEl=document.getElementById("sdIv");
      if(window.maInterviewer&&ivEl){iv=maInterviewer(ivEl,{name:R[i].r+(firm?` · ${firm}`:""),role:qs[i].c});
        const key=i+"|"+phase;if(busy)iv.think();else if(spoken!==key){spoken=key;iv.say(phase?L.fu:q.q)}}
      $("#sdQuit").onclick=()=>{clearInterval(tick);persist();toast("Saved. Resume it from the Superday card.");closePanel()};
      if(busy)return;$("#sdA").focus();t0=Date.now();if(iv)iv.listen($("#sdA"));
      if(clock)tick=setInterval(()=>{const e=document.getElementById("sdT");if(!e){clearInterval(tick);return}const s=Math.round((Date.now()-t0)/1000);e.textContent=fmtT(s);e.style.color=s>150?"var(--bad)":s>110?"var(--warn)":""},500);
      $("#sdNext").onclick=async()=>{const v=$("#sdA").value.trim();if(v.split(/\s+/).length<4){toast("Give a real answer first");return}
        clearInterval(tick);L.secs+=Math.round((Date.now()-t0)/1000);
        if(!phase){L.a=v;draw(true);
          try{const r=await ai(`You are ${R[i].who} at ${firm||"an investment bank"} running one part of a ${goal()} Superday. Your style: ${R[i].style}.
You asked: "${q.q}". Strong answers cover: ${(q.k||[]).join("; ")}.
The candidate answered: """${v.slice(0,1500)}"""
Ask ONE short, natural follow-up question (max 30 words) that probes the weakest or most interesting part of their answer, the way a real interviewer would. If the answer was wrong, gently push on the mistake. No praise, no feedback, just the question.
Return JSON: {"followup":"..."}`,"quick");L.fu=String((r&&r.followup)||"").slice(0,240)}catch(e){}
          if(!L.fu){const miss=keyHits(q,v).find(h=>!h.ok);L.fu=miss?`You didn't really get into this part: ${miss.k.replace(/\.$/,"")}. Can you walk me through it?`:"Good. Can you go one level deeper on that?"}
          phase=1;persist();draw()}
        else{L.fa=v;gradeRound(i);if(i<R.length-1){i++;phase=0;persist();draw()}else debrief()}}};

    const debrief=async()=>{clearInterval(tick);openPanel(`<div class="label">Superday complete</div><h2>The team is deciding…</h2><p class="sub">Your interviewers are comparing notes.</p>`);
      const gs=await Promise.all(R.map((_,j)=>grades[j]||Promise.resolve(log[j].g||codeGrade(qs[j],log[j]))));
      const scores=gs.map(g=>g.score),avg=scores.reduce((a,b)=>a+b,0)/scores.length,low=Math.min(...scores);
      const decision=avg>=7.5&&low>=5?"Offer":avg>=6&&low>=4?"Callback":"No offer",ov=Math.round(avg);
      const worst=scores.indexOf(low);
      /* short AI summary on top of the code decision; skipped silently if AI is slow or unavailable */
      let sum=null;try{sum=await ai(`Hiring committee after a ${goal()} Superday at ${firm||"an investment bank"}. Decision already made: ${decision} (${avg.toFixed(1)}/10). Interview grades: ${R.map((ro,j)=>`${ro.r} ${scores[j]}/10 (${gs[j].note})`).join("; ")}.
Weakest question: "${qs[worst].q}" (strong answers cover: ${(qs[worst].k||[]).join("; ")}). Candidate said: """${(log[worst].a+" "+log[worst].fa).slice(0,1200)}"""
Return JSON: {"headline":"one sentence on why","strengths":["2 short bullets"],"fix":["2-3 short, specific fixes"],"best":"a strong 60-90 word model answer to the weakest question"}`,"quick")}catch(e){}
      const strengths=(sum&&sum.strengths)||R.map((ro,j)=>scores[j]>=7?`${ro.r}: ${gs[j].note}`:null).filter(Boolean).slice(0,2);
      const fix=(sum&&sum.fix)||gs.flatMap((g,j)=>(g.missed||[]).slice(0,1).map(m=>`${R[j].r} round: ${m}`)).slice(0,3);
      S.superdays=S.superdays||[];S.superdays.push({date:new Date().toISOString().slice(0,10),overall:ov,decision,firm,sim:1,n:R.length});S.sdDraft=null;save();
      const col=decision==="Offer"?"var(--good)":decision==="Callback"?"var(--brass)":"var(--bad)";
      const prev=S.superdays.filter(x=>x.sim).slice(-6,-1);
      openPanel(`<div class="label">Superday result${firm?` · ${esc(firm)}`:""}</div><div class="sd-dec" style="color:${col}">${esc(decision)} · ${ov}/10</div><p class="sub">${esc((sum&&sum.headline)||(decision==="Offer"?"Consistent across every interview.":decision==="Callback"?"Close. One or two weaker rounds held you back.":"Several rounds missed what interviewers were listening for."))}</p>
        ${R.map((ro,j)=>`<div class="sd-row"><span><b>${esc(ro.r)}</b> · ${esc(gs[j].note)}${log[j].secs?` <span class="note">(${fmtT(log[j].secs)}${log[j].secs>300?", too long":""})</span>`:""}</span><b>${scores[j]}/10</b></div>`).join("")}
        ${prev.length?`<p class="note" style="margin-top:8px">Your last ${prev.length}: ${prev.map(x=>`${x.overall}/10`).join(" → ")} → <b>${ov}/10</b></p>`:""}
        ${strengths.length?`<h3 class="cs-h" style="margin-top:16px">What went well</h3><ul class="sd-list">${strengths.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
        ${fix.length?`<h3 class="cs-h">Fix before the real thing</h3><ul class="sd-list">${fix.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
        ${sum&&sum.best?`<h3 class="cs-h">A stronger answer to: ${esc(qs[worst].q)}</h3><div class="sd-best">${esc(sum.best)}</div>`:""}
        <h3 class="cs-h">What each interviewer was listening for</h3>
        ${R.map((ro,j)=>{const h=keyHits(qs[j],log[j].a+" "+log[j].fa);return `<details class="sd-row" style="display:block"><summary><b>${esc(ro.r)}:</b> ${esc(qs[j].q)}</summary><ul class="sd-list">${h.map(x=>`<li>${x.ok?"✓":"✗"} ${esc(x.k)}</li>`).join("")}</ul><p class="note">You said: ${esc(log[j].a)}${log[j].fa?` / Follow-up: ${esc(log[j].fa)}`:""}</p></details>`}).join("")}
        <div class="actions"><button class="btn" id="sdAgain">Run another Superday</button><button class="ghost" id="sdDone">Done</button></div>`);
      $("#sdAgain").onclick=start;$("#sdDone").onclick=closePanel;try{renderSdCard()}catch(e){}};
    if(resume&&i>=R.length)debrief();else draw()}

  function renderSdCard(){const c=document.getElementById("sdCard");if(!c)return;const h=(S.superdays||[]).filter(x=>x.sim);const last=h[h.length-1],best=h.reduce((m,x)=>Math.max(m,x.overall||0),0);
    const dr=S.sdDraft&&Date.now()-S.sdDraft.t<3*864e5;
    c.innerHTML=`<div><span class="k">Superday simulator · Pro</span><b>${dr?"Finish your Superday":"Run a full final round"}</b><p>${h.length?`${h.length} run${h.length>1?"s":""} · last: ${esc(last.decision||"")} ${last.overall}/10 · best ${best}/10`:"4 or 6 AI interviewers, real follow-ups, graded after every interview, and a hire / no-hire decision."}</p></div><button class="btn" id="sdOpen">${dr?"Resume →":"Start a Superday →"}</button>`;
    document.getElementById("sdOpen").onclick=start}
  function card(){const pane=document.querySelector('[data-pane="interview"]');if(!pane||document.getElementById("sdCard"))return;
    const c=document.createElement("div");c.className="sd-card";c.id="sdCard";
    pane.insertBefore(c,pane.firstChild);renderSdCard()}
  window.maSuperday=start;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(card,200));else setTimeout(card,200);
})();
