/* Harder question pools for the Advanced (and part of Intermediate) difficulty.
   window.MA_HARDQ["trackId-levelIndex"] = [[question, [4 options], correctIndex, why], ...]  (same shape as the core bank).
   Every number below was worked out by hand; tests/hardq.test.mjs re-checks the shape. A level with no pool here
   falls back to its core questions, so adding a pool is always safe. */
(function(){
"use strict";
window.MA_HARDQ=Object.assign(window.MA_HARDQ||{},{
 /* Private Equity · IRR & MOIC */
 "pe-2":[
  ["You put in $100 of equity and exit for $300 after 4 years, no interim cash flows. IRR is closest to:",["25%","32%","41%","50%"],1,"3^(1/4) ≈ 1.316, so about 32%."],
  ["A deal returns 2.0x MOIC at a 25% IRR. Roughly how long was the hold?",["2 years","3 years","5 years","7 years"],1,"2^(1/n) = 1.25 gives n ≈ 3.1 years."],
  ["Deal A returns 2.5x in 5 years. Deal B returns 2.0x in 3 years. Which has the higher IRR, and which the higher MOIC?",["A higher IRR, B higher MOIC","B higher IRR, A higher MOIC","A higher on both","B higher on both"],1,"A: 2.5^(1/5) ≈ 20% IRR. B: 2^(1/3) ≈ 26% IRR. A's MOIC (2.5x) is higher than B's (2.0x)."],
  ["At a 20% IRR, money roughly doubles in:",["About 2 years","About 3.5 years","About 5 years","About 7 years"],1,"1.2^n = 2 gives n ≈ 3.8 years. The rule of 72 says 72 ÷ 20 = 3.6."],
  ["A company pays you a $20 dividend in year 2, then you sell your stake for $150 in year 5. Compared with getting the same $170 all at year 5, the IRR is:",["Higher, because cash comes back sooner","Lower, because dividends are taxed","The same, since the total is $170","Impossible to compare"],0,"Same total dollars, but earlier cash raises IRR. MOIC is identical either way."],
  ["Sponsor invests $200 of equity and exits for $500 after 5 years. MOIC and approximate IRR:",["2.5x, about 20%","2.5x, about 25%","3.0x, about 20%","2.0x, about 15%"],0,"500 ÷ 200 = 2.5x. 2.5^(1/5) ≈ 1.20, so about 20%."],
  ["Why can a very high IRR still be a weak result for a fund?",["A short hold can give a huge IRR on a small profit in dollars","IRR ignores the time value of money","IRR can never exceed 100%","IRR only applies to public stocks"],0,"A quick 1.3x flip can show a big IRR but add little MOIC or dollar profit. Funds care about both."]],
 /* Private Equity · The Paper LBO */
 "pe-3":[
  ["Buy at $500 EV (10x $50 EBITDA) with $300 of debt. After 5 years EBITDA is $75, the exit multiple is still 10x, and $100 of debt has been repaid. Ignoring fees, MOIC is:",["2.0x","2.75x","3.75x","1.8x"],1,"Exit EV = 10 × 75 = 750. Debt left = 200, so exit equity = 550. Entry equity = 500 − 300 = 200. 550 ÷ 200 = 2.75x."],
  ["Same deal, but the exit multiple falls to 8x (EBITDA $75, debt $200 at exit). MOIC becomes:",["1.5x","2.0x","2.75x","1.0x"],1,"Exit EV = 8 × 75 = 600. Exit equity = 600 − 200 = 400. 400 ÷ 200 = 2.0x."],
  ["EBITDA and the exit multiple both stay flat. Where does an LBO's return come from?",["Multiple expansion","EBITDA growth","Paying down debt with free cash flow","A dividend recap"],2,"With flat EBITDA and a flat multiple, enterprise value doesn't change. Equity grows only as debt is repaid."],
  ["Holding price and everything else equal, raising leverage from 50% to 70% of the purchase price usually:",["Raises IRR and risk","Lowers IRR and risk","Raises IRR and lowers risk","Changes neither"],0,"Less equity buys the same asset, so returns are magnified both up and down. Higher interest also raises default risk."],
  ["You invest $200 of equity and it is worth $800 after 5 years. IRR is closest to:",["25%","32%","40%","60%"],1,"4x over 5 years: 4^(1/5) ≈ 1.32, so about 32%."],
  ["A deal is priced at 8x EBITDA of $60M and financed with 5x leverage. How big is the equity check?",["$120M","$180M","$300M","$480M"],1,"EV = 8 × 60 = $480M. Debt = 5 × 60 = $300M. Equity = 480 − 300 = $180M."]]
});
})();