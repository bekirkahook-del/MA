/* "Your turn" reps for Restructuring levels 7-10 (rx:6 to rx:9). Same format as reps-data.js. */
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
 /* Level 7: Chapter 11 timeline. Preference lookback: sum of payments made within 90 days of filing. */
 "rx:6":{
  gen:()=>{const ds=[r.i(100,150),r.i(60,89),r.i(20,50),r.i(91,120)];
    for(let k=3;k>0;k--){const j=r.i(0,k);const t=ds[k];ds[k]=ds[j];ds[j]=t}
    return{items:ds.map(d=>({d,a:r.s(2,12,1)}))}},
  build:p=>{const inn=p.items.filter(x=>x.d<=90),ans=inn.reduce((s,x)=>s+x.a,0);
    return{given:`A company files for Chapter 11. In the months before, it paid non-insider suppliers: ${p.items.map(x=>`<b>${$(x.a)}M</b> at <b>${x.d} days</b> before filing`).join("; ")}. Assume the company was insolvent and ignore defenses.`,
      q:"What is the total preference exposure, in $M? (payments within 90 days)",ans,unit:"$",
      steps:[["Keep only payments made within 90 days of filing",inn.length?inn.map(x=>`${x.d} days: ${x.a}`).join(", "):"none"],["Add them up",inn.length?`${inn.map(x=>x.a).join(" + ")} = ${n(ans)}`:"0"]],
      tip:"The standard lookback is 90 days (one year for insiders). Payments outside it are not preferences."}}},
 /* Level 8: DIP and 13-week cash flow. Smallest DIP draw to hold a minimum cash floor. */
 "rx:7":{
  gen:()=>{let p,low;do{const nets=[-r.s(2,8,1),-r.s(4,10,1),-r.s(4,12,1),-r.s(2,8,1),r.s(-2,6,1)];
    p={open:r.s(10,30,5),nets,floor:r.s(5,10,5)};let c=p.open;low=Math.min(...nets.map(x=>c+=x))}while(low>=p.floor);return p},
  build:p=>{let c=p.open;const run=p.nets.map(x=>c+=x),low=Math.min(...run),ans=Math.max(0,p.floor-low);
    return{given:`Opening cash is <b>${$(p.open)}M</b>. Weekly net cash flows for 5 weeks are <b>${p.nets.map(x=>(x<0?"−":"+")+Math.abs(x)).join(", ")}</b> ($M). Lenders require at least <b>${$(p.floor)}M</b> of cash at all times.`,
      q:"What is the smallest new DIP draw (in $M) that keeps cash at or above the floor?",ans,unit:"$",
      steps:[["Running cash balance each week",run.join(", ")],["Find the lowest point",`${low}`],["Draw needed = floor − lowest cash (not below 0)",`${p.floor} − (${low}) = ${n(ans)}`]],
      tip:"Size the DIP from the lowest point in the forecast, not from the ending balance."}}},
 /* Level 9: plan voting thresholds. Minimum dollars needed for two-thirds in amount. */
 "rx:8":{
  gen:()=>({tot:r.s(30,150,15),k:r.i(5,12)}),
  build:p=>{const ans=rd(p.tot*2/3,2),need=Math.floor(p.k/2)+1;
    return{given:`A class has <b>${p.k}</b> creditors voting, holding <b>${$(p.tot)}M</b> of claims in total.`,
      q:"At least how many dollars of claims (in $M) must vote yes to meet the two-thirds amount test?",ans,unit:"$",tol:0.02,
      steps:[["Two-thirds in amount",`${p.tot} × 2/3 = ${n(ans)}`],["The number test too: more than half of voters",`more than ${p.k/2} → at least ${need} creditors`]],
      tip:"Both tests must pass: two-thirds in amount and more than half in number, counting only creditors who vote."}}},
 /* Level 10: interview waterfall with a DIP. Recovery of the second lien. */
 "rx:9":{
  gen:()=>{const dip=r.s(20,60,10),l1=r.s(100,200,50),l2=r.s(100,200,50),left=r.s(20,l2-20,10);return{v:dip+l1+left,dip,l1,l2}},
  build:p=>{const left=p.v-p.dip-p.l1,ans=rd(left/p.l2*100,1);
    return{given:`Distributable value is <b>${$(p.v)}M</b>. Claims in order: DIP <b>${$(p.dip)}M</b>, first lien <b>${$(p.l1)}M</b>, second lien <b>${$(p.l2)}M</b>, then unsecured.`,
      q:"What does the second lien recover? (in %)",ans,unit:"%",tol:0.1,
      steps:[["DIP is paid first, then the first lien",`${p.dip} + ${p.l1} = ${p.dip+p.l1}`],["Value left for the second lien",`${p.v} − ${p.dip+p.l1} = ${left}`],["Recovery = received ÷ owed",`${left} ÷ ${p.l2} = ${pc(ans)}`]],
      tip:"Pay the stack top-down. The class where the money runs out is the fulcrum."}}}
});
})();
