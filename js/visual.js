/* Visual layer: progress rings on the toolkit card, result chart on modeling challenges */
(function(){
"use strict";
const q$=s=>document.querySelector(s);
const ring=(pct,label,val,col)=>{const r=26,c=2*Math.PI*r,p=Math.max(0,Math.min(1,pct));return `<div class="vr"><svg width="72" height="72" viewBox="0 0 68 68" role="img" aria-label="${label}: ${val}"><circle cx="34" cy="34" r="${r}" fill="none" stroke="rgba(128,128,128,.2)" stroke-width="7"/><circle cx="34" cy="34" r="${r}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c*p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 34 34)"/><text x="34" y="38" text-anchor="middle" font-size="13" font-weight="700" fill="currentColor">${val}</text></svg><span>${label}</span></div>`};
function rings(){
  let seen=0,total=1,models=0,days=0,xp=0;
  try{total=allQs().length||1;seen=Object.keys(S.fc||{}).length}catch(e){}
  try{models=Object.keys(S.models||{}).length}catch(e){}
  try{days=typeof streak==="function"?(+streak()||0):0}catch(e){}
  try{xp=typeof totalXP==="function"?(+totalXP()||0):0}catch(e){}
  return `<div class="vrow">${ring(seen/total,"Cards studied",seen,"#4f46e5")}${ring(models/CHAL.length,"Models solved",models+"/"+CHAL.length,"#30a46c")}${ring(Math.min(days,30)/30,"Day streak",days,"#f5a524")}${ring(Math.min(xp,1000)/1000,"XP",xp,"#e5484d")}</div>`}
try{const _rw=renderWeakCard;renderWeakCard=function(){_rw.apply(this,arguments);try{const el=q$("#toolkitCard");if(el){const o=el.querySelector(".vrow");if(o)o.remove();el.insertAdjacentHTML("afterbegin",rings())}}catch(e){console.error(e)}}}catch(e){console.error(e)}
/* model results: one bar per cell, filled by how close your entry is to the answer */
try{const _oc=openChal;openChal=function(c){_oc.apply(this,arguments);try{const b=q$("#chCheck");if(!b||!c||!c.cells)return;b.addEventListener("click",()=>{const out=q$("#chOut");if(!out)return;
  const bars=c.cells.map((x,i)=>{const inp=q$("#cell"+i);const raw=inp?inp.value:"";const v=parseFloat(raw.replace(/[−–]/g,"-").replace(/[$,x%\s]/gi,""));const tol=x[3]||0.5;const ok=isFinite(v)&&Math.abs(v-x[1])<=tol;
    const pct=!raw?0:ok?100:isFinite(v)&&x[1]?Math.max(6,Math.min(95,Math.round((1-Math.min(1,Math.abs(v-x[1])/Math.abs(x[1])))*100))):6;
    return `<div class="cbar"><span>${esc(x[0])}</span><div class="vbar"><i style="width:${pct}%;background:${!raw?"transparent":ok?"#30a46c":"#e5484d"}"></i></div><b>${!raw?"–":ok?"✓":"✗"}</b></div>`}).join("");
  out.insertAdjacentHTML("beforeend",`<div class="cbars">${bars}</div>`)})}catch(e){console.error(e)}}}catch(e){console.error(e)}
try{renderWeakCard()}catch(e){}
})();
