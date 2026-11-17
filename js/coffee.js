/* Mock coffee chat: the student talks to an AI banker (a made-up persona) for up to 6 messages,
   then AI grades the whole chat: intro, questions, listening, tone and close, plus a thank-you note draft. */
(function(){
  const $=s=>document.querySelector(s);
  const MAX=6; // student messages per chat; banker replies use 1 AI call each, grading uses 1
  const NAMES=["Jordan","Priya","Marcus","Emily","Daniel","Sofia","Ethan","Hannah","Ryan","Grace","Kevin","Olivia","Chris","Maya","Alex","Natalie"];
  const LAST=["Chen","Patel","Reyes","Walsh","Kim","Okafor","Nguyen","Brooks","Shah","Murphy","Lopez","Bennett"];
  const PEOPLE={
    ib:[["2nd-year analyst","the healthcare group at a bulge bracket bank"],["1st-year analyst","the technology group at an elite boutique"],["associate","the industrials group at a middle-market bank"],["3rd-year analyst","the M&amp;A group at a bulge bracket bank"],["analyst","the consumer &amp; retail group at a regional bank"]],
    pe:[["associate","a middle-market private equity fund"],["associate","a large-cap buyout firm"],["senior associate","a growth equity firm"]],
    hf:[["analyst","a long/short equity hedge fund"],["research associate","a multi-manager hedge fund"]],
    rx:[["2nd-year analyst","a restructuring advisory boutique"],["associate","the restructuring group at a large bank"]],
    mc:[["business analyst","a top strategy consulting firm"],["consultant","a strategy consulting firm"]]};
  const PATH={ib:"investment banking",pe:"private equity",hf:"hedge funds",rx:"restructuring",mc:"consulting"};
  const MOODS=[["friendly","Friendly","Warm and chatty. Good first rep."],["busy","Busy","Short answers, checks the clock. You have to keep it moving."],["tough","Dry","Polite but gives little. Vague questions get vague answers."]];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const esc2=s=>typeof esc==="function"?esc(s):String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const plain=s=>String(s).replace(/&amp;/g,"&");
  const pathKey=()=>{try{const k=S.settings.prof;return PEOPLE[k]?k:"ib"}catch(e){return "ib"}};
  const school=()=>{try{return (S.profile&&S.profile.school)||""}catch(e){return ""}};

  const css=`.cc-wrap{display:flex;flex-direction:column;gap:14px}
.cc-who{display:flex;align-items:center;gap:12px}.cc-av{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--brass);flex:none}
.cc-who b{display:block;font-size:17px;color:var(--ink)}.cc-who span{font-size:14px;color:var(--ink-2)}
.cc-log{display:flex;flex-direction:column;gap:10px;max-height:420px;overflow:auto;padding:4px 2px}
.cc-m{max-width:85%;padding:10px 14px;border-radius:14px;font-size:15px;line-height:1.45;white-space:pre-wrap}
.cc-m.them{background:var(--paper);border:1px solid var(--rule);align-self:flex-start;border-bottom-left-radius:4px}
.cc-m.me{background:var(--cobalt);color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
.cc-m.sys{align-self:center;background:none;color:var(--ink-2);font-size:13px;padding:2px}
.cc-in{display:flex;gap:8px;align-items:flex-end}.cc-in textarea{flex:1;min-height:64px;resize:vertical}
.cc-meta{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:13px;color:var(--ink-2)}
.cc-opts{display:flex;gap:8px;flex-wrap:wrap}.cc-opt{border:1px solid var(--rule);border-radius:12px;padding:10px 12px;background:var(--sheet);cursor:pointer;text-align:left;flex:1;min-width:150px;font:inherit;color:var(--ink)}
.cc-opt[aria-pressed="true"]{border-color:var(--cobalt);box-shadow:0 0 0 1px var(--cobalt)}.cc-opt b{display:block;font-size:14px}.cc-opt span{font-size:12.5px;color:var(--ink-2)}
.cc-rows{margin:8px 0 12px}.cc-row{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid var(--rule);font-size:14px}
.cc-tips{font-size:14px;color:var(--ink-2);margin:0;padding-left:18px;line-height:1.55}
@media(max-width:560px){.cc-m{max-width:94%}.cc-in{flex-direction:column;align-items:stretch}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  let mood="friendly",chat=null,busy=false;

  function newPersona(){const pk=pathKey();const [role,where]=pick(PEOPLE[pk]);const first=pick(NAMES);
    const sameSchool=school()&&Math.random()<.5;
    const bg=pick(["was a finance major who did two internships before landing the job","switched over from an accounting internship","came from a non-target school and networked hard","did a summer at a small local firm first","started in consulting and moved over after a year"]);
    return {name:`${first} ${pick(LAST)}`,first,role,where,path:PATH[pk],bg,alum:sameSchool?school():"",mood}}

  function render(){const box=$("#ccBox");if(!box)return;
    if(!chat){const hist=(S.coffee||[]);const best=hist.reduce((m,h)=>Math.max(m,h.sc||0),0);
      box.innerHTML=`<div class="cc-wrap">
        <p style="margin:0">Practice a real networking call. You'll talk to a made-up banker for up to ${MAX} messages, then AI grades the whole chat: your intro, your questions, how well you listened, your tone, and how you closed.</p>
        <div class="label">Pick the banker's mood</div>
        <div class="cc-opts">${MOODS.map(([k,n,d])=>`<button type="button" class="cc-opt" data-mood="${k}" aria-pressed="${k===mood}"><b>${n}</b><span>${d}</span></button>`).join("")}</div>
        <ul class="cc-tips"><li>They'll open by asking about you. Have a 30-second intro ready.</li><li>Ask about their path, their work and their group. Follow up on what they say.</li><li>Close well: thank them and ask who else you should talk to.</li></ul>
        <div class="cc-meta"><span>${hist.length?`${hist.length} chat${hist.length===1?"":"s"} done · best ${best}/10`:"Uses about 6 AI uses per chat."} <a href="/guides/how-to-prepare-for-a-coffee-chat/">How to prepare →</a></span><button class="btn" id="ccStart">Start the call →</button></div></div>`;
      box.querySelectorAll("[data-mood]").forEach(b=>b.onclick=()=>{mood=b.dataset.mood;render()});
      $("#ccStart").onclick=start;return}
    const p=chat.p,left=MAX-chat.n;
    box.innerHTML=`<div class="cc-wrap">
      <div class="cc-who"><div class="cc-av">${esc2(p.first[0])}</div><div><b>${esc2(p.name)}</b><span>${p.role}, ${p.where}${p.alum?` · ${esc2(p.alum)} alum`:""}</span></div></div>
      <div class="cc-log" id="ccLog">${chat.log.map(m=>`<div class="cc-m ${m.who}">${esc2(m.t)}</div>`).join("")}${busy?`<div class="cc-m sys">${esc2(p.first)} is typing…</div>`:""}</div>
      ${chat.done?`<div id="ccOut"></div>`:`<div class="cc-in"><textarea id="ccMsg" placeholder="Type what you'd say…" aria-label="Your message" ${busy?"disabled":""}></textarea><button class="btn" id="ccSend" ${busy?"disabled":""}>Send</button></div>
      <div class="cc-meta"><span>${left} message${left===1?"":"s"} left · this is a made-up person</span><span style="display:flex;gap:8px"><button class="ghost" id="ccQuit">Quit</button><button class="ghost outline" id="ccEnd" ${chat.n<2||busy?"disabled":""}>End call &amp; grade</button></span></div>`}</div>`;
    const lg=$("#ccLog");if(lg)lg.scrollTop=lg.scrollHeight;
    if(chat.done){showGrade();return}
    const ta=$("#ccMsg");if(ta&&!busy){ta.focus();ta.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}}
    $("#ccSend").onclick=send;$("#ccQuit").onclick=()=>{chat=null;render()};$("#ccEnd").onclick=()=>finish(true)}

  async function start(){await samplePromise;
    if(!SAMPLE){$("#ccBox").insertAdjacentHTML("beforeend",`<p class="note" style="margin-top:10px">${typeof aiLock==="function"?aiLock("The mock coffee chat"):"Sign in to use the mock coffee chat."}</p>`);return}
    const p=newPersona();
    const open=pick([`Hey${S.profile&&S.profile.name?`, is this ${S.profile.name.split(" ")[0]}?`:", good to meet you."} Thanks for reaching out. I've got about 15 minutes. So tell me a bit about yourself.`,`Hi! Good to meet you. Sorry, crazy day, but happy to chat. Why don't you start by telling me about yourself?`,`Hey, thanks for setting this up. Before I jump in, tell me a little about you and what you're interested in.`]);
    chat={p,log:[{who:"them",t:open}],n:0,done:false,grade:null};render()}

  function transcript(){return chat.log.filter(m=>m.who!=="sys").map(m=>`${m.who==="me"?"Student":chat.p.first}: ${m.t}`).join("\n")}

  async function send(){if(busy||!chat||chat.done)return;const ta=$("#ccMsg");const t=(ta&&ta.value||"").trim();if(!t)return;
    chat.log.push({who:"me",t:t.slice(0,1200)});chat.n++;
    if(chat.n>=MAX){const p=chat.p;chat.log.push({who:"them",t:pick([`Hey, I'm so sorry, I have to jump onto a call. This was great. Feel free to shoot me an email if anything comes up.`,`I've got to run to a meeting, but thanks for reaching out. Keep in touch.`])});finish(false);return}
    busy=true;render();const p=chat.p;
    const moodTxt={friendly:"You're warm, generous with detail and happy to help.",busy:"You're busy: keep answers short (1-2 sentences) and mention the time once if the student rambles.",tough:"You're polite but reserved. Give short answers to vague or generic questions and only open up when the student asks something specific or follows up on what you said."}[p.mood];
    const prompt=`You are role-playing ${p.name}, a ${plain(p.role)} at ${plain(p.where)}, on a 15-minute networking coffee chat call with a college student interested in ${p.path}. Background: you ${p.bg}.${p.alum?` You went to ${p.alum}, the same school as the student.`:""} ${moodTxt}
Stay fully in character as a real person on a call. Speak naturally in 1-4 short sentences. Invent ordinary, realistic details about your own job and path, but never name a real bank, real deal or real person. Don't coach the student or comment on how they're doing. If they ask for a referral or a job too early, be politely noncommittal. If they ask who else to talk to, offer to connect them with a colleague.

Conversation so far:
${transcript()}

Return ONLY JSON: {"reply": what ${p.first} says next}`;
    try{const r=await SAMPLE.json(prompt,{modelTier:"default"});chat.log.push({who:"them",t:String(r.reply||"Sorry, go on.").slice(0,800)})}
    catch(e){chat.n--;chat.log.pop();const c=e&&e.code;if(typeof toast==="function")toast(c==="rate_limited"?"Busy right now. Try again in a minute.":c==="limit"?"You've used today's AI uses.":"That didn't go through. Try again.");if(ta)setTimeout(()=>{const x=$("#ccMsg");if(x)x.value=t},0)}
    finally{busy=false;render()}}

  async function finish(early){if(early)chat.log.push({who:"sys",t:"You ended the call."});chat.done=true;render()}

  async function showGrade(){const out=$("#ccOut");if(!out)return;
    if(chat.grade){out.innerHTML=gradeHTML(chat.grade);bindAfter();return}
    out.innerHTML=`<p class="note">Grading your chat…</p>`;const p=chat.p;
    const prompt=`You are a career coach who has run hundreds of finance networking calls. Grade this college student's coffee chat with ${p.name}, a ${plain(p.role)} at ${plain(p.where)} (mood: ${p.mood}). Be honest and specific, like a demanding but fair mentor. Calibrate: 5 = forgettable, 7 = solid and they'd likely take a follow-up, 9+ = the banker would go out of their way to help. ${({gentle:"Be encouraging and lead with what went well, but stay honest. ",tough:"Grade like the toughest mentor: no credit for generic questions. "})[S.settings&&S.settings.strict]||""}
Judge: intro (clear, short story of who they are and why this field), questions (specific, not things they could Google, not about pay), listening (followed up on what the banker actually said), tone (polite, natural, respected their time, didn't ask for a job or referral too early), close (thanked them, asked who else to talk to or how to stay in touch). If the student ended the call early without a close, score close low.

Transcript:
${transcript()}

Return ONLY JSON: {"score": integer 1-10, "verdict": one short sentence, "parts": {"intro": 1-10, "questions": 1-10, "listening": 1-10, "tone": 1-10, "close": 1-10}, "strengths": [1-3 short strings], "improve": [1-3 short, specific fixes], "best_question": the student's best question quoted exactly, or "", "try_asking": [2 better questions they could ask next time, tailored to this banker], "thank_you": a short thank-you email (about 70 words) from the student that mentions one specific thing ${p.first} said}`;
    try{const r=await SAMPLE.json(prompt,{modelTier:"default"});r.score=Math.max(1,Math.min(10,Math.round(+r.score||0)));chat.grade=r;
      S.coffee=(S.coffee||[]).concat([{t:Date.now(),sc:r.score,m:p.mood}]).slice(-30);if(typeof save==="function")save();
      out.innerHTML=gradeHTML(r);bindAfter()}
    catch(e){const c=e&&e.code;out.innerHTML=`<p class="note">${c==="rate_limited"?"Grading is busy right now.":c==="limit"?"You've used today's AI uses, so this chat couldn't be graded.":"Grading didn't go through."}</p><div class="actions"><button class="btn sm" id="ccRetry">Try grading again</button><button class="ghost" id="ccNew">New chat</button></div>`;
      $("#ccRetry").onclick=showGrade;$("#ccNew").onclick=()=>{chat=null;render()}}}

  function gradeHTML(r){const sc=r.score,col=sc>=7?"var(--good)":sc>=5?"var(--warn)":"var(--bad)";const P=r.parts||{};
    const L=[["intro","Your intro"],["questions","Your questions"],["listening","Listening &amp; follow-ups"],["tone","Tone &amp; respect for time"],["close","The close"]];
    return `<div class="grade"><div class="score" style="border-color:${col};color:${col}"><div>${sc}<small>/10</small></div></div><div>
      <h4>${esc2(r.verdict||"")}</h4>
      <div class="cc-rows">${L.map(([k,n])=>`<div class="cc-row"><span>${n}</span><b>${Math.max(0,Math.min(10,Math.round(+P[k]||0)))}/10</b></div>`).join("")}</div>
      <div class="label">What worked</div><ul>${(r.strengths||[]).map(s=>`<li>${esc2(s)}</li>`).join("")}</ul>
      <div class="label">Fix next time</div><ul>${(r.improve||[]).map(s=>`<li>${esc2(s)}</li>`).join("")}</ul>
      ${r.best_question?`<div class="label">Your best question</div><p style="margin:4px 0 12px">“${esc2(r.best_question)}”</p>`:""}
      ${(r.try_asking||[]).length?`<div class="label">Try asking next time</div><ul>${r.try_asking.map(s=>`<li>${esc2(s)}</li>`).join("")}</ul>`:""}
      ${r.thank_you?`<div class="label" style="margin-bottom:6px">A thank-you note to send</div><div class="model">${esc2(r.thank_you)}</div>`:""}
      <div class="actions"><button class="btn sm" id="ccAgain">New chat</button>${r.thank_you?`<button class="ghost outline" id="ccCopy">Copy thank-you note</button>`:""}</div></div></div>`}

  function bindAfter(){const a=$("#ccAgain");if(a)a.onclick=()=>{chat=null;render();const b=$("#ccBox");b&&b.scrollIntoView({block:"start",behavior:"smooth"})};
    const c=$("#ccCopy");if(c)c.onclick=()=>{try{navigator.clipboard.writeText(chat.grade.thank_you);if(typeof toast==="function")toast("Copied")}catch(e){}}}

  function mount(){const pane=document.querySelector('[data-pane="coffee"]');if(!pane||$("#ccBox"))return;
    pane.innerHTML=`<div class="card" id="ccBox"></div>`;render()}
  window.maCoffee=()=>{try{showSub("practice","coffee")}catch(e){}};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(mount,150));else setTimeout(mount,150);
})();
