/* "Your turn" reps: endless fresh-number practice that mirrors each lesson's worked example.
   MA_REPS["trackId:levelIndex"] = { gen(r) -> params, build(params) -> problem }.
   build() is pure, so tests/reps.test.mjs can feed it each lesson's own published example and check the
   answer the lesson prints. A problem = {given, q, ans, unit, dec, tol, steps:[[label, math]], tip}.
   Numbers are chosen to stay clean so the math works in your head, like a real interview. */
(function(){
"use strict";
const r={
  i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  p:a=>a[Math.floor(Math.random()*a.length)],
  s:(a,b,st)=>a+st*Math.floor(Math.random()*((b-a)/st+1))};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
const $=x=>(x<0?"−":"")+"$"+n(Math.abs(x));
const sg=x=>(x<0?"−":"+")+n(Math.abs(x));
const pc=x=>n(x)+"%";
const M={};

/* ---------- Foundations ---------- */
M["f:0"]={
  gen:()=>({ni:r.s(60,200,10),da:r.s(10,40,10),ar:r.s(5,30,5),capex:r.s(20,80,10),debt:r.s(10,50,10)}),
  build:p=>{const cfo=p.ni+p.da-p.ar,ans=cfo-p.capex+p.debt;
    return{given:`Net income <b>${$(p.ni)}</b> · D&amp;A <b>${$(p.da)}</b> · receivables up <b>${$(p.ar)}</b> · capex <b>${$(p.capex)}</b> · new borrowing <b>${$(p.debt)}</b>. No dividends.`,
      q:"By how much does cash change this year?",ans,unit:"$",
      steps:[["Net income + D&A − receivables increase",`${p.ni} + ${p.da} − ${p.ar} = ${cfo}`],["Subtract capex (investing)",`${cfo} − ${p.capex} = ${cfo-p.capex}`],["Add new borrowing (financing)",`${cfo-p.capex} + ${p.debt} = ${ans}`]],
      tip:"Operations, then investing, then financing. Receivables going up is revenue you haven't collected yet, so it subtracts."}}};

const depBuild=p=>{const ans=rd(p.d*p.t/100),ni=rd(-p.d*(1-p.t/100));
  return{given:`Depreciation rises <b>${$(p.d)}</b>. The tax rate is <b>${p.t}%</b>.`,q:"By how much does ending cash change?",ans,unit:"$",
    steps:[["Pre-tax income falls by the expense",sg(-p.d)],["Taxes fall by "+p.t+"% × "+p.d,sg(rd(p.d*p.t/100))],["Net income",`${sg(ni)}`],["Add back depreciation (non-cash)",`${sg(ni)} + ${p.d} = ${sg(ans)}`]],
    tip:"Cash rises by exactly the tax you save: "+p.t+"% × "+p.d+" = "+n(ans)+"."}};
const depGen=()=>({d:r.p([10,20,30,40,50]),t:r.p([20,25,30,40])});
M["ib:7"]={gen:depGen,build:depBuild};
/* Foundations: time value of money. $100 at 10% for 2 years = $121 (the lesson's worked example). */
M["f:1"]={
  gen:()=>({pv:r.s(100,500,100),rate:r.p([10,20])}),
  build:p=>{const m=1+p.rate/100,y1=rd(p.pv*m),ans=rd(p.pv*m*m);
    return{given:`You invest <b>${$(p.pv)}</b> at <b>${p.rate}%</b> a year with compounding.`,q:"What is it worth after 2 years?",ans,unit:"$",
      steps:[["Year 1: grow by "+p.rate+"%",`${p.pv} × ${rd(m)} = ${n(y1)}`],["Year 2: grow again",`${n(y1)} × ${rd(m)} = ${n(ans)}`]],
      tip:"Interest earns interest. Discounting is the same math in reverse: divide by "+rd(m)+" each year."}}};
M["t:0"]={gen:depGen,build:depBuild};

const evBuild=p=>{const ans=p.eq+p.debt-p.cash;
  return{given:`Equity value <b>${$(p.eq)}</b> · debt <b>${$(p.debt)}</b> · cash <b>${$(p.cash)}</b>.`,q:"What is the enterprise value?",ans,unit:"$",
    steps:[["Start with equity value",String(p.eq)],["Add debt (you take it on)",`${p.eq} + ${p.debt} = ${p.eq+p.debt}`],["Subtract cash (you get it)",`${p.eq+p.debt} − ${p.cash} = ${ans}`]],
    tip:"EV = equity value + debt − cash."}};
const evGen=()=>({eq:r.s(400,900,50),debt:r.s(100,400,50),cash:r.s(20,150,10)});
M["f:2"]={gen:evGen,build:evBuild};
M["t:1"]={gen:evGen,build:evBuild};

M["f:3"]={
  gen:()=>({e:r.s(20,90,5),m:r.i(6,14)}),
  build:p=>{const ans=p.e*p.m;
    return{given:`Similar companies trade at <b>${p.m}x</b> EBITDA. The target's EBITDA is <b>${$(p.e)}</b>.`,q:"What is the implied enterprise value?",ans,unit:"$",
      steps:[["EV = EBITDA × multiple",`${p.e} × ${p.m} = ${ans}`]],tip:"Comps: take what the market pays for similar companies and apply it to the target."}}};

M["ib:8"]={
  gen:()=>({rate:r.p([6,7,8,9,10]),t:r.p([20,25,30])}),
  build:p=>{const ans=rd(p.rate*(1-p.t/100));
    return{given:`New debt costs <b>${p.rate}%</b> interest. The tax rate is <b>${p.t}%</b>.`,q:"What is the after-tax cost of the debt? (in %)",ans,unit:"%",tol:0.05,
      steps:[["Interest is tax deductible",`1 − ${p.t}% = ${rd(1-p.t/100)}`],["After-tax cost",`${p.rate}% × ${rd(1-p.t/100)} = ${pc(ans)}`]],
      tip:"A deal is accretive when what the target earns per dollar beats this cost."}}};

/* Foundations: leverage. $100 asset, $50 debt, +20% -> equity +40% (the lesson's worked example). */
M["f:4"]={
  gen:()=>({a:r.p([100,200,400]),d:r.p([50,75]),x:r.p([10,20,25])}),
  build:p=>{const debt=p.a*p.d/100,eq=p.a-debt,gain=rd(p.a*p.x/100),ans=rd(gain/eq*100);
    return{given:`You buy a <b>${$(p.a)}</b> asset with <b>${$(debt)}</b> of debt and <b>${$(eq)}</b> of your own money. The asset rises <b>${p.x}%</b>. Ignore interest.`,q:"What is your return on your equity? (in %)",ans,unit:"%",tol:0.05,
      steps:[["Asset gain",`${p.a} × ${p.x}% = ${n(gain)}`],["Your equity is the part you paid",`${p.a} − ${debt} = ${eq}`],["Return on equity",`${n(gain)} ÷ ${eq} = ${pc(ans)}`]],
      tip:"Leverage multiplies the move by assets ÷ equity ("+rd(p.a/eq)+"x here). It multiplies losses the same way."}}};

/* ---------- Investment banking ---------- */
M["ib:3"]={
  gen:()=>{const m2=r.i(6,10);return{e:r.s(50,150,10),m1:m2+r.i(2,6),m2}},
  build:p=>{const a=p.e*p.m1,b=p.e*p.m2,ans=a-b;
    return{given:`Two companies each earn <b>${$(p.e)}</b> of EBITDA. A trades at <b>${p.m1}x</b>, B at <b>${p.m2}x</b>.`,q:"How much higher is A's enterprise value than B's?",ans,unit:"$",
      steps:[["A's EV",`${p.e} × ${p.m1} = ${a}`],["B's EV",`${p.e} × ${p.m2} = ${b}`],["Gap",`${a} − ${b} = ${ans}`]],
      tip:"Same earnings, different value. The market pays more for growth, higher margins and lower risk."}}};

/* ---------- Private equity ---------- */
M["pe:0"]={
  gen:()=>r.p([0,1])?{k:"carry",profit:r.s(100,800,50)}:{k:"fee",fund:r.p([500,1000,1500,2000])},
  build:p=>p.k==="carry"
   ?{given:`A fund earns <b>${$(p.profit)}M</b> of profit. Carry is <b>20%</b> (ignore the hurdle).`,q:"How much carried interest does the GP earn? ($M)",ans:rd(p.profit*.2),unit:"$",
     steps:[["Carry = 20% × profit",`0.20 × ${p.profit} = ${n(p.profit*.2)}`]],tip:"Carry is the GP's cut of the profit. The management fee is a separate 2%."}
   :{given:`A fund is <b>${$(p.fund)}M</b>. The management fee is <b>2%</b> a year.`,q:"What is the annual management fee? ($M)",ans:rd(p.fund*.02),unit:"$",
     steps:[["Fee = 2% × fund size",`0.02 × ${p.fund} = ${n(p.fund*.02)}`]],tip:"Fees pay the firm's salaries and costs. Carry is the upside."}};

M["pe:1"]={
  gen:()=>({price:r.s(500,1500,100),fees:r.s(10,40,10),dp:r.p([50,60])}),
  build:p=>{const uses=p.price+p.fees,debt=rd(p.price*p.dp/100),ans=uses-debt;
    return{given:`Purchase price <b>${$(p.price)}</b> · fees <b>${$(p.fees)}</b> · new debt is <b>${p.dp}%</b> of the purchase price.`,q:"How much equity does the sponsor put in?",ans,unit:"$",
      steps:[["Total uses: price + fees",`${p.price} + ${p.fees} = ${uses}`],["Debt: "+p.dp+"% × "+p.price,String(debt)],["Equity = uses − debt",`${uses} − ${debt} = ${ans}`]],
      tip:"Sources must equal uses. Fees count as a use of cash."}}};

const moicBuild=p=>{
  if(p.k==="irr"){const ans={2:15,2.5:20,3:25}[p.m];
    return{given:`You get <b>${p.m}x</b> your money back over <b>5 years</b>.`,q:"Roughly what is the IRR? (in %, nearest 5)",ans,unit:"%",tol:1.5,
      steps:[["Use the 5-year ladder","2x ≈ 15%, 2.5x ≈ 20%, 3x ≈ 25%"],["Match",`${p.m}x ≈ ${ans}%`]],tip:"Check by compounding: 1.20⁵ ≈ 2.5."}}
  const out=p.inn*p.m;
  return{given:`You invest <b>${$(p.inn)}</b> and receive <b>${$(out)}</b> at exit.`,q:"What is the MOIC? (e.g. 2.5)",ans:p.m,unit:"x",tol:0.02,
    steps:[["MOIC = money out ÷ money in",`${out} ÷ ${p.inn} = ${p.m}x`]],tip:"MOIC ignores time. IRR is the version that cares how long it took."}};
const moicGen=()=>r.p([0,1])?{k:"moic",inn:r.p([50,100,200,250,500]),m:r.p([1.5,2,2.5,3,4])}:{k:"irr",m:r.p([2,2.5,3])};
M["pe:2"]={gen:moicGen,build:moicBuild};
M["t:3"]={gen:moicGen,build:moicBuild};

M["pe:3"]={
  gen:()=>{const e0=r.s(50,150,10),m=r.p([8,10,12]),e5=r.s(Math.ceil(e0*1.2/5)*5,Math.floor(e0*1.5/5)*5,5),d0=e0*m/2;return{e0,m,e5,left:Math.round(d0*r.p([.4,.5,.6])/10)*10}},
  build:p=>{const ev=p.e0*p.m,debt=ev/2,xev=p.e5*p.m,ans=xev-p.left;
    return{given:`Buy at EBITDA <b>${$(p.e0)}</b> × <b>${p.m}x</b>, funded <b>50% debt</b>. In year 5 EBITDA is <b>${$(p.e5)}</b>, the exit multiple is still <b>${p.m}x</b>, and <b>${$(p.left)}</b> of debt remains.`,
      q:"What is the exit equity?",ans,unit:"$",
      steps:[["Entry EV",`${p.e0} × ${p.m} = ${ev}`],["Entry debt / equity",`${debt} / ${ev-debt}`],["Exit EV",`${p.e5} × ${p.m} = ${xev}`],["Exit equity = exit EV − debt left",`${xev} − ${p.left} = ${ans}`],["MOIC",`${ans} ÷ ${ev-debt} = ${n(ans/(ev-debt))}x`]],
      tip:"Never forget to subtract the debt that's left. The PE firm owns the equity, not the whole company."}}};

M["pe:5"]={
  gen:()=>r.p(["lev","cov","pik"])==="lev"?{k:"lev",e:r.p([50,80,100,125]),mult:r.p([4,4.5,5,5.5,6])}:r.p([0,1])?{k:"cov",e:r.p([60,80,100,120]),i:r.p([15,20,25,30])}:{k:"pik",pr:r.p([100,200,500]),rate:r.p([8,10,12])},
  build:p=>{
    if(p.k==="lev"){const debt=p.e*p.mult;return{given:`Debt <b>${$(debt)}</b> · EBITDA <b>${$(p.e)}</b>.`,q:"What is the leverage (debt ÷ EBITDA)? (e.g. 5.5)",ans:p.mult,unit:"x",tol:0.02,
      steps:[["Leverage = debt ÷ EBITDA",`${debt} ÷ ${p.e} = ${p.mult}x`]],tip:"Lenders watch this ratio. Covenants often cap it around 5–6x."}}
    if(p.k==="cov"){const ans=rd(p.e/p.i);return{given:`EBITDA <b>${$(p.e)}</b> · cash interest <b>${$(p.i)}</b>.`,q:"What is the interest coverage (EBITDA ÷ interest)? (e.g. 4)",ans,unit:"x",tol:0.05,
      steps:[["Coverage = EBITDA ÷ interest",`${p.e} ÷ ${p.i} = ${n(ans)}x`]],tip:"Higher is safer. Under about 2x gets uncomfortable."}}
    const y1=p.pr*(1+p.rate/100),ans=rd(y1*(1+p.rate/100));return{given:`<b>${$(p.pr)}</b> of debt pays <b>${p.rate}% PIK</b> (interest added to the balance).`,q:"What is the balance after 2 years?",ans,unit:"$",tol:0.05,
      steps:[["Year 1",`${p.pr} × ${rd(1+p.rate/100)} = ${n(y1)}`],["Year 2",`${n(y1)} × ${rd(1+p.rate/100)} = ${n(ans)}`]],tip:"PIK compounds, so the balance grows faster than simple interest."}}};

M["pe:6"]={
  gen:()=>({e:r.s(5,20,5),buy:r.p([5,6,7]),plat:r.p([9,10,11,12])}),
  build:p=>{const cost=p.e*p.buy,val=p.e*p.plat,ans=val-cost;
    return{given:`Buy an add-on with <b>${$(p.e)}</b> of EBITDA at <b>${p.buy}x</b>. The platform is valued at <b>${p.plat}x</b>.`,q:"How much value is created by multiple arbitrage?",ans,unit:"$",
      steps:[["Cost of the add-on",`${p.e} × ${p.buy} = ${cost}`],["Worth inside the platform",`${p.e} × ${p.plat} = ${val}`],["Value created",`${val} − ${cost} = ${ans}`]],
      tip:"Buy small at a low multiple, get valued at the bigger multiple. That gap is the arbitrage."}}};

/* ---------- Public markets ---------- */
M["pm:0"]={
  gen:()=>({bid:r.p([49.98,99.98,24.97,149.96]),sp:r.p([.02,.04,.06]),sh:r.p([5000,10000,20000])}),
  build:p=>{const ask=rd(p.bid+p.sp),ans=rd(p.sp*p.sh);
    return{given:`A trader quotes <b>bid ${$(p.bid)} / ask ${$(ask)}</b>, buys <b>${n(p.sh)}</b> shares at the bid and sells them at the ask.`,q:"How much does the trader earn?",ans,unit:"$",
      steps:[["Spread per share",`${n(ask)} − ${n(p.bid)} = ${n(p.sp)}`],["Times the shares",`${n(p.sp)} × ${n(p.sh)} = ${n(ans)}`]],tip:"Tiny spread, huge volume. The risk is the price moving before the trader sells."}}};

M["pm:1"]={
  gen:()=>{const o=r.p([30,40,50,60]);return{o,px:o-r.p([1,2,3])}},
  build:p=>{const ans=rd((p.o-p.px)/p.px*100,1);
    return{given:`A buyer agrees to pay <b>${$(p.o)}</b> cash per share. The target trades at <b>${$(p.px)}</b>.`,q:"If the deal closes, what is your return? (in %, 1 decimal)",ans,unit:"%",tol:0.1,
      steps:[["Gain per share",`${p.o} − ${p.px} = ${p.o-p.px}`],["Return",`${p.o-p.px} ÷ ${p.px} = ${pc(ans)}`]],tip:"The gap pays you for the risk that the deal fails and the stock falls back."}}};

M["pm:2"]={
  gen:()=>({px:r.p([20,40,50,80]),up:r.p([20,25,30,40,50])}),
  build:p=>{const tgt=rd(p.px*(1+p.up/100));
    return{given:`Stock price <b>${$(p.px)}</b>, your price target <b>${$(tgt)}</b>.`,q:"What is the upside? (in %)",ans:p.up,unit:"%",tol:0.2,
      steps:[["Upside = (target − price) ÷ price",`(${n(tgt)} − ${p.px}) ÷ ${p.px} = ${pc(p.up)}`]],tip:"Lead your pitch with the number: long, target, upside."}}};

M["pm:3"]={
  gen:()=>{const k=r.p(["net","gross","sharpe"]);return k==="sharpe"?{k,ret:r.p([10,12,14,16]),rf:r.p([2,4]),vol:r.p([8,10,16,20])}:{k,l:r.s(80,160,10),s:r.s(40,100,10)}},
  build:p=>{
    if(p.k==="net")return{given:`Long <b>${p.l}%</b>, short <b>${p.s}%</b> of capital.`,q:"What is the net exposure? (in %)",ans:p.l-p.s,unit:"%",tol:0.2,steps:[["Net = longs − shorts",`${p.l} − ${p.s} = ${p.l-p.s}%`]],tip:"Net is how much you're betting the market goes up."}
    if(p.k==="gross")return{given:`Long <b>${p.l}%</b>, short <b>${p.s}%</b> of capital.`,q:"What is the gross exposure? (in %)",ans:p.l+p.s,unit:"%",tol:0.2,steps:[["Gross = longs + shorts",`${p.l} + ${p.s} = ${p.l+p.s}%`]],tip:"Gross is total money at work, in either direction."}
    const ans=rd((p.ret-p.rf)/p.vol);return{given:`Return <b>${p.ret}%</b> · safe rate <b>${p.rf}%</b> · volatility <b>${p.vol}%</b>.`,q:"What is the Sharpe ratio? (2 decimals)",ans,unit:"",tol:0.01,
      steps:[["Excess return",`${p.ret} − ${p.rf} = ${p.ret-p.rf}`],["Per unit of risk",`${p.ret-p.rf} ÷ ${p.vol} = ${n(ans)}`]],tip:"Sharpe = return per unit of risk."}}};

M["pm:4"]={
  gen:()=>{const k=r.s(40,100,5);return{k,prem:r.i(1,6),px:k+r.i(-8,15)}},
  build:p=>{const val=Math.max(p.px-p.k,0),ans=val-p.prem;
    return{given:`You buy a call with a <b>${$(p.k)}</b> strike for <b>${$(p.prem)}</b>. The stock ends at <b>${$(p.px)}</b>.`,q:"What is your profit per share? (a loss is negative)",ans,unit:"$",
      steps:[["Value at expiry = max(stock − strike, 0)",`max(${p.px} − ${p.k}, 0) = ${val}`],["Minus the premium you paid",`${val} − ${p.prem} = ${sg(ans)}`]],
      tip:"The most you can lose buying an option is the premium. Break-even = strike + premium = "+(p.k+p.prem)+"."}}};

M["pm:5"]={
  gen:()=>({dur:r.i(3,10),dy:r.p([-2,-1.5,-1,-.5,.5,1,1.5,2])}),
  build:p=>{const ans=rd(-p.dur*p.dy);
    return{given:`A bond has a duration of <b>${p.dur}</b>. Yields move <b>${p.dy>0?"up":"down"} ${n(Math.abs(p.dy))}</b> point${Math.abs(p.dy)===1?"":"s"}.`,q:"Roughly how does the price change? (in %, sign matters)",ans,unit:"%",tol:0.1,
      steps:[["Price change ≈ −duration × yield change",`−${p.dur} × ${sg(p.dy)} = ${sg(ans)}%`]],tip:"Prices move opposite to yields."}}};

/* ---------- Restructuring ---------- */
M["rx:0"]={
  gen:()=>({debt:r.s(300,800,50),e:r.p([50,80,100,125])}),
  build:p=>{const ans=rd(p.debt/p.e);
    return{given:`Debt <b>${$(p.debt)}</b> · EBITDA <b>${$(p.e)}</b>. The covenant requires debt ÷ EBITDA under <b>5x</b>.`,q:"What is the leverage ratio? (2 decimals)",ans,unit:"x",tol:0.02,
      steps:[["Debt ÷ EBITDA",`${p.debt} ÷ ${p.e} = ${n(ans)}x`],["Against the 5x limit",ans>5?"breached":"OK"]],tip:ans>5?"Breaching a covenant lets lenders demand repayment or renegotiate.":"Under the limit, so the covenant holds."}}};

M["rx:1"]={
  gen:()=>{const sec=r.p([200,300]),un=r.p([200,400,500]);const left=r.s(50,un-50,50);return{v:sec+left,sec,un}},
  build:p=>{const left=p.v-p.sec,ans=rd(left/p.un*100,1);
    return{given:`Company value <b>${$(p.v)}</b>. Secured creditors are owed <b>${$(p.sec)}</b>, unsecured creditors <b>${$(p.un)}</b>.`,q:"What is the unsecured recovery? (in %)",ans,unit:"%",tol:0.1,
      steps:[["Secured gets paid first, in full",`${p.v} − ${p.sec} = ${left} left`],["Unsecured recovery = received ÷ owed",`${left} ÷ ${p.un} = ${pc(ans)}`]],tip:"Each class is paid in full before the next one gets anything."}}};

M["rx:5"]={
  gen:()=>{const a=r.p([300,400]),b=r.p([250,300,400,500]);return{v:a+r.s(50,b-50,50),a,b}},
  build:p=>{const left=p.v-p.a,ans=rd(left/p.b*100,1);
    return{given:`Value <b>${$(p.v)}</b>. First lien owed <b>${$(p.a)}</b>, second lien owed <b>${$(p.b)}</b>.`,q:"What does the second lien recover? (in %) It's the fulcrum.",ans,unit:"%",tol:0.1,
      steps:[["First lien paid in full",`${p.v} − ${p.a} = ${left} left`],["Second lien recovery",`${left} ÷ ${p.b} = ${pc(ans)}`]],tip:"The fulcrum is the class where value runs out. It usually gets the new equity."}}};

/* ---------- Technical questions ---------- */
M["t:2"]={
  gen:()=>({ebit:r.s(80,150,10),t:r.p([20,25,30,40]),da:r.s(10,40,10),capex:r.s(20,50,10),nwc:r.s(0,20,5)}),
  build:p=>{const nopat=rd(p.ebit*(1-p.t/100)),ans=rd(nopat+p.da-p.capex-p.nwc);
    return{given:`EBIT <b>${$(p.ebit)}</b> · tax <b>${p.t}%</b> · D&amp;A <b>${$(p.da)}</b> · capex <b>${$(p.capex)}</b> · working capital increase <b>${$(p.nwc)}</b>.`,q:"What is the unlevered free cash flow?",ans,unit:"$",tol:0.1,
      steps:[["EBIT after tax",`${p.ebit} × ${rd(1-p.t/100)} = ${n(nopat)}`],["Add D&A, subtract capex and working capital",`${n(nopat)} + ${p.da} − ${p.capex} − ${p.nwc} = ${n(ans)}`]],
      tip:"UFCF = EBIT × (1 − tax) + D&A − capex − increase in working capital."}}};

window.MA_REPS=M;
})();
