/* "Your turn" reps for Portfolio Mgmt levels 7-10 (pm:6..pm:9). Same format as reps-data.js. */
(function(){
"use strict";
window.MA_REPS=window.MA_REPS||{};
const r={i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  p:a=>a[Math.floor(Math.random()*a.length)],
  s:(a,b,st)=>a+st*Math.floor(Math.random()*((b-a)/st+1))};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
Object.assign(window.MA_REPS,{
 /* Macro: real yield = nominal - inflation (lesson: 5% - 3% = 2%) */
 "pm:6":{
  gen:()=>({nom:r.p([3,3.5,4,4.5,5,5.5,6]),inf:r.p([1.5,2,2.5,3])}),
  build:p=>{const ans=rd(p.nom-p.inf);
    return{given:`A government bond yields <b>${n(p.nom)}%</b> a year. Inflation is running at <b>${n(p.inf)}%</b>.`,
      q:"What is the real yield? (in %)",ans,unit:"%",tol:0.05,
      steps:[["Real yield = nominal yield − inflation",`${n(p.nom)} − ${n(p.inf)} = ${n(ans)}%`]],
      tip:"The real yield is what you keep after inflation. If it is negative, your money buys less over time."}}},
 /* Market making: spread income minus inventory loss (lesson: 4c on 10,000 shares, 2,000 shares fall $0.50 -> -600) */
 "pm:7":{
  gen:()=>({sp:r.p([2,3,4,5,6]),sh:r.s(5000,20000,5000),inv:r.s(1000,3000,1000),mv:r.p([0.2,0.3,0.5])}),
  build:p=>{const inc=rd(p.sp/100*p.sh),loss=rd(p.inv*p.mv),ans=rd(inc-loss);
    return{given:`A dealer's spread is <b>${p.sp} cents</b>. Clients trade <b>${n(p.sh)}</b> shares both ways. The desk is also stuck holding <b>${n(p.inv)}</b> unhedged shares that fall <b>$${n(p.mv)}</b> each.`,
      q:"What is the desk's net result for the day? (in dollars, negative if a loss)",ans,unit:"$",
      steps:[["Spread income = spread × shares",`${n(p.sp/100)} × ${n(p.sh)} = ${n(inc)}`],["Inventory loss = shares held × price drop",`${n(p.inv)} × ${n(p.mv)} = ${n(loss)}`],["Net = income − loss",`${n(inc)} − ${n(loss)} = ${n(ans)}`]],
      tip:"Spread wins are small and steady. One unhedged move can wipe them out, so desks hedge."}}},
 /* Position sizing: shares = capital x risk% / (entry - stop) (lesson: $1M, 1%, $50 -> $45 = 2,000 shares) */
 "pm:8":{
  gen:()=>({cap:r.p([500000,1000000,2000000]),rp:r.p([0.5,1,2]),entry:r.p([40,50,80,100]),rps:r.p([2,4,5,10])}),
  build:p=>{const risk=rd(p.cap*p.rp/100),stop=p.entry-p.rps,ans=rd(risk/p.rps,0);
    return{given:`A fund has <b>$${n(p.cap)}</b> and risks <b>${n(p.rp)}%</b> of it on one trade. You buy at <b>$${n(p.entry)}</b> with a stop-loss at <b>$${n(stop)}</b>.`,
      q:"How many shares can you buy?",ans,unit:"",dec:0,
      steps:[["Dollars you can lose = capital × risk %",`${n(p.cap)} × ${n(p.rp)}% = ${n(risk)}`],["Risk per share = entry − stop",`${n(p.entry)} − ${n(stop)} = ${n(p.rps)}`],["Shares = dollars at risk ÷ risk per share",`${n(risk)} ÷ ${n(p.rps)} = ${n(ans)}`]],
      tip:"Let the stop-loss set the size. A tighter stop lets you hold more shares for the same dollar risk."}}},
 /* Short selling: gain minus borrow fee (lesson: 1,000 sh, $50 -> $40, 4% fee, 6 months -> 9,000) */
 "pm:9":{
  gen:()=>({sh:r.s(100,1000,100),sell:r.s(20,100,10),drop:r.p([5,10,15]),fee:r.p([2,4,6]),mo:r.p([3,6,12])}),
  build:p=>{const cover=p.sell-p.drop,gain=rd(p.sh*p.drop),fee=rd(p.sh*p.sell*p.fee/100*p.mo/12),ans=rd(gain-fee);
    return{given:`You short <b>${n(p.sh)}</b> shares at <b>$${n(p.sell)}</b> and cover at <b>$${n(cover)}</b> after <b>${p.mo} months</b>. The borrow fee is <b>${p.fee}%</b> a year, charged on the starting value of the position.`,
      q:"What is your net profit after the borrow fee? (in dollars)",ans,unit:"$",
      steps:[["Gain = shares × (sell price − cover price)",`${n(p.sh)} × (${n(p.sell)} − ${n(cover)}) = ${n(gain)}`],["Fee = position value × fee % × months ÷ 12",`${n(p.sh*p.sell)} × ${p.fee}% × ${p.mo}/12 = ${n(fee)}`],["Net profit = gain − fee",`${n(gain)} − ${n(fee)} = ${n(ans)}`]],
      tip:"Waiting costs money on a short. The longer the idea takes, the more the borrow fee eats."}}}
});
})();
