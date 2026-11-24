/* Practice layer on top of the lessons (js/lessons.js, js/lessons2.js):
   1) "Your turn": after a lesson's worked example, a fresh problem with new numbers (js/reps-data.js). Type the answer, see the steps.
   2) "Number reps": the same problems on repeat from any level briefing.
   3) "Why you missed it": after a drill, every miss gets its explanation plus the exact lesson card that teaches it.
   Nothing here changes scoring, XP or stars. It only adds practice and feedback. */
(function(){
"use strict";
if(typeof showBrief!=="function"||typeof runLevel!=="function"||typeof openPanel!=="function")return;
const REPS=()=>window.MA_REPS||{};
const LESSONS=()=>window.MA_LESSONS||{};
const kOf=(tr,i)=>tr.id+":"+i;
const E=s=>typeof esc==="function"?esc(s):String(s);

const st=document.createElement("style");
st.textContent=`
.rp-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0 4px}
.rp-in{width:140px;padding:10px 12px;border:1.5px solid var(--rule,#d9dde6);border-radius:4px;font:600 17px var(--mono,monospace);background:var(--sheet,#fff);color:var(--ink,#13203B)}
.rp-in:focus{outline:2px solid var(--cobalt,#2448D8);outline-offset:1px;border-color:var(--cobalt,#2448D8)}
.rp-in.ok{border-color:var(--good,#1b8a4b)}.rp-in.no{border-color:var(--bad,#b3261e)}
.rp-u{font:600 17px var(--mono,monospace);color:var(--ink-2,#5b6577)}
.rp-steps{list-style:none;margin:12px 0 0;padding:0;counter-reset:rp}
.rp-steps li{display:grid;grid-template-columns:22px 1fr auto;gap:10px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--rule,#d9dde6);counter-increment:rp;animation:rpIn .3s both;animation-delay:calc(var(--i)*120ms)}
.rp-steps li::before{content:counter(rp);font:600 12px var(--mono,monospace);color:var(--cobalt,#2448D8)}
.rp-steps .m{font:13.5px var(--mono,monospace);text-align:right}
.rp-meta{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--ink-2,#5b6577);margin:0 0 8px}
.rp-miss{margin:16px 0 4px;text-align:left}.rp-miss h3{font-size:15px;margin:0 0 8px}
.rp-m{border:1px solid var(--rule,#d9dde6);border-radius:6px;padding:12px 14px;margin:0 0 10px;font-size:14px;line-height:1.5}
.rp-m .qq{font-weight:600;margin-bottom:6px}.rp-m .ra{color:var(--good,#1b8a4b);font-weight:600}
@keyframes rpIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.rp-steps li{animation:none}}`;
document.head.appendChild(st);

/* ---------- reading what the student typed ---------- */
function parse(s){
  s=String(s==null?"":s).trim().replace(/[−–—]/g,"-").replace(/[$,%\s]/g,"").replace(/x$/i,"");
  if(/^\(.+\)$/.test(s))s="-"+s.slice(1,-1);
  return /^-?\d*\.?\d+$/.test(s)?parseFloat(s):NaN}
const closeEnough=(u,p)=>Math.abs(u-p.ans)<=(p.tol!=null?p.tol:Math.max(0.01,Math.abs(p.ans)*0.005));
const fmtAns=p=>{const a=Math.round(p.ans*100)/100,t=a.toLocaleString("en-US",{maximumFractionDigits:2});return (p.unit==="$"?(a<0?"−$"+t.slice(1):"$"+t):t+(p.unit||""))};

/* ---------- the "Your turn" problem ---------- */
function mount(el,key,o){
  o=o||{};const G=REPS()[key];if(!el||!G)return;
  let tries=0,right=0,streak=0;
  const next=()=>{
    const p=G.build(G.gen());let answered=false;
    el.innerHTML=`<h2 style="margin:0 0 6px">${E(o.title||"Your turn")}</h2>
      <div class="rp-meta"><span>${E(o.lead||"Same idea, new numbers. Type your answer.")}</span>${tries?`<span>${right}/${tries} right${streak>1?` · ${streak} in a row`:""}</span>`:""}</div>
      <div class="ls-ex" style="font-family:inherit">${p.given}</div>
      <div class="q">${p.q}</div>
      <div class="rp-row">${p.unit==="$"?`<span class="rp-u">$</span>`:""}<input id="rpIn" class="rp-in" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Your answer">${p.unit==="%"||p.unit==="x"?`<span class="rp-u">${p.unit}</span>`:""}<button class="btn" id="rpGo" type="button">Check</button></div>
      <div id="rpFb" aria-live="polite"></div>
      <div class="actions" id="rpAct">${o.onNext?`<button class="ghost" id="rpSkip" type="button">Skip</button>`:`<button class="ghost" id="rpDone" type="button">Done</button>`}</div>`;
    const inp=el.querySelector("#rpIn"),fb=el.querySelector("#rpFb"),act=el.querySelector("#rpAct");
    try{inp.focus({preventScroll:true})}catch(e){}
    const finish=()=>{try{o.onNext?o.onNext():(o.onDone&&o.onDone())}catch(e){}};
    if(el.querySelector("#rpSkip"))el.querySelector("#rpSkip").onclick=finish;
    if(el.querySelector("#rpDone"))el.querySelector("#rpDone").onclick=finish;
    const check=()=>{
      if(answered)return;const u=parse(inp.value);
      if(isNaN(u)){fb.innerHTML=`<div class="why">Type just the number, like 25 or −4.5.</div>`;inp.focus();return}
      answered=true;tries++;const ok=closeEnough(u,p);if(ok){right++;streak++}else streak=0;
      inp.disabled=true;inp.classList.add(ok?"ok":"no");el.querySelector("#rpGo").disabled=true;
      try{if(typeof sfx==="function")sfx(ok?"ok":"no");if(typeof buzz==="function")buzz(ok?8:[12,30,12])}catch(e){}
      const steps=p.steps.map((s,n)=>`<li style="--i:${n}"><span>${s[0]}</span><span class="m">${s[1]}</span></li>`).join("");
      fb.innerHTML=`<div class="why"><b>${ok?"Right.":"Not quite."}</b> ${ok?"":`The answer is <b>${fmtAns(p)}</b>. `}${p.tip||""}</div><ol class="rp-steps">${steps}</ol>`;
      act.innerHTML=`<button class="btn" id="rpNew" type="button">New numbers</button>${o.onNext?`<button class="ghost" id="rpCont" type="button">Continue</button>`:`<button class="ghost" id="rpDone2" type="button">Done</button>`}`;
      el.querySelector("#rpNew").onclick=next;
      if(el.querySelector("#rpCont"))el.querySelector("#rpCont").onclick=finish;
      if(el.querySelector("#rpDone2"))el.querySelector("#rpDone2").onclick=finish;
      (ok&&o.onNext?el.querySelector("#rpCont"):el.querySelector("#rpNew")).focus({preventScroll:true});
    };
    el.querySelector("#rpGo").onclick=check;
    inp.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();check()}});
  };
  next()}

/* standalone reps from the level briefing */
function openReps(tr,i){
  const key=kOf(tr,i),lvl=tr.levels[i];
  openPanel(`<div class="label">${E(tr.name)} · Level ${i+1} · ${E(lvl.n)}</div><div id="rpMount"></div>${window.MAMock?`<div class="actions" style="margin-top:14px"><button class="ghost outline" id="rpMock" type="button">Timed mock · 10 questions</button></div>`:""}`);
  mount(document.getElementById("rpMount"),key,{title:"Number reps",lead:"Fresh numbers every time. Aim for 3 in a row.",onDone:()=>showBrief(tr,i)});
  const mk=document.getElementById("rpMock");if(mk)mk.onclick=()=>MAMock.open(tr,i)}

/* ---------- "Why you missed it" ---------- */
const STOP=new Set("the and for are was with that this from have has not but you your can will what when which how why does did who whom its into than then them they their there these those over out per any all one two three each more most less only also just very much many such like very about after before between because while where should would could been being are our own off too use used using via get got put set".split(" "));
const toks=s=>(String(s).replace(/<[^>]+>/g," ").toLowerCase().match(/[a-z][a-z0-9&\/\-']{2,}/g)||[]).filter(w=>!STOP.has(w));
/* which teaching card best explains this question? rare shared words count more than common ones */
function bestCard(key,q){
  const cards=(LESSONS()[key]||[]).filter(c=>!c.check);if(!cards.length)return null;
  const docs=cards.map(c=>new Set(toks((c.h||"")+" "+(c.b||"")+" "+(c.ex||""))));
  const qt=new Set(toks(q[0]+" "+q[1][q[2]]+" "+(q[3]||"")));
  let best=-1,bs=0;
  docs.forEach((d,ix)=>{let sc=0;qt.forEach(w=>{if(d.has(w)){const df=docs.filter(x=>x.has(w)).length;sc+=1/df}});if(sc>bs){bs=sc;best=ix}});
  return bs>=MIN_SCORE?{card:cards[best],score:bs}:null}
const MIN_SCORE=1.6;

function miss(tr,i,misses){
  if(!misses||!misses.length)return "";
  const key=kOf(tr,i),show=misses.slice(0,3);
  const items=show.map((q,n)=>{const b=bestCard(key,q);
    return `<div class="rp-m"><div class="qq">${q[0]}</div><div>Right answer: <span class="ra">${q[1][q[2]]}</span></div><div style="margin-top:4px">${q[3]||""}</div>${b?`<button class="flink" type="button" data-rp-replay="${n}">Replay the lesson: ${b.card.h} →</button>`:""}</div>`}).join("");
  miss._last={key,show};
  return `<div class="rp-miss"><h3>Why you missed ${misses.length===1?"it":"them"}</h3>${items}${misses.length>3?`<p class="note">+${misses.length-3} more. Retry the level and they'll come back around.</p>`:""}</div>`}

function bindMiss(tr,i){
  const m=miss._last;if(!m||m.key!==kOf(tr,i))return;
  panel.querySelectorAll("[data-rp-replay]").forEach(btn=>btn.onclick=()=>{
    const q=m.show[+btn.dataset.rpReplay],b=bestCard(m.key,q);if(!b)return;const c=b.card;
    openPanel(`<div class="label">${E(tr.name)} · ${E(tr.levels[i].n)} · Replay</div><h2>${c.h}</h2>
      <div class="ls-body">${c.ex?`<div class="ls-ex">${c.ex}</div>`:""}${c.b||""}</div>
      <div class="why"><b>The question you missed:</b> ${q[0]}<br>Right answer: <b>${q[1][q[2]]}</b></div>
      <div class="actions"><button class="btn" id="rpAgain" type="button">Try the drill again</button><button class="ghost" id="rpMap" type="button">Back to map</button></div>`);
    document.getElementById("rpAgain").onclick=()=>runLevel(tr,i);document.getElementById("rpMap").onclick=closePanel})}

/* ---------- a "Number reps" button on level briefings ---------- */
const _sb=window.showBrief;
window.showBrief=function(tr,i){
  _sb.apply(this,arguments);
  try{
    if(!REPS()[kOf(tr,i)])return;
    const a=document.querySelector("#panel .actions");
    if(!a||!a.querySelector("#go")||a.querySelector("#rpBtn"))return;
    const b=document.createElement("button");b.className="ghost outline";b.id="rpBtn";b.type="button";b.textContent="Number reps";
    b.onclick=()=>openReps(tr,i);(a.querySelector("#lsAgain")||a.querySelector("#go")).after(b)}catch(e){}};

window.MAPractice={mount,openReps,miss,bindMiss,bestCard,parse,closeEnough};
})();
