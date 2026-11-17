/* Mock coffee chat (VOICE CALL): the student talks out loud to an AI banker (a made-up persona).
   The banker answers out loud (speechSynthesis), the student's speech is transcribed (SpeechRecognition).
   Up to 6 student turns, then AI grades the whole call: intro, questions, listening, tone, close + a thank-you note.
   Gamified: live Rapport meter, XP + daily quest on finish, best-score tracking. Typing stays as a fallback
   for browsers without speech support (e.g. Firefox) or when the mic is blocked. */
(function(){
  const $=s=>document.querySelector(s);
  const MAX=6; // student turns per call; banker replies use 1 AI call each (also returns the rapport meter), grading uses 1
  const NAMES=["Jordan","Priya","Marcus","Emily","Daniel","Sofia","Ethan","Hannah","Ryan","Grace","Kevin","Olivia","Chris","Maya","Alex","Natalie"];
  const FEMALE=["Priya","Emily","Sofia","Hannah","Grace","Olivia","Maya","Natalie"];
  const LAST=["Chen","Patel","Reyes","Walsh","Kim","Okafor","Nguyen","Brooks","Shah","Murphy","Lopez","Bennett"];
  const PEOPLE={
    ib:[["2nd-year analyst","the healthcare group at a bulge bracket bank"],["1st-year analyst","the technology group at an elite boutique"],["associate","the industrials group at a middle-market bank"],["3rd-year analyst","the M&amp;A group at a bulge bracket bank"],["analyst","the consumer &amp; retail group at a regional bank"]],
    pe:[["associate","a middle-market private equity fund"],["associate","a large-cap buyout firm"],["senior associate","a growth equity firm"]],
    hf:[["analyst","a long/short equity hedge fund"],["research associate","a multi-manager hedge fund"]],
    rx:[["2nd-year analyst","a restructuring advisory boutique"],["associate","the restructuring group at a large bank"]],
    mc:[["business analyst","a top strategy consulting firm"],["consultant","a strategy consulting firm"]]};
  const PATH={ib:"investment banking",pe:"private equity",hf:"hedge funds",rx:"restructuring",mc:"consulting"};
  const MOODS=[["friendly","Friendly","Warm and chatty. Good first rep."],["busy","Busy","Short answers, checks the clock. Keep it moving."],["tough","Dry","Polite but gives little. Vague questions get vague answers."]];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const esc2=s=>typeof esc==="function"?esc(s):String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const plain=s=>String(s).replace(/&amp;/g,"&");
  const pathKey=()=>{try{const k=S.settings.prof;return PEOPLE[k]?k:"ib"}catch(e){return "ib"}};
  const school=()=>{try{return (S.profile&&S.profile.school)||""}catch(e){return ""}};

  /* ---- voice support ---- */
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  const TTS=window.speechSynthesis;
  const voiceOK=!!(SR&&TTS&&window.SpeechSynthesisUtterance);
  const MIC='<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  const STOP='<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>';

  const css=`.cc-wrap{display:flex;flex-direction:column;gap:14px}
.cc-who{display:flex;align-items:center;gap:12px}.cc-av{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--brass);flex:none}
.cc-who b{display:block;font-size:17px;color:var(--ink)}.cc-who span{font-size:14px;color:var(--ink-2)}
.cc-log{display:flex;flex-direction:column;gap:10px;max-height:300px;overflow:auto;padding:4px 2px}
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
/* voice stage */
.cc-stage{display:flex;flex-direction:column;align-items:center;gap:10px;padding:18px 8px 6px;border-radius:18px;background:linear-gradient(160deg,color-mix(in srgb,var(--cobalt) 16%,transparent),color-mix(in srgb,var(--brass) 14%,transparent));border:1px solid var(--rule)}
.cc-orb{position:relative;width:96px;height:96px;border-radius:50%;display:grid;place-items:center;font-size:38px;font-weight:800;color:#fff;background:linear-gradient(145deg,var(--cobalt),var(--brass))}
.cc-orb::before,.cc-orb::after{content:"";position:absolute;inset:-6px;border-radius:50%;border:2px solid var(--cobalt);opacity:0}
.cc-orb.speak::before{animation:ccPulse 1.6s ease-out infinite}.cc-orb.speak::after{animation:ccPulse 1.6s ease-out .8s infinite}
.cc-orb.listen{box-shadow:0 0 0 6px color-mix(in srgb,var(--good) 35%,transparent)}.cc-orb.listen::before{border-color:var(--good);animation:ccPulse 1.1s ease-out infinite}
.cc-orb.think{animation:ccBreath 1.2s ease-in-out infinite}
@keyframes ccPulse{0%{transform:scale(.92);opacity:.7}100%{transform:scale(1.5);opacity:0}}
@keyframes ccBreath{50%{transform:scale(1.06)}}
.cc-status{font-size:14px;font-weight:600;color:var(--ink)}
.cc-live{min-height:44px;max-width:520px;text-align:center;font-size:15px;line-height:1.4;color:var(--ink-2);font-style:italic}
.cc-mic{width:68px;height:68px;border-radius:50%;border:0;display:grid;place-items:center;cursor:pointer;color:#fff;background:var(--cobalt);box-shadow:0 6px 18px color-mix(in srgb,var(--cobalt) 40%,transparent);transition:transform .12s}
.cc-mic:active{transform:scale(.94)}.cc-mic.on{background:var(--bad,#c0392b)}.cc-mic:disabled{opacity:.45;cursor:default;box-shadow:none}
.cc-rap{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--ink-2)}.cc-rap b{min-width:26px;text-align:right;color:var(--ink)}
.cc-rapbar{flex:1;height:10px;border-radius:99px;background:var(--rule);overflow:hidden}.cc-rapbar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--warn),var(--good));transition:width .7s cubic-bezier(.2,.8,.2,1)}
.cc-pips{display:flex;gap:6px;justify-content:center}.cc-pips i{width:22px;height:6px;border-radius:99px;background:var(--rule)}.cc-pips i.on{background:var(--cobalt)}
.cc-xp{display:flex;gap:8px;flex-wrap:wrap;margin:2px 0 10px}.cc-chip{font-size:13px;font-weight:700;padding:4px 10px;border-radius:99px;background:color-mix(in srgb,var(--brass) 22%,transparent);color:var(--ink)}
.cc-chip.g{background:color-mix(in srgb,var(--good) 22%,transparent)}
.cc-modes{display:flex;gap:8px}.cc-modes .cc-opt{min-width:0}
.cc-fold summary{cursor:pointer;font-size:13px;color:var(--ink-2)}
@media(prefers-reduced-motion:reduce){.cc-orb,.cc-orb::before,.cc-orb::after{animation:none!important}}
@media(max-width:560px){.cc-m{max-width:94%}.cc-in{flex-direction:column;align-items:stretch}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  let mood="friendly",chat=null,busy=false;
  let speaking=false,listening=false,rec=null,finalTxt="",interim="",silenceT=null,gotSpeech=false,speakTok=0;
  const modeNow=()=>{const m=S.coffeeMode;return voiceOK&&m!=="text"?"voice":"text"};

  /* ---- XP (also read by totalXP in app.js via window.coffeeXP) ---- */
  window.coffeeXP=h=>10+((h.sc||0)>=7?5:0)+((h.sc||0)>=9?10:0);

  /* ---- speaking ---- */
  let voices=[];const loadVoices=()=>{try{voices=TTS.getVoices().filter(v=>/^en/i.test(v.lang))}catch(e){}};
  if(voiceOK){loadVoices();try{TTS.addEventListener("voiceschanged",loadVoices)}catch(e){}}
  function pickVoice(p){if(!voices.length)loadVoices();if(!voices.length)return null;
    const fem=/samantha|karen|victoria|zira|jenny|aria|susan|moira|tessa|fiona|female|serena/i,mal=/alex|daniel|fred|david|guy|aaron|mark|male|tom|oliver|arthur/i;
    const want=p.gender==="f"?fem:mal;const us=voices.filter(v=>/en[-_]US/i.test(v.lang));
    const pool=[...us,...voices];const hit=pool.filter(v=>want.test(v.name));
    const list=hit.length?hit:(us.length?us:voices);let h=0;for(const c of p.name)h=(h*31+c.charCodeAt(0))>>>0;return list[h%list.length]}
  function stopAudio(){speakTok++;try{TTS&&TTS.cancel()}catch(e){}speaking=false;stopListen(true)}
  function speak(text,done){speakTok++;const tok=speakTok;let fired=false;
    const fin=()=>{if(fired||tok!==speakTok)return;fired=true;speaking=false;clearTimeout(guard);done&&done()};
    let guard;
    if(!voiceOK||modeNow()!=="voice"){done&&done();return}
    try{TTS.cancel();const u=new SpeechSynthesisUtterance(plain(text));const v=pickVoice(chat.p);if(v){u.voice=v;u.lang=v.lang}
      let ph=0;for(const c of chat.p.name)ph=(ph*17+c.charCodeAt(0))>>>0;u.pitch=chat.p.gender==="f"?1.05+(ph%5)*.03:.85+(ph%5)*.04;
      u.rate=chat.p.mood==="busy"?1.15:chat.p.mood==="tough"?.97:1.03;
      u.onend=fin;u.onerror=fin;speaking=true;
      guard=setTimeout(fin,Math.max(3500,text.length*85+2500)); // some browsers never fire onend
      TTS.speak(u);render()}catch(e){speaking=false;done&&done()}}

  /* ---- listening ---- */
  function setLive(t){const el=$("#ccLive");if(el)el.textContent=t||""}
  function stopListen(silent){clearTimeout(silenceT);if(rec){try{rec.onresult=rec.onerror=rec.onend=null;rec.abort()}catch(e){}rec=null}listening=false;finalTxt="";interim="";if(!silent)render()}
  function startListen(){if(!voiceOK||!chat||chat.done||busy||speaking||listening)return;
    finalTxt="";interim="";gotSpeech=false;
    try{rec=new SR();rec.lang="en-US";rec.interimResults=true;rec.continuous=true;rec.maxAlternatives=1}catch(e){S.coffeeMode="text";render();return}
    rec.onresult=e=>{gotSpeech=true;let fin="",tmp="";for(let i=0;i<e.results.length;i++){const r=e.results[i];(r.isFinal?(fin+=r[0].transcript+" "):(tmp+=r[0].transcript))}
      finalTxt=fin;interim=tmp;setLive((finalTxt+interim).trim());clearTimeout(silenceT);silenceT=setTimeout(()=>endTurn(),2400)};
    rec.onerror=e=>{const c=e&&e.error;if(c==="not-allowed"||c==="service-not-allowed"){stopListen(true);S.coffeeMode="text";try{save()}catch(x){}if(typeof toast==="function")toast("Mic is blocked. Switched to typing. Allow the mic in your browser to use voice.");render()}
      else if(c==="no-speech"||c==="aborted"){/* handled in onend */}else if(c==="network"){if(typeof toast==="function")toast("Voice needs an internet connection.")}};
    rec.onend=()=>{if(rec){endTurn()}};
    try{rec.start();listening=true;render()}catch(e){rec=null;listening=false}}
  function endTurn(){if(!listening&&!rec)return;const t=(finalTxt+" "+interim).trim();const r=rec;clearTimeout(silenceT);
    if(r){try{r.onresult=r.onerror=r.onend=null;r.stop()}catch(e){}}rec=null;listening=false;finalTxt="";interim="";
    if(t.length>1){send(t)}else{setLive("");render()}}
  function micTap(){if(busy||!chat||chat.done)return;
    if(speaking){speakTok++;try{TTS.cancel()}catch(e){}speaking=false;startListen();return}
    if(listening){endTurn();return}
    startListen()}

  function newPersona(){const pk=pathKey();const [role,where]=pick(PEOPLE[pk]);const first=pick(NAMES);
    const sameSchool=school()&&Math.random()<.5;
    const bg=pick(["was a finance major who did two internships before landing the job","switched over from an accounting internship","came from a non-target school and networked hard","did a summer at a small local firm first","started in consulting and moved over after a year"]);
    return {name:`${first} ${pick(LAST)}`,first,role,where,path:PATH[pk],bg,alum:sameSchool?school():"",mood,gender:FEMALE.includes(first)?"f":"m"}}

  const statusTxt=()=>busy?`${chat.p.first} is thinking…`:speaking?`${chat.p.first} is talking · tap the mic to jump in`:listening?"Listening… tap the mic when you're done":"Your turn · tap the mic and talk";

  function render(){const box=$("#ccBox");if(!box)return;
    if(!chat){const hist=(S.coffee||[]);const best=hist.reduce((m,h)=>Math.max(m,h.sc||0),0);const md=modeNow();
      box.innerHTML=`<div class="cc-wrap">
        <p style="margin:0">Practice a real networking call, out loud. You'll talk to a made-up banker for up to ${MAX} turns, and they talk back. Then AI grades the whole call: your intro, questions, listening, tone and close. Keep their <b>Rapport</b> meter climbing.</p>
        ${voiceOK?`<div class="label">How do you want to talk?</div><div class="cc-opts cc-modes"><button type="button" class="cc-opt" data-md="voice" aria-pressed="${md==="voice"}"><b>🎙 Voice call</b><span>Speak, they answer out loud</span></button><button type="button" class="cc-opt" data-md="text" aria-pressed="${md==="text"}"><b>⌨ Type it</b><span>Same call, no mic</span></button></div>`:`<p class="note" style="margin:0">Voice calls need Chrome, Edge or Safari. You can still do this call by typing.</p>`}
        <div class="label">Pick the banker's mood</div>
        <div class="cc-opts">${MOODS.map(([k,n,d])=>`<button type="button" class="cc-opt" data-mood="${k}" aria-pressed="${k===mood}"><b>${n}</b><span>${d}</span></button>`).join("")}</div>
        <ul class="cc-tips"><li>They open by asking about you. Have a 30-second intro ready.</li><li>Ask about their path, their work and their group. Follow up on what they say.</li><li>Close well: thank them and ask who else you should talk to.</li></ul>
        <div class="cc-meta"><span>${hist.length?`${hist.length} call${hist.length===1?"":"s"} done · best ${best}/10`:"Uses about 6 AI uses per call."} <a href="/guides/how-to-prepare-for-a-coffee-chat/">How to prepare →</a></span><button class="btn" id="ccStart">${md==="voice"?"Start the call 🎙":"Start the call →"}</button></div></div>`;
      box.querySelectorAll("[data-mood]").forEach(b=>b.onclick=()=>{mood=b.dataset.mood;render()});
      box.querySelectorAll("[data-md]").forEach(b=>b.onclick=()=>{S.coffeeMode=b.dataset.md;try{save()}catch(e){}render()});
      $("#ccStart").onclick=start;return}
    const p=chat.p,left=MAX-chat.n,voice=modeNow()==="voice";
    const rap=Math.max(0,Math.min(100,Math.round(chat.rapport)));
    const rapHTML=`<div class="cc-rap"><span>Rapport</span><div class="cc-rapbar"><i style="width:${rap}%"></i></div><b>${rap}</b></div>`;
    const logHTML=chat.log.map(m=>`<div class="cc-m ${m.who}">${esc2(m.t)}</div>`).join("");
    const state=busy?"think":speaking?"speak":listening?"listen":"";
    const stage=voice&&!chat.done?`<div class="cc-stage">
        <div class="cc-orb ${state}" aria-hidden="true">${esc2(p.first[0])}</div>
        <div class="cc-status" role="status" aria-live="polite">${esc2(statusTxt())}</div>
        <div class="cc-live" id="ccLive"></div>
        <button class="cc-mic ${listening?"on":""}" id="ccMic" type="button" aria-label="${listening?"Stop and send":"Talk"}" ${busy?"disabled":""}>${listening?STOP:MIC}</button>
        <div class="cc-pips" aria-label="${left} turns left">${Array.from({length:MAX},(_,i)=>`<i class="${i<chat.n?"on":""}"></i>`).join("")}</div>
      </div>`:"";
    const textIn=!voice&&!chat.done?`<div class="cc-in"><textarea id="ccMsg" placeholder="Type what you'd say…" aria-label="Your message" ${busy?"disabled":""}></textarea><button class="btn" id="ccSend" ${busy?"disabled":""}>Send</button></div>`:"";
    box.innerHTML=`<div class="cc-wrap">
      <div class="cc-who"><div class="cc-av">${esc2(p.first[0])}</div><div><b>${esc2(p.name)}</b><span>${p.role}, ${p.where}${p.alum?` · ${esc2(p.alum)} alum`:""}</span></div></div>
      ${chat.done?"":rapHTML}${stage}
      ${voice&&!chat.done?`<details class="cc-fold"><summary>Captions</summary><div class="cc-log" id="ccLog">${logHTML}</div></details>`:`<div class="cc-log" id="ccLog">${logHTML}${busy&&!voice?`<div class="cc-m sys">${esc2(p.first)} is typing…</div>`:""}</div>`}
      ${chat.done?`<div id="ccOut"></div>`:`${textIn}
      <div class="cc-meta"><span>${left} turn${left===1?"":"s"} left · this is a made-up person</span><span style="display:flex;gap:8px">${voiceOK?`<button class="ghost" id="ccMode">${voice?"Type instead":"Use voice"}</button>`:""}<button class="ghost" id="ccQuit">Quit</button><button class="ghost outline" id="ccEnd" ${chat.n<2||busy?"disabled":""}>End call &amp; grade</button></span></div>`}</div>`;
    const lg=$("#ccLog");if(lg)lg.scrollTop=lg.scrollHeight;
    if(chat.done){showGrade();return}
    const ta=$("#ccMsg");if(ta&&!busy){ta.focus();ta.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();const t=(ta.value||"").trim();if(t)send(t)}}}
    const sb=$("#ccSend");if(sb)sb.onclick=()=>{const x=$("#ccMsg");const t=(x&&x.value||"").trim();if(t)send(t)};
    const mic=$("#ccMic");if(mic)mic.onclick=micTap;
    const md=$("#ccMode");if(md)md.onclick=()=>{stopAudio();S.coffeeMode=voice?"text":"voice";try{save()}catch(e){}render();if(!voice&&!busy&&!chat.done)startListenSoon()};
    $("#ccQuit").onclick=()=>{stopAudio();chat=null;render()};$("#ccEnd").onclick=()=>{stopAudio();finish(true)};
    if(listening)setLive((finalTxt+" "+interim).trim())}

  function startListenSoon(){setTimeout(()=>{if(modeNow()==="voice")startListen()},350)}

  /* the banker says something: show it, speak it, then open the mic */
  function bankerSays(t,after){render();speak(t,()=>{render();after&&after()})}

  async function start(){await samplePromise;
    if(!SAMPLE){$("#ccBox").insertAdjacentHTML("beforeend",`<p class="note" style="margin-top:10px">${typeof aiLock==="function"?aiLock("The mock coffee chat"):"Sign in to use the mock coffee chat."}</p>`);return}
    const p=newPersona();
    const open=pick([`Hey${S.profile&&S.profile.name?`, is this ${S.profile.name.split(" ")[0]}?`:", good to meet you."} Thanks for reaching out. I've got about 15 minutes. So tell me a bit about yourself.`,`Hi! Good to meet you. Sorry, crazy day, but happy to chat. Why don't you start by telling me about yourself?`,`Hey, thanks for setting this up. Before I jump in, tell me a little about you and what you're interested in.`]);
    chat={p,log:[{who:"them",t:open}],n:0,done:false,grade:null,rapport:30,peak:30,voice:modeNow()==="voice"};
    bankerSays(open,()=>{if(modeNow()==="voice")startListen()})}

  function transcript(){return chat.log.filter(m=>m.who!=="sys").map(m=>`${m.who==="me"?"Student":chat.p.first}: ${m.t}`).join("\n")}

  async function send(text){if(busy||!chat||chat.done)return;const t=String(text||"").trim();if(!t)return;
    stopListen(true);setLive("");
    chat.log.push({who:"me",t:t.slice(0,1200)});chat.n++;
    if(chat.n>=MAX){const p=chat.p;const bye=pick([`Hey, I'm so sorry, I have to jump onto a call. This was great. Feel free to shoot me an email if anything comes up.`,`I've got to run to a meeting, but thanks for reaching out. Keep in touch.`]);chat.log.push({who:"them",t:bye});
      render();speak(bye,()=>finish(false));return}
    busy=true;render();const p=chat.p;
    const moodTxt={friendly:"You're warm, generous with detail and happy to help.",busy:"You're busy: keep answers short (1-2 sentences) and mention the time once if the student rambles.",tough:"You're polite but reserved. Give short answers to vague or generic questions and only open up when the student asks something specific or follows up on what you said."}[p.mood];
    const prompt=`You are role-playing ${p.name}, a ${plain(p.role)} at ${plain(p.where)}, on a 15-minute networking coffee chat call with a college student interested in ${p.path}. Background: you ${p.bg}.${p.alum?` You went to ${p.alum}, the same school as the student.`:""} ${moodTxt}
Stay fully in character as a real person on a call. Speak naturally in 1-4 short sentences, in plain spoken English that sounds right read aloud (no lists, no emojis, no stage directions). Invent ordinary, realistic details about your own job and path, but never name a real bank, real deal or real person. Don't coach the student or comment on how they're doing. If they ask for a referral or a job too early, be politely noncommittal. If they ask who else to talk to, offer to connect them with a colleague.${chat.voice?" The student's words were spoken aloud and auto-transcribed, so ignore missing punctuation or small transcription slips.":""}

Conversation so far:
${transcript()}

Also rate how warmly ${p.first} feels about this student right now as "rapport", 0-100 (it was ${Math.round(chat.rapport)} last turn; move it gradually, up 5-20 for a clear intro, specific questions or real follow-ups, down 5-20 for generic questions, rambling, asking for a job too early, or ignoring what they said).
Return ONLY JSON: {"reply": what ${p.first} says next, "rapport": integer 0-100}`;
    let reply=null;
    try{const r=await SAMPLE.json(prompt,{modelTier:"default"});reply=String(r.reply||"Sorry, go on.").slice(0,800);
      const rp=Math.max(0,Math.min(100,Math.round(+r.rapport)));if(isFinite(rp)&&r.rapport!==undefined){chat.rapport=rp;chat.peak=Math.max(chat.peak,rp)}
      chat.log.push({who:"them",t:reply})}
    catch(e){chat.n--;chat.log.pop();const c=e&&e.code;if(typeof toast==="function")toast(c==="rate_limited"?"Busy right now. Try again in a minute.":c==="limit"?"You've used today's AI uses.":"That didn't go through. Try again.");
      busy=false;render();const ta=$("#ccMsg");if(ta)setTimeout(()=>{const x=$("#ccMsg");if(x)x.value=t},0);return}
    busy=false;
    if(reply!==null)bankerSays(reply,()=>{if(modeNow()==="voice"&&chat&&!chat.done)startListen()})}

  async function finish(early){stopAudio();if(early)chat.log.push({who:"sys",t:"You ended the call."});chat.done=true;render()}

  async function showGrade(){const out=$("#ccOut");if(!out)return;
    if(chat.grade){out.innerHTML=gradeHTML(chat.grade);bindAfter();return}
    out.innerHTML=`<p class="note">Grading your call…</p>`;const p=chat.p;
    const prompt=`You are a career coach who has run hundreds of finance networking calls. Grade this college student's coffee chat with ${p.name}, a ${plain(p.role)} at ${plain(p.where)} (mood: ${p.mood}). Be honest and specific, like a demanding but fair mentor. Calibrate: 5 = forgettable, 7 = solid and they'd likely take a follow-up, 9+ = the banker would go out of their way to help. ${({gentle:"Be encouraging and lead with what went well, but stay honest. ",tough:"Grade like the toughest mentor: no credit for generic questions. "})[S.settings&&S.settings.strict]||""}${chat.voice?"The student spoke out loud and their words were auto-transcribed, so ignore missing punctuation, capitalization and small transcription errors; do judge how tight and natural the answers would sound spoken. ":""}
Judge: intro (clear, short story of who they are and why this field), questions (specific, not things they could Google, not about pay), listening (followed up on what the banker actually said), tone (polite, natural, respected their time, didn't ask for a job or referral too early), close (thanked them, asked who else to talk to or how to stay in touch). If the student ended the call early without a close, score close low.

Transcript:
${transcript()}

Return ONLY JSON: {"score": integer 1-10, "verdict": one short sentence, "parts": {"intro": 1-10, "questions": 1-10, "listening": 1-10, "tone": 1-10, "close": 1-10}, "strengths": [1-3 short strings], "improve": [1-3 short, specific fixes], "best_question": the student's best question quoted exactly, or "", "try_asking": [2 better questions they could ask next time, tailored to this banker], "thank_you": a short thank-you email (about 70 words) from the student that mentions one specific thing ${p.first} said}`;
    try{const r=await SAMPLE.json(prompt,{modelTier:"default"});r.score=Math.max(1,Math.min(10,Math.round(+r.score||0)));chat.grade=r;
      const prevBest=(S.coffee||[]).reduce((m,h)=>Math.max(m,h.sc||0),0);
      const entry={t:Date.now(),sc:r.score,m:p.mood,rp:Math.round(chat.peak)};
      S.coffee=(S.coffee||[]).concat([entry]).slice(-30);
      r._xp=window.coffeeXP(entry);r._best=r.score>prevBest&&prevBest>0;r._first=prevBest===0;
      if(typeof save==="function")save();
      try{if(typeof questEvt==="function")questEvt("coffee")}catch(e){}
      out.innerHTML=gradeHTML(r);bindAfter();
      try{if(r.score>=7){if(typeof sfx==="function")sfx("chest");if(typeof fxConfetti==="function")fxConfetti(innerWidth/2,innerHeight*.35,{n:r.score>=9?90:50})}}catch(e){}
      try{if(typeof window.render==="function")window.render()}catch(e){}}
    catch(e){const c=e&&e.code;out.innerHTML=`<p class="note">${c==="rate_limited"?"Grading is busy right now.":c==="limit"?"You've used today's AI uses, so this call couldn't be graded.":"Grading didn't go through."}</p><div class="actions"><button class="btn sm" id="ccRetry">Try grading again</button><button class="ghost" id="ccNew">New call</button></div>`;
      $("#ccRetry").onclick=showGrade;$("#ccNew").onclick=()=>{chat=null;render()}}}

  function gradeHTML(r){const sc=r.score,col=sc>=7?"var(--good)":sc>=5?"var(--warn)":"var(--bad)";const P=r.parts||{};
    const L=[["intro","Your intro"],["questions","Your questions"],["listening","Listening &amp; follow-ups"],["tone","Tone &amp; respect for time"],["close","The close"]];
    const chips=`<div class="cc-xp">${r._xp?`<span class="cc-chip">+${r._xp} XP</span>`:""}${r._best?`<span class="cc-chip g">New personal best</span>`:r._first?`<span class="cc-chip g">First call done</span>`:""}<span class="cc-chip">Peak rapport ${Math.round(chat.peak)}</span></div>`;
    return `<div class="grade"><div class="score" style="border-color:${col};color:${col}"><div>${sc}<small>/10</small></div></div><div>
      <h4>${esc2(r.verdict||"")}</h4>${chips}
      <div class="cc-rows">${L.map(([k,n])=>`<div class="cc-row"><span>${n}</span><b>${Math.max(0,Math.min(10,Math.round(+P[k]||0)))}/10</b></div>`).join("")}</div>
      <div class="label">What worked</div><ul>${(r.strengths||[]).map(s=>`<li>${esc2(s)}</li>`).join("")}</ul>
      <div class="label">Fix next time</div><ul>${(r.improve||[]).map(s=>`<li>${esc2(s)}</li>`).join("")}</ul>
      ${r.best_question?`<div class="label">Your best question</div><p style="margin:4px 0 12px">“${esc2(r.best_question)}”</p>`:""}
      ${(r.try_asking||[]).length?`<div class="label">Try asking next time</div><ul>${r.try_asking.map(s=>`<li>${esc2(s)}</li>`).join("")}</ul>`:""}
      ${r.thank_you?`<div class="label" style="margin-bottom:6px">A thank-you note to send</div><div class="model">${esc2(r.thank_you)}</div>`:""}
      <div class="actions"><button class="btn sm" id="ccAgain">New call</button>${r.thank_you?`<button class="ghost outline" id="ccCopy">Copy thank-you note</button>`:""}</div></div></div>`}

  function bindAfter(){const a=$("#ccAgain");if(a)a.onclick=()=>{chat=null;render();const b=$("#ccBox");b&&b.scrollIntoView({block:"start",behavior:"smooth"})};
    const c=$("#ccCopy");if(c)c.onclick=()=>{try{navigator.clipboard.writeText(chat.grade.thank_you);if(typeof toast==="function")toast("Copied")}catch(e){}}}

  function mount(){const pane=document.querySelector('[data-pane="coffee"]');if(!pane||$("#ccBox"))return;
    pane.insertAdjacentHTML("beforeend",`<div class="card" id="ccBox"></div>`);render()}
  // stop talking/listening if the user leaves the tab or the Coffee pane
  document.addEventListener("visibilitychange",()=>{if(document.hidden&&chat&&(speaking||listening))stopAudio()});
  setInterval(()=>{const pane=document.querySelector('[data-pane="coffee"]');if(pane&&pane.hidden&&chat&&(speaking||listening)){stopAudio();render()}},1000);
  window.addEventListener("beforeunload",()=>{try{TTS&&TTS.cancel()}catch(e){}});
  window.maCoffee=()=>{try{showSub("practice","coffee")}catch(e){}};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(mount,150));else setTimeout(mount,150);
})();
