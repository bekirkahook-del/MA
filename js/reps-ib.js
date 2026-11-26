/* "Your turn" rep for IB level 9 (Comps & Precedents in Practice). Same format as reps-data.js. */
(function(){
"use strict";
window.MA_REPS=window.MA_REPS||{};
const r={i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  p:a=>a[Math.floor(Math.random()*a.length)],
  s:(a,b,st)=>a+st*Math.floor(Math.random()*((b-a)/st+1))};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
const $=x=>(x<0?"−":"")+"$"+n(Math.abs(x));
Object.assign(window.MA_REPS,{
 "ib:9":{
  gen:()=>{const m=r.i(9,14),lo=m-r.i(1,3),hi=m+r.i(1,3),ms=[lo,m,hi];
    /* shuffle so students have to find the middle one */
    for(let k=2;k>0;k--){const j=r.i(0,k);const t=ms[k];ms[k]=ms[j];ms[j]=t}
    return{ms,e:r.s(30,90,10),debt:r.s(20,100,10),cash:r.s(10,60,10)}},
  build:p=>{const s=p.ms.slice().sort((a,b)=>a-b),med=s[1],ev=med*p.e,ans=ev-p.debt+p.cash;
    return{given:`Peer EV/EBITDA multiples: <b>${p.ms.map(x=>x+"x").join(", ")}</b>. The target has EBITDA of <b>${$(p.e)}</b>, debt of <b>${$(p.debt)}</b> and cash of <b>${$(p.cash)}</b>.`,
      q:"Using the median multiple, what is the target's implied equity value?",ans,unit:"$",
      steps:[["Sort the multiples and take the middle one",`${s.map(x=>x+"x").join(", ")} → median ${med}x`],["Enterprise value = median × EBITDA",`${med} × ${p.e} = ${n(ev)}`],["Equity value = EV − debt + cash",`${n(ev)} − ${p.debt} + ${p.cash} = ${n(ans)}`]],
      tip:"Median first, then EV, then the bridge to equity: subtract debt, add cash."}}}
});
})();
