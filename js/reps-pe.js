/* "Your turn" reps for PE levels 8-10 (indices 7,8,9). Same format as reps-data.js. */
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
 /* Fund economics: full catch-up waterfall, GP carry */
 "pe:7":{
  gen:()=>{const c=r.p([100,200,400]),pct=r.p([16,20,24]),pref=c*pct/100,extra=r.s(20,100,10);
    return{c,pref,extra,p:c+pref+pref/4+extra}},
  build:p=>{const cu=p.pref/4,rem=p.p-p.c-p.pref-cu,split=rd(rem*.2),ans=cu+split;
    return{given:`LPs invest <b>${$(p.c)}M</b>. The preferred return is <b>${$(p.pref)}M</b>, with a <b>full GP catch-up</b> and <b>20% carry</b>. The fund distributes <b>${$(p.p)}M</b> in total.`,
      q:"How much carry does the GP receive? ($M)",ans,unit:"$",
      steps:[["Capital and pref go to LPs",`${p.c} + ${p.pref} = ${n(p.c+p.pref)}`],["Catch-up = pref × 20 ÷ 80",`${p.pref} × 0.25 = ${n(cu)}`],["Remainder splits 80/20",`${p.p} − ${n(p.c+p.pref+cu)} = ${n(rem)} → GP gets 20% = ${n(split)}`],["Total carry",`${n(cu)} + ${n(split)} = ${n(ans)}`]],
      tip:"Check: with a full catch-up, carry should equal 20% of total profit. 0.20 × "+n(p.p-p.c)+" = "+n(ans)+"."}}},
 /* Case study: LBO returns, MOIC */
 "pe:8":{
  gen:()=>{for(let t=0;t<200;t++){const e=r.p([50,100]),m=r.p([8,10,12]),d=r.p([4,5]),fees=r.s(10,30,10),k=r.p([2,2.5,3]),g=r.p([1.2,1.4]),
      eq=e*m+fees-d*e,ex=e*g,left=ex*m-k*eq;
      if(Number.isInteger(k*eq)&&left>=0&&left<=d*e&&Number.isInteger(left))return{e,m,d,fees,ex,left,k}}
    return{e:100,m:10,d:5,fees:20,ex:140,left:200,k:2.31}},
  build:p=>{const ev=p.e*p.m,debt=p.d*p.e,eq=ev+p.fees-debt,xev=p.ex*p.m,xeq=xev-p.left,moic=rd(xeq/eq);
    return{given:`Buy EBITDA of <b>${$(p.e)}M</b> at <b>${p.m}x</b>. Debt is <b>${p.d}x</b> EBITDA and fees are <b>${$(p.fees)}M</b>. At exit, EBITDA is <b>${$(p.ex)}M</b>, the multiple is still <b>${p.m}x</b> and <b>${$(p.left)}M</b> of debt remains.`,
      q:"What is the sponsor's MOIC? (e.g. 2.5)",ans:moic,unit:"x",tol:0.02,
      steps:[["Entry EV and debt",`${p.e} × ${p.m} = ${ev}; debt ${p.d} × ${p.e} = ${debt}`],["Sponsor equity = EV + fees − debt",`${ev} + ${p.fees} − ${debt} = ${eq}`],["Exit EV",`${p.ex} × ${p.m} = ${xev}`],["Exit equity = exit EV − debt left",`${xev} − ${p.left} = ${xeq}`],["MOIC",`${xeq} ÷ ${eq} = ${n(moic)}x`]],
      tip:"Fees are a use of cash, so they raise the equity you must put in."}}},
 /* Diligence: QoE changes the price */
 "pe:9":{
  gen:()=>({e:r.s(60,120,10),a:r.s(5,15,5),b:r.s(5,10,5),mult:r.p([8,9,10,12])}),
  build:p=>{const adj=p.e-p.a+p.b,ans=adj*p.mult;
    return{given:`The seller reports EBITDA of <b>${$(p.e)}M</b> and asks <b>${p.mult}x</b>. Quality of earnings finds <b>${$(p.a)}M</b> of non-recurring revenue to remove and <b>${$(p.b)}M</b> of owner pay to add back.`,
      q:"What is the enterprise value at the same multiple, using adjusted EBITDA? ($M)",ans,unit:"$",
      steps:[["Adjusted EBITDA = reported − removed + add-back",`${p.e} − ${p.a} + ${p.b} = ${adj}`],["EV = adjusted EBITDA × multiple",`${adj} × ${p.mult} = ${ans}`]],
      tip:"Every $1 of EBITDA the QoE removes costs the seller $"+p.mult+" of price."}}}
});
})();
