/* Spaced review: the site remembers what you got wrong and brings it back right before you'd forget it.
   Leitner boxes: miss it -> back tomorrow; get it right when due -> 3 days, 7, 14, 30, then mastered.
   Tracks two things: exact multiple-choice questions you missed in drills, and number-rep concepts (fresh numbers each time).
   Stored in S.srs = { id: {b: box, d: dueDay} }. S merges objects key by key and takes the max of numbers, so this syncs
   across devices without losing progress. Appears only as a "Review · N due" button on level briefings (nothing on Home).
   Does not touch XP, stars or scoring. */
(function(){
"use strict";
const GAPS=[0,1,3,7,14,30],MASTER=90,CAP=300;
const hash=s=>{let h=5381;s=String(s);for(let i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36)};
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);

/* pure core so the schedule can be tested: pass a state object and today's day number */
function core(get,today){
  const tab=()=>{const s=get();if(!s.srs||typeof s.srs!=="object")s.srs={};return s.srs};
  const qid=(key,q)=>"q:"+key+":"+hash(q[0]);
  const rid=key=>"r:"+key;
  function mark(id,ok){
    const t=tab(),it=t[id];
    if(!ok){t[id]={b:1,d:today()+1};return true}
    if(!it)return false;
    if(it.d>today())return false;              /* right answer before it was due: no credit, no cramming */
    const b=Math.min(6,(it.b||1)+1);t[id]={b,d:today()+(b>=6?MASTER:GAPS[b])};
    prune();return true}
  function prune(){
    const t=tab(),ids=Object.keys(t);if(ids.length<=CAP)return;
    ids.filter(i=>t[i].b>=6).sort((a,b)=>t[a].d-t[b].d).slice(0,ids.length-CAP).forEach(i=>delete t[i])}
  const due=()=>{const t=tab(),n=today();return Object.keys(t).filter(i=>t[i].b<6&&t[i].d<=n).sort((a,b)=>t[a].d-t[b].d)};
  const stats=()=>{const t=tab(),n=today(),ids=Object.keys(t);
    const dueN=ids.filter(i=>t[i].b<6&&t[i].d<=n).length,mastered=ids.filter(i=>t[i].b>=6).length;
    const later=ids.filter(i=>t[i].b<6&&t[i].d>n),next=later.length?Math.min(...later.map(i=>t[i].d)):null;
    return{due:dueN,later:later.length,mastered,next}};
  /* levels with the most items still in the early boxes */
  const weak=()=>{const t=tab(),by={};Object.keys(t).forEach(i=>{if(t[i].b>=6)return;const m=i.match(/^[qr]:([a-z0-9]+:\d+)/);if(!m)return;by[m[1]]=(by[m[1]]||0)+(t[i].b<=2?2:1)});
    return Object.entries(by).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0])};
  return{qid,rid,mark,due,stats,weak,tab,hash}}

const C=core(()=>typeof S!=="undefined"?S:(window.__srsS||(window.__srsS={})),dayNum);
const isTR=()=>typeof TRACKS!=="undefined"&&TRACKS;

/* hooks the rest of the site calls (all safe to call before anything is due) */
const api={
  core,hash,
  record(tr,i,q,ok){try{if(C.mark(C.qid(tr.id+":"+i,q),!!ok)&&typeof save==="function")save()}catch(e){}},
  rep(key,ok){try{if(C.mark(C.rid(key),!!ok)&&typeof save==="function")save()}catch(e){}},
  stats:()=>C.stats(),due:()=>C.due()};
window.MASrs=api;
if(typeof openPanel!=="function"||typeof showBrief!=="function")return;
const E=s=>typeof esc==="function"?esc(s):String(s);
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

const st=document.createElement("style");
st.textContent=`.sr-o{display:block;width:100%;text-align:left;margin:6px 0;padding:11px 12px;border:1.5px solid var(--rule,#d9dde6);border-radius:6px;background:var(--sheet,#fff);color:var(--ink,#13203B);font:inherit;font-size:14.5px;cursor:pointer}
.sr-o:hover:not(:disabled){border-color:var(--cobalt,#2448D8)}.sr-o.good{border-color:var(--good,#1b8a4b);background:rgba(27,138,75,.08)}.sr-o.bad{border-color:var(--bad,#b3261e);background:rgba(179,38,30,.07)}
.sr-st{display:flex;gap:18px;margin:10px 0;font:600 13px var(--mono,monospace)}.sr-st b{font-size:22px;display:block}
.sr-wk{margin:8px 0;font-size:14px}.sr-wk button{margin:3px 6px 3px 0}`;
document.head.appendChild(st);

const trOf=key=>{const[t,i]=key.split(":");const tr=isTR()&&TRACKS.find(x=>x.id===t);return tr&&tr.levels[+i]?{tr,i:+i,lvl:tr.levels[+i]}:null};
const when=d=>{const n=d-dayNum();return n<=0?"today":n===1?"tomorrow":"in "+n+" days"};

function weakBlock(){
  const w=C.weak().map(trOf).filter(Boolean);if(!w.length)return "";
  return `<div class="sr-wk"><b>Your weak spots</b><br>${w.map((x,k)=>`<button class="ghost outline" type="button" data-wk="${k}">${E(x.tr.name)} · ${E(x.lvl.n)}</button>`).join("")}</div>`}
function bindWeak(){
  const w=C.weak().map(trOf).filter(Boolean);
  document.querySelectorAll("[data-wk]").forEach(b=>b.onclick=()=>{const x=w[+b.dataset.wk];if(x)showBrief(x.tr,x.i)})}

function open(){
  const s=C.stats();
  const body=s.due?`<div class="sr-st"><span><b>${s.due}</b>due now</span><span><b>${s.later}</b>scheduled</span><span><b>${s.mastered}</b>mastered</span></div>
      <p class="note" style="margin:0 0 8px">These are things you missed. Getting one right when it is due pushes it further out (3 days, 7, 14, 30). Missing it brings it back tomorrow.</p>
      <div class="actions"><button class="btn" id="srGo" type="button">Start review · ${Math.min(8,s.due)}</button><button class="ghost" id="srX" type="button">Close</button></div>`
    :`<div class="sr-st"><span><b>0</b>due now</span><span><b>${s.later}</b>scheduled</span><span><b>${s.mastered}</b>mastered</span></div>
      <p style="margin:0 0 8px">${s.later?`Nothing due. Next review ${when(s.next)}.`:`Nothing to review yet. Miss a drill question or a rep and it will come back here at the right time.`}</p>
      <div class="actions"><button class="btn" id="srX" type="button">Close</button></div>`;
  openPanel(`<div class="label">Spaced review</div><h2 style="margin:4px 0 6px">Review</h2>${body}${weakBlock()}`);
  bindWeak();
  const x=document.getElementById("srX");if(x)x.onclick=closePanel;
  const go=document.getElementById("srGo");if(go)go.onclick=session}

function session(){
  const ids=C.due().slice(0,8),res=[];let n=0;
  const items=ids.map(id=>{const m=id.match(/^([qr]):([a-z0-9]+:\d+)(?::(.+))?$/),loc=m&&trOf(m[2]);
    if(!loc)return null;
    if(m[1]==="q"){const q=(loc.lvl.q||[]).find(z=>hash(z[0])===m[3]);return q?{id,loc,q}:null}
    return window.MA_REPS&&window.MA_REPS[m[2]]?{id,loc,key:m[2]}:null}).filter(Boolean);
  /* items whose question or level no longer exists drop out quietly */
  ids.forEach(id=>{if(!items.find(x=>x.id===id)){const t=C.tab();delete t[id]}});
  if(!items.length)return finish();
  const lab=it=>`<div class="label">Review ${n+1} of ${items.length} · ${E(it.loc.tr.name)} · ${E(it.loc.lvl.n)}</div>`;
  function next(){n++;n>=items.length?finish():show()}
  function show(){
    const it=items[n];
    if(it.q){
      const q=it.q,opts=shuf(q[1].map((t,k)=>({t,ok:k===q[2]})));
      openPanel(lab(it)+`<div class="q" style="margin:6px 0 8px">${q[0]}</div>${opts.map((o,k)=>`<button class="sr-o" type="button" data-k="${k}">${o.t}</button>`).join("")}<div id="srFb" aria-live="polite"></div>`);
      document.querySelectorAll(".sr-o").forEach(b=>b.onclick=()=>{
        const o=opts[+b.dataset.k];document.querySelectorAll(".sr-o").forEach((x,k)=>{x.disabled=true;if(opts[k].ok)x.classList.add("good")});if(!o.ok)b.classList.add("bad");
        C.mark(it.id,o.ok);res.push(o.ok);try{if(typeof sfx==="function")sfx(o.ok?"ok":"no")}catch(e){}
        document.getElementById("srFb").innerHTML=`<div class="why"><b>${o.ok?"Right.":"Not quite."}</b> ${q[3]||""}</div><div class="actions"><button class="btn" id="srNx" type="button">${n+1>=items.length?"Finish":"Next"}</button></div>`;
        document.getElementById("srNx").focus();document.getElementById("srNx").onclick=next})}
    else{
      openPanel(lab(it)+`<div id="rpMount"></div>`);let first=true;
      MAPractice.mount(document.getElementById("rpMount"),it.key,{title:"Number rep",lead:"Fresh numbers. First answer counts.",onNext:next,onResult:ok=>{if(first){first=false;C.mark(it.id,ok);res.push(ok)}}})}}
  function finish(){
    try{if(typeof save==="function")save()}catch(e){}
    const right=res.filter(Boolean).length,s=C.stats();
    openPanel(`<div class="label">Spaced review</div><h2 style="margin:4px 0 6px">${res.length?right+" of "+res.length+" right":"All caught up"}</h2>
      <p style="margin:0 0 6px">${s.due?`${s.due} more due. Run it again.`:s.later?`Done for now. Next review ${when(s.next)}.`:"Nothing left scheduled."}</p>
      <div class="sr-st"><span><b>${s.later}</b>scheduled</span><span><b>${s.mastered}</b>mastered</span></div>${weakBlock()}
      <div class="actions">${s.due?`<button class="btn" id="srAgain" type="button">Keep going</button>`:""}<button class="${s.due?"ghost":"btn"}" id="srX" type="button">Close</button></div>`);
    bindWeak();document.getElementById("srX").onclick=closePanel;const a=document.getElementById("srAgain");if(a)a.onclick=session}
  show()}

/* "Review · N due" on level briefings, only when something is due */
const _sb=window.showBrief;
window.showBrief=function(tr,i){
  _sb.apply(this,arguments);
  try{
    const n=C.stats().due,a=document.querySelector("#panel .actions");
    if(!n||!a||!a.querySelector("#go")||a.querySelector("#srBtn"))return;
    const b=document.createElement("button");b.className="ghost outline";b.id="srBtn";b.type="button";b.textContent="Review · "+n+" due";b.title="Bring back what you missed";b.onclick=open;
    a.querySelector("#go").after(b)}catch(e){}};
api.open=open;
})();
