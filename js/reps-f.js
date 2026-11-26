/* "Your turn" reps for Foundations levels 5-9 (Percentages & Growth Rates, Margins & Unit Economics,
   Working Capital & Cash Conversion, Cost of Capital & WACC intro, Markets & Securities Overview).
   Same format as reps-data.js: MA_REPS["f:N"] = { gen() -> params, build(params) -> problem }. build() is pure. */
(function(){
"use strict";
window.MA_REPS=window.MA_REPS||{};
const r={i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  p:a=>a[Math.floor(Math.random()*a.length)],
  s:(a,b,st)=>a+st*Math.floor(Math.random()*((b-a)/st+1))};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
const $=x=>(x<0?"−":"")+"$"+n(Math.abs(x));
const pc=x=>n(x)+"%";
Object.assign(window.MA_REPS,{
 /* Percentages & Growth Rates: percent change, or a 2-year CAGR */
 "f:5":{
  gen:()=>({k:r.i(0,1),old:r.p([50,80,100,200,400]),g:r.p([10,20,25,50]),r:r.p([10,20,50]),s:r.s(100,500,100)}),
  build:p=>{
    if(p.k===0){const nw=rd(p.old*(1+p.g/100)),ans=rd((nw-p.old)/p.old*100);
      return{given:`Revenue goes from <b>${$(p.old)}M</b> to <b>${$(nw)}M</b>.`,q:"What is the growth rate?",ans,unit:"%",tol:0.1,
        steps:[["Change = new − old",`${nw} − ${p.old} = ${n(nw-p.old)}`],["Divide by the old number",`${n(nw-p.old)} ÷ ${p.old} = ${n((nw-p.old)/p.old)}`],["As a percent",`${pc(ans)}`]],
        tip:"Always divide by the starting (old) number."}}
    const m=1+p.r/100,end=rd(p.s*m*m);
    return{given:`An investment grows from <b>${$(p.s)}</b> to <b>${$(end)}</b> over <b>2 years</b>.`,q:"What is the CAGR (smooth yearly growth rate)?",ans:p.r,unit:"%",tol:0.1,
      steps:[["End ÷ start",`${end} ÷ ${p.s} = ${n(end/p.s)}`],["Take the square root (2 years)",`√${n(end/p.s)} = ${n(m)}`],["Subtract 1",`${n(m)} − 1 = ${n(m-1)} = ${pc(p.r)}`]],
      tip:"CAGR = (end ÷ start)^(1 ÷ years) − 1. Check: "+p.s+" × "+n(m)+" × "+n(m)+" = "+n(end)+"."}}
 },
 /* Margins & Unit Economics: breakeven units, or CAC payback and LTV */
 "f:6":{
  gen:()=>{const c=r.s(4,20,2),vc=r.s(5,30,5);return{k:r.i(0,1),c,price:vc+c,vc,units:r.s(100,800,50),cac:r.s(60,200,20),gp:r.p([10,20,25,30,40]),life:r.p([10,12,20,24])}},
  build:p=>{
    if(p.k===0){const fixed=p.c*p.units;
      return{given:`Price <b>${$(p.price)}</b>, variable cost <b>${$(p.vc)}</b> per unit, fixed costs <b>${$(fixed)}</b>.`,q:"How many units must be sold to break even?",ans:p.units,unit:"",tol:0.5,
        steps:[["Contribution = price − variable cost",`${p.price} − ${p.vc} = ${p.c}`],["Breakeven = fixed costs ÷ contribution",`${n(fixed)} ÷ ${p.c} = ${n(p.units)}`]],
        tip:"Each unit contributes "+$(p.c)+" toward the fixed costs. Sell enough units to cover them."}}
    const ans=rd(p.gp*p.life);
    return{given:`CAC is <b>${$(p.cac)}</b>. Each customer brings <b>${$(p.gp)}</b> of gross profit a month and stays <b>${p.life} months</b>.`,q:"What is the customer's LTV (lifetime value)?",ans,unit:"$",tol:0.5,
      steps:[["LTV = monthly gross profit × months",`${p.gp} × ${p.life} = ${n(ans)}`],["Compare with CAC (LTV ÷ CAC)",`${n(ans)} ÷ ${p.cac} = ${n(ans/p.cac)}x`]],
      tip:"Use gross profit, not revenue. LTV ÷ CAC of 3x or more is the usual healthy mark."}}
 },
 /* Working Capital & Cash Conversion: CCC from balances, or cash effect of a change in NWC */
 "f:7":{
  gen:()=>({k:r.i(0,1),a:r.i(2,6),b:r.i(1,4),dso:r.s(20,60,10),dio:r.s(30,90,10),dpo:r.s(20,60,10),nwc:r.s(40,200,10),chg:r.s(5,30,5),up:r.i(0,1)}),
  build:p=>{
    if(p.k===0){const rev=p.a*365,cogs=p.b*365,ar=p.a*p.dso,inv=p.b*p.dio,ap=p.b*p.dpo,ans=p.dso+p.dio-p.dpo;
      return{given:`Revenue <b>${$(rev)}M</b>, COGS <b>${$(cogs)}M</b>, receivables <b>${$(ar)}M</b>, inventory <b>${$(inv)}M</b>, payables <b>${$(ap)}M</b>. Use a 365-day year.`,q:"What is the cash conversion cycle (in days)?",ans,unit:"",tol:0.5,
        steps:[["DSO = receivables ÷ revenue × 365",`${ar} ÷ ${n(rev)} × 365 = ${p.dso}`],["DIO = inventory ÷ COGS × 365",`${inv} ÷ ${n(cogs)} × 365 = ${p.dio}`],["DPO = payables ÷ COGS × 365",`${ap} ÷ ${n(cogs)} × 365 = ${p.dpo}`],["CCC = DSO + DIO − DPO",`${p.dso} + ${p.dio} − ${p.dpo} = ${ans}`]],
        tip:"Receivables use revenue; inventory and payables use COGS. Paying suppliers later (higher DPO) shortens the cycle."}}
    const nw=p.up?p.nwc+p.chg:p.nwc-p.chg,ans=-(nw-p.nwc);
    return{given:`Net working capital goes from <b>${$(p.nwc)}M</b> to <b>${$(nw)}M</b>.`,q:"What is the cash flow effect? (Use a minus sign for cash used.)",ans,unit:"$",tol:0.5,
      steps:[["Change in NWC = new − old",`${nw} − ${p.nwc} = ${sgn(nw-p.nwc)}`],["Cash flow effect = minus the change",`${sgn(ans)}`]],
      tip:"More cash tied up in receivables and inventory means less cash. An NWC increase is a cash outflow."}}
 },
 /* Cost of Capital & WACC intro: WACC from weights and costs */
 "f:8":{
  gen:()=>({e:r.p([500,600,700,800]),re:r.p([8,10,12,14]),rd:r.p([4,5,6,8]),t:r.p([20,25])}),
  build:p=>{const d=1000-p.e,rdat=rd(p.rd*(1-p.t/100)),ans=rd((p.e*p.re+d*rdat)/1000);
    return{given:`Equity <b>${$(p.e)}M</b>, debt <b>${$(d)}M</b>. Cost of equity <b>${p.re}%</b>, interest rate <b>${p.rd}%</b>, tax rate <b>${p.t}%</b>.`,q:"What is the WACC (in %)?",ans,unit:"%",tol:0.05,
      steps:[["After-tax cost of debt = rate × (1 − tax)",`${p.rd}% × ${n(1-p.t/100)} = ${pc(rdat)}`],["Weights",`equity ${pc(p.e/10)}, debt ${pc(d/10)}`],["WACC = weighted average",`${n(p.e/1000)} × ${p.re}% + ${n(d/1000)} × ${n(rdat)}% = ${pc(ans)}`]],
      tip:"Use the after-tax cost of debt. The answer must land between the debt cost and the equity cost."}}
 },
 /* Markets & Securities Overview: market cap to enterprise value, or a bond's current yield */
 "f:9":{
  gen:()=>({k:r.i(0,1),px:r.s(10,60,5),sh:r.s(10,50,10),debt:r.s(100,400,50),cash:r.s(20,100,20),face:1000,cp:r.p([4,5,6,8]),price:r.p([800,900,1000])}),
  build:p=>{
    if(p.k===0){const mc=p.px*p.sh,ans=mc+p.debt-p.cash;
      return{given:`Share price <b>${$(p.px)}</b>, <b>${p.sh}M</b> shares outstanding, debt <b>${$(p.debt)}M</b>, cash <b>${$(p.cash)}M</b>.`,q:"What is the enterprise value ($M)?",ans,unit:"$",tol:0.5,
        steps:[["Market cap = price × shares",`${p.px} × ${p.sh} = ${n(mc)}`],["EV = market cap + debt − cash",`${n(mc)} + ${p.debt} − ${p.cash} = ${n(ans)}`]],
        tip:"Market cap is the equity value. Add debt and subtract cash to reach enterprise value."}}
    const cpn=p.face*p.cp/100,ans=rd(cpn/p.price*100);
    return{given:`A bond has a face value of <b>${$(p.face)}</b> and a <b>${p.cp}%</b> coupon. It trades at <b>${$(p.price)}</b>.`,q:"What is the current yield (in %)?",ans,unit:"%",tol:0.05,
      steps:[["Annual coupon = rate × face",`${p.cp}% × ${p.face} = ${$(cpn)}`],["Current yield = coupon ÷ price",`${cpn} ÷ ${p.price} = ${pc(ans)}`]],
      tip:"Price below face value pushes the yield above the coupon rate. Price and yield move in opposite directions."}}
 }
});
function sgn(x){return (x<0?"−":"+")+n(Math.abs(x))}
})();
