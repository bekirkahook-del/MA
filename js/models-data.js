/* Model Lab data: three small models you build cell by cell, with fresh numbers every time.
   MA_MODELS[id] = { keys:[levels it belongs to], name, blurb, gen() -> params, build(params) -> model }.
   build() is pure so tests/models.test.mjs can check the math. A model =
   { title, intro, given:[[label, valueText]], sections:[{ title, rows:[{label, hint, ans, unit, tol}] }], tip }.
   unit: "$" (in $ millions unless the label says per share), "%", "x", "" (plain number). */
(function(){
"use strict";
const r={
  i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  p:a=>a[Math.floor(Math.random()*a.length)],
  s:(a,b,st)=>a+st*Math.floor(Math.random()*((b-a)/st+1))};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
const $=x=>(x<0?"−":"")+"$"+n(Math.abs(x));
const M={};

/* ---------- 1) DCF in five steps ---------- */
M.dcf={keys:["f:3"],name:"Build a DCF",blurb:"Cash flows → present value → enterprise value → price per share.",
  gen:()=>({f1:r.s(80,200,20),g:r.p([5,10]),rate:r.p([9,10,12]),tg:r.p([2,3]),nd:r.s(100,300,50),sh:r.p([10,20,25,50])}),
  build:p=>{
    const g=p.g/100,R=p.rate/100,T=p.tg/100;
    const f2=p.f1*(1+g),f3=f2*(1+g);
    const pv1=p.f1/(1+R),pv2=f2/Math.pow(1+R,2),pv3=f3/Math.pow(1+R,3);
    const tv=f3*(1+T)/(R-T),pvtv=tv/Math.pow(1+R,3);
    const ev=pv1+pv2+pv3+pvtv,eq=ev-p.nd,ps=eq/p.sh;
    const row=(label,hint,ans,extra)=>Object.assign({label,hint,ans,unit:"$",tol:Math.max(0.6,Math.abs(ans)*0.01)},extra||{});
    return{title:"Build a DCF",
      intro:"A 3-year DCF. Fill each blank. Use a calculator, rounding to the nearest $1M is fine.",
      given:[["Year 1 free cash flow",$(p.f1)+"M"],["FCF growth each year",p.g+"%"],["Discount rate (WACC)",p.rate+"%"],["Terminal growth",p.tg+"%"],["Net debt",$(p.nd)+"M"],["Shares outstanding",p.sh+"M"]],
      sections:[
        {title:"1 · Project the cash flows",rows:[
          row("Year 2 FCF ($M)","Year 1 × (1 + growth)",f2),
          row("Year 3 FCF ($M)","Year 2 × (1 + growth)",f3)]},
        {title:"2 · Discount them to today",rows:[
          row("PV of Year 1 FCF ($M)","FCF ÷ (1 + WACC)^1",pv1),
          row("PV of Year 2 FCF ($M)","FCF ÷ (1 + WACC)^2",pv2),
          row("PV of Year 3 FCF ($M)","FCF ÷ (1 + WACC)^3",pv3)]},
        {title:"3 · Terminal value",rows:[
          row("Terminal value at Year 3 ($M)","Year 3 FCF × (1 + g) ÷ (WACC − g)",tv),
          row("PV of terminal value ($M)","TV ÷ (1 + WACC)^3",pvtv)]},
        {title:"4 · Value and price",rows:[
          row("Enterprise value ($M)","Sum of the 3 PVs + PV of terminal value",ev),
          row("Equity value ($M)","Enterprise value − net debt",eq),
          row("Value per share ($)","Equity value ÷ shares",ps,{tol:Math.max(0.05,Math.abs(ps)*0.01)})]}],
      tip:"Terminal value is usually the biggest piece of EV. Here it is "+Math.round(pvtv/ev*100)+"% of it. That is why analysts fight over the growth and discount rate."}}};

/* ---------- 2) 5-year LBO ---------- */
const LBO_PAIRS=[[7,4],[8,4],[8,5],[9,5],[10,5],[10,6]];
M.lbo={keys:["pe:1","pe:3"],name:"Build an LBO",blurb:"Buy it, pay down debt for 5 years, sell it, get your MOIC and IRR.",
  gen:()=>{const mp=r.p(LBO_PAIRS);return{e0:r.p([80,100,120]),m:mp[0],lev:mp[1],a:r.p([5,10]),s:r.p([30,40])}},
  build:p=>{
    const ev=p.m*p.e0,debt0=p.lev*p.e0,eq0=ev-debt0;
    const E=[1,2,3,4,5].map(t=>p.e0*(1+p.a/100*t));
    const D=[];let d=debt0;E.forEach(e=>{d=d-e*p.s/100;D.push(d)});
    const exitEv=p.m*E[4],exitEq=exitEv-D[4],moic=exitEq/eq0,irr=(Math.pow(moic,1/5)-1)*100;
    const row=(label,hint,ans,extra)=>Object.assign({label,hint,ans,unit:"$",tol:Math.max(0.6,Math.abs(ans)*0.01)},extra||{});
    return{title:"Build an LBO",
      intro:"Buy at the entry multiple, put in the debt, sweep cash to repay it for 5 years, then sell at the same multiple. No fees, to keep it clean.",
      given:[["Entry EBITDA",$(p.e0)+"M"],["Entry multiple",p.m+"x EBITDA"],["Debt at entry",p.lev+"x EBITDA"],["EBITDA grows by",p.a+"% of entry EBITDA each year (Y1 "+n(E[0])+", Y5 "+n(E[4])+")"],["Cash used to repay debt",p.s+"% of each year's EBITDA"],["Exit multiple","same as entry, "+p.m+"x"]],
      sections:[
        {title:"1 · The purchase",rows:[
          row("Purchase price / EV ($M)","Entry EBITDA × entry multiple",ev),
          row("Debt raised ($M)","Entry EBITDA × leverage",debt0),
          row("Sponsor equity ($M)","EV − debt",eq0)]},
        {title:"2 · Pay down the debt",rows:D.map((x,i)=>row("Debt at end of Year "+(i+1)+" ($M)","Last year's debt − "+p.s+"% × Year "+(i+1)+" EBITDA ("+n(E[i])+")",x))},
        {title:"3 · The exit",rows:[
          row("Exit EV ($M)","Year 5 EBITDA × exit multiple",exitEv),
          row("Exit equity ($M)","Exit EV − Year 5 debt",exitEq),
          row("MOIC (x)","Exit equity ÷ sponsor equity",moic,{unit:"x",tol:0.06}),
          row("IRR (%)","MOIC^(1/5) − 1",irr,{unit:"%",tol:0.7})]}],
      tip:"Where did the return come from? Debt paydown added "+n(debt0-D[4])+", EBITDA growth added "+n((E[4]-p.e0)*p.m)+" of value. Multiple expansion added 0 because entry and exit are equal. That is the standard conservative assumption."}}};

/* ---------- 3) Merger: accretion / dilution ---------- */
M.merger={keys:["f:4"],name:"Build a merger model",blurb:"Does the deal raise or lower the buyer's EPS?",
  gen:()=>({nia:r.s(100,300,50),sha:r.p([50,100]),pa:r.p([20,40,50]),price:r.p([400,500,600]),pct:r.p([50,75]),nit:r.s(20,40,10),d:r.p([5,6,8])}),
  build:p=>{
    const tax=0.25,stock=p.price*p.pct/100,debt=p.price-stock,newSh=stock/p.pa;
    const eps0=p.nia/p.sha,ati=debt*p.d/100*(1-tax),pfNi=p.nia+p.nit-ati,pfSh=p.sha+newSh,eps1=pfNi/pfSh,ad=(eps1/eps0-1)*100;
    const eps=(label,hint,ans)=>({label,hint,ans,unit:"$",tol:0.02});
    return{title:"Build a merger model",
      intro:"The buyer pays "+p.pct+"% in new stock and the rest with new debt. Find out if EPS goes up (accretive) or down (dilutive).",
      given:[["Buyer net income",$(p.nia)+"M"],["Buyer shares",p.sha+"M"],["Buyer share price","$"+p.pa],["Target net income",$(p.nit)+"M"],["Purchase price",$(p.price)+"M, "+p.pct+"% stock / "+(100-p.pct)+"% new debt"],["Interest on new debt",p.d+"% (tax rate 25%)"]],
      sections:[
        {title:"1 · Buyer today",rows:[eps("Buyer EPS today ($)","Net income ÷ shares",eps0)]},
        {title:"2 · Paying for it",rows:[
          {label:"New shares issued (M)",hint:"Stock portion of price ÷ buyer share price",ans:newSh,unit:"",tol:Math.max(0.06,newSh*0.01)},
          {label:"After-tax interest on new debt ($M)",hint:"Debt × rate × (1 − 25%)",ans:ati,unit:"$",tol:Math.max(0.1,ati*0.01)}]},
        {title:"3 · Combined company",rows:[
          {label:"Pro forma net income ($M)",hint:"Buyer NI + target NI − after-tax interest",ans:pfNi,unit:"$",tol:Math.max(0.6,pfNi*0.01)},
          {label:"Pro forma shares (M)",hint:"Old shares + new shares",ans:pfSh,unit:"",tol:Math.max(0.06,pfSh*0.01)},
          eps("Pro forma EPS ($)","Pro forma NI ÷ pro forma shares",eps1),
          {label:"Accretion / (dilution) (%)",hint:"Pro forma EPS ÷ today's EPS − 1. Negative = dilutive.",ans:ad,unit:"%",tol:0.3}]}],
      tip:(ad>=0?"Accretive":"Dilutive")+" by "+n(Math.abs(ad))+"%. Rule of thumb: stock is cheaper for the buyer when its P/E is higher than the target's, debt is cheaper when its after-tax interest rate is lower than the earnings yield it buys."}}};

window.MA_MODELS=M;
})();
