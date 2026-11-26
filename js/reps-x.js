/* "Your turn" rep for Excel level 8 (x:7, Financial Functions: NPV, IRR, PMT). Same format as reps-data.js.
   Only NPV and IRR are drilled: they have clean mental-math numbers. PMT needs a calculator, so it is left to the quiz. */
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
 "x:7":{
  gen:()=>r.p([0,1])
    ?{k:"npv",pv:r.p([100,200,300]),rate:r.p([10,20]),d:r.p([10,20,30,40,50]),sg:r.p([1,-1])}
    :{k:"irr",inn:r.s(100,500,100),rate:r.p([10,20])},
  build:p=>{
    if(p.k==="irr"){const m=rd(1+p.rate/100,2),mm=rd(m*m,4),out=rd(p.inn*mm,2);
      return{given:`You pay <b>${$(p.inn)}</b> today and receive <b>${$(out)}</b> in 2 years, nothing in between.`,
        q:"What is the IRR? (in %)",ans:p.rate,unit:"%",tol:0.05,
        steps:[["Total growth = money out ÷ money in",`${out} ÷ ${p.inn} = ${mm}`],["Two equal yearly steps, so find what number times itself gives "+mm,`${m} × ${m} = ${mm}`],["Yearly rate",`${m} − 1 = ${p.rate}%`]],
        tip:"In Excel: =IRR of (−"+p.inn+", 0, "+out+"). Check by compounding: "+m+" × "+m+" = "+mm+"."}}
    const m=rd(1+p.rate/100,2),f1=rd(p.pv*m,2),f2=rd(p.pv*m*m,2),pvSum=2*p.pv,cost=pvSum-p.sg*p.d,ans=p.sg*p.d;
    return{given:`Cost today <b>${$(cost)}</b>. Cash in: <b>${$(f1)}</b> in year 1 and <b>${$(f2)}</b> in year 2. Discount rate <b>${p.rate}%</b>.`,
      q:"What is the NPV?",ans,unit:"$",
      steps:[["Discount year 1: divide by "+m,`${f1} ÷ ${m} = ${p.pv}`],["Discount year 2: divide by "+m+" twice",`${f2} ÷ ${rd(m*m,4)} = ${p.pv}`],["Add the present values",`${p.pv} + ${p.pv} = ${pvSum}`],["NPV = PV of cash in − cost today",`${pvSum} − ${cost} = ${ans<0?"−":""}${n(Math.abs(ans))}`]],
      tip:"Excel: =NPV("+p.rate+"%, "+f1+", "+f2+") − "+cost+". Keep today's cost outside the NPV function."}}
 }
});
})();
