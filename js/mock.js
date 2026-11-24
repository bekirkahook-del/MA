/* Timed technical mock: 10 fresh-number questions from one track, 75 seconds each, no feedback until the end.
   Same pace as a real technical round. Misses come back with the worked steps.
   Opened from the "Number reps" panel. Does not touch scoring, XP or stars. */
(function(){
"use strict";
if(typeof openPanel!=="function"||!window.MAPractice)return;
const REPS=()=>window.MA_REPS||{};
const E=s=>typeof esc==="function"?esc(s):String(s);
const SECS=75,N=10;
const fmtAns=p=>{const a=Math.round(p.ans*100)/100,t=Math.abs(a).toLocaleString("en-US",{maximumFractionDigits:2}),s=a<0?"−":"";
  return p.unit==="$"?s+"$"+t:t.replace(/^/,s)+(p.unit||"")};

const st=document.createElement("style");
st.textContent=`
.mk-bar{height:6px;background:var(--rule,#d9dde6);border-radius:3px;overflow:hidden;margin:6px 0 10px}
.mk-bar i{display:block;height:100%;width:100%;background:var(--cobalt,#2448D8);transition:width .25s linear}
.mk-bar.low i{background:var(--bad,#b3261e)}
.mk-top{display:flex;justify-content:space-between;font:600 13px var(--mono,monospace);color:var(--ink-2,#5b6577)}
.mk-score{font:700 44px var(--mono,monospace);margin:6px 0 0}
.mk-l{margin:10px 0}
.mk-r{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:8px;padding:9px 0;border-bottom:1px solid var(--rule,#d9dde6);font-size:13.5px;text-align:left;overflow-wrap:anywhere}
.mk-r>span:first-child{font-family:var(--mono,monospace);color:var(--ink-2,#5b6577)}
.mk-r>span:last-child{font-family:var(--mono,monospace);color:var(--ink-2,#5b6577)}
.mk-r .y{color:var(--good,#1b8a4b);font-weight:700}.mk-r .x{color:var(--bad,#b3261e);font-weight:700}
.mk-r .g{color:var(--ink-2,#5b6577);font-size:12.5px;margin:2px 0}
.mk-r details summary{cursor:pointer;color:var(--cobalt,#2448D8);margin-top:4px}`;
document.head.appendChild(st);

function pool(tr){
  const keys=Object.keys(REPS()),mine=tr?keys.filter(k=>k.split(":")[0]===tr.id):[];
  return mine.length>=2?mine:keys}

function open(tr,i){
  const keys=pool(tr);if(!keys.length)return;
  const pick=(()=>{let last="";return()=>{let k;do{k=keys[Math.floor(Math.random()*keys.length)]}while(keys.length>1&&k===last);last=k;return k}})();
  const qs=Array.from({length:N},()=>{const k=pick(),G=REPS()[k];return{key:k,p:G.build(G.gen())}});
  const res=[];let n=0,timer=null;
  const stop=()=>{if(timer){clearInterval(timer);timer=null}};
  const back=()=>{stop();tr&&tr.levels&&tr.levels[i]?MAPractice.openReps(tr,i):closePanel()};

  function ask(){
    stop();
    if(n>=N)return finish();
    const q=qs[n],p=q.p;let left=SECS,t0=Date.now(),done=false;
    openPanel(`<div class="label">Timed mock${tr?" · "+E(tr.name):""}</div>
      <div class="mk-top"><span>Question ${n+1} of ${N}</span><span id="mkT">${SECS}s</span></div>
      <div class="mk-bar" id="mkB"><i></i></div>
      <div class="ls-ex" style="font-family:inherit">${p.given}</div><div class="q">${p.q}</div>
      <div class="rp-row">${p.unit==="$"?`<span class="rp-u">$</span>`:""}<input id="mkIn" class="rp-in" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Your answer">${p.unit==="%"||p.unit==="x"?`<span class="rp-u">${p.unit}</span>`:""}<button class="btn" id="mkGo" type="button">Lock it in</button></div>
      <div class="actions"><button class="ghost" id="mkQuit" type="button">Quit mock</button></div>`);
    const inp=document.getElementById("mkIn");try{inp.focus({preventScroll:true})}catch(e){}
    const submit=timeout=>{
      if(done)return;const raw=inp.value,u=MAPractice.parse(raw);
      if(!timeout&&isNaN(u)){inp.classList.add("no");inp.placeholder="number";return}
      done=true;stop();
      const okQ=!isNaN(u)&&MAPractice.closeEnough(u,p);try{if(window.MASrs)MASrs.rep(q.key,okQ)}catch(e){}
      res.push({q,u:isNaN(u)?null:u,ok:okQ,secs:Math.min(SECS,Math.round((Date.now()-t0)/1000)),timeout:!!timeout&&isNaN(u)});
      n++;ask()};
    document.getElementById("mkGo").onclick=()=>submit(false);
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();submit(false)}});
    document.getElementById("mkQuit").onclick=back;
    timer=setInterval(()=>{
      const el=document.getElementById("mkT");if(!el){stop();return}
      left=Math.max(0,SECS-(Date.now()-t0)/1000);
      el.textContent=Math.ceil(left)+"s";
      const b=document.getElementById("mkB");b.firstElementChild.style.width=(left/SECS*100)+"%";b.classList.toggle("low",left<=15);
      if(left<=0)submit(true)},250)}

  function finish(){
    stop();
    const right=res.filter(x=>x.ok).length,avg=Math.round(res.reduce((a,x)=>a+x.secs,0)/res.length);
    const grade=right>=9?"Superday ready.":right>=7?"Solid. Tighten the misses.":right>=5?"Getting there. Drill the reps.":"Back to the lessons, then try again.";
    const trs=res.map((x,ix)=>{const p=x.q.p;
      return `<div class="mk-r"><span>${ix+1}</span><div><span class="${x.ok?"y":"x"}">${x.ok?"✓":"✗"}</span> ${p.q}${x.ok?"":`<div class="g">${p.given}</div>Answer: <b>${fmtAns(p)}</b>${x.timeout?" (time ran out)":` · you: ${x.u==null?"blank":x.u}`}
        <details><summary>See the steps</summary>${p.steps.map(s=>`<div>${s[0]}: <code>${s[1]}</code></div>`).join("")}<div class="note">${p.tip||""}</div></details>`}</div><span>${x.secs}s</span></div>`}).join("");
    openPanel(`<div class="label">Timed mock · Results</div><div class="mk-score">${right}/${N}</div><p style="margin:2px 0 4px"><b>${grade}</b> Average ${avg}s per question, limit ${SECS}s.</p>
      <div class="mk-l">${trs}</div>
      <div class="actions"><button class="btn" id="mkAgain" type="button">New mock</button><button class="ghost" id="mkBack" type="button">Back to reps</button></div>`);
    document.getElementById("mkAgain").onclick=()=>open(tr,i);
    document.getElementById("mkBack").onclick=back}

  ask()}

window.MAMock={open,pool};
})();
