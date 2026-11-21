/* Live interviewer (Superday): the anchor from our videos, on screen while you answer.
   Sprite sheet img/interviewer.jpg = 6 frames: neutral, mouth 30%, 60%, 100%, rounded, eyes closed.
   - say(text): reads the question out loud (browser voice) with a moving mouth.
   - Watches the answer box: nods while you type or talk, blinks, small head sway when idle.
   No video files, no paid API. Voice can be muted (remembered per device). */
(function(){
  const st=document.createElement("style");
  st.textContent=`.ivx{display:flex;gap:14px;align-items:center;margin:4px 0 12px}
.ivx-cam{position:relative;width:132px;height:132px;flex:none;border-radius:18px;overflow:hidden;background:#0b1830;box-shadow:0 8px 24px rgba(10,20,50,.25)}
.ivx-face{position:absolute;inset:-6%;background:url(/img/interviewer.jpg) 0 0/600% 100% no-repeat;transform-origin:50% 85%;will-change:transform}
.ivx-live{position:absolute;left:8px;top:8px;font:700 10px/1 var(--mono,monospace);letter-spacing:.08em;color:#fff;background:rgba(220,40,40,.9);padding:3px 6px;border-radius:5px}
.ivx-side{min-width:0}.ivx-side b{display:block;font-size:15px;color:var(--ink)}.ivx-state{font-size:13px;color:var(--ink-2);margin-top:2px}
.ivx-mute{margin-top:6px;font:inherit;font-size:12.5px;background:none;border:1px solid var(--rule);color:var(--ink-2);border-radius:8px;padding:3px 8px;cursor:pointer}
@media(min-width:700px){.ivx-cam{width:168px;height:168px}}
@media(prefers-reduced-motion:reduce){.ivx-face{transition:none}}`;
  document.head.appendChild(st);
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const calm=()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches||(S.settings&&S.settings.calm)}catch(e){return false}};
  let voices=[];const loadV=()=>{try{voices=speechSynthesis.getVoices()}catch(e){}};
  try{loadV();speechSynthesis.onvoiceschanged=loadV}catch(e){}
  const pickVoice=()=>{const en=voices.filter(v=>/^en(-|_)US/i.test(v.lang));
    return en.find(v=>/Guy|Davis|Andrew|Christopher|Eric|Brian|Daniel|Male|Aaron|Fred/i.test(v.name))||en.find(v=>/Google US English/i.test(v.name))||en[0]||voices[0]||null};

  /* mount(el, {name, role}) -> controller */
  window.maInterviewer=function(el,o){o=o||{};
    el.innerHTML=`<div class="ivx"><div class="ivx-cam" aria-hidden="true"><div class="ivx-face"></div><span class="ivx-live">● LIVE</span></div>
      <div class="ivx-side"><b>${o.name||"Interviewer"}</b><div class="ivx-state">${o.role||""}</div>${"speechSynthesis" in window?`<button type="button" class="ivx-mute"></button>`:""}</div></div>`;
    const face=el.querySelector(".ivx-face"),state=el.querySelector(".ivx-state"),mute=el.querySelector(".ivx-mute");
    let frame=0,talking=false,listening=false,nodT=0,nodStart=-1,blinkUntil=0,nextBlink=performance.now()+1500,raf=0,alive=true,lastType=0;
    const voiceOn=()=>LS.get("ma-iv-voice")!=="0";
    const setMute=()=>{if(mute)mute.textContent=voiceOn()?"🔊 Voice on":"🔇 Voice off"};setMute();
    if(mute)mute.onclick=()=>{LS.set("ma-iv-voice",voiceOn()?"0":"1");setMute();if(!voiceOn())stopTalk()};
    const show=f=>{if(f!==frame){frame=f;face.style.backgroundPosition=`${f*20}% 0`}};
    const setState=t=>{state.textContent=t};
    function loop(now){if(!alive||!el.isConnected){destroy();return}
      const t=now/1000,still=calm();
      // head: slow sway + breathing, plus a nod (down then up) when triggered
      let nod=0;if(nodStart>=0){const u=(now-nodStart)/620;if(u>=1)nodStart=-1;else nod=Math.sin(u*Math.PI)*(u<.5?1:.8)}
      const sway=still?0:0.8*Math.sin(t*.9)+0.35*Math.sin(t*2.3+1),bob=still?0:0.8*Math.sin(t*1.7);
      face.style.transform=`translate(${still?0:1.5*Math.sin(t*.6)}px,${bob+nod*7}px) rotate(${sway+nod*1.2}deg) scale(${1+nod*.012})`;
      // mouth while talking, blink otherwise
      if(talking){if(now>nodT){const seq=[1,2,3,2,4,1,3,2,0,1];show(seq[Math.floor(Math.random()*seq.length)]);nodT=now+70+Math.random()*70}}
      else if(now<blinkUntil)show(5);
      else{show(0);if(now>nextBlink){blinkUntil=now+140;nextBlink=now+2400+Math.random()*2600}}
      // listening: nod every ~2.5s while the student is actively typing or talking
      if(listening&&!talking&&now-lastType<1800&&nodStart<0&&now-(listen.lastNod||0)>2300+Math.random()*900){nodStart=now;listen.lastNod=now}
      raf=requestAnimationFrame(loop)}
    raf=requestAnimationFrame(loop);
    let utt=null;
    function stopTalk(){talking=false;try{if(utt)speechSynthesis.cancel()}catch(e){}utt=null}
    function say(text,after){stopTalk();setState("Asking…");
      const done=()=>{talking=false;utt=null;setState(listening?"Listening":o.role||"");after&&after()};
      if(!voiceOn()||!("speechSynthesis" in window)){ // no voice: mouth moves for a reading-length beat
        talking=true;setTimeout(()=>{if(alive)done()},Math.min(4500,600+String(text).split(/\s+/).length*120));return}
      try{const u=new SpeechSynthesisUtterance(String(text));const v=pickVoice();if(v)u.voice=v;u.rate=1.02;u.pitch=.95;
        u.onstart=()=>{talking=true};u.onend=u.onerror=()=>{if(utt===u)done()};utt=u;speechSynthesis.speak(u);
        setTimeout(()=>{if(utt===u&&!talking)done()},2500) // some browsers never start: don't hang
      }catch(e){done()}}
    function listen(box){listening=true;setState("Listening");
      const bump=()=>{lastType=performance.now()};box.addEventListener("input",bump);box.addEventListener("keydown",bump)}
    listen.lastNod=0;
    function think(){listening=false;stopTalk();setState("Thinking…")}
    function destroy(){alive=false;cancelAnimationFrame(raf);stopTalk()}
    return {say,listen,think,destroy,nod:()=>{nodStart=performance.now()}}};
})();
