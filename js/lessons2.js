/* More lessons (Nov 21, 2026: "teach these people things before asking questions").
   Adds lessons to every level that had none: IB 5-6, PE 5-6, Public Markets 4-5, and all of Restructuring,
   Consulting, Behavioral, Technical Questions and Excel. Same card format as lessons.js:
   {h, b (html), ex (worked example, html), check: [question, [options], correctIndex, why]}.
   Each lesson teaches exactly what that level's questions ask, in plain words, with a worked example. */
(function(){
  "use strict";
  const L = window.MA_LESSONS; if (!L) return;
  const add = (k, cards) => { if (!L[k]) L[k] = cards };

  /* ---------------- Investment Banking ---------------- */
  add("ib:5", [
    { h: "Selling a company: why an auction",
      b: "<p>Most deals a junior banker works on are <b>sell-sides</b>: a company hires the bank to sell it. The bank's job is the highest price and the surest close.</p><p>The tool is an <b>auction</b>: talk to many buyers at once, because competition pushes the price up. Talking to just one buyer gives that buyer all the leverage.</p>" },
    { h: "The documents, in order",
      ex: "<b>Teaser</b> → 1–2 pages, no company name, sent to a long list of buyers<br><b>NDA</b> → buyer promises to keep everything confidential<br><b>CIM</b> → the detailed book on the company (only after the NDA)<br><b>Data room</b> → contracts, financials, everything (round 2)",
      b: "<p>Each step gives buyers more information, and only the serious ones get the next layer.</p>" },
    { h: "Two rounds, then signing and closing",
      b: "<ul><li><b>Round 1:</b> buyers read the CIM and send an <b>IOI</b>, a non-binding price range.</li><li><b>Round 2:</b> a short list gets management meetings and the data room, does <b>due diligence</b> (checking everything), then sends an <b>LOI</b> or final bid with firmer terms.</li><li><b>Signing</b> the purchase agreement comes first; <b>closing</b> (money changes hands) comes weeks or months later, after approvals like antitrust review and shareholder votes.</li></ul>" },
    { h: "Quick check", check: ["What do buyers receive right after signing the NDA?", ["The data room", "The CIM", "The final contract"], 1, "The CIM goes out after the NDA; the data room usually waits for round 2."] }
  ]);
  add("ib:6", [
    { h: "Two ways to raise money",
      b: "<p><b>ECM</b> (equity capital markets) helps companies sell <b>stock</b>: IPOs, follow-on offerings and convertible bonds (bonds that can turn into stock).</p><p><b>DCM</b> (debt capital markets) helps them sell <b>bonds</b>. A follow-on is a company that's already public selling more shares.</p>" },
    { h: "How an IPO works",
      ex: "1. File the <b>S-1</b> registration statement with the SEC<br>2. <b>Roadshow:</b> management and bankers pitch big investors<br>3. <b>Book building:</b> collect orders (how many shares, at what price)<br>4. <b>Price</b> and allocate shares, stock starts trading<br>5. <b>Greenshoe:</b> underwriters can sell up to <b>15%</b> more shares to support the stock",
      b: "<p>A big first-day jump is called an IPO <b>pop</b>. Companies go public to raise money and give early owners a way to sell.</p>" },
    { h: "Bond ratings in one line",
      b: "<p><b>Investment grade</b> = rated <b>BBB−</b> (S&amp;P/Fitch) or higher: safer, lower interest. Anything below, like <b>BB+</b>, is <b>high yield</b> (\"junk\"): riskier, so investors demand more interest.</p>" },
    { h: "Quick check", check: ["A bond rated BB+ is:", ["Investment grade", "High yield", "Risk-free"], 1, "Investment grade starts at BBB−; BB+ is the top of high yield."] }
  ]);

  /* ---------------- Private Equity ---------------- */
  add("pe:5", [
    { h: "LBO debt comes in layers",
      b: "<p>From safest (top) to riskiest (bottom):</p><ul><li><b>Revolver:</b> a credit line the company draws and repays as needed.</li><li><b>Senior secured term loans:</b> backed by the company's assets, paid first, <b>cheapest</b>.</li><li><b>High-yield bonds:</b> usually unsecured, higher interest, fewer rules.</li><li><b>Mezzanine:</b> sits lowest, <b>most expensive</b>, often partly <b>PIK</b>.</li></ul>" },
    { h: "PIK, leverage and coverage math",
      ex: "<b>PIK</b> (paid-in-kind): interest is added to the loan instead of paid in cash<br>$100 at 10% PIK → $110 after year 1 → $121 after year 2<br><b>Leverage</b> = debt ÷ EBITDA: $600 ÷ $100 = <b>6x</b><br><b>Interest coverage</b> = EBITDA ÷ interest: $100 ÷ $25 = <b>4x</b>",
      b: "<p>PIK compounds, so the balance grows faster than simple interest would.</p>" },
    { h: "Covenants: the lender's rules",
      b: "<ul><li><b>Maintenance covenant:</b> tested regularly (often quarterly), like keeping debt/EBITDA under 6x.</li><li><b>Incurrence covenant:</b> only checked when the company does something, like borrowing more or paying a dividend.</li><li><b>Cov-lite</b> loans have no maintenance covenants, which gives the company more room.</li></ul>" },
    { h: "Quick check", check: ["Debt $600, EBITDA $100. Leverage is:", ["6x", "0.6x", "60%"], 0, "Leverage = debt ÷ EBITDA = 600 ÷ 100."] }
  ]);
  add("pe:6", [
    { h: "Buy-and-build",
      b: "<p>Buy a bigger <b>platform</b> company first, then bolt on smaller <b>add-ons</b>. Small companies often sell for lower multiples than a big combined business, so each add-on can be worth more inside the platform the day you buy it.</p>" },
    { h: "Multiple arbitrage, worked out",
      ex: "Add-on: $10 EBITDA bought at <b>6x</b> = $60<br>Platform valued at <b>10x</b> → that $10 is now worth $100<br>Value created = $100 − $60 = <b>$40</b> (before costs)",
      b: "<p>Funds also create value with <b>operations</b>: smarter pricing, better buying, a stronger sales team, upgraded management.</p>" },
    { h: "Getting out (the exit)",
      b: "<ul><li><b>Sale to a strategic</b> (a company in the industry): often pays most, because it can capture <b>synergies</b>.</li><li><b>Secondary buyout:</b> sell to another PE firm.</li><li><b>IPO:</b> list the company and sell shares gradually.</li><li><b>Dividend recap:</b> borrow new debt to pay the fund a dividend before exiting, which returns cash early and boosts IRR.</li><li><b>Continuation fund:</b> the same GP moves the company into a new fund to hold it longer.</li></ul>" },
    { h: "Quick check", check: ["Selling a portfolio company to another PE firm is a:", ["Secondary buyout", "Dividend recap", "Add-on"], 0, "PE-to-PE sales are secondary buyouts."] }
  ]);

  /* ---------------- Public Markets ---------------- */
  add("pm:4", [
    { h: "Calls and puts",
      b: "<p>An option is a contract that gives you a <b>right</b>, not an obligation:</p><ul><li><b>Call:</b> the right to <b>buy</b> a stock at a set price (the <b>strike</b>).</li><li><b>Put:</b> the right to <b>sell</b> at the strike.</li></ul><p>What you pay for the option is the <b>premium</b>. If you buy an option, the most you can lose is that premium.</p>" },
    { h: "Payoff math",
      ex: "<b>Call</b> value at expiry = stock − strike (if positive, else $0)<br>$50 call bought for $3, stock ends $58 → 58 − 50 = $8 value, <b>$5 profit</b><br><b>Break-even</b> = strike + premium = 50 + 3 = $53<br><b>Put</b> value = strike − stock: $50 put, stock $42 → $8",
      b: "<p>A call is <b>in the money</b> when the stock is above the strike; a put when it's below.</p>" },
    { h: "Why funds use them",
      b: "<p>A <b>protective put</b> on a stock you own caps how much you can lose, like insurance. The premium is the cost of that insurance.</p>" },
    { h: "Quick check", check: ["$30 call bought for $1.50, stock ends at $31. Profit per share?", ["+$1.00", "−$0.50", "+$0.50"], 1, "Value $1 minus $1.50 paid = −$0.50."] }
  ]);
  add("pm:5", [
    { h: "Bond basics",
      b: "<p>A bond pays a fixed <b>coupon</b> on its <b>face value</b> (usually $1,000): a 5% coupon pays $50 a year. Above face value it trades at a <b>premium</b>; below, at a <b>discount</b>. <b>Yield to maturity</b> is your annual return if you hold it to the end.</p>" },
    { h: "Prices move opposite to rates",
      ex: "Rates rise → new bonds pay more → old, lower-coupon bonds are worth less<br><b>Duration</b> ≈ % price change for a 1-point move in yield<br>Duration 7, yields +1% → price ≈ <b>−7%</b><br>Duration 5, yields −1% → price ≈ <b>+5%</b>",
      b: "<p>Longer bonds (like a 30-year) have higher duration, so they swing more when rates move.</p>" },
    { h: "Curves and spreads",
      b: "<ul><li><b>Normal yield curve:</b> long-term yields above short-term.</li><li><b>Inverted:</b> short-term above long-term, often read as a recession warning.</li><li><b>Credit spread:</b> extra yield over Treasuries for default risk. A <b>widening</b> spread means investors see more risk.</li></ul>" },
    { h: "Quick check", check: ["Rates rise. Existing bond prices:", ["Rise", "Fall", "Don't change"], 1, "Older bonds with lower coupons become less attractive, so their prices fall."] }
  ]);

  /* ---------------- Restructuring ---------------- */
  add("rx:0", [
    { h: "How companies get into trouble",
      b: "<p>Most distress is <b>too much debt meeting falling earnings</b>. Two different problems:</p><ul><li><b>Liquidity:</b> not enough cash for bills or interest coming due soon, even if the business is fine.</li><li><b>Solvency:</b> the debt is bigger than what the whole business is worth.</li></ul>" },
    { h: "Tell them apart",
      ex: "Profitable company, $50M cash, $300M debt due next month → <b>liquidity</b><br>Business worth $800, owes $1,200 → <b>solvency</b><br>Covenant: debt/EBITDA under 5x; debt $500, EBITDA falls to $80 → 6.25x → <b>breached</b>",
      b: "<p>A <b>covenant</b> is a promise in a loan. Breaking one lets lenders demand repayment or renegotiate.</p>" },
    { h: "Warning signs",
      b: "<ul><li>Debt/EBITDA rising, cash shrinking</li><li>A <b>maturity wall</b>: lots of debt due around the same time</li><li>Bonds trading far below face value (say 45 cents on the dollar)</li><li>Rising rates pushing up interest on floating-rate debt</li></ul>" },
    { h: "Quick check", check: ["Worth $800, owes $1,200. The main problem is:", ["Liquidity", "Solvency", "Neither"], 1, "Debts exceed what the business is worth."] }
  ]);
  add("rx:1", [
    { h: "Who gets paid first",
      b: "<p>When a company can't pay everyone, claims are paid in order (the <b>capital stack</b>):</p><p><b>First-lien secured</b> → <b>second-lien</b> → <b>unsecured bonds</b> → <b>subordinated debt</b> → <b>preferred stock</b> → <b>common equity</b>.</p><p>Secured lenders rank highest because they have a claim on specific assets.</p>" },
    { h: "The waterfall, worked out",
      ex: "Value $500. Secured owed $300 → paid in full<br>$200 left. Unsecured owed $400 → gets $200<br><b>Recovery</b> = received ÷ owed = 200 ÷ 400 = <b>50%</b><br>Equity gets nothing",
      b: "<p>The <b>absolute priority rule</b>: each class is paid in full before the class below gets anything.</p>" },
    { h: "Terms to know",
      b: "<ul><li><b>Subordinated:</b> paid after senior debt.</li><li><b>Second lien:</b> secured on the same assets but behind the first lien.</li><li><b>Preferred stock:</b> below all debt, above common.</li></ul>" },
    { h: "Quick check", check: ["Value $250, first lien owed $300. First-lien recovery?", ["100%", "83%", "50%"], 1, "250 ÷ 300 ≈ 83%."] }
  ]);
  add("rx:2", [
    { h: "Chapter 11 vs. Chapter 7",
      b: "<ul><li><b>Chapter 11 = reorganize.</b> The company keeps operating (it's the <b>debtor in possession</b>), renegotiates its debts and comes out with less debt.</li><li><b>Chapter 7 = liquidate.</b> A trustee sells the assets and pays creditors; the business ends.</li></ul>" },
    { h: "What happens when a company files",
      ex: "<b>Automatic stay</b> → creditors must stop collecting immediately<br><b>DIP financing</b> → new loans during bankruptcy, with <b>super-priority</b> (paid ahead of old debt) so lenders will lend at all<br><b>Plan of reorganization</b> → who gets what, and how the company exits",
      b: "<p>A <b>prepackaged</b> Chapter 11 means creditors agreed to the plan before filing, so the case is much faster.</p>" },
    { h: "Voting on the plan",
      b: "<p>Classes that are <b>impaired</b> (not paid in full or whose terms change) vote. If a class says no, the court can still approve the plan through <b>cramdown</b> if legal tests are met.</p>" },
    { h: "Quick check", check: ["The automatic stay:", ["Freezes creditor collection", "Liquidates the company", "Cancels all debt"], 0, "It stops collection the moment the company files."] }
  ]);
  add("rx:3", [
    { h: "Fixing it without a court",
      b: "<p>Out-of-court deals are faster, cheaper and less damaging to the business than bankruptcy. The main tools:</p><ul><li><b>Amend &amp; extend:</b> push maturities further out, usually for a higher rate.</li><li><b>Forbearance:</b> lenders agree to temporarily not enforce their rights.</li></ul>" },
    { h: "Swapping the debt",
      ex: "<b>Distressed exchange</b> → swap old bonds for new ones worth less but more likely to be paid<br><b>Debt-for-equity swap</b> → creditors trade debt for ownership<br>→ old shareholders are heavily diluted or wiped out",
      b: "<p>The big obstacle is <b>holdouts</b>: creditors who refuse the deal, hoping to be paid more by those who agree.</p>" },
    { h: "Who advises whom",
      b: "<p>Advisors pick a side: <b>debtor-side</b> works for the company, <b>creditor-side</b> works for the lenders or bondholders. Well-known restructuring groups include Houlihan Lokey, PJT Partners, Evercore, Lazard and Moelis.</p>" },
    { h: "Quick check", check: ["In a debt-for-equity swap, creditors:", ["Get paid in cash", "Become owners", "Lend more"], 1, "They trade their debt for equity."] }
  ]);
  add("rx:4", [
    { h: "Liability management (LMEs)",
      b: "<p>An <b>LME</b> is an out-of-court deal that uses room in the company's loan documents to raise money or cut debt. They often help some lenders at the expense of others (<b>non-pro-rata</b> treatment).</p>" },
    { h: "The two classic moves",
      ex: "<b>Uptier:</b> a majority of lenders lends new money and swaps into debt that ranks <b>ahead</b> of the lenders left out (<b>priming</b>)<br><b>Drop-down:</b> valuable assets move to an <b>unrestricted subsidiary</b> outside the lenders' collateral, then back new debt there (made famous by <b>J.Crew</b>)",
      b: "<p>An unrestricted subsidiary isn't bound by the loan's covenants or collateral, which is why moving assets there hurts existing lenders.</p>" },
    { h: "How lenders fight back",
      b: "<ul><li><b>Cooperation agreements:</b> lenders agree to act together and not cut side deals, so they can't be picked off.</li><li><b>Lawsuits:</b> excluded lenders sue, claiming the deal broke their rights.</li><li><b>Double-dip</b> structures give new lenders two claims on the same value.</li></ul>" },
    { h: "Quick check", check: ["A drop-down moves assets to:", ["An unrestricted subsidiary", "The first-lien lenders", "Chapter 7"], 0, "Moving assets outside the collateral is the drop-down."] }
  ]);
  add("rx:5", [
    { h: "Value decides who owns it",
      b: "<p>In a restructuring, the company's <b>enterprise value</b> decides who ends up owning it. Run the waterfall from the top until the value runs out.</p><p>The <b>fulcrum security</b> is the class where value runs out: partly repaid, and it usually receives most of the new equity.</p>" },
    { h: "Find the fulcrum",
      ex: "Value $600. First lien owed $400 → paid in full ($200 left)<br>Second lien owed $300 → gets $200 = <b>67%</b> → <b>fulcrum</b><br>Unsecured owed $250 → gets $0",
      b: "<p>Seniors and the fulcrum want a <b>lower</b> valuation (more equity for them); junior creditors and old equity want a <b>higher</b> one.</p>" },
    { h: "The floor: liquidation",
      b: "<p>The <b>best-interests test</b>: every creditor must get at least what it would in a Chapter 7 liquidation. Going-concern value is usually higher than liquidation value. Bankers value distressed companies with DCF, comps and precedent deals, adjusted for the distress.</p>" },
    { h: "Quick check", check: ["Value $700. First lien $400, second lien $200, unsecured $300. The fulcrum is:", ["First lien", "Second lien", "Unsecured"], 2, "After 400 and 200 are paid, $100 is left for unsecured: that's where value runs out."] }
  ]);

  /* ---------------- Consulting ---------------- */
  add("mc:0", [
    { h: "What consultants do",
      b: "<p>Management consultants help companies solve big problems: which markets to enter, how to cut costs, whether to buy a competitor. They work in small teams on <b>projects</b> (often called engagements) that last weeks to months.</p>" },
    { h: "The firms and the ladder",
      ex: "<b>MBB</b> = McKinsey, BCG, Bain (the biggest strategy firms)<br>Others: Big 4 advisory, boutiques, in-house strategy teams<br>Ladder: <b>Analyst / Associate Consultant</b> (undergrad) → Consultant → Manager → Partner",
      b: "<p>Undergrads usually join as analysts or associate consultants, often after a junior-summer internship.</p>" },
    { h: "What the job feels like",
      b: "<p>Research, interviews with the client's people, Excel analysis and slides that turn it all into a recommendation. Travel to clients is common at many firms.</p>" },
    { h: "Quick check", check: ["MBB stands for:", ["McKinsey, BCG, Bain", "Morgan, Barclays, BofA", "Moelis, Blackstone, Bain Capital"], 0, "The three largest strategy consulting firms."] }
  ]);
  add("mc:1", [
    { h: "What a case interview is",
      b: "<p>A <b>case</b> is a business problem you solve out loud with the interviewer, like \"profits at a coffee chain are falling.\" They're testing how you <b>think</b>, not whether you know the answer.</p>" },
    { h: "Structure it MECE",
      ex: "<b>MECE</b> = Mutually Exclusive, Collectively Exhaustive<br>→ no overlaps, nothing missing<br>Profit problem → <b>Revenue</b> (price × volume) and <b>Costs</b> (fixed + variable)",
      b: "<p>Before diving in, ask clarifying questions, take a moment, then lay out your structure (a short list of branches) to the interviewer.</p>" },
    { h: "How the case flows",
      b: "<ol><li>Clarify the goal</li><li>Lay out your structure</li><li>Dig into the most likely branch first</li><li>Do the math, out loud</li><li>Finish with a recommendation</li></ol>" },
    { h: "Quick check", check: ["MECE means your categories:", ["Overlap a little", "Don't overlap and cover everything", "Are all about costs"], 1, "Mutually exclusive, collectively exhaustive."] }
  ]);
  add("mc:2", [
    { h: "Estimate anything",
      b: "<p>Market sizing asks you to estimate a number you can't look up, like how many coffee cups are sold in a city each day. The answer matters less than a clear, logical path.</p>" },
    { h: "Top-down, step by step",
      ex: "U.S. population ≈ 330M (use round numbers)<br>× share who drink coffee daily (assume ~50%) → ~165M<br>× cups per day (assume ~2) → ~330M cups/day<br>State every assumption out loud, round to make math easy",
      b: "<p><b>Top-down</b> starts from a big population and narrows down. <b>Bottom-up</b> builds from one unit, like one store's daily sales × number of stores.</p>" },
    { h: "Finish with a sanity check",
      b: "<p>Ask: does the number pass the smell test? Compare it to something you know. If it seems off, say which assumption you'd revisit.</p>" },
    { h: "Quick check", check: ["Starting from total population and narrowing down is:", ["Bottom-up", "Top-down", "MECE"], 1, "Top-down sizing narrows from a big total."] }
  ]);
  add("mc:3", [
    { h: "The most common case",
      b: "<p>\"Profits are falling. Why, and what should we do?\" Start with the formula:</p><p><b>Profit = Revenue − Costs</b>, where Revenue = <b>price × volume</b> and Costs = <b>fixed + variable</b>.</p>" },
    { h: "Find which side broke",
      ex: "Revenue flat, costs up 20% → it's a <b>cost</b> problem → split fixed vs variable<br>Revenue down, costs flat → check <b>price</b> vs <b>volume</b>, then why (competitor? product mix? lost customers?)",
      b: "<p>Use the numbers the interviewer gives to rule branches out fast, then go deep where the change is.</p>" },
    { h: "Then fix it",
      b: "<p>Ideas should match the cause: raise price or change mix for a price problem, win back volume for a demand problem, renegotiate or automate for a cost problem.</p>" },
    { h: "Quick check", check: ["Revenue =", ["Price × volume", "Fixed + variable", "Profit − costs"], 0, "Revenue is price times units sold."] }
  ]);
  add("mc:4", [
    { h: "Always land the plane",
      b: "<p>End every case with a clear <b>recommendation</b>, even when the data isn't perfect. Consultants are paid to give advice, not to list more questions.</p>" },
    { h: "Answer first",
      ex: "\"<b>Recommendation:</b> enter the market.<br><b>Why:</b> 1) it's growing 12% a year, 2) we can reach 10% share in 3 years, 3) payback in under 2 years.<br><b>Risks:</b> a price war. <b>Next steps:</b> pilot in one city.\"",
      b: "<p>Lead with the answer, then 2–3 supporting reasons, then risks and next steps. Leaders read the top line first.</p>" },
    { h: "Keep it tight",
      b: "<p>Use numbers you actually found in the case, keep it under a minute, and sound decisive. \"It depends\" isn't a recommendation.</p>" },
    { h: "Quick check", check: ["A good recommendation starts with:", ["The background", "The answer", "A list of open questions"], 1, "Answer first, then the reasons."] }
  ]);
  add("mc:5", [
    { h: "Should we go in?",
      b: "<p>Market entry cases ask whether a client should enter a new market, product or country. Cover four areas:</p><ul><li><b>The market:</b> size, growth, profitability</li><li><b>Competition:</b> who's there, how strong</li><li><b>The client:</b> capabilities, fit, money</li><li><b>Economics &amp; how:</b> costs, payback, and build vs buy vs partner</li></ul>" },
    { h: "Payback math",
      ex: "Entry cost $10M, profit $4M a year → payback = 10 ÷ 4 = <b>2.5 years</b><br>Market $500M, target 10% share → $50M revenue",
      b: "<p>Compare payback to what the client needs (many want it in a few years).</p>" },
    { h: "How to enter",
      b: "<p><b>Build</b> (slow, full control), <b>buy</b> a company (fast, expensive) or <b>partner</b> (shared risk and reward). Pick based on speed, cost and control.</p>" },
    { h: "Quick check", check: ["$10M to enter, $4M profit a year. Payback?", ["2.5 years", "4 years", "0.4 years"], 0, "10 ÷ 4 = 2.5."] }
  ]);
  add("mc:6", [
    { h: "Clean math under pressure",
      b: "<p>Cases test fast, clean math. Say each step out loud, write units, and round to friendly numbers when the interviewer allows it.</p>" },
    { h: "Tricks that save time",
      ex: "Percent swap: 35% of 60 = 60% of 35 = <b>21</b><br>Growth trap: +50% then −50% ≠ even → 100 → 150 → <b>75</b><br>Big numbers: write 2.4B as 2.4 × 10⁹ and track the zeros",
      b: "<p>Before calculating, estimate roughly what the answer should be, so you catch mistakes.</p>" },
    { h: "Reading charts",
      b: "<p>First read the title, axes and units. Then say the one takeaway (\"costs grew faster than revenue since 2023\") and what it means for the case.</p>" },
    { h: "Quick check", check: ["$100 falls 50%, then rises 50%. You end at:", ["$100", "$75", "$125"], 1, "100 → 50 → 75."] }
  ]);

  /* ---------------- Behavioral ---------------- */
  add("b:0", [
    { h: "Your 90-second story",
      b: "<p>\"Walk me through your resume\" is almost always the first question. Don't read your resume line by line; tell a short story that ends with why you're in this room.</p>" },
    { h: "The structure",
      ex: "1. <b>Where you started</b> (school, major, one line)<br>2. <b>What sparked finance</b> (a class, a club, a person)<br>3. <b>What you did about it</b> (club, internship, a project)<br>4. <b>Why this role, now</b> → hand it back",
      b: "<p>Keep it to about 90 seconds. Each step should lead naturally to the next.</p>" },
    { h: "Make it yours",
      b: "<p>Use real specifics (a deal you followed, a stock you pitched) and practice out loud until it sounds natural, not memorized.</p>" },
    { h: "Quick check", check: ["Your resume walk-through should end with:", ["Your GPA", "Why this role, now", "Your hobbies"], 1, "Finish by connecting your story to the job."] }
  ]);
  add("b:1", [
    { h: "Why investment banking?",
      b: "<p>Strong answers point to things banking actually offers: a steep <b>learning curve</b>, real <b>deal exposure</b>, <b>transferable skills</b> (modeling, valuation, communication) and working with sharp, driven teams.</p>" },
    { h: "Prove it, don't claim it",
      ex: "Weak: \"I'm passionate about finance and want to make money.\"<br>Strong: \"Pitching a stock in my club made me want to understand how deals are valued, so I [did X]. Banking is the fastest way to learn that.\"",
      b: "<p>Tie each reason to something you've already done. Avoid leading with money or prestige.</p>" },
    { h: "Why this bank?",
      b: "<p>Know something specific: a group, a recent deal, a person you spoke with. \"I talked to an analyst in your healthcare group about...\" beats generic praise.</p>" },
    { h: "Quick check", check: ["Which is the weakest reason to give?", ["The learning curve", "Deal exposure", "The money"], 2, "Leading with pay sounds like you'll leave once you've earned it."] }
  ]);
  add("b:2", [
    { h: "Prep five stories",
      b: "<p>Prepare about <b>five stories</b> you can adapt to most questions: leadership, teamwork, a conflict, a failure and a time you went above and beyond.</p>" },
    { h: "Tell them with STAR",
      ex: "<b>S</b>ituation: the context, one or two lines<br><b>T</b>ask: what you had to do<br><b>A</b>ction: what <b>you</b> did (most of the time goes here)<br><b>R</b>esult: what happened, with a number if possible",
      b: "<p>Say \"I,\" not \"we,\" for your part. Interviewers want to know what you did.</p>" },
    { h: "The failure question",
      b: "<p>Pick a real failure, own it without blaming others, and spend the end on what you <b>learned</b> and how you changed. That's the part they're grading.</p>" },
    { h: "Quick check", check: ["In STAR, most of your time should go to:", ["Situation", "Action", "Result"], 1, "The action is what shows how you work."] }
  ]);
  add("b:3", [
    { h: "Always ask questions",
      b: "<p>At the end, you'll be asked \"Any questions for me?\" Always have two or three ready. Make them about <b>the interviewer's own experience</b>, not things you could look up.</p>" },
    { h: "Good vs. weak questions",
      ex: "Good: \"What's a deal you've worked on that changed how you think about your sector?\"<br>Good: \"What separates the top analysts in your group?\"<br>Weak: \"How many analysts does the bank hire?\" (look it up)",
      b: "<p>Listen to the answer and follow up; it should feel like a conversation.</p>" },
    { h: "The close",
      b: "<p>Thank them, restate your interest in one line, and send a short thank-you note within a day that mentions something specific you talked about.</p>" },
    { h: "Quick check", check: ["The best end-of-interview questions are about:", ["Salary", "The interviewer's experience", "Facts on the website"], 1, "Personal, thoughtful questions build a connection."] }
  ]);

  /* ---------------- Technical Questions ---------------- */
  add("t:0", [
    { h: "Walk every change through 3 statements",
      b: "<p>Accounting questions are always the same move: follow the change through the <b>income statement → cash flow statement → balance sheet</b>, then check that the balance sheet still balances.</p>" },
    { h: "The classic: depreciation +$10",
      ex: "Income statement: pre-tax income −10 → net income −7.50 (25% tax)<br>Cash flow: net income −7.50, add back D&amp;A +10 → cash <b>+2.50</b><br>Balance sheet: cash +2.50, PP&amp;E −10 → assets −7.50<br>Equity (retained earnings) −7.50 → <b>balances</b>",
      b: "<p>Depreciation is <b>non-cash</b>: it lowers taxes, so cash goes <b>up</b> by the tax savings.</p>" },
    { h: "Follow-ups they love",
      b: "<ul><li>Buying inventory with cash: no income statement change; cash down, inventory up.</li><li>Stock-based compensation: an expense, but non-cash, so it's added back in cash flow.</li><li>Always say the tax effect out loud.</li></ul>" },
    { h: "Quick check", check: ["Depreciation +$10, tax 25%. Cash changes by:", ["−$10", "−$7.50", "+$2.50"], 2, "Net income −7.50 plus the $10 add-back = +2.50."] }
  ]);
  add("t:1", [
    { h: "Why multiples differ",
      b: "<p>Similar companies trade at different multiples mainly because of <b>growth, margins and risk</b>. Faster growth, higher margins and lower risk earn a higher multiple.</p>" },
    { h: "Equity value vs. enterprise value",
      ex: "<b>Enterprise value</b> = equity value + debt − cash (+ preferred, minority interest)<br>$1,000 equity + $300 debt − $100 cash = <b>$1,200 EV</b><br>EV ÷ EBITDA uses EV; P/E uses equity value",
      b: "<p>Match the multiple to the right number: EV goes with metrics before interest (revenue, EBITDA); equity value goes with metrics after interest (net income).</p>" },
    { h: "Which method gives the highest value?",
      b: "<p>Usually <b>precedent transactions</b>, because buyers pay a <b>control premium</b> to take over a company. A DCF is the most sensitive to assumptions.</p>" },
    { h: "Quick check", check: ["$1,000 equity, $300 debt, $100 cash. Enterprise value?", ["$1,200", "$1,400", "$800"], 0, "1,000 + 300 − 100."] }
  ]);
  add("t:2", [
    { h: "Unlevered free cash flow",
      b: "<p>A DCF values a company as the present value of its future cash flows. Start with <b>unlevered FCF</b> (cash available to all investors, before debt payments).</p>" },
    { h: "The formula",
      ex: "UFCF = EBIT × (1 − tax rate) + D&amp;A − capex − increase in working capital<br>EBIT 100, tax 25%, D&amp;A 20, capex 30, NWC +10<br>→ 75 + 20 − 30 − 10 = <b>55</b>",
      b: "<p>Discount UFCF at <b>WACC</b> (the blended cost of debt and equity) because it belongs to all capital providers.</p>" },
    { h: "Terminal value",
      b: "<p>Most of a DCF's value is usually the <b>terminal value</b>: either a perpetuity growth formula (FCF × (1 + g) ÷ (WACC − g)) or an exit multiple on final-year EBITDA. A higher WACC lowers the value; higher growth raises it.</p>" },
    { h: "Quick check", check: ["Unlevered FCF is discounted at:", ["Cost of equity", "WACC", "The risk-free rate"], 1, "It's cash for all investors, so use the blended rate."] }
  ]);
  add("t:3", [
    { h: "LBO returns in your head",
      b: "<p>An LBO return comes from three things: <b>EBITDA growth</b>, <b>paying down debt</b> and <b>multiple expansion</b>. The path: entry equity → debt paydown → exit equity.</p>" },
    { h: "Benchmarks to memorize",
      ex: "2x in 5 years ≈ <b>15% IRR</b><br>3x in 5 years ≈ <b>25% IRR</b><br>2x in 3 years ≈ <b>26% IRR</b><br>Money multiple = exit equity ÷ entry equity",
      b: "<p>Use these to estimate quickly, then refine if the interviewer asks.</p>" },
    { h: "Merger math: accretion/dilution",
      b: "<p>A deal is <b>accretive</b> if the buyer's EPS goes up, <b>dilutive</b> if it goes down. Quick test for an all-stock deal: if the buyer's P/E is higher than the P/E it pays for the target, the deal is accretive.</p>" },
    { h: "Quick check", check: ["Roughly what IRR is a 2x in 5 years?", ["~15%", "~25%", "~40%"], 0, "2x over 5 years ≈ 15% a year."] }
  ]);

  /* ---------------- Excel ---------------- */
  add("x:0", [
    { h: "Why bankers ditch the mouse",
      b: "<p>Models are built under time pressure. Keyboard shortcuts make you faster and are a quiet signal you've done the work. These are Windows Excel shortcuts (Mac uses Cmd/Option for many).</p>" },
    { h: "Move and select",
      ex: "<b>Ctrl + Arrow</b> → jump to the edge of a data block<br><b>Ctrl + Shift + Arrow</b> → select to the edge<br><b>Shift + Space</b> → select the row · <b>Ctrl + Space</b> → select the column<br><b>Ctrl + Page Up/Down</b> → switch sheets",
      b: "<p>Combine them: Ctrl + Shift + Down selects a whole column of data in one move.</p>" },
    { h: "Practice tip",
      b: "<p>Unplug the mouse for 10 minutes while building a small model. It's slow at first, then much faster.</p>" },
    { h: "Quick check", check: ["Ctrl + Shift + Arrow does what?", ["Jumps to the edge", "Selects to the edge", "Switches sheets"], 1, "Adding Shift selects as you jump."] }
  ]);
  add("x:1", [
    { h: "Edit and anchor formulas",
      b: "<p><b>F2</b> edits the active cell. <b>F4</b> cycles a reference through the anchoring options, which control what changes when you copy a formula.</p>" },
    { h: "What F4 does",
      ex: "$A$1 → row and column both locked<br>A$1 → row locked<br>$A1 → column locked<br>A1 → nothing locked<br>Copy =B2*$B$1 down: B2 moves, $B$1 stays",
      b: "<p>Lock the cell that holds an assumption (like a tax rate) so every copied formula still points at it.</p>" },
    { h: "Copy formulas fast",
      b: "<p><b>Ctrl + D</b> fills down, <b>Ctrl + R</b> fills right, <b>Alt + =</b> inserts a SUM. Check one copied cell with F2 to make sure the references moved the way you wanted.</p>" },
    { h: "Quick check", check: ["$A$1 means:", ["Nothing is locked", "Row and column are locked", "Only the row is locked"], 1, "Both dollar signs lock both."] }
  ]);
  add("x:2", [
    { h: "Make it bank-ready",
      b: "<p>Models follow conventions so anyone can read them fast. The most important: <b>blue</b> font for hard-coded inputs, <b>black</b> for formulas, <b>green</b> for links to other sheets.</p>" },
    { h: "Shortcuts for formatting",
      ex: "<b>Ctrl + 1</b> → Format Cells<br><b>Ctrl + Alt + V</b> → Paste Special (values, formats...)<br><b>Ctrl + Shift + 1</b> → number format with commas<br><b>Alt + H + O + I</b> → auto-fit column width",
      b: "<p>Show negatives in parentheses, keep decimals consistent, and label units (like $M) in headers.</p>" },
    { h: "Why it matters",
      b: "<p>Clean formatting lets a reviewer spot what's an assumption and what's calculated, which prevents mistakes and saves your team time.</p>" },
    { h: "Quick check", check: ["In a banking model, blue font means:", ["A formula", "A hard-coded input", "A link to another sheet"], 1, "Blue = inputs you typed in."] }
  ]);
})();
