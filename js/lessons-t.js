/* Technical Questions levels 5-10 (t:4 to t:9) lessons (same card format as lessons.js). */
(function(){
  "use strict";
  window.MA_LESSONS = window.MA_LESSONS || {};
  Object.assign(window.MA_LESSONS, {
    "t:4": [
      { h: "Same order, every time",
        b: "<p>Interviewers love a curveball: a write-down, a prepayment, an accrued expense. The method never changes. Walk through the three statements in this order:</p><ul><li><b>Income statement:</b> does net income change? Remember taxes.</li><li><b>Cash flow statement:</b> start from net income, add back anything <b>non-cash</b>, adjust for working capital, then investing and financing.</li><li><b>Balance sheet:</b> assets change, liabilities change, equity (retained earnings) changes. End with \"and it balances.\"</li></ul>" },
      { h: "Worked example: a $10 inventory write-down",
        ex: "Inventory write-down of <b>$10</b>, tax rate <b>30%</b><br><b>Income statement:</b> pre-tax income −10, taxes −3, <b>net income −7</b><br><b>Cash flow:</b> net income −7, add back the non-cash write-down +10 → <b>cash +3</b><br><b>Balance sheet:</b> inventory −10, cash +3, retained earnings −7 → <b>balanced</b>",
        b: "<p>A write-down is a <b>non-cash</b> charge: no money leaves. The only real cash effect is the <b>tax you save</b> (30% × 10 = 3). The same logic covers goodwill impairments and stock-based compensation.</p>" },
      { h: "Cash that arrives early, expenses that wait",
        b: "<ul><li><b>Deferred revenue:</b> a customer prepays $120 for a year. Cash +120 and a <b>liability</b> +120 (you owe the service). Revenue shows up month by month, not today.</li><li><b>Accrued expense:</b> you record a cost you haven't paid. Net income falls, but a liability rises, so the cash flow statement adds it back.</li><li><b>Accounts receivable:</b> collecting what a customer owes swaps one asset for another: cash up, receivable down, <b>no change to net income</b>. A <i>rise</i> in receivables <b>subtracts</b> from operating cash flow.</li></ul>" },
      { h: "What never touches the income statement",
        b: "<ul><li><b>Buying equipment</b> with cash: cash down, PP&E up. Total assets don't change.</li><li><b>Repaying debt principal:</b> cash down, debt down.</li><li><b>Issuing stock:</b> cash up, equity up.</li><li><b>Dividends:</b> cash down, retained earnings down.</li></ul><p><b>Trap:</b> saying a profitable company can't run out of cash. It can, when customers haven't paid and <b>working capital</b> (receivables, inventory) soaks up the cash.</p>" },
      { h: "Quick check", check: ["A $20 write-down (non-cash) at a 25% tax rate changes cash by:", ["−$20", "+$5", "+$15"], 1, "Taxes fall by 25% × 20 = $5, and the write-down is added back, so cash rises by the tax saved."] }
    ],
    "t:5": [
      { h: "Two prices for the same company",
        b: "<p><b>Equity value</b> is the part owned by shareholders: share price × <b>diluted</b> shares. <b>Enterprise value (EV)</b> is the price of the whole business, no matter who funded it.</p><p>EV = equity value + debt + preferred stock + non-controlling interest − cash. Add what other investors are owed. Subtract cash, because a buyer gets it on day one and it lowers the real cost of the operations.</p>" },
      { h: "Worked example: from share price to EV",
        ex: "Share price <b>$20</b>, <b>100M</b> basic shares, <b>10M</b> options with a <b>$10</b> strike<br>Buyback = (10M × $10) ÷ $20 = <b>5M</b> shares → diluted shares = 100 + 10 − 5 = <b>105M</b><br>Equity value = 105 × $20 = <b>$2,100M</b><br>EV = 2,100 + debt 500 + preferred 50 + non-controlling 30 − cash 200 = <b>$2,480M</b>",
        b: "<p>This share count method is the <b>treasury stock method</b>: in-the-money options add shares, but the cash paid in is assumed to buy back stock at today's price. Options with a strike <b>above</b> the share price are left out.</p>" },
      { h: "Why each piece is in the bridge",
        b: "<ul><li><b>Debt and preferred:</b> investors who get paid before or alongside shareholders.</li><li><b>Non-controlling interest:</b> a parent's EBITDA includes 100% of a partly owned subsidiary, so EV must add the other owners' slice.</li><li><b>Convertibles:</b> if the stock is above the conversion price, count the new shares and <b>don't</b> also count the bond as debt.</li><li><b>Negative EV</b> is possible when cash exceeds equity value plus debt.</li></ul>" },
      { h: "Traps interviewers set",
        b: "<ul><li><b>Match the pair:</b> EV goes with EBITDA, EBIT or revenue. Equity value goes with net income (P/E).</li><li><b>Borrow $100 and hold the cash:</b> debt +100, cash +100, EV unchanged.</li><li><b>Spend cash to buy back stock:</b> equity down, cash down, EV about the same.</li></ul><p><b>Quick math:</b> $50 share price × 20M shares = $1,000M. Net debt = 300 − 100 = 200. EV = $1,200M.</p>" },
      { h: "Quick check", check: ["Equity value is $800M, debt is $300M, cash is $100M. Enterprise value is:", ["$1,000M", "$600M", "$1,200M"], 0, "800 + 300 − 100 = $1,000M."] }
    ],
    "t:6": [
      { h: "Making comps fair",
        b: "<p>A comps table only works if every number describes the same thing. Three clean-up steps:</p><ul><li><b>Calendarize:</b> companies have different fiscal year-ends. Blend two fiscal years so each peer covers the same 12 months.</li><li><b>Adjust:</b> remove one-time gains and charges from EBITDA.</li><li><b>Pick LTM or NTM</b> (last or next twelve months) and use the same one for everyone.</li></ul>" },
      { h: "Worked example: calendarizing",
        ex: "A peer's fiscal year ends in <b>June</b>. FY2025 revenue = <b>$100M</b>, FY2026 revenue = <b>$120M</b><br>Calendar 2025 = 6 months of FY2025 + 6 months of FY2026<br>CY2025 = 6/12 × 100 + 6/12 × 120 = 50 + 60 = <b>$110M</b><br>Peer multiples 6x, 8x, 9x, 11x, 20x → <b>median 9x</b> (the average, 10.8x, is pulled up by the 20x)",
        b: "<p>For a <b>March</b> year-end: calendar 2025 = 3/12 of the year ending March 2025 + 9/12 of the next year. With $80M and $100M that is 0.25 × 80 + 0.75 × 100 = <b>$95M</b>.</p>" },
      { h: "Choosing the right multiple",
        b: "<ul><li><b>EV/EBITDA:</b> the default for most companies. It ignores how a company is funded.</li><li><b>EV/Revenue:</b> for fast-growing companies with no profit yet.</li><li><b>EV/EBIT:</b> for asset-heavy businesses where depreciation is a real cost.</li><li><b>P/E and P/B:</b> for banks, where debt is the raw material, so EV and EBITDA don't mean much. <b>P/E = price ÷ earnings per share</b>, so $30 ÷ $2 = 15x.</li></ul>" },
      { h: "Outliers and traps",
        b: "<ul><li>Use the <b>median</b> and a range (25th to 75th percentile), not the average.</li><li>Ask why a peer is an outlier before you keep or drop it. A <b>fast grower</b> deserves a higher multiple, so don't apply it blindly to a slower target.</li><li><b>Match the pair:</b> EV ÷ EBITDA is fine. Equity value ÷ EBITDA mixes an after-lender value with a before-lender metric.</li></ul><p>Quick check: EV $900M ÷ EBITDA $90M = 10x.</p>" },
      { h: "Quick check", check: ["A peer's fiscal year ends in June. FY2025 revenue is $200M and FY2026 is $240M. Calendar-2025 revenue is:", ["$220M", "$200M", "$240M"], 0, "Half of each year: 0.5 × 200 + 0.5 × 240 = $220M."] }
    ],
    "t:7": [
      { h: "What a buyer actually pays",
        b: "<p>A buyer almost never pays the stock price. It pays a <b>control premium</b> on top of the <b>unaffected</b> price (the price before takeover news leaked).</p><p><b>Premium = (offer − unaffected price) ÷ unaffected price.</b> Precedent multiples include this premium, which is why they usually sit above trading comps.</p>" },
      { h: "Worked example: premium and synergies",
        ex: "Unaffected price <b>$48</b>, offer <b>$60</b> → premium = (60 − 48) ÷ 48 = <b>25%</b><br>Pre-tax cost synergies <b>$20M</b> a year, tax rate 25% → after-tax <b>$15M</b><br>Value at a 10% discount rate (a steady yearly amount) = 15 ÷ 0.10 = <b>$150M</b><br>Target equity value <b>$1,000M</b> → 150 ÷ 1,000 = a <b>15%</b> premium uses up all the synergies",
        b: "<p>That last line is the buyer's limit. Pay a bigger premium than the synergies are worth and the buyer's shareholders hand value to the target's.</p>" },
      { h: "Synergies: real and not so real",
        b: "<ul><li><b>Cost synergies</b> (cutting duplicate jobs, offices, systems) are more reliable because the buyer controls them.</li><li><b>Revenue synergies</b> (cross-selling) depend on customers, so treat them with caution.</li><li><b>Integration costs</b> (severance, systems merging) are one-time costs that reduce the value of the synergies.</li><li><b>Strategic buyers</b> (same industry) can count synergies and often pay more than <b>financial buyers</b> (PE funds).</li></ul>" },
      { h: "Using precedent transactions well",
        b: "<ul><li><b>Deal multiple</b> = enterprise value paid ÷ the target's <b>LTM</b> EBITDA at announcement. Say $720M ÷ $80M = 9x.</li><li><b>Recent and similar:</b> an old deal from a boom market (cheap debt, high prices) may not apply today.</li><li><b>Apply the median</b> multiple to your target's EBITDA to get enterprise value, then bridge to equity value (minus debt, plus cash).</li></ul>" },
      { h: "Quick check", check: ["Unaffected price is $40 and the offer is $50. The premium is:", ["20%", "25%", "10%"], 1, "(50 − 40) ÷ 40 = 25%."] }
    ],
    "t:8": [
      { h: "Interviewers want to hear you think",
        b: "<p>Brain teasers and mental math test two things: can you stay calm, and can you reason in steps? Say your steps out loud. A clean path with a small slip beats a silent right answer.</p><p>Memorize a few anchors and break big numbers into easy pieces (15% = 10% + 5%).</p>" },
      { h: "Worked example: four quick ones",
        ex: "<b>Rule of 72:</b> money growing 8% a year doubles in 72 ÷ 8 = <b>9 years</b><br><b>Stock goes up 20% then down 20%:</b> 50 × 1.2 = 60, then 60 × 0.8 = <b>$48</b> (not back to $50)<br><b>15% of $240</b> = 10% (24) + 5% (12) = <b>$36</b><br><b>Handshakes among 10 people:</b> 10 × 9 ÷ 2 = <b>45</b>",
        b: "<p>Falls hurt more than gains help: down 20% needs <b>+25%</b> to recover (20 ÷ 80). Down 50% needs <b>+100%</b>.</p>" },
      { h: "Returns in your head",
        b: "<ul><li><b>2x in 5 years</b> ≈ 15% a year (the 5th root of 2 is about 1.149).</li><li><b>3x in 3 years</b> ≈ 44%, <b>2x in 3 years</b> ≈ 26%, <b>3x in 5 years</b> ≈ 25%.</li><li><b>Rule of 72</b> works both ways: at 12%, 72 ÷ 12 = 6 years to double.</li></ul>" },
      { h: "Probability and logic classics",
        b: "<ul><li><b>Fair die:</b> expected value is (1+2+3+4+5+6) ÷ 6 = <b>3.5</b>.</li><li><b>Two dice sum to 7:</b> 6 ways out of 36 = <b>1/6</b>.</li><li><b>Bat and ball:</b> total $1.10, the bat costs $1.00 more. The ball is <b>$0.05</b>, not $0.10.</li><li><b>Doubling lily pad:</b> if it covers the lake on day 48, half the lake on day <b>47</b>.</li><li><b>Eight balls, one heavier:</b> weigh 3 vs 3. Two weighings are enough.</li></ul>" },
      { h: "Quick check", check: ["Using the rule of 72, money growing 6% a year doubles in about:", ["6 years", "12 years", "9 years"], 1, "72 ÷ 6 = 12 years."] }
    ],
    "t:9": [
      { h: "How to answer fast",
        b: "<p>A rapid-fire round is 10 or 15 technical questions in a few minutes. Give a one or two sentence answer, then add a number or example if you can. Don't ramble: the interviewer will ask the follow-up they care about.</p><p>This level mixes everything: accounting, enterprise value, comps and precedents, DCF and LBO.</p>" },
      { h: "Worked example: the greatest hits",
        ex: "<b>Depreciation +$20, tax 25%:</b> net income −15, add back 20 → cash <b>+$5</b><br><b>WACC:</b> 60% equity at 10%, 40% debt at 8% before tax (6% after 25% tax) = 0.6 × 10 + 0.4 × 6 = <b>8.4%</b><br><b>Terminal value:</b> FCF $100, growth 3%, WACC 8% → 100 × 1.03 ÷ (0.08 − 0.03) = <b>$2,060</b><br><b>IRR:</b> 2x in 5 years ≈ <b>15%</b>",
        b: "<p>Equity value $500M + debt 200 + preferred 20 − cash 50 = EV of <b>$670M</b>. Precedents at 12x on $80M of EBITDA = $960M of EV, so equity is 960 − 150 debt + 30 cash = <b>$840M</b>.</p>" },
      { h: "Valuation and DCF in a breath",
        b: "<ul><li><b>Precedents sit above trading comps</b> because of the control premium (and sometimes synergies).</li><li><b>Higher WACC means lower DCF value:</b> future cash is worth less today.</li><li>The <b>terminal value</b> is usually the majority of a DCF's value, so growth and WACC choices matter a lot.</li></ul>" },
      { h: "LBO and M&A in a breath",
        b: "<ul><li><b>LBO returns come from three places:</b> EBITDA growth, multiple expansion and debt paydown.</li><li><b>All-stock deal:</b> accretive when the buyer's P/E is higher than the P/E it pays for the target. With a 20x buyer and a 15x target (ignoring premium and synergies), EPS goes up.</li><li><b>Working capital:</b> a rise in receivables subtracts from operating cash flow.</li></ul>" },
      { h: "Quick check", check: ["WACC is 60% × 10% (equity) plus 40% × 6% (after-tax debt). WACC is:", ["8.4%", "8.0%", "9.2%"], 0, "0.6 × 10 + 0.4 × 6 = 6 + 2.4 = 8.4%."] }
    ]
  });
})();
