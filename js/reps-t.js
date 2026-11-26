/* "Your turn" reps for Technical Questions levels t:4 to t:9. Same format as reps-data.js. */
(function(){
"use strict";
window.MA_REPS=window.MA_REPS||{};
const r={i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  p:a=>a[Math.floor(Math.random()*a.length)],
  s:(a,b,st)=>a+st*Math.floor(Math.random()*((b-a)/st+1))};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
const $=x=>(x<0?"−":"")+"$"+n(Math.abs(x));
const sg=x=>(x<0?"−":"+")+n(Math.abs(x));
Object.assign(window.MA_REPS,{
 /* t:4 non-cash write-down: net income falls by the after-tax amount; cash rises by the tax saved */
 "t:4":{
  gen:()=>({k:r.p(["cash","ni"]),x:r.s(10,60,10),t:r.p([20,25,30,40])}),
  build:p=>{const tax=rd(p.x*p.t/100),ni=rd(-(p.x-tax)),cash=tax;
    const given=`A company records a non-cash inventory write-down of <b>${$(p.x)}</b>. The tax rate is <b>${p.t}%</b>.`;
    if(p.k==="ni")return{given,q:"By how much does net income change? (a fall is negative)",ans:ni,unit:"$",
      steps:[["Taxes fall by the tax rate × the write-down",`${p.t}% × ${p.x} = ${n(tax)}`],["Net income = −write-down + tax saved",`−${p.x} + ${n(tax)} = ${sg(ni)}`]],
      tip:"The write-down cuts pre-tax income by the full amount, but you save "+n(tax)+" of tax."};
    return{given,q:"By how much does cash change?",ans:cash,unit:"$",
      steps:[["Net income falls by the write-down less the tax saved",`−${p.x} + ${n(tax)} = ${sg(ni)}`],["Add back the non-cash write-down",`${sg(ni)} + ${p.x} = ${sg(cash)}`]],
      tip:"A non-cash charge only changes cash through the tax you save: "+p.t+"% × "+p.x+" = "+n(tax)+"."}}},

 /* t:5 equity value to enterprise value with the treasury stock method */
 "t:5":{
  gen:()=>{const px=r.p([20,40]);return{px,k:px/2,b:r.s(50,200,10),o:r.p([10,20,30]),debt:r.s(100,500,50),pref:r.p([0,20,50]),cash:r.s(50,200,50)}},
  build:p=>{const buy=p.o*p.k/p.px,dil=p.b+p.o-buy,eq=dil*p.px,ans=eq+p.debt+p.pref-p.cash;
    return{given:`Share price <b>${$(p.px)}</b> · <b>${p.b}M</b> basic shares · <b>${p.o}M</b> options with a <b>${$(p.k)}</b> strike · debt <b>${$(p.debt)}M</b> · preferred <b>${$(p.pref)}M</b> · cash <b>${$(p.cash)}M</b>.`,
      q:"What is the enterprise value (in $M)?",ans,unit:"$",
      steps:[["Shares bought back with the option money",`(${p.o} × ${p.k}) ÷ ${p.px} = ${n(buy)}M`],["Diluted shares = basic + options − buyback",`${p.b} + ${p.o} − ${n(buy)} = ${n(dil)}M`],["Equity value = price × diluted shares",`${p.px} × ${n(dil)} = ${n(eq)}`],["EV = equity + debt + preferred − cash",`${n(eq)} + ${p.debt} + ${p.pref} − ${p.cash} = ${n(ans)}`]],
      tip:"Options only add the shares left after the buyback. Then add debt and preferred, and subtract cash."}}},

 /* t:6 calendarize a fiscal year into calendar-year revenue */
 "t:6":{
  gen:()=>({m:r.p([3,6,9]),a:r.s(80,200,20),g:r.s(10,40,10)}),
  build:p=>{const b=p.a+p.g,f=p.m/12,fa=rd(f*p.a),fb=rd((1-f)*b),ans=rd(fa+fb);
    return{given:`A peer's fiscal year ends in month <b>${p.m}</b> (${{3:"March",6:"June",9:"September"}[p.m]}). Fiscal-year revenue: the year ending this calendar year is <b>${$(p.a)}M</b> and the next fiscal year is <b>${$(b)}M</b>.`,
      q:"What is the calendar-year revenue for this calendar year (in $M)?",ans,unit:"$",
      steps:[["Months of this fiscal year inside the calendar year",`${p.m}/12 × ${p.a} = ${n(fa)}`],["Remaining months come from the next fiscal year",`${12-p.m}/12 × ${b} = ${n(fb)}`],["Add them together",`${n(fa)} + ${n(fb)} = ${n(ans)}`]],
      tip:"Blend the two fiscal years by how many months of each fall in the calendar year."}}},

 /* t:7 control premium, or the value of after-tax synergies */
 "t:7":{
  gen:()=>{const k=r.p(["prem","syn"]);const u=r.s(20,80,10),pct=r.p([20,25,30,40]);
    return k==="prem"?{k,u,pct}:{k,s:r.s(10,50,10),t:r.p([20,25,30,40]),d:r.p([10,20,25])}},
  build:p=>{
    if(p.k==="prem"){const offer=rd(p.u*(1+p.pct/100));
      return{given:`The target's unaffected share price is <b>${$(p.u)}</b>. The buyer offers <b>${$(offer)}</b> a share.`,q:"What is the control premium? (in %)",ans:p.pct,unit:"%",tol:0.1,
        steps:[["Extra paid per share",`${n(offer)} − ${p.u} = ${n(offer-p.u)}`],["Premium = extra ÷ unaffected price",`${n(offer-p.u)} ÷ ${p.u} = ${p.pct}%`]],
        tip:"Always divide by the unaffected price, not the offer."}}
    const at=rd(p.s*(100-p.t)/100),ans=rd(at/p.d*100);
    return{given:`A deal brings <b>${$(p.s)}M</b> a year of pre-tax cost synergies. The tax rate is <b>${p.t}%</b> and the discount rate is <b>${p.d}%</b>. Treat the synergies as a steady yearly amount that lasts forever.`,
      q:"What is the value of the synergies (in $M)?",ans,unit:"$",
      steps:[["After-tax synergies",`${p.s} × (1 − ${p.t}%) = ${n(at)}`],["Value ≈ yearly amount ÷ discount rate",`${n(at)} ÷ ${p.d}% = ${n(ans)}`]],
      tip:"This is the most a buyer could pay as extra premium before giving all the synergies to the sellers."}}},

 /* t:8 mental math: rule of 72, up-then-down, or the gain needed to recover a loss */
 "t:8":{
  gen:()=>{const k=r.p(["r72","ud","rec"]);
    return k==="r72"?{k,rate:r.p([6,8,9,12])}:k==="ud"?{k,s:r.p([100,200]),u:r.p([10,20,25])}:{k,d:r.p([20,50,60,75])}},
  build:p=>{
    if(p.k==="r72"){const ans=rd(72/p.rate);return{given:`Money grows <b>${p.rate}%</b> a year.`,q:"Using the rule of 72, about how many years to double?",ans,unit:"",tol:0.1,
      steps:[["Years ≈ 72 ÷ yearly return",`72 ÷ ${p.rate} = ${n(ans)}`]],tip:"Quick, handy, and close enough for interviews."}}
    if(p.k==="ud"){const up=rd(p.s*(1+p.u/100)),ans=rd(up*(1-p.u/100));return{given:`A stock starts at <b>${$(p.s)}</b>. It rises <b>${p.u}%</b>, then falls <b>${p.u}%</b>.`,q:"Where does it end up?",ans,unit:"$",
      steps:[["Up first",`${p.s} × ${rd(1+p.u/100)} = ${n(up)}`],["Then down by the same percent",`${n(up)} × ${rd(1-p.u/100)} = ${n(ans)}`]],tip:"The loss is taken from a bigger base, so you end below where you started."}}
    const ans=rd(p.d/(100-p.d)*100);return{given:`A stock falls <b>${p.d}%</b>.`,q:"What percent gain gets it back to where it started? (in %)",ans,unit:"%",tol:0.1,
      steps:[["Left after the fall (out of 100)",`100 − ${p.d} = ${100-p.d}`],["Gain needed = lost amount ÷ what's left",`${p.d} ÷ ${100-p.d} = ${n(ans)}%`]],tip:"Falls are bigger than they look: recovering a 50% drop takes a 100% gain."}}},

 /* t:9 mixed review: WACC, terminal value, or enterprise value */
 "t:9":{
  gen:()=>{const k=r.p(["wacc","tv","ev"]);
    if(k==="wacc")return{k,e:r.p([50,60,70,80]),ke:r.p([10,12]),kd:r.p([6,8]),t:r.p([25,40])};
    if(k==="tv"){const gw=r.p([[2,7],[2,8],[2,12],[3,8],[3,13]]);return{k,f:r.s(50,150,10),g:gw[0],w:gw[1]}}
    return{k,eq:r.s(200,800,100),debt:r.s(100,300,50),pref:r.p([0,20,50]),cash:r.s(20,100,10)}},
  build:p=>{
    if(p.k==="wacc"){const kdt=rd(p.kd*(1-p.t/100)),d=100-p.e,ans=rd((p.e*p.ke+d*kdt)/100);
      return{given:`Funding: <b>${p.e}%</b> equity costing <b>${p.ke}%</b> and <b>${d}%</b> debt costing <b>${p.kd}%</b> before tax. The tax rate is <b>${p.t}%</b>.`,q:"What is WACC? (in %)",ans,unit:"%",tol:0.05,
        steps:[["After-tax cost of debt",`${p.kd}% × (1 − ${p.t}%) = ${n(kdt)}%`],["Weight each cost",`${p.e}% × ${p.ke} + ${d}% × ${n(kdt)} = ${n(ans)}%`]],tip:"Use the after-tax cost of debt, because interest is tax deductible."}}
    if(p.k==="tv"){const ans=rd(p.f*(1+p.g/100)/((p.w-p.g)/100));
      return{given:`Final-year free cash flow <b>${$(p.f)}</b> · growth after that <b>${p.g}%</b> · WACC <b>${p.w}%</b>.`,q:"What is the terminal value (Gordon growth)?",ans,unit:"$",
        steps:[["Next year's cash flow",`${p.f} × ${rd(1+p.g/100)} = ${n(p.f*(1+p.g/100))}`],["Divide by WACC − growth",`${n(p.f*(1+p.g/100))} ÷ ${rd((p.w-p.g)/100)} = ${n(ans)}`]],tip:"Terminal value = FCF × (1 + g) ÷ (WACC − g). WACC must be bigger than g."}}
    const ans=p.eq+p.debt+p.pref-p.cash;
    return{given:`Equity value <b>${$(p.eq)}M</b> · debt <b>${$(p.debt)}M</b> · preferred <b>${$(p.pref)}M</b> · cash <b>${$(p.cash)}M</b>.`,q:"What is the enterprise value (in $M)?",ans,unit:"$",
      steps:[["Add what other investors are owed",`${p.eq} + ${p.debt} + ${p.pref} = ${p.eq+p.debt+p.pref}`],["Subtract cash",`${p.eq+p.debt+p.pref} − ${p.cash} = ${ans}`]],tip:"EV = equity + debt + preferred − cash."}}}
});
})();
