/* IB level 9 lesson: Comps & Precedents in Practice (same card format as lessons.js). */
(function(){
  "use strict";
  window.MA_LESSONS = window.MA_LESSONS || {};
  Object.assign(window.MA_LESSONS, {
    "ib:9": [
      { h: "Two ways to ask: what is it worth?",
        b: "<p>Bankers rarely trust one number. They check a company's value from several angles. Two of the most common use <b>comparables</b>:</p><ul><li><b>Trading comps:</b> what similar <i>public</i> companies are worth on the stock market <i>today</i>.</li><li><b>Precedent transactions</b> (\"precedents\"): what buyers actually <i>paid</i> to take over similar companies in the past.</li></ul><p>Both turn a price into a <b>multiple</b> (price ÷ a metric like EBITDA), then apply that multiple to the target's own metric. Same idea as comparing houses: find similar ones, see the price per square foot, apply it to yours.</p>" },
      { h: "Worked example: from peers to a price",
        ex: "Peer EV/EBITDA multiples: <b>8x, 10x, 12x</b> → sorted, the middle one (the <b>median</b>) is <b>10x</b><br>Target EBITDA = <b>$50M</b> → enterprise value = 10 × 50 = <b>$500M</b><br>Target has <b>$100M</b> of debt and <b>$20M</b> of cash<br>Equity value = 500 − 100 + 20 = <b>$420M</b>",
        b: "<p>Why the median? One odd peer (say 45x because its profit crashed) would drag an average way up. The median ignores extremes. Why subtract debt and add cash? Lenders are paid before owners, and the company's cash belongs to the owners.</p>" },
      { h: "Precedents and the control premium",
        b: "<p>When a buyer takes over a company, it gets <b>control</b>: it decides strategy, the board and the cash. It pays extra for that, called the <b>control premium</b> (often 20% to 40% over the stock price). So precedent multiples usually come out <b>higher</b> than trading multiples.</p><ul><li><b>Recent deals count more.</b> Old deals were struck in different markets.</li><li><b>Similar deals count more:</b> same industry, similar size, similar growth.</li><li>Deals include <b>synergies</b> (savings from combining), which the buyer may pay for.</li></ul>" },
      { h: "Rules that keep you out of trouble",
        b: "<ul><li><b>Match the pair:</b> EV goes with EBITDA or revenue (before lenders are paid). Equity value goes with net income (P/E).</li><li><b>Same time basis:</b> LTM (last twelve months) with LTM, NTM (next twelve) with NTM. Companies with different fiscal years get <b>calendarized</b> to the same year-end.</li><li><b>Use a range</b> (25th to 75th percentile), not one point. A <b>football field</b> chart lines up the ranges from each method.</li></ul><p><b>Trap:</b> multiplying an EV multiple by net income. Always say which metric goes with which value.</p>" },
      { h: "Quick check", check: ["Three peers trade at 6x, 9x and 30x EV/EBITDA. The median is:", ["9x", "15x", "6x"], 0, "Sorted, the middle one is 9x. The average (15x) is pulled up by the 30x outlier."] }
    ]
  });
})();
