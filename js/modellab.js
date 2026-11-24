/* Model Lab: build a real DCF, LBO or merger model one cell at a time, with fresh numbers every run (js/models-data.js).
   Each blank shows the formula in plain words. Check marks every cell, "Show answers" reveals the rest.
   Opened from a "Build the model" button on the matching level briefings. Does not touch scoring, XP or stars. */
(function(){
"use strict";
if(typeof showBrief!=="function"||typeof openPanel!=="function")return;
const MODELS=()=>window.MA_MODELS||{};
const E=s=>typeof esc==="function"?esc(s):String(s);
const parse=s=>window.MAPractice?MAPractice.parse(s):parseFloat(s);
const fmt=(v,u)=>{const a=Math.round(v*100)/100,t=Math.abs(a).toLocaleString("en-US",{maximumFractionDigits:2}),s=a<0?"−":"";
  return u==="$"?s+"$"+t:u==="%"?s+t+"%":u==="x"?s+t+"x":s+t};

const st=document.createElement("style");
st.textContent=`
.ml-given{display:grid;grid-template-columns:1fr auto;gap:2px 12px;font-size:13.5px;margin:8px 0 4px;padding:10px 12px;background:var(--sheet-2,#f4f6fa);border-left:3px solid var(--cobalt,#2448D8);border-radius:3px}
.ml-given b{text-align:right;font-family:var(--mono,monospace);font-weight:600}
.ml-sec{font:600 12px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--cobalt,#2448D8);margin:18px 0 4px}
.ml-row{display:grid;grid-template-columns:1fr 118px;gap:4px 12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--rule,#d9dde6)}
.ml-lab{font-size:14px;font-weight:600}.ml-hint{font-size:12px;color:var(--ink-2,#5b6577);font-weight:400;margin-top:1px}
.ml-box{display:flex;align-items:center;gap:4px;justify-content:flex-end}
.ml-in{width:96px;padding:8px 8px;border:1.5px solid var(--rule,#d9dde6);border-radius:4px;font:600 15px var(--mono,monospace);text-align:right;background:var(--sheet,#fff);color:var(--ink,#13203B)}
.ml-in:focus{outline:2px solid var(--cobalt,#2448D8);outline-offset:1px}
.ml-in.ok{border-color:var(--good,#1b8a4b);background:rgba(27,138,75,.07)}.ml-in.no{border-color:var(--bad,#b3261e);background:rgba(179,38,30,.06)}
.ml-u{font:600 14px var(--mono,monospace);color:var(--ink-2,#5b6577)}
.ml-ans{grid-column:1/-1;font-size:12.5px;color:var(--bad,#b3261e)}.ml-ans b{font-family:var(--mono,monospace)}
.ml-score{margin:14px 0 4px;font-weight:600}
@media (max-width:420px){.ml-row{grid-template-columns:1fr}.ml-box{justify-content:flex-start}}`;
document.head.appendChild(st);

function open(tr,i,id){
  const def=MODELS()[id];if(!def)return;
  const lvl=tr&&tr.levels&&tr.levels[i];
  let model,rows;
  const draw=()=>{
    model=def.build(def.gen());rows=[];
    const secs=model.sections.map(s=>`<div class="ml-sec">${E(s.title)}</div>`+s.rows.map(r=>{
      const k=rows.push(r)-1;
      return `<div class="ml-row"><div><div class="ml-lab">${E(r.label)}</div><div class="ml-hint">${E(r.hint)}</div></div>
        <div class="ml-box">${r.unit==="$"?`<span class="ml-u">$</span>`:""}<input class="ml-in" data-k="${k}" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="${E(r.label)}">${r.unit==="%"||r.unit==="x"?`<span class="ml-u">${r.unit}</span>`:""}</div>
        <div class="ml-ans" data-a="${k}" hidden></div></div>`}).join("")).join("");
    openPanel(`<div class="label">${lvl&&tr?E(tr.name)+" · "+E(lvl.n)+" · ":""}Model Lab</div><h2 style="margin:4px 0 6px">${E(model.title)}</h2>
      <p class="note" style="margin:0 0 6px">${E(model.intro)}</p>
      <div class="ml-given">${model.given.map(g=>`<span>${E(g[0])}</span><b>${E(g[1])}</b>`).join("")}</div>
      ${secs}
      <div class="ml-score" id="mlScore" aria-live="polite"></div>
      <div class="actions"><button class="btn" id="mlCheck" type="button">Check all</button><button class="ghost" id="mlShow" type="button">Show answers</button><button class="ghost" id="mlNew" type="button">New numbers</button><button class="ghost" id="mlDone" type="button">Done</button></div>`);
    const root=document.getElementById("panel")||document;
    const ins=[...root.querySelectorAll(".ml-in")];
    ins[0]&&ins[0].focus({preventScroll:true});
    ins.forEach((el,ix)=>el.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();ix<ins.length-1?ins[ix+1].focus():check()}}));
    const ok=(r,v)=>!isNaN(v)&&Math.abs(v-r.ans)<=r.tol;
    function check(){
      let right=0,blank=0;
      ins.forEach(el=>{const r=rows[+el.dataset.k],box=root.querySelector(`[data-a="${el.dataset.k}"]`),v=parse(el.value);
        el.classList.remove("ok","no");box.hidden=true;
        if(el.value.trim()===""){blank++;return}
        if(ok(r,v)){right++;el.classList.add("ok")}else{el.classList.add("no");box.hidden=false;box.innerHTML=`Not quite. Check: ${E(r.hint)}`}});
      const t=ins.length,sc=root.querySelector("#mlScore");
      sc.innerHTML=right===t?`<b>${right}/${t}. Perfect.</b> ${E(model.tip)}`:`${right}/${t} right${blank?`, ${blank} blank`:""}. Fix the red ones, or tap Show answers.`;
      try{if(typeof sfx==="function")sfx(right===t?"ok":"no")}catch(e){}}
    function show(){
      ins.forEach(el=>{const r=rows[+el.dataset.k],box=root.querySelector(`[data-a="${el.dataset.k}"]`);
        const v=parse(el.value);el.classList.remove("ok","no");
        if(ok(r,v)){el.classList.add("ok");box.hidden=true}else{el.classList.add("no");box.hidden=false;box.innerHTML=`Answer: <b>${fmt(r.ans,r.unit)}</b> · ${E(r.hint)}`}});
      root.querySelector("#mlScore").innerHTML=E(model.tip)}
    root.querySelector("#mlCheck").onclick=check;
    root.querySelector("#mlShow").onclick=show;
    root.querySelector("#mlNew").onclick=draw;
    root.querySelector("#mlDone").onclick=()=>{tr&&lvl?showBrief(tr,i):closePanel()};
  };
  draw()}

/* "Build the model" button on matching level briefings */
const _sb=window.showBrief;
window.showBrief=function(tr,i){
  _sb.apply(this,arguments);
  try{
    const key=tr.id+":"+i,hit=Object.keys(MODELS()).filter(id=>MODELS()[id].keys.indexOf(key)>=0);
    const a=document.querySelector("#panel .actions");
    if(!hit.length||!a||!a.querySelector("#go")||a.querySelector("#mlBtn"))return;
    let anchor=a.querySelector("#rpBtn")||a.querySelector("#lsAgain")||a.querySelector("#go");
    hit.forEach(id=>{const b=document.createElement("button");b.className="ghost outline";b.id=hit.length>1?"mlBtn-"+id:"mlBtn";b.type="button";
      b.textContent=MODELS()[id].name;b.title=MODELS()[id].blurb;b.onclick=()=>open(tr,i,id);anchor.after(b);anchor=b})}catch(e){}};

window.MALab={open,fmt};
})();
