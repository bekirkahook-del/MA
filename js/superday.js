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
  const css=`.sd-card{border:1px solid var(--rule);border-radius:6px;background:var(--sheet);padding:18px 20px;margin:0 0 20px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.sd-card .k{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass)}.sd-card b{display:block;font-size:18px;margin:4px 0;color:var(--ink)}.sd-card p{margin:0;font-size:14px;color:var(--ink-2)}
.sd-who{display:flex;align-items:center;gap:10px;margin:6px 0 10px}.sd-av{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--cobalt);flex:none}
.sd-q{font-size:18px;line-height:1.4;font-weight:600;color:var(--ink);margin:6px 0 12px}.sd-fu{border-left:3px solid var(--brass);padding:4px 0 4px 12px;margin:0 0 12px;font-size:16px;color:var(--ink)}
.sd-mic{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0 0}.sd-mic #dictBtn{background:var(--cobalt,#2448D8);color:#fff;border:0;border-radius:999px;padding:9px 16px;font-weight:700}.sd-mic #dictBtn.on{background:#c62828;color:#fff;border-color:#c62828}.sd-kb{margin-left:auto}@media(max-width:560px){.sd-kb{display:none}}
.sd-dec{font-size:26px;font-weight:800;margin:4px 0}.sd-row{display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--rule);font-size:14px}.sd-row b{white-space:nowrap}
.sd-list{margin:6px 0 0;padding-left:18px;font-size:14.5px;line-height:1.5}.sd-best{background:var(--paper);border:1px solid var(--rule);border-radius:4px;padding:12px 14px;font-size:14.5px;line-height:1.5}
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

  /* candidate background from their profile / uploaded resume, so interviewers can ask about it */
  function bg(){try{const p=S.profile||{},ex=(p.exp||[]).slice(0,4).map(e=>[e.title||e.role||"",e.org||e.company||""].filter(Boolean).join(" at ")).filter(Boolean);
    const parts=[p.school&&("School: "+p.school),p.major&&("Major: "+p.major),p.year&&("Year: "+p.year),ex.length&&("Experience: "+ex.join("; ")),(p.skills||[]).length&&("Skills: "+p.skills.slice(0,6).join(", "))].filter(Boolean);
    return parts.join(". ").slice(0,600)}catch(e){return ""}}
  const WHYQ=MOCK_QS.find(x=>x.q==="Why our firm?");
  const whyFirm=f=>({c:"Behavioral",d:1,custom:1,q:`Why ${f}, and not one of the other banks you're talking to?`,k:(WHYQ&&WHYQ.k)||["Names specific people they spoke with","References specific deals or groups at the firm","Connects the firm's strengths to their own goals","Avoids generic praise"]});
  const walkQ=MOCK_QS.find(x=>x.q==="Walk me through your resume.");
  const FILL=/\b(um+|uh+|erm|like|you know|basically|kind of|sort of|i mean|literally|actually)\b/gi;
  const fillers=t=>(String(t||"").match(FILL)||[]).length;
  /* shareable result image (1080x1350) */
  function shareCard(d){const c=document.createElement("canvas");c.width=1080;c.height=1350;const g=c.getContext("2d");
    const grd=g.createLinearGradient(0,0,0,1350);grd.addColorStop(0,"#0f1a33");grd.addColorStop(1,"#1d2f63");g.fillStyle=grd;g.fillRect(0,0,1080,1350);
    g.fillStyle="#c9a227";g.font="700 34px system-ui,sans-serif";g.fillText("SUPERDAY RESULT"+(d.firm?"  ·  "+d.firm.toUpperCase():""),80,140);
    const col=d.decision==="Offer"?"#38d27a":d.decision==="Callback"?"#f2c14e":"#ff6b6b";
    g.fillStyle=col;g.font="900 150px system-ui,sans-serif";g.fillText(d.decision,80,330);
    g.fillStyle="#fff";g.font="800 96px system-ui,sans-serif";g.fillText(d.ov+"/10",80,460);
    g.font="600 34px system-ui,sans-serif";g.fillStyle="#b9c4dd";g.fillText(d.n+" interviews · AI interview panel",80,520);
    d.rows.forEach((r,j)=>{const y=620+j*92;g.fillStyle="#fff";g.font="700 34px system-ui,sans-serif";g.fillText(r[0],80,y);
      g.fillStyle="rgba(255,255,255,.14)";g.fillRect(80,y+18,820,22);g.fillStyle=r[1]>=7?"#38d27a":r[1]>=5?"#f2c14e":"#ff6b6b";g.fillRect(80,y+18,82*r[1],22);
      g.fillStyle="#fff";g.font="800 34px system-ui,sans-serif";g.fillText(r[1]+"/10",930,y+40)});
    g.fillStyle="#fff";g.font="800 54px system-ui,sans-serif";g.fillText("Can you beat it?",80,1220);
    g.fillStyle="#c9a227";g.font="700 40px system-ui,sans-serif";g.fillText("mnaprep.com",80,1280);
    return new Promise(res=>c.toBlob(res,"image/png"))}
  async function share(d){try{window.maEv&&maEv("sd_share")}catch(e){}
    const b=await shareCard(d);const f=new File([b],"superday-result.png",{type:"image/png"});
    const text=`I got "${d.decision}" (${d.ov}/10) on an AI Superday${d.firm?" at "+d.firm:""}. Practice free at mnaprep.com`;
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text});return}}catch(e){if(e&&e.name==="AbortError")return}
    const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="superday-result.png";document.body.appendChild(a);a.click();a.remove();toast("Saved your result card")}

  function start(){const free=!isPro()&&!S.sdFreeUsed;if(!isPro()&&!free){upgrade("Your free interview is done. The full Superday is part of Pro");return}
    const dr=S.sdDraft&&Date.now()-S.sdDraft.t<3*864e5?S.sdDraft:null;
    openPanel(`<div class="label">Superday simulator · Pro</div><h2>Your final round</h2>
      ${free?`<div class="sd-best" style="margin:0 0 12px"><b>Try it free:</b> your first interview (the analyst round) is on us. The full panel is part of Pro.</div>`:""}
      <p class="sub">Back-to-back interviewers. Each asks a question, then follows up on what you actually said. You're graded after every interview, and at the end you get the team's decision and a scorecard.</p>
      ${dr?`<div class="sd-best" style="margin:0 0 14px"><b>You have an unfinished Superday</b>${dr.firm?` at ${esc(dr.firm)}`:""} (interview ${dr.i+1} of ${dr.qs.length}). <button class="btn sm" id="sdResume" style="margin-left:8px">Resume</button></div>`:""}
      <label class="note" for="sdFirm">Which firm are you interviewing with? (optional)</label><input id="sdFirm" type="text" maxlength="40" placeholder="e.g. Evercore" style="width:100%;font:inherit;font-size:16px;padding:11px 13px;border:1px solid var(--rule);border-radius:4px;background:var(--paper);color:var(--ink);margin:6px 0 10px">
      <div class="seg" role="group" aria-label="Length" id="sdLen"><button data-n="4" aria-pressed="true">Standard · 4 interviews (~15 min)</button><button data-n="6" aria-pressed="false">Full day · 6 interviews (~25 min)</button></div>
      <label class="note" style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="sdClock" checked> Show a clock (real interviews give you about 2 minutes per answer)</label>
      <p class="note">Path: <b>${esc(goal())}</b>. Type your answers like you'd say them out loud.</p>
      <div class="actions"><button class="btn" id="sdGo">Start the Superday →</button><button class="ghost" id="sdX">Not now</button></div>`);
    let n=4;panel.querySelectorAll("#sdLen [data-n]").forEach(b=>b.onclick=()=>{n=+b.dataset.n;panel.querySelectorAll("#sdLen [data-n]").forEach(x=>x.setAttribute("aria-pressed",x===b))});
    $("#sdGo").onclick=()=>{try{window.maEv&&maEv(free?"sd_free_start":"sd_start")}catch(e){}run({firm:($("#sdFirm").value||"").trim().replace(/[<>]/g,"").slice(0,40),n,clock:$("#sdClock").checked,teaser:free})};$("#sdX").onclick=closePanel;
    if(dr)$("#sdResume").onclick=()=>{if(!isPro()){upgrade("Finish your Superday with Pro");return}run(null,dr)};else $("#sdFirm").focus()}

  function run(opt,resume){
    const pc=PATHCAT[goal()];let firm,R,qs,log,i,phase,clock,teaser=!!(opt&&opt.teaser);const BG=bg();
    if(resume){firm=resume.firm;R=resume.n===6?FULL:ROLES;qs=resume.qs.map(t=>typeof t==="object"?t:MOCK_QS.find(x=>x.q===t)).filter(Boolean);log=resume.log;i=resume.i;phase=resume.phase;clock=resume.clock;if(qs.length!==R.length){S.sdDraft=null;save();start();return}}
    else{firm=opt.firm;clock=opt.clock;R=opt.n===6?FULL:ROLES;const prev=(S.sdSeen||[]).slice(-40);
      qs=R.map((ro,j)=>{const cats=ro.cats||[pc||"M&A"];return pick(x=>cats.includes(x.c)&&(ro.r==="Managing Director"||ro.r==="Director"||x.d>=(j===0?1:2)),prev)||pick(x=>cats.includes(x.c),prev)||pick(()=>true)});
      /* the MD asks "why this firm" when a firm is named; the director (full day) asks for their resume walk-through */
      const md=R.findIndex(ro=>ro.r==="Managing Director");if(firm&&md>=0)qs[md]=whyFirm(firm);
      const di=R.findIndex(ro=>ro.r==="Director");if(di>=0&&walkQ&&BG)qs[di]=walkQ;
      log=R.map(()=>({a:"",fu:"",fa:"",secs:0}));i=0;phase=0;S.sdSeen=(S.sdSeen||[]).concat(qs.map(q=>q.q)).slice(-60)}
    const grades=R.map((_,j)=>log[j].g?Promise.resolve(log[j].g):null);
    const persist=()=>{if(teaser)return;S.sdDraft={t:Date.now(),firm,n:R.length,qs:qs.map(q=>q.custom?q:q.q),log,i,phase,clock};save()};
    let t0=Date.now(),tick=null,spoken="";
    const gradeRound=j=>{const q=qs[j],L=log[j];
      grades[j]=ai(`You are ${R[j].who} at ${firm||"an investment bank"} grading one Superday interview for a ${goal()} summer analyst. Be strict but fair, like a real banker.
Question: "${q.q}". Strong answers cover: ${(q.k||[]).join("; ")}.
Answer: """${L.a.slice(0,1200)}"""
${BG?`Candidate background: ${BG}\n`:""}Your follow-up: "${L.fu}"
Answer to follow-up: """${L.fa.slice(0,1000)}"""
Return JSON: {"score": integer 1-10, "note": "one sentence verdict", "missed": ["up to 2 key points they missed"]}`,"quick")
        .then(r=>({score:Math.max(1,Math.min(10,Math.round(+r.score||0)))||codeGrade(q,L).score,note:String(r.note||""),missed:(r.missed||[]).slice(0,2),src:"ai"}))
        .catch(()=>codeGrade(q,L)).then(g=>{L.g=g;persist();return g})};
    const head=()=>`<div class="label">Superday${firm?` · ${esc(firm)}`:""} · Interview ${i+1} of ${R.length}${clock?` · <span id="sdT">0:00</span>`:""}</div><div class="dots">${R.map((_,j)=>`<i class="${j<i?'ok':j===i?'cur':''}"></i>`).join("")}</div>
      <div id="sdIv"><div class="sd-who"><span class="sd-av">${R[i].r[0]}</span><div><b>${R[i].r}</b><div class="note">${esc(qs[i].c)}</div></div></div></div>`;
    const draw=(busy)=>{const q=qs[i],L=log[i];clearInterval(tick);
      openPanel(`${head()}<div class="sd-q">${esc(q.q)}</div>${phase?`<div class="note" style="margin:-4px 0 8px">You said: ${esc(L.a.length>140?L.a.slice(0,140)+"…":L.a)}</div><div class="sd-fu">${esc(L.fu)}</div>`:""}
        <textarea id="sdA" aria-label="Your answer" placeholder="${window.dictateOK?"Tap 🎙 and answer out loud, or type here…":"Answer as you would out loud…"}" ${busy?"disabled":""}>${esc(phase?L.fa:L.a)}</textarea>
        ${window.dictateOK&&!busy?`<div class="sd-mic"><button class="ghost" type="button" id="dictBtn" aria-pressed="false">🎙 Start talking</button><span id="dictNote" class="note" aria-live="polite"></span><span class="note sd-kb">Ctrl + Enter to send</span></div>`:`<p class="note sd-kb" style="margin:6px 0 0">${busy?"":"Ctrl + Enter to send. Tip: use your keyboard's dictation to answer out loud."}</p>`}
        <div class="actions"><button class="btn" id="sdNext" ${busy?"disabled":""}>${busy?"The interviewer is thinking…":phase?(i<R.length-1?"Next interviewer →":"Finish and get the decision →"):"Answer →"}</button><button class="ghost" id="sdQuit">Save and exit</button></div>`);
      try{panel.classList.add("wide")}catch(e){}
      /* live interviewer: reads the question (or follow-up) out loud once, then nods while you answer */
      let iv=null;const ivEl=document.getElementById("sdIv");
      if(window.maInterviewer&&ivEl){iv=maInterviewer(ivEl,{name:R[i].r+(firm?` · ${firm}`:""),role:qs[i].c,roleKey:R[i].r});
        const key=i+"|"+phase;if(busy)iv.think();else if(spoken!==key){spoken=key;
          const ack=["Okay.","Got it.","Mm, okay.","Alright.","Sure."][Math.floor(Math.random()*5)];
          iv.say(phase?`${L.re||ack} ${L.fu}`:(i===0?`Hi, thanks for coming in. ${q.q}`:q.q))}}
      $("#sdQuit").onclick=()=>{clearInterval(tick);if(window.dictateStop)dictateStop();try{speechSynthesis.cancel()}catch(e){}persist();toast("Saved. Resume it from the Superday card.");closePanel()};
      if(busy){if(window.dictateStop)dictateStop();return}$("#sdA").focus();t0=Date.now();if(iv)iv.listen($("#sdA"));
      if(window.dictateBind&&$("#dictBtn"))dictateBind($("#dictBtn"),$("#sdA"));
      $("#sdA").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();$("#sdNext").click()}});
      if(clock)tick=setInterval(()=>{const e=document.getElementById("sdT");if(!e){clearInterval(tick);return}const s=Math.round((Date.now()-t0)/1000);e.textContent=fmtT(s);e.style.color=s>150?"var(--bad)":s>110?"var(--warn)":""},500);
      $("#sdNext").onclick=async()=>{if(window.dictateStop)dictateStop();const v=$("#sdA").value.trim();if(v.split(/\s+/).length<4){toast("Give a real answer first");return}
        clearInterval(tick);L.secs+=Math.round((Date.now()-t0)/1000);
        if(!phase){L.a=v;draw(true);
          try{const r=await ai(`You are ${R[i].who} at ${firm||"an investment bank"} running one part of a ${goal()} Superday. Your style: ${R[i].style}.
You asked: "${q.q}". Strong answers cover: ${(q.k||[]).join("; ")}.
${BG?`Candidate background (from their resume/profile): ${BG}\n`:""}The candidate answered: """${v.slice(0,1500)}"""
First react to the answer in ONE short spoken sentence (max 22 words), like a real banker: say plainly what was right and what was off or missing. Be honest; don't gush. If it was wrong, say so.
Then ask ONE short, natural follow-up question (max 30 words) that probes the weakest or most interesting part of their answer. If it fits, tie it to something specific in their background.
Return JSON: {"reaction":"...","followup":"..."}`,"quick");L.re=String((r&&r.reaction)||"").slice(0,200);L.fu=String((r&&r.followup)||"").slice(0,240)}catch(e){}
          if(!L.re){const h=keyHits(q,v),ok=h.filter(x=>x.ok).length,miss=h.find(x=>!x.ok);L.re=!h.length?"Okay.":ok/h.length>=.7?"Good, that covers the main points.":miss?`Partly there, but you didn't really get to this: ${miss.k.toLowerCase()}.`:"Okay."}
          if(!L.fu){const miss=keyHits(q,v).find(h=>!h.ok);L.fu=miss?["Let me push on that. You left out a key piece. Walk me through it step by step.","Okay, but you skipped something important there. Can you fill in the gap?","Take me one level deeper. What are you missing in that answer?"][Math.floor(Math.random()*3)]:["Can you go one level deeper on that?","Why does that matter for the deal?","How would that change if rates went up 2%?"][Math.floor(Math.random()*3)]}
          phase=1;persist();draw()}
        else{L.fa=v;gradeRound(i);if(teaser){teaserEnd();return}
          if(i<R.length-1)await roundFeedback(i);
          if(i<R.length-1){i++;phase=0;persist();
            if(window.maInterviewerJoin){openPanel(`<div id="sdJoin"></div>`);try{panel.classList.add("wide")}catch(e){}await maInterviewerJoin(document.getElementById("sdJoin"),R[i].r+(firm?` · ${firm}`:""))}
            draw()}else debrief()}}};

    /* after each round: the interviewer tells you how it went before you walk to the next office */
    const roundFeedback=j=>new Promise(async done=>{
      openPanel(`<div class="label">Interview ${j+1} of ${R.length} · wrapping up</div><div id="sdFb"></div><p class="note">${esc(R[j].r)} is writing up their notes…</p>`);try{panel.classList.add("wide")}catch(e){}
      let iv=null;const el=document.getElementById("sdFb");if(window.maInterviewer&&el){iv=maInterviewer(el,{name:R[j].r+(firm?` · ${firm}`:""),role:"Feedback",roleKey:R[j].r});iv.think()}
      const g=await Promise.race([grades[j]||Promise.resolve(codeGrade(qs[j],log[j])),new Promise(r=>setTimeout(()=>r(codeGrade(qs[j],log[j])),7000))]);
      const col=g.score>=7?"var(--good)":g.score>=5?"var(--brass)":"var(--bad)";
      const words=g.score>=8?"Strong round.":g.score>=6?"Solid, with gaps.":g.score>=4?"That one was shaky.":"That round hurt you.";
      const fb=document.createElement("div");fb.innerHTML=`<div class="sd-dec" style="color:${col}">${g.score}/10 · ${words}</div><p class="sub">${esc(g.note)}</p>
        ${(g.missed||[]).length?`<h3 class="cs-h">What they wanted to hear</h3><ul class="sd-list">${g.missed.map(m=>`<li>${esc(m)}</li>`).join("")}</ul>`:""}
        <div class="actions"><button class="btn" id="sdFbGo">Walk to the next office →</button></div>`;
      const n=panel.querySelector("p.note");if(n)n.replaceWith(fb);else panel.appendChild(fb);
      if(iv)iv.say(`${words} ${g.note}${(g.missed||[]).length?` Next time, make sure you hit: ${g.missed[0]}.`:""}`);
      const go=document.getElementById("sdFbGo");go.focus();go.onclick=()=>{try{speechSynthesis.cancel()}catch(e){}if(iv)iv.destroy();done()}});
    const teaserEnd=async()=>{S.sdFreeUsed=1;save();try{window.maEv&&maEv("sd_free_done")}catch(e){}
      openPanel(`<div class="label">Interview 1 of ${R.length} done</div><h2>Grading your answer…</h2>`);
      const g=await (grades[0]||Promise.resolve(codeGrade(qs[0],log[0])));const col=g.score>=7?"var(--good)":g.score>=5?"var(--brass)":"var(--bad)";
      openPanel(`<div class="label">${esc(R[0].r)} round${firm?` · ${esc(firm)}`:""}</div><div class="sd-dec" style="color:${col}">${g.score}/10</div><p class="sub">${esc(g.note)}</p>
        ${(g.missed||[]).length?`<h3 class="cs-h">What you missed</h3><ul class="sd-list">${g.missed.map(m=>`<li>${esc(m)}</li>`).join("")}</ul>`:""}
        <div class="sd-best" style="margin-top:14px"><b>${R.length-1} more interviewers are waiting.</b> The associate, VP and MD each ask a question and follow up on what you say. At the end you get the hire / no-hire decision, a model answer to your weakest question and a scorecard you can share.</div>
        <div class="actions"><button class="btn" id="sdUp">Unlock the full Superday</button><button class="ghost" id="sdDone">Not now</button></div>`);
      $("#sdUp").onclick=()=>{try{window.maEv&&maEv("sd_free_upgrade")}catch(e){}upgrade("Finish your Superday with Pro")};$("#sdDone").onclick=closePanel;try{renderSdCard()}catch(e){}};
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
      const allTxt=log.map(L=>L.a+" "+L.fa),wc=allTxt.map(t=>words(t).length),fl=allTxt.reduce((a,t)=>a+fillers(t),0),longR=log.filter(L=>L.secs>300).length,shortR=wc.filter(n=>n<40).length;
      const avgW=Math.round(wc.reduce((a,b)=>a+b,0)/wc.length);
      const prev=S.superdays.filter(x=>x.sim).slice(-6,-1);
      openPanel(`<div id="sdIv2"></div><div class="label">Superday result${firm?` · ${esc(firm)}`:""}</div><div class="sd-dec" style="color:${col}">${esc(decision)} · ${ov}/10</div><p class="sub">${esc((sum&&sum.headline)||(decision==="Offer"?"Consistent across every interview.":decision==="Callback"?"Close. One or two weaker rounds held you back.":"Several rounds missed what interviewers were listening for."))}</p>
        ${R.map((ro,j)=>`<div class="sd-row"><span><b>${esc(ro.r)}</b> · ${esc(gs[j].note)}${log[j].secs?` <span class="note">(${fmtT(log[j].secs)}${log[j].secs>300?", too long":""})</span>`:""}</span><b>${scores[j]}/10</b></div>`).join("")}
        ${prev.length?`<p class="note" style="margin-top:8px">Your last ${prev.length}: ${prev.map(x=>`${x.overall}/10`).join(" → ")} → <b>${ov}/10</b></p>`:""}
        ${strengths.length?`<h3 class="cs-h" style="margin-top:16px">What went well</h3><ul class="sd-list">${strengths.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
        ${fix.length?`<h3 class="cs-h">Fix before the real thing</h3><ul class="sd-list">${fix.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}
        ${sum&&sum.best?`<h3 class="cs-h">A stronger answer to: ${esc(qs[worst].q)}</h3><div class="sd-best">${esc(sum.best)}</div>`:""}
        <h3 class="cs-h">What each interviewer was listening for</h3>
        ${R.map((ro,j)=>{const h=keyHits(qs[j],log[j].a+" "+log[j].fa);return `<details class="sd-row" style="display:block"><summary><b>${esc(ro.r)}:</b> ${esc(qs[j].q)}</summary><ul class="sd-list">${h.map(x=>`<li>${x.ok?"✓":"✗"} ${esc(x.k)}</li>`).join("")}</ul><p class="note">You said: ${esc(log[j].a)}${log[j].fa?` / Follow-up: ${esc(log[j].fa)}`:""}</p></details>`}).join("")}
        <h3 class="cs-h">Delivery</h3>
        <div class="sd-row"><span>Average answer length</span><b>${avgW} words${avgW<60?" · too short":avgW>260?" · too long":" · good"}</b></div>
        <div class="sd-row"><span>Filler words (um, like, basically…)</span><b>${fl}${fl>8?" · cut these":fl>3?" · ok":" · clean"}</b></div>
        ${longR?`<div class="sd-row"><span>Answers over 5 minutes</span><b>${longR}</b></div>`:""}${shortR?`<div class="sd-row"><span>Answers under 40 words</span><b>${shortR} · say more</b></div>`:""}
        <div class="actions"><button class="btn" id="sdShare">Share my result</button><button class="ghost" id="sdDrill">Drill my weakest area: ${esc(qs[worst].c)}</button></div>
        <div class="actions"><button class="btn" id="sdAgain">Run another Superday</button><button class="ghost" id="sdDone">Done</button></div>`);
      $("#sdShare").onclick=()=>share({decision,ov,firm,n:R.length,rows:R.map((ro,j)=>[ro.r,scores[j]])});
      $("#sdDrill").onclick=()=>{try{window.maEv&&maEv("sd_drill")}catch(e){}try{goInterview(qs[worst].c)}catch(e){closePanel()}};
      try{const e2=document.getElementById("sdIv2");if(window.maInterviewer&&e2){const md=R[R.length-1];const v=maInterviewer(e2,{name:md.r+(firm?` · ${firm}`:""),role:"Decision",roleKey:md.r});
        v.say(decision==="Offer"?`Congratulations. The team was impressed, and we'd like to extend you an offer.`:decision==="Callback"?`Thanks for today. You were close. We'd like to bring you back for one more conversation.`:`Thank you for coming in. We won't be moving forward this time, but here's exactly what to work on.`)}}catch(e){}
      $("#sdAgain").onclick=start;$("#sdDone").onclick=closePanel;try{renderSdCard()}catch(e){}};
    if(resume&&i>=R.length)debrief();else draw()}

  function renderSdCard(){const c=document.getElementById("sdCard");if(!c)return;const h=(S.superdays||[]).filter(x=>x.sim);const last=h[h.length-1],best=h.reduce((m,x)=>Math.max(m,x.overall||0),0);
    const dr=S.sdDraft&&Date.now()-S.sdDraft.t<3*864e5;
    c.innerHTML=`<div><span class="k">Superday simulator · ${isPro()?"Pro":S.sdFreeUsed?"Pro":"first interview free"}</span><b>${dr?"Finish your Superday":"Run a full final round"}</b><p>${h.length?`${h.length} run${h.length>1?"s":""} · last: ${esc(last.decision||"")} ${last.overall}/10 · best ${best}/10`:"4 or 6 AI interviewers, real follow-ups, graded after every interview, and a hire / no-hire decision."}</p></div><button class="btn" id="sdOpen">${dr?"Resume →":"Start a Superday →"}</button>`;
    document.getElementById("sdOpen").onclick=start}
  function card(){const pane=document.querySelector('[data-pane="interview"]');if(!pane||document.getElementById("sdCard"))return;
    const c=document.createElement("div");c.className="sd-card";c.id="sdCard";
    pane.insertBefore(c,pane.firstChild);renderSdCard()}
  window.maSuperday=start;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(card,200));else setTimeout(card,200);
})();
