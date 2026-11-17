/* More questions (flashcards use them automatically) and 12 more graded models */
(function(){
"use strict";
const ADD={
"f-0":[
["Which expense is added back in cash flow from operations because no cash leaves the company?",["Rent","Depreciation","Salaries","Interest on a bank loan"],1,"Depreciation reduces net income but no cash goes out, so it is added back."],
["A company buys $50 of equipment with cash. What happens to total assets?",["Up $50","Down $50","No change","Up $100"],2,"PP&E goes up $50 and cash goes down $50, so total assets are unchanged."],
["Where does a dividend payment show up on the cash flow statement?",["Operations","Investing","Financing","It does not"],2,"Dividends are a cash return to shareholders, so they sit in financing."],
["Accounts receivable rises by $20. Effect on cash from operations?",["+$20","−$20","No effect","+$40"],1,"Revenue was recorded but the cash has not been collected yet, so operating cash falls $20."],
["Accounts payable rises by $15. Effect on cash from operations?",["−$15","+$15","No effect","−$30"],1,"You kept $15 of cash you would otherwise have paid out."],
["Retained earnings roll forward as beginning balance plus:",["Net income minus dividends","Net income plus dividends","Revenue minus dividends","EBITDA minus capex"],0,"Retained earnings grow with profit and shrink with dividends."],
["Ending cash from the cash flow statement feeds which line?",["Balance sheet cash","Income statement revenue","Retained earnings","Goodwill"],0,"The cash flow statement ties the income statement to the balance sheet through cash."],
["A company writes down inventory by $10. Tax rate 25%. Net income changes by:",["−$10","−$7.50","−$2.50","+$2.50"],1,"Pre-tax income falls $10, tax falls $2.50, so net income falls $7.50."],
["Stock-based compensation on the cash flow statement is:",["Added back as non-cash","Subtracted","A financing outflow","An investing inflow"],0,"It is an expense with no cash payment, so it is added back in operations."],
["Which is NOT part of working capital?",["Inventory","Accounts payable","Long-term debt","Accounts receivable"],2,"Working capital covers current operating assets and liabilities. Long-term debt is financing."],
["Issuing $100 of new debt changes which cash flow section?",["Financing, +$100","Operations, +$100","Investing, +$100","None"],0,"Raising debt is a financing inflow."],
["Goodwill is created when:",["The buyer pays more than the fair value of net identifiable assets","A company beats its forecast","A company issues stock","Assets are depreciated"],0,"Goodwill is the purchase price above the fair value of identifiable net assets."]],
"f-1":[
["Depreciation rises $10 and the tax rate is 25%. Cash changes by:",["−$10","+$2.50","−$7.50","+$10"],1,"Net income falls $7.50, you add back $10, so cash is up $2.50 from the tax shield."],
["A company repays $30 of debt with cash. Total assets change by:",["−$30","+$30","0","−$60"],0,"Cash falls $30 and debt falls $30, so assets fall $30."],
["A company issues $40 of stock and keeps the cash. Total assets change by:",["+$40","0","−$40","+$80"],0,"Cash rises $40 and equity rises $40."],
["A company records $100 of revenue on credit with no costs. Day-one change in cash is:",["+$100","+$80","$0","−$20"],2,"Receivables go up, not cash, until the customer pays."],
["A $12 prepaid expense is paid in cash. Effect on net income today?",["−$12","None right away","+$12","−$6"],1,"Prepaids are assets first and become expense as they are used."],
["Deferred revenue rises $50 because customers paid upfront. Cash from operations:",["+$50","−$50","0","+$25"],0,"Cash came in before the revenue was earned."],
["A $20 inventory purchase is paid in cash. Total assets change by:",["−$20","+$20","0","−$40"],2,"Inventory goes up $20 and cash goes down $20."],
["Interest expense rises $8 and the tax rate is 25%. Net income changes by:",["−$8","−$6","−$2","+$2"],1,"Pre-tax income falls $8, tax falls $2, net income falls $6."]],
"f-2":[
["Which adjustments take equity value to enterprise value?",["Add debt, subtract cash","Subtract debt, add cash","Add both","Subtract both"],0,"EV is equity value plus debt (and preferred, minority interest) minus cash."],
["Share price $20 and 50 diluted shares. Equity value?",["$1,000","$70","$2,500","$400"],0,"20 × 50 = $1,000."],
["Equity value $1,000, debt $300, cash $100, preferred $50. Enterprise value?",["$1,150","$1,250","$1,350","$1,450"],1,"1,000 + 300 + 50 − 100 = 1,250."],
["Why subtract cash when computing EV?",["An acquirer effectively gets the cash back","Cash is not an asset","Cash is a liability","It lowers the multiple"],0,"Cash can repay debt, so it reduces the real price of the operating business."],
["Which multiple pairs with equity value?",["P/E","EV/EBITDA","EV/Revenue","EV/EBIT"],0,"P/E uses equity value (price) over earnings to shareholders. EV multiples use pre-debt metrics."],
["A company has 100 shares and 10 options with an $8 strike. Share price $20. Diluted shares under the treasury method:",["110","106","104","100"],1,"Proceeds of $80 buy back 4 shares, so 10 − 4 = 6 net new shares."],
["Why add noncontrolling interest to EV?",["EBITDA includes 100% of the subsidiary but equity value only the parent's share","It is debt","It is cash","It lowers taxes"],0,"Keeping numerator and denominator consistent requires adding the minority share."],
["Which is usually left out of net debt?",["Accounts payable","Revolver balance","Term loan","Senior notes"],0,"Accounts payable is an operating liability. Borrowings are debt."],
["EV/EBITDA is useful for comparing companies with different:",["Capital structures","Industries entirely","Share counts only","Logos"],0,"EV and EBITDA are both before the effect of debt, so leverage differences wash out."],
["Equity value $800, net debt $200, EBITDA $100. EV/EBITDA?",["8.0x","10.0x","12.0x","9.0x"],1,"EV is 1,000, so 1,000 ÷ 100 = 10.0x."]],
"f-3":[
["Which method values a company on its own projected cash flows?",["DCF","Comparable companies","Precedent transactions","52-week range"],0,"A DCF discounts the company's own forecast cash flows."],
["Which method usually shows the highest value because it can include a control premium?",["Precedent transactions","Trading comps","52-week low","Liquidation value"],0,"Buyers in past deals paid a premium for control."],
["A higher discount rate does what to DCF value?",["Lowers it","Raises it","No effect","Doubles it"],0,"Future cash flows are worth less when discounted more."],
["Terminal growth should generally not exceed:",["Long-run economic growth","Year 1 revenue growth","WACC plus 3%","10%"],0,"No company can outgrow the economy forever."],
["Final-year FCF $100, growth 2%, WACC 10%. Terminal value (perpetuity growth)?",["$1,000","$1,275","$1,020","$1,250"],1,"100 × 1.02 ÷ (10% − 2%) = 1,275."],
["In the exit multiple method, terminal value is final-year EBITDA times:",["A multiple","WACC","The tax rate","The growth rate"],0,"You assume the business sells at a multiple of EBITDA."],
["For debt, WACC uses:",["After-tax cost of debt","Pre-tax cost only","Dividend yield","Book value of equity"],0,"Interest is tax deductible, so the cost to the company is lower."],
["Higher beta implies:",["Higher cost of equity","Lower cost of equity","Lower risk","No change in CAPM"],0,"CAPM adds beta times the equity risk premium."],
["A football field chart shows:",["Valuation ranges from several methods","Stock price history only","The org chart","The cap table"],0,"Each bar is a method's low-to-high value range."],
["Which is the better trading comp?",["Same industry, similar size, growth and margins","Same stock exchange","Same CEO first name","Same year founded"],0,"Comps should have similar business drivers and risk."]],
"f-4":[
["An all-stock deal is accretive when the acquirer's P/E is:",["Higher than the target's P/E (at the offer price)","Lower than the target's","Always equal","Irrelevant"],0,"You are paying with a richer currency than what you are buying."],
["Which financing is usually cheapest after tax?",["Debt","Stock","Preferred","They cost the same"],0,"Interest is tax deductible and debt has lower required returns."],
["Synergies in accretion analysis usually change:",["Pro forma net income","Only the share count","Only the share price","Nothing"],0,"Cost or revenue synergies raise combined earnings."],
["Acquirer net income $400 on 100 shares. Target net income $50. 10 new shares issued. Pro forma EPS?",["$4.09","$4.50","$4.00","$3.64"],0,"450 ÷ 110 = 4.09."],
["Using cash for a deal lowers pro forma net income through:",["Lost interest income, after tax","Higher revenue","Lower taxes only","Extra shares"],0,"The cash no longer earns interest."],
["Breakeven synergies are the synergies needed to make the deal:",["EPS-neutral","Tax free","Debt free","Maximum profit"],0,"They offset dilution exactly."],
["Under US GAAP, goodwill for a public company is:",["Tested for impairment, not amortized","Amortized over 5 years","Amortized over 40 years","Expensed immediately"],0,"Impairment testing replaces regular amortization."],
["New debt of $200 at 6% interest and a 25% tax rate. After-tax interest cost?",["$12","$9","$3","$6"],1,"Interest 12, less 3 of tax savings, is 9."]],
"pe-1":[
["Which is NOT a main LBO return driver?",["EBITDA growth","Multiple expansion","Debt paydown","Higher book value of goodwill"],3,"Returns come from growth, multiple and paying down debt."],
["Why does leverage raise sponsor IRR?",["Less equity is needed for the same asset","Debt is free","Banks guarantee returns","It lowers EBITDA"],0,"The same gain is earned on a smaller equity check."],
["Which debt is repaid first and is usually cheapest?",["Senior secured","Mezzanine","Preferred","Common equity"],0,"It has the most protection, so it costs the least."],
["A cash sweep means:",["Excess cash repays debt","Cash goes to dividends","Cash buys stock","Cash is held back"],0,"Free cash flow after required payments pays down debt."],
["Uses in a sources and uses table typically include:",["Purchase of equity, refinanced debt, fees","Revenue","Taxes only","Sponsor dividends"],0,"Uses are where the money goes."],
["Which is a good LBO candidate?",["Stable cash flows, low capex, strong assets","Early stage with big losses","Very high capex","No assets"],0,"Steady cash flow services debt."],
["PIK interest:",["Accrues to principal instead of being paid in cash","Is paid daily","Is equity","Is tax free by definition"],0,"It preserves cash but grows the debt balance."],
["Entry EBITDA $50, 8x purchase, 5x leverage. Debt?",["$200","$250","$300","$400"],1,"5 × 50 = 250."],
["Purchase EV $400 and debt $250 with no fees. Sponsor equity?",["$150","$250","$400","$100"],0,"400 − 250 = 150."],
["Management rollover means:",["Executives reinvest part of their proceeds in the new company","Executives are replaced","Debt is refinanced","Fees are deferred"],0,"It aligns management with the sponsor."]],
"pe-2":[
["Invest $100 and receive $200 after 4 years. MOIC?",["1.5x","2.0x","4.0x","0.5x"],1,"200 ÷ 100 = 2.0x."],
["Same deal (2.0x over 4 years). IRR is about:",["12%","19%","25%","50%"],1,"2^(1/4) − 1 ≈ 18.9%."],
["2.0x in 3 years is an IRR of about:",["26%","33%","20%","15%"],0,"2^(1/3) − 1 ≈ 26%."],
["Holding MOIC constant, a longer hold makes IRR:",["Lower","Higher","The same","Double"],0,"The same gain is spread over more years."],
["3.0x in 5 years is an IRR of about:",["25%","30%","20%","15%"],0,"3^(1/5) − 1 ≈ 24.6%."],
["Using the rule of 72, 12% returns double in about:",["6 years","12 years","3 years","9 years"],0,"72 ÷ 12 = 6."],
["IRR can look better than MOIC suggests when:",["Cash comes back early","The hold is very long","There are no returns","There is no debt"],0,"Early cash raises IRR but not the multiple."],
["A dividend recap usually:",["Raises IRR by returning cash early","Lowers IRR","Leaves IRR unchanged","Cancels the debt"],0,"Cash back early boosts IRR."]],
"pe-3":[
["Entry EBITDA $100, 10x, 6x leverage, no fees. Equity check?",["$300","$400","$500","$600"],1,"EV 1,000 − debt 600 = 400."],
["EBITDA grows to $150, exit at 10x, debt is down to $300. Exit equity?",["$1,200","$1,500","$1,000","$900"],0,"1,500 − 300 = 1,200."],
["Equity goes from $400 to $1,200. MOIC?",["2.0x","3.0x","4.0x","1.2x"],1,"1,200 ÷ 400 = 3.0x."],
["Same deal over 5 years: IRR about?",["25%","30%","15%","40%"],0,"3^(1/5) − 1 ≈ 24.6%."],
["Debt $600 plus equity $400 gives total sources of:",["$1,000","$600","$400","$1,400"],0,"Sources must equal uses."],
["Interest on $600 of debt at 8%:",["$48","$80","$60","$8"],0,"600 × 8% = 48."],
["$60 of free cash flow sweeps debt. Ending debt from $600?",["$540","$660","$600","$60"],0,"600 − 60 = 540."],
["Exit multiple falls to 8x on $150 EBITDA, debt $300. Exit equity?",["$900","$1,200","$600","$1,500"],0,"8 × 150 = 1,200 EV, minus 300 = 900."]],
"pm-1":[
["Long/short equity funds:",["Buy undervalued stocks and short overvalued ones","Only buy bonds","Only short stocks","Only trade FX"],0,"They hold both long and short positions."],
["Merger arbitrage usually:",["Buys the target and may short the acquirer in stock deals","Buys only the acquirer","Trades commodities","Avoids deals"],0,"It earns the spread between the market price and the deal price."],
["Global macro funds bet on:",["Economy-wide trends such as rates and currencies","One company's story","Private companies","IPO allocations"],0,"They trade big-picture themes."],
["In a 2 and 20 fund, the 20 is:",["A performance fee on profits","A management fee on assets","A redemption fee","A tax"],0,"2% of assets, 20% of profits."],
["A high-water mark means:",["Performance fees are only charged on gains above the prior peak","Fees every year","No management fee","A leverage cap"],0,"Investors do not pay twice for the same recovery."]],
"pm-3":[
["A stock with beta 1.5 tends to move:",["1.5x the market","0.5x the market","Opposite the market","With the market equally"],0,"Beta measures sensitivity to the market."],
["Diversification mainly reduces:",["Company-specific risk","Market risk","Inflation","Taxes"],0,"Market risk cannot be diversified away."],
["Sharpe ratio is excess return divided by:",["Standard deviation","Beta","Alpha","Duration"],0,"It is return per unit of volatility."],
["A stock is 10% of a portfolio and falls 30%. Portfolio impact?",["−3%","−30%","−10%","−0.3%"],0,"10% × 30% = 3%."],
["A stop-loss order:",["Sells when the price hits a set level","Guarantees no loss","Buys dips","Adds leverage"],0,"It triggers a sale at a chosen price, but fills can gap past it."]],
"ib-3":[
["Which is better for comparing companies with different debt levels?",["EV/EBITDA","P/E","Net income","EPS"],0,"EV multiples ignore capital structure."],
["A company has negative EBITDA. Which multiple is more usable?",["EV/Revenue","EV/EBITDA","P/E","EV/EBIT"],0,"Revenue is positive when profit metrics are not."],
["In a DCF, which cash flow is discounted at WACC?",["Unlevered free cash flow","Levered free cash flow","Net income","Dividends"],0,"WACC reflects all capital providers, so use cash flow available to all of them."],
["EBIT $100, tax 25%, D&A $20, capex $30, change in NWC $5. Unlevered FCF?",["$60","$75","$65","$70"],0,"75 + 20 − 30 − 5 = 60."],
["Raising WACC lowers enterprise value because:",["Future cash flows are discounted more","Revenue falls","Taxes rise","Debt disappears"],0,"A higher discount rate shrinks present value."],
["Past M&A deals used for valuation are called:",["Precedent transactions","Trading comps","DCF","LBO"],0,"They show what buyers actually paid."],
["Pre-money value $80 and an investment of $20. Post-money?",["$100","$60","$80","$120"],0,"Post-money = pre-money + new money."],
["Beta from a regression measures:",["Sensitivity to the market","Debt level","Growth","Margin"],0,"It is the slope of stock returns against market returns."],
["Revenue $1,000 and 36.5 receivable days. Accounts receivable?",["$100","$365","$36.50","$10"],0,"1,000 × 36.5 ÷ 365 = 100."],
["EBIT $120, interest $20, tax 25%. Net income?",["$75","$90","$100","$120"],0,"Pre-tax 100, tax 25, net income 75."]]
};
try{
 for(const tr of TRACKS)tr.levels.forEach((L,i)=>{const m=ADD[tr.id+"-"+i];if(!m)return;const have=new Set(L.q.map(q=>q[0]));m.forEach(q=>{if(!have.has(q[0])){L.q.push(q);have.add(q[0]);try{if(!QIDX.has(q[0]))QIDX.set(q[0],{tr,i,q})}catch(e){}}})});
}catch(e){console.error(e)}
const NEWC=[{"id": "c41", "t": "Simple revenue build", "d": "Year 1: 2,000 units at $25. Year 2: units grow 15% and price rises to $26.", "pro": true, "cells": [["Year 1 revenue", 50000, "2,000 × 25", 1], ["Year 2 units", 2300, "2,000 × 1.15", 1], ["Year 2 revenue", 59800, "2,300 × 26", 1], ["Revenue growth (%)", 19.6, "59,800 ÷ 50,000 − 1", 0.2]]}, {"id": "c42", "t": "LTM calculation", "d": "Fiscal-year revenue was $400. Nine months of last year were $290. Nine months of this year are $330.", "pro": true, "cells": [["Last year's Q4", 110, "400 − 290", 1], ["LTM revenue", 440, "Prior Q4 + current YTD", 1]]}, {"id": "c43", "t": "Calendarization", "d": "A company has a June year-end. FY ending June revenue is $600 and next FY is $720. Calendarize to December.", "pro": true, "cells": [["Calendar-year revenue", 660, "50% × 600 + 50% × 720", 1]]}, {"id": "c44", "t": "P/E to price", "d": "Net income $160, 50 diluted shares, peer P/E 15x.", "pro": true, "cells": [["EPS", 3.2, "160 ÷ 50", 0.02], ["Implied share price", 48, "3.20 × 15", 0.1], ["Implied equity value", 2400, "160 × 15", 1]]}, {"id": "c45", "t": "PEG ratio", "d": "P/E is 24x and expected earnings growth is 12% a year.", "pro": true, "cells": [["PEG ratio", 2, "24 ÷ 12", 0.02]]}, {"id": "c46", "t": "Sustainable growth", "d": "Net income $200, dividends $60, shareholders' equity $1,000.", "pro": true, "cells": [["Payout ratio (%)", 30, "60 ÷ 200", 0.2], ["Retention ratio (%)", 70, "1 − 30%", 0.2], ["ROE (%)", 20, "200 ÷ 1,000", 0.2], ["Sustainable growth (%)", 14, "20% × 70%", 0.2]]}, {"id": "c47", "t": "Interest tax shield", "d": "Debt $500 at 6% interest. Tax rate 25%.", "pro": true, "cells": [["Interest expense", 30, "500 × 6%", 0.1], ["Tax shield", 7.5, "30 × 25%", 0.02], ["After-tax cost of the interest", 22.5, "30 − 7.5", 0.1]]}, {"id": "c48", "t": "Debt capacity", "d": "EBITDA $80. Lenders allow up to 4.5x. Interest rate 7%.", "pro": true, "cells": [["Maximum debt", 360, "80 × 4.5", 1], ["Interest expense", 25.2, "360 × 7%", 0.1], ["EBITDA / interest (x)", 3.17, "80 ÷ 25.2", 0.05]]}, {"id": "c49", "t": "Sources and uses with fees", "d": "Buy equity for $700, refinance $200 of debt, pay $30 of fees. New debt raised is $500.", "pro": true, "cells": [["Total uses", 930, "700 + 200 + 30", 1], ["Sponsor equity", 430, "930 − 500", 1]]}, {"id": "c50", "t": "IRR with an interim dividend", "d": "Invest $100 now, receive a $20 dividend at the end of year 1 and sell for $150 at the end of year 2.", "pro": true, "cells": [["Total cash returned", 170, "20 + 150", 1], ["MOIC (x)", 1.7, "170 ÷ 100", 0.02], ["IRR (%)", 32.88, "Solve: −100 + 20/(1+r) + 150/(1+r)²= 0", 0.3]]}, {"id": "c51", "t": "Customer LTV and CAC", "d": "Monthly revenue per customer $50, gross margin 80%, monthly churn 5%, CAC $200.", "pro": true, "cells": [["Expected lifetime (months)", 20, "1 ÷ 5%", 0.1], ["Lifetime gross profit (LTV)", 800, "50 × 80% × 20", 1], ["LTV / CAC (x)", 4, "800 ÷ 200", 0.02]]}, {"id": "c52", "t": "Rule of 40", "d": "A software company grows revenue 30% with a 15% free cash flow margin.", "pro": true, "cells": [["Rule of 40 score", 45, "30 + 15", 0.1], ["Margin needed at 10% growth to hit 40", 30, "40 − 10", 0.1]]}];
try{NEWC.forEach(c=>{if(!CHAL.some(x=>x.id===c.id))CHAL.push(c)})}catch(e){console.error(e)}
try{renderWeakCard()}catch(e){}
})();
