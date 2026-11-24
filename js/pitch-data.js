/* Pitch Room data: fictional companies, fresh numbers, a thesis bank that mixes strong and weak points, and a grilling bank.
   Pure on purpose so tests/pitch.test.mjs can check the math and the content shape.
   Every company here is made up. Numbers are clean so the math works in your head. */
(function(){
"use strict";
const r={i:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),p:a=>a[Math.floor(Math.random()*a.length)]};
const rd=(x,d=2)=>{const m=Math.pow(10,d);return Math.round(x*m)/m};
const n=x=>rd(x).toLocaleString("en-US",{maximumFractionDigits:2});
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

/* each sector: 3 strong thesis points, 3 weak ones (with why), a variant view and a catalyst (1 strong, 2 weak) */
const SECTORS={
 software:{label:"Software",names:["Redwood Systems","Cobalt Cloud","Lumen Data","Nimbus Ledger"],
  blurb:"sells subscription software to mid-size firms. Growth dipped after a one-time price change and the stock de-rated below peers.",
  good:[["Churn spiked on the price change and is already normalizing","Specific and checkable, and it explains why the stock is cheap."],
        ["A new premium tier grows 40% but sits inside a segment nobody breaks out","A hidden growth driver the market is not modeling."],
        ["Sales spend is being cut, so margins expand while consensus assumes flat","Estimates go up without needing revenue to beat."]],
  bad:[["It is a great company with loyal customers","Everyone already agrees. If it is that obvious, it is priced in."],
       ["Software is a growing industry","True of every peer. No edge, nothing specific to this stock."],
       ["The CEO went to a top school","Not evidence about the business."]],
  variant:[["Consensus models churn staying high. I think it fades to normal in two quarters, which lifts estimates.","Specific, different from consensus, and you can be proven right or wrong."],
           ["Consensus is too negative on the whole software sector.","Too broad. It is a market call, not a view on this company."],
           ["The market is wrong because the stock is down.","Price alone is not a reason."]],
  catalyst:[["Next earnings in about 6 weeks is the first print with churn back to normal.","A dated event that forces the market to look."],
            ["Software spending keeps rising over time.","No date, no trigger."],
            ["Eventually people will notice how cheap it is.","Hope is not a catalyst."]]},
 freight:{label:"Freight & logistics",names:["Summit Freight","Harborline Logistics","Ironbridge Haulage","Cascade Carriers"],
  blurb:"runs regional trucking and warehousing. A weak shipping market pushed earnings down and the stock below peers.",
  good:[["Contract rates reset higher in the next renewal cycle while costs are already cut","A mechanical earnings lift you can date."],
        ["The company is closing its two worst terminals, which drag margins","Cost action that management controls."],
        ["Warehousing is a third of profit but is valued like trucking","Mix shift the market has not priced."]],
  bad:[["Trucking is essential to the economy","True of every carrier. Not a reason this stock moves."],
       ["The stock has fallen for a year, so it must bounce","Price history is not a thesis."],
       ["Management seems really confident on the call","Tone is not numbers."]],
  variant:[["Consensus assumes rates stay flat. The renewal cycle resets them higher, which lifts next year's earnings.","Specific, different from consensus, and testable."],
           ["Everyone is too gloomy about the economy.","A macro opinion, not a company view."],
           ["It is cheap versus its own history.","Cheap can stay cheap without a reason to change."]],
  catalyst:[["Rate renewals land in the next two quarters and show up in the earnings report.","A dated event with a visible number."],
            ["The economy will recover at some point.","No timing."],
            ["Interest rates might come down.","Uncertain, and not specific to this company."]]},
 consumer:{label:"Consumer brand",names:["Ironclad Footwear","Pinecrest Foods","Brightwave Beverages","Lakeshore Apparel"],
  blurb:"owns a mid-size consumer brand sold through big retailers. A weak quarter and a retailer inventory cut hit the stock.",
  good:[["The inventory cut was a one-time retailer reset, so sell-through is healthier than sales show","Separates a timing issue from real demand."],
        ["Direct-to-consumer is 15% of sales at double the margin and growing fast","A mix shift that lifts margins."],
        ["Input costs fell last year and the benefit has not reached the income statement","Earnings upside with a clear mechanism."]],
  bad:[["Everybody knows and loves the brand","Fully priced in. Popular is not the same as undervalued."],
       ["Consumers will always need to eat, wear and drink","Defensive, but says nothing about upside."],
       ["The logo looks great","Not a financial argument."]],
  variant:[["Consensus extrapolates the weak quarter. Sell-through says demand is fine, so the next quarter rebounds.","Specific, different from consensus, and you can track it."],
           ["Consumers are about to spend more.","Macro guess, nothing specific."],
           ["The brand is too strong to fail.","Sentiment, not analysis."]],
  catalyst:[["Retailer restocking shows up in next quarter's shipments, reported in about 8 weeks.","A dated, measurable event."],
            ["A new ad campaign might help.","Maybe, and unmeasurable."],
            ["The holiday season is coming.","Everyone knows. Already in the numbers."]]},
 health:{label:"Healthcare services",names:["Meridian Care","Oakfield Clinics","Bluepoint Diagnostics","Harbor Health Partners"],
  blurb:"runs outpatient clinics. A reimbursement scare and one weak quarter pushed the stock below peers.",
  good:[["The reimbursement cut was proposed, not final, and the company's mix limits the hit to about 2% of revenue","Sizes the risk with a number instead of fear."],
        ["Same-clinic volume is accelerating while the stock is priced for a slowdown","Operating data the market is slow to credit."],
        ["Three new clinics reach breakeven this year, adding profit without new spending","A visible, dated driver."]],
  bad:[["Healthcare demand only goes up as people age","Every peer gets the same tailwind."],
       ["Management has a medical background","Does not tell you about returns."],
       ["The valuation looks low","Low is not a reason. Why will it change?"]],
  variant:[["Consensus prices in the full reimbursement cut. The final rule is likely softer, which removes the fear discount.","Specific, different from consensus, and decided by a dated ruling."],
           ["The market overreacts to all healthcare news.","Too general to trade on."],
           ["Healthcare stocks always bounce back.","A pattern, not an argument."]],
  catalyst:[["The final reimbursement rule is due next quarter. A softer outcome re-rates the stock.","Dated, binary, and it hits the exact fear."],
            ["Population aging continues.","No trigger."],
            ["Another analyst might upgrade it.","Not in your control and not a fundamental event."]]}
};

const SECTIONS=[["Recommendation",20,"Lead with the number: long, target, upside."],["Thesis",45,"Your 2 to 3 strongest points."],["Variant view",30,"Where you disagree with consensus, and why."],["Catalysts",25,"What forces the market to see it, and when."],["Valuation",35,"Target multiple, earnings, upside vs. downside."],["Risks",25,"What breaks it, and what limits the damage."]];

function gen(){
  const key=r.p(Object.keys(SECTORS)),S=SECTORS[key];
  const E=r.p([2,2.5,3,4,5]),m0=r.p([12,14,15,16]),gap=r.p([3,4,5,6]),peer=m0+gap,bm=m0-r.p([2,3]);
  const P=m0*E,T=peer*E,bearP=bm*E,up=(T-P)/P*100,down=(P-bearP)/P*100;
  return{key,sector:S.label,co:r.p(S.names),blurb:S.blurb,E,m0,peer,bm,P,T,bearP,up,down,rr:up/down}}

/* the five questions from the room: 2 numbers on this exact case, 3 judgment questions */
const QUAL=[
 ["Why hasn't the market figured this out already?",["Name the specific thing consensus misses (your variant view).","Say why it is missed: neglected, complicated, or a recent change.","Tie it to the catalyst so the answer has a date."],"\"Consensus is anchored on the weak quarter. The data it is ignoring is X. It gets noticed at the next report, so the gap closes then.\""],
 ["What would make you wrong, and when do you sell?",["Name one or two specific thesis-breakers, not just \"the market falls\".","Give a level or data point that triggers the exit.","Say how you size it so being wrong is survivable."],"\"If the datapoint I'm watching does not turn by next quarter, or the stock hits my bear case, I cut it. Position is sized so the bear case costs us under 1% of the fund.\""],
 ["Why now?",["One dated catalyst.","What the market learns when it happens.","How estimates or the multiple change after."],"\"The report in six weeks is the first test. If it confirms, estimates move up and the multiple has a reason to close the gap.\""],
 ["How big would you make this position?",["Tie size to conviction and to the downside number.","Mention liquidity and overlap with what the fund already owns.","Say how you would add or trim as the thesis plays out."],"\"Starter size, then add on confirmation. The bear case is the loss number, so I size so that is tolerable.\""],
 ["Who is on the other side of this trade?",["Name the sellers or holders and why they sell (forced selling, boredom, anchoring).","Say why their reason does not hold up.","Admit what they might know that you do not."],"\"Holders are selling the last quarter's headline. Their model is anchored on it. What they may see that I do not is X, which is why that is my main risk.\""],
 ["Defend the target multiple. Why should it re-rate?",["Compare to peers and say why the gap should close.","Give the reason: growth, margins, mix or lower risk.","Mention a past precedent or the stock's own history."],"\"Peers trade at the target multiple with similar growth. The discount came from the one-time issue, which is going away.\""]];
const ASKERS=["Portfolio manager","Risk manager","Sector analyst","Skeptic in the back","Junior analyst","Senior partner"];

function questions(c){
  const bear={type:"num",asker:r.p(ASKERS),q:`Bear case: the multiple falls to ${c.bm}x on the same EPS. What is the stock worth?`,ans:c.bearP,unit:"$",tol:Math.max(0.1,c.bearP*0.01),
    steps:[["Same EPS, lower multiple",`${n(c.E)} × ${c.bm} = ${n(c.bearP)}`],["That is a loss of",`(${n(c.P)} − ${n(c.bearP)}) ÷ ${n(c.P)} = ${n(c.down)}%`]],tip:"Always know the bear-case number before you say the upside."};
  const rr={type:"num",asker:r.p(ASKERS),q:"What is your upside-to-downside ratio, target upside divided by bear-case loss?",ans:c.rr,unit:"x",tol:0.1,
    steps:[["Upside",`${n(c.up)}%`],["Downside",`${n(c.down)}%`],["Ratio",`${n(c.up)} ÷ ${n(c.down)} = ${n(c.rr)}x`]],tip:"Funds like 2x or better. Below 1.5x you are being paid too little for the risk."};
  const miss={type:"num",asker:r.p(ASKERS),q:`EPS comes in 20% below your estimate and the multiple stays at today's ${c.m0}x. What is the price?`,ans:c.m0*c.E*0.8,unit:"$",tol:Math.max(0.1,c.m0*c.E*0.008),
    steps:[["New EPS",`${n(c.E)} × 0.8 = ${n(c.E*0.8)}`],["Same multiple",`${n(c.E*0.8)} × ${c.m0} = ${n(c.m0*c.E*0.8)}`]],tip:"An earnings miss hits twice when the multiple also falls. Say that out loud."};
  const nums=shuffle([bear,rr,miss]).slice(0,2);
  const quals=shuffle(QUAL).slice(0,3).map(q=>({type:"qual",asker:r.p(ASKERS),q:q[0],points:q[1],model:q[2]}));
  return shuffle(nums.concat(quals))}

window.MA_PITCH={SECTORS,SECTIONS,QUAL,gen,questions,shuffle,n};
})();
