/* "Your turn" reps for the numeric Consulting levels: mc:2 market sizing, mc:3 profitability, mc:5 market entry, mc:6 case math.
   Same format as reps-data.js. mc:0, mc:1, mc:4 and mc:7..9 are not number-driven, so they have no rep. */
(function(){
"use strict";
window.MA_REPS=window.MA_REPS||{};
const r={i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  p:a=>a[Math.floor(Math.random()*a.length)],
  s:(a,b,st)=>a+st*Math.floor(Math.random()*((b-a)/st+1))};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
Object.assign(window.MA_REPS,{
 /* lesson: 330M x 50% x 2 cups = 330M cups a day */
 "mc:2":{
  gen:()=>({pop:r.p([200,300,330]),sh:r.p([20,25,40,50,60]),per:r.p([1,2,3])}),
  build:p=>{const users=rd(p.pop*p.sh/100),ans=rd(users*p.per);
    return{given:`The U.S.-style market has <b>${n(p.pop)} million</b> people. About <b>${p.sh}%</b> buy coffee each day, and each buyer has <b>${p.per}</b> cup${p.per===1?"":"s"}.`,
      q:"How many cups a day, in millions?",ans,unit:"",tol:0.5,
      steps:[["Buyers = population × share",`${n(p.pop)} × ${p.sh}% = ${n(users)} million`],["Cups = buyers × cups each",`${n(users)} × ${p.per} = ${n(ans)} million`]],
      tip:"Top-down: start big, filter with a percentage, then multiply by usage. Say each assumption out loud."}}},
 /* break-even units = fixed costs / (price - variable cost) */
 "mc:3":{
  gen:()=>({fixed:r.s(100000,500000,100000),vc:r.p([10,12,15,20]),mar:r.p([5,10,20])}),
  build:p=>{const price=p.vc+p.mar,ans=rd(p.fixed/p.mar,0);
    return{given:`A product sells for <b>$${n(price)}</b>. Each unit costs <b>$${n(p.vc)}</b> to make (variable cost). Fixed costs are <b>$${n(p.fixed)}</b>.`,
      q:"How many units must be sold to break even?",ans,unit:"",tol:0.5,
      steps:[["Profit per unit = price − variable cost",`${n(price)} − ${n(p.vc)} = ${n(p.mar)}`],["Break-even units = fixed costs ÷ profit per unit",`${n(p.fixed)} ÷ ${n(p.mar)} = ${n(ans)}`]],
      tip:"Each unit sold chips away at fixed costs. Break-even is when the chipping is done."}}},
 /* payback = investment / yearly profit (lesson: 10 / 4 = 2.5 years) */
 "mc:5":{
  gen:()=>({cost:r.s(10,60,10),pr:r.p([2,4,5,10])}),
  build:p=>{const ans=rd(p.cost/p.pr);
    return{given:`Entering a market costs <b>$${n(p.cost)}M</b> up front and is expected to earn <b>$${n(p.pr)}M</b> of profit a year.`,
      q:"What is the payback period, in years?",ans,unit:"",tol:0.05,
      steps:[["Payback = investment ÷ annual profit",`${n(p.cost)} ÷ ${n(p.pr)} = ${n(ans)} years`]],
      tip:"Payback tells you how long until the client gets its money back. Shorter is safer."}}},
 /* percent swap (lesson: 35% of 60 = 60% of 35 = 21) */
 "mc:6":{
  gen:()=>({a:r.p([15,25,35,45,65]),b:r.p([20,40,60,80])}),
  build:p=>{const ans=rd(p.a*p.b/100);
    return{given:`You need <b>${p.a}% of ${p.b}</b> in your head.`,
      q:`What is ${p.a}% of ${p.b}?`,ans,unit:"",tol:0.01,
      steps:[["Swap the numbers: a% of b = b% of a",`${p.a}% of ${p.b} = ${p.b}% of ${p.a}`],["Compute whichever is easier",`${p.b} × ${p.a} ÷ 100 = ${n(ans)}`]],
      tip:"Percent swap: flip them to whichever is easier. 8% of 50 is 50% of 8, which is 4."}}}
});
})();
