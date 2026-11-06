/* Superday simulator (Pro): 4 back-to-back AI interviewers (Analyst, Associate, VP, MD). Each asks a real question
   for the student's path, then a follow-up based on what they actually said. Ends with a hire / no-hire scorecard. */
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
  const pick=f=>{const p=MOCK_QS.filter(f);return p[Math.floor(Math.random()*p.length)]};
  const goal=()=>{try{return (S.plan&&S.plan.target)||"Investment banking"}catch(e){return "Investment banking"}};
  async function ai(prompt,tier){await samplePromise;if(!SAMPLE)throw new Error("signin");return SAMPLE.json(prompt,{modelTier:tier})}

  function start(){if(!isPro()){upgrade("The Superday simulator is part of Pro");return}
    openPanel(`<div class="label">Superday simulator · Pro</div><h2>Your final round</h2>
      <p class="sub">4 interviewers, back to back: Analyst, Associate, VP and MD. Each asks a question, then follows up on what you actually said. At the end you get their decision and a scorecard.</p>
      <label class="note" for="sdFirm">Which firm are you interviewing with? (optional)</label><input id="sdFirm" type="text" maxlength="40" placeholder="e.g. Evercore" style="width:100%;font:inherit;font-size:16px;padding:11px 13px;border:1px solid var(--rule);border-radius:10px;background:var(--paper);color:var(--ink);margin:6px 0 4px">
      <p class="note">Path: <b>${esc(goal())}</b>. Type your answers like you'd say them out loud. About 15 minutes.</p>
      <div class="actions"><button class="btn" id="sdGo">Start the Superday →</button><button class="ghost" id="sdX">Not now</button></div>`);
    $("#sdGo").onclick=()=>run(($("#sdFirm").value||"").trim().slice(0,40));$("#sdX").onclick=closePanel;$("#sdFirm").focus()}

  function run(firm){const pc=PATHCAT[goal()];
    const qs=ROLES.map((ro,i)=>{const cats=ro.cats||[pc||"M&A"];const q=pick(x=>cats.includes(x.c)&&(i===3||x.d>=(i===0?1:2)))||pick(x=>cats.includes(x.c))||pick(()=>true);return q});
    const log=ROLES.map(()=>({a:"",fu:"",fa:""}));let i=0,phase=0;
    const head=()=>`<div class="label">Superday${firm?` · ${esc(firm)}`:""} · Interview ${i+1} of 4</div><div class="dots">${ROLES.map((_,j)=>`<i class="${j<i?'ok':j===i?'cur':''}"></i>`).join("")}</div>
      <div class="sd-who"><span class="sd-av">${ROLES[i].r[0]}</span><div><b>${ROLES[i].r}</b><div class="note">${esc(qs[i].c)}</div></div></div>`;
    const draw=(busy)=>{const q=qs[i],L=log[i];
      openPanel(`${head()}<div class="sd-q">${esc(q.q)}</div>${phase?`<div class="note" style="margin:-4px 0 8px">You said: ${esc(L.a.length>140?L.a.slice(0,140)+"…":L.a)}</div><div class="sd-fu">${esc(L.fu)}</div>`:""}
        <textarea id="sdA" aria-label="Your answer" placeholder="Answer as you would out loud…" ${busy?"disabled":""}>${esc(phase?L.fa:L.a)}</textarea>
        <div class="actions"><button class="btn" id="sdNext" ${busy?"disabled":""}>${busy?"The interviewer is thinking…":phase?(i<3?"Next interviewer →":"Finish and get the decision →"):"Answer →"}</button><button class="ghost" id="sdQuit">End early</button></div>`);
      try{panel.classList.add("wide")}catch(e){}
      $("#sdQuit").onclick=()=>{if(confirm("End the Superday? Your answers won't be scored."))closePanel()};
      if(busy)return;$("#sdA").focus();
      $("#sdNext").onclick=async()=>{const v=$("#sdA").value.trim();if(v.split(/\s+/).length<4){toast("Give a real answer first");return}
        if(!phase){L.a=v;draw(true);
          try{const r=await ai(`You are ${ROLES[i].who} at ${firm||"an investment bank"} running one part of a ${goal()} Superday. Your style: ${ROLES[i].style}.
You asked: "${q.q}". Strong answers cover: ${(q.k||[]).join("; ")}.
The candidate answered: """${v.slice(0,1500)}"""
Ask ONE short, natural follow-up question (max 30 words) that probes the weakest or most interesting part of their answer, the way a real interviewer would. If the answer was wrong, gently push on the mistake. No praise, no feedback, just the question.
Return JSON: {"followup":"..."}`,"quick");L.fu=String((r&&r.followup)||"Can you go one level deeper on that?").slice(0,240)}
          catch(e){L.fu="Can you walk me through that in a bit more detail?"}
          phase=1;draw()}
        else{L.fa=v;if(i<3){i++;phase=0;draw()}else debrief()}}};
    const debrief=async()=>{openPanel(`<div class="label">Superday complete</div><h2>The team is deciding…</h2><p class="sub">Your interviewers are comparing notes. This takes a few seconds.</p>`);
      const transcript=ROLES.map((ro,j)=>`${ro.r} asked: ${qs[j].q}\nStrong answers cover: ${(qs[j].k||[]).join("; ")}\nCandidate: ${log[j].a}\n${ro.r} follow-up: ${log[j].fu}\nCandidate: ${log[j].fa}`).join("\n\n");
      try{const d=await ai(`You are the hiring committee after a ${goal()} Superday at ${firm||"an investment bank"} for a summer analyst role. Grade strictly but fairly, like real bankers. Here is the full transcript:\n\n${transcript.slice(0,12000)}\n\nReturn JSON only:
{"decision":"Offer"|"Callback"|"No offer","overall":1-10,"headline":"one sentence on why",
"interviewers":[{"role":"Analyst","score":1-10,"note":"one sentence"},{"role":"Associate","score":1-10,"note":"..."},{"role":"Vice President","score":1-10,"note":"..."},{"role":"Managing Director","score":1-10,"note":"..."}],
"strengths":["2-3 short bullets"],"fix":["2-3 short, specific things to fix before the real thing"],"best":{"question":"the question they did worst on","answer":"a strong 60-90 word model answer"}}`,"default");
        const ov=Math.max(1,Math.min(10,Math.round(+d.overall||0)));S.superdays=S.superdays||[];S.superdays.push({date:new Date().toISOString().slice(0,10),overall:ov,decision:d.decision,firm,sim:1});save();
        const col=d.decision==="Offer"?"var(--good)":d.decision==="Callback"?"var(--brass)":"var(--bad)";
        openPanel(`<div class="label">Superday result${firm?` · ${esc(firm)}`:""}</div><div class="sd-dec" style="color:${col}">${esc(d.decision||"Callback")} · ${ov}/10</div><p class="sub">${esc(d.headline||"")}</p>
          ${(d.interviewers||[]).map(x=>`<div class="sd-row"><span><b>${esc(x.role)}</b> · ${esc(x.note)}</span><b>${Math.round(+x.score||0)}/10</b></div>`).join("")}
          <h3 class="cs-h" style="margin-top:16px">What went well</h3><ul class="sd-list">${(d.strengths||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          <h3 class="cs-h">Fix before the real thing</h3><ul class="sd-list">${(d.fix||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>
          ${d.best&&d.best.answer?`<h3 class="cs-h">A stronger answer to: ${esc(d.best.question||"")}</h3><div class="sd-best">${esc(d.best.answer)}</div>`:""}
          <div class="actions"><button class="btn" id="sdAgain">Run another Superday</button><button class="ghost" id="sdDone">Done</button></div>`);
        $("#sdAgain").onclick=start;$("#sdDone").onclick=closePanel}
      catch(e){openPanel(`<div class="label">Superday complete</div><h2>Couldn't get the decision</h2><p class="sub">${e.message==="signin"?"Sign in to get your AI scorecard.":"The AI didn't respond. Your answers are below so nothing is lost."}</p>
        ${ROLES.map((ro,j)=>`<div class="sd-row" style="display:block"><b>${ro.r}: ${esc(qs[j].q)}</b><div class="note">${esc(log[j].a)}</div></div>`).join("")}<div class="actions"><button class="btn" id="sdRetry">Try the decision again</button></div>`);
        $("#sdRetry").onclick=debrief}};
    draw()}

  function card(){const pane=document.querySelector('[data-pane="interview"]');if(!pane||document.getElementById("sdCard"))return;
    const c=document.createElement("div");c.className="sd-card";c.id="sdCard";
    c.innerHTML=`<div><span class="k">Superday simulator · Pro</span><b>Run a full final round</b><p>4 AI interviewers, real follow-ups, and a hire / no-hire decision with a scorecard.</p></div><button class="btn" id="sdOpen">Start a Superday →</button>`;
    pane.insertBefore(c,pane.firstChild);document.getElementById("sdOpen").onclick=start}
  window.maSuperday=start;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(card,200));else setTimeout(card,200);
})();
