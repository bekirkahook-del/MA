/* Live interviewer (Superday): the anchor from our videos, on a video-call tile while you answer.
   Sprite sheet img/interviewer.jpg = 6 frames: neutral, mouth 30%, 60%, 100%, rounded, eyes closed.
   - say(text): reads out loud (browser voice). The mouth opens on each word the voice speaks (boundary
     events), with a fallback rhythm for browsers that don't send them.
   - listen(box): nods every few seconds while you type or talk, blinks, breathes, sways.
   - Each role gets its own voice/pitch, so interviewers feel like different people.
   No video files, no paid API. Voice can be muted (remembered per device). */
(function(){
  const st=document.createElement("style");
  st.textContent=`.ivx{display:flex;gap:16px;align-items:center;margin:6px 0 12px}
.ivx-cam{position:relative;width:150px;height:150px;flex:none;border-radius:18px;overflow:hidden;background:#0b1830;box-shadow:0 10px 28px rgba(10,20,50,.28)}
.ivx-face{position:absolute;inset:-6%;background:url(/img/interviewer.jpg) 0 0/600% 100% no-repeat;transform-origin:50% 85%;will-change:transform}
.ivx-live{position:absolute;left:8px;top:8px;font:700 10px/1 var(--mono,monospace);letter-spacing:.08em;color:#fff;background:rgba(220,40,40,.92);padding:3px 6px;border-radius:5px}
.ivx-tag{position:absolute;left:8px;bottom:8px;right:8px;font:600 11.5px/1.2 system-ui,sans-serif;color:#fff;background:rgba(8,14,30,.62);padding:4px 7px;border-radius:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ivx-ring{position:absolute;inset:0;border-radius:18px;box-shadow:inset 0 0 0 3px #3ad07a;opacity:0;transition:opacity .2s}
.ivx-cam.talk .ivx-ring{opacity:1}
.ivx-side{min-width:0}.ivx-side b{display:block;font-size:16px;color:var(--ink)}.ivx-state{font-size:13.5px;color:var(--ink-2);margin-top:2px;display:flex;align-items:center;gap:6px}
.ivx-dot{width:8px;height:8px;border-radius:50%;background:#9aa5be;flex:none}.ivx-state.on .ivx-dot{background:#3ad07a;animation:ivxP 1.2s infinite}
@keyframes ivxP{50%{opacity:.35}}
.ivx-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.ivx-btns button{font:inherit;font-size:12.5px;background:none;border:1px solid var(--rule);color:var(--ink-2);border-radius:8px;padding:4px 9px;cursor:pointer}
.ivx-join{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:260px;text-align:center}
.ivx-join .ivx-cam{width:120px;height:120px;filter:grayscale(.6) brightness(.8);animation:ivxJ 1.3s ease-in-out infinite}
@keyframes ivxJ{50%{filter:none}}
@media(min-width:700px){.ivx-cam{width:200px;height:200px}}
@media(max-width:420px){.ivx{gap:12px}.ivx-cam{width:118px;height:118px}}
@media(prefers-reduced-motion:reduce){.ivx-join .ivx-cam{animation:none}}`;
  document.head.appendChild(st);
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const calm=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches||(S.settings&&S.settings.calm)}catch(e){return false}};
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let voices=[];const loadV=()=>{try{voices=speechSynthesis.getVoices()}catch(e){}};
  try{loadV();speechSynthesis.addEventListener("voiceschanged",loadV)}catch(e){}
  /* one voice + pitch per role, so each interviewer sounds a little different */
  const VOICE={Analyst:[1.05,1.08],Associate:[1,1.02],"Associate (markets)":[1,1.1],"Vice President":[.92,1],Director:[.95,.98],"Managing Director":[.85,.95]};
  function pickVoice(role){const en=voices.filter(v=>/^en(-|_)(US|GB|AU|CA)/i.test(v.lang));
    const male=en.filter(v=>/Guy|Davis|Andrew|Christopher|Eric|Brian|Daniel|Male|Aaron|Fred|Roger|Steffan|Tony|Ryan|Thomas|Oliver|Alex/i.test(v.name));
    const pool=male.length?male:en.length?en:voices;if(!pool.length)return null;
    const keys=Object.keys(VOICE),k=Math.max(0,keys.indexOf(role));return pool[k%pool.length]}

  /* mount(el, {name, role, roleKey}) -> controller */
  window.maInterviewer=function(el,o){o=o||{};const hasTTS="speechSynthesis" in window;
    el.innerHTML=`<div class="ivx"><div class="ivx-cam" aria-hidden="true"><div class="ivx-face"></div><div class="ivx-ring"></div><span class="ivx-live">● LIVE</span><span class="ivx-tag">${esc(o.name||"Interviewer")}</span></div>
      <div class="ivx-side"><b>${esc(o.name||"Interviewer")}</b><div class="ivx-state"><span class="ivx-dot"></span><span class="ivx-st">${esc(o.role||"")}</span></div>
      <div class="ivx-btns">${hasTTS?`<button type="button" class="ivx-rep">🔁 Repeat</button><button type="button" class="ivx-mute"></button>`:""}</div></div></div>`;
    const cam=el.querySelector(".ivx-cam"),face=el.querySelector(".ivx-face"),stBox=el.querySelector(".ivx-state"),stTxt=el.querySelector(".ivx-st"),mute=el.querySelector(".ivx-mute"),rep=el.querySelector(".ivx-rep");
    let frame=0,talking=false,listening=false,mouthT=0,burst=0,nodStart=-1,lastNod=0,blinkUntil=0,nextBlink=performance.now()+1800,raf=0,alive=true,lastType=0,lastText="",gotBoundary=false;
    const voiceOn=()=>LS.get("ma-iv-voice")!=="0";
    const setMute=()=>{if(mute)mute.textContent=voiceOn()?"🔊 Voice on":"🔇 Voice off"};setMute();
    if(mute)mute.onclick=()=>{LS.set("ma-iv-voice",voiceOn()?"0":"1");setMute();if(!voiceOn())stopTalk()};
    if(rep)rep.onclick=()=>{if(lastText)say(lastText)};
    const show=f=>{if(f!==frame){frame=f;face.style.backgroundPosition=`${f*20}% 0`}};
    const setState=(t,on)=>{stTxt.textContent=t;stBox.classList.toggle("on",!!on)};
    function loop(now){if(!alive||!el.isConnected){destroy();return}
      const t=now/1000,still=calm();
      let nod=0;if(nodStart>=0){const u=(now-nodStart)/620;if(u>=1)nodStart=-1;else nod=Math.sin(u*Math.PI)*(u<.5?1:.8)}
      const sway=still?0:0.8*Math.sin(t*.9)+0.35*Math.sin(t*2.3+1)+(talking?0.4*Math.sin(t*3.1):0),bob=still?0:0.8*Math.sin(t*1.7);
      face.style.transform=`translate(${still?0:1.5*Math.sin(t*.6)}px,${bob+nod*7}px) rotate(${sway+nod*1.2}deg) scale(${1+nod*.012})`;
      if(talking){
        // word-synced: each boundary event opens the mouth (burst), then it closes; fallback rhythm without events
        if(gotBoundary){const k=Math.max(0,burst-(now-mouthT)/170);show(k>.75?3:k>.45?2:k>.15?1:0)}
        else if(now>mouthT){const seq=[1,2,3,2,4,1,3,2,0,1];show(seq[Math.floor(Math.random()*seq.length)]);mouthT=now+70+Math.random()*70}}
      else if(now<blinkUntil)show(5);
      else{show(0);if(now>nextBlink){blinkUntil=now+140;nextBlink=now+2400+Math.random()*2600}}
      if(listening&&!talking&&now-lastType<1800&&nodStart<0&&now-lastNod>2300+Math.random()*900){nodStart=now;lastNod=now}
      raf=requestAnimationFrame(loop)}
    raf=requestAnimationFrame(loop);
    let utt=null;
    function stopTalk(){talking=false;cam.classList.remove("talk");try{if(utt)speechSynthesis.cancel()}catch(e){}utt=null}
    function say(text,after){stopTalk();lastText=String(text||"");setState("Speaking",true);
      const done=()=>{talking=false;cam.classList.remove("talk");utt=null;setState(listening?"Listening":o.role||"",listening);after&&after()};
      const startTalk=()=>{talking=true;cam.classList.add("talk")};
      if(!voiceOn()||!hasTTS){startTalk();gotBoundary=false;setTimeout(()=>{if(alive)done()},Math.min(4500,600+lastText.split(/\s+/).length*120));return}
      try{try{speechSynthesis.cancel()}catch(e){}
        const u=new SpeechSynthesisUtterance(lastText),pv=VOICE[o.roleKey]||[1,1.02],v=pickVoice(o.roleKey);
        if(v)u.voice=v;u.pitch=pv[0];u.rate=pv[1];gotBoundary=false;
        u.onstart=startTalk;u.onboundary=e=>{if(e.name&&e.name!=="word")return;gotBoundary=true;burst=.8+Math.random()*.25;mouthT=performance.now()};
        u.onend=u.onerror=()=>{if(utt===u)done()};utt=u;speechSynthesis.speak(u);
        setTimeout(()=>{if(utt===u&&!talking)done()},2500) // some browsers never start speaking: don't hang
      }catch(e){done()}}
    function listen(box){listening=true;setState("Listening",true);
      const bump=()=>{lastType=performance.now()};box.addEventListener("input",bump);box.addEventListener("keydown",bump)}
    function think(){listening=false;stopTalk();setState("Thinking…",true)}
    function destroy(){alive=false;cancelAnimationFrame(raf);stopTalk()}
    return {say,listen,think,destroy,nod:()=>{nodStart=performance.now();lastNod=nodStart},heard:()=>{lastType=performance.now()}}};

  /* "X is joining…" screen between interviewers (resolves after ms) */
  window.maInterviewerJoin=function(el,name,ms){el.innerHTML=`<div class="ivx-join"><div class="ivx-cam"><div class="ivx-face"></div></div><b>${esc(name)} is joining…</b><span class="note">Next interview</span></div>`;
    return new Promise(r=>setTimeout(r,calm()?300:(ms||1300)))};
})();
