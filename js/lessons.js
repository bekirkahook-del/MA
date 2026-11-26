/* Lessons mixed with the drill (Nov 21, 2026). The first time a student opens a level: lesson → question →
   lesson → question → results, one step at a time. Written for a high school senior to college sophomore:
   every term is explained the first time it shows up. Later visits show the normal briefing with a
   "Lesson + questions" button. (Each lesson's own "check" card is kept in the data for future use.)
   Content lives in LESSONS keyed by "<trackId>:<levelIndex>"; levels without a lesson keep the old briefing. */
(function(){
  "use strict";
  if (typeof showBrief !== "function" || typeof runLevel !== "function") return;
  const ev = n => { try { window.maEv && maEv(n) } catch (e) {} };
  const seen = () => { try { return JSON.parse(localStorage.getItem("ma-lessons") || "{}") } catch (e) { return {} } };
  const markSeen = k => { try { const s = seen(); s[k] = Date.now(); localStorage.setItem("ma-lessons", JSON.stringify(s)) } catch (e) {} };

  /* card: {h, b (html), ex (worked example, html), check: [question, [options], correctIndex, why]} */
  const LESSONS = {
    "f:0": [
      { h: "Three reports, three questions",
        b: "<p>Every company tells its story with three statements. Each one answers a different question:</p><ul><li><b>Income statement:</b> did we make money <i>over a period</i> (a quarter, a year)?</li><li><b>Balance sheet:</b> what do we own and owe <i>on one date</i>? (Like a photo, not a video.)</li><li><b>Cash flow statement:</b> where did the cash <i>actually</i> go?</li></ul><p>Profit and cash are different things. You can make a profit on paper and still run low on cash. That gap is why the cash flow statement exists.</p>" },
      { h: "Worked example: a coffee shop's year",
        ex: "Sales $100 − costs $70 = <b>net income $30</b> (income statement)<br>But customers still owe $10, so cash from operations = 30 − 10 = <b>$20</b><br>Bought a $15 espresso machine: investing = <b>−$15</b><br>Cash change for the year = 20 − 15 = <b>+$5</b> → cash on the balance sheet goes up $5" ,
        b: "<p>Notice the shop earned $30 but only kept $5 of new cash. Unpaid customer bills and equipment purchases eat cash without hitting profit right away.</p>" },
      { h: "How they connect (interviewers test this)",
        b: "<ul><li>Net income is the <b>first line of the cash flow statement</b> and also adds to <b>retained earnings</b> (profits the company has kept over the years) on the balance sheet.</li><li><b>Ending cash</b> on the cash flow statement becomes <b>cash</b> on the balance sheet.</li><li>The balance sheet always balances: <b>assets = liabilities + equity</b>. In plain English: everything the company owns was paid for either with borrowed money or with the owners' money.</li></ul><p><b>Trap:</b> calling the balance sheet a report \"for the year\". It's a snapshot on one date.</p>" },
      { h: "Quick check", check: ["The coffee shop buys a $15 espresso machine. Which section of the cash flow statement shows it?", ["Operating", "Investing", "Financing"], 1, "Buying long-term equipment (called capital expenditures, or capex) is an investing outflow."] }
    ],
    "f:1": [
      { h: "A dollar today beats a dollar later",
        b: "<p>Would you rather have $100 today or $100 in a year? Today, because you could invest it and have more than $100 a year from now. That idea is the <b>time value of money</b>, and it shows up in every track: bankers use it in a DCF, PE funds use it to measure returns, investors use it to price stocks and bonds, and consultants use it to decide whether a project is worth the cost.</p><p>Two moves cover almost everything: <b>compounding</b> (growing money forward) and <b>discounting</b> (shrinking future money back to today).</p>" },
      { h: "Worked example: growing and shrinking money",
        ex: "<b>Compounding:</b> $100 at 10% a year for 2 years<br>Year 1: 100 × 1.10 = 110<br>Year 2: 110 × 1.10 = <b>$121</b> (you earned interest on your interest)<br><b>Discounting:</b> $121 arriving in 2 years, 10% rate<br>121 ÷ 1.10 ÷ 1.10 = <b>$100 today</b>",
        b: "<p>Compounding multiplies by (1 + rate) each year. Discounting divides by the same number. A <b>higher rate</b> makes future money worth <b>less</b> today, which is why a higher discount rate lowers a DCF value.</p>" },
      { h: "Returns: MOIC and IRR",
        b: "<ul><li><b>MOIC</b> (multiple on invested capital) = money you get back ÷ money you put in. $100 in, $300 back = <b>3.0x</b>.</li><li><b>IRR</b> (internal rate of return) = the yearly return that turns your money in into your money out. It adds the time, which MOIC ignores.</li><li><b>Rule of thumb:</b> 2x in 5 years is about <b>15%</b> a year. 3x in 5 years is about <b>25%</b>.</li></ul><p><b>Trap:</b> the same MOIC in fewer years is a <b>higher</b> IRR. A 2x in 3 years beats a 2x in 6 years.</p>" },
      { h: "Quick check", check: ["A fund doubles its money in 5 years. Its yearly return (IRR) is about:", ["10%", "15%", "20%"], 1, "2^(1/5) is about 1.15, so roughly 15% a year. Use the rule of thumb: 2x in 5 years is about 15%."] }
    ],
    "ib:7": [
      { h: "The most-asked accounting question",
        b: "<p>\"Depreciation goes up by $10. Walk me through the three statements.\"</p><p>Always answer in the same order: <b>income statement → cash flow statement → balance sheet</b>. The income statement changes net income, the cash flow statement turns that into cash, and the balance sheet has to balance at the end.</p><p>First, the key idea: <b>depreciation</b> spreads the cost of equipment over the years you use it. It counts as an expense on paper, but <b>no cash leaves</b> that year (you paid for the equipment when you bought it).</p><p>Assume a tax rate if none is given (40% keeps the math clean).</p>" },
      { h: "Worked example: depreciation +$10, 40% tax",
        ex: "<b>Income statement:</b> depreciation +10 → pre-tax income −10 → taxes −4 → <b>net income −6</b><br><b>Cash flow:</b> net income −6, add back depreciation +10 → <b>cash +4</b><br><b>Balance sheet:</b> cash +4, PP&amp;E (property, plant &amp; equipment) −10 → assets −6. Retained earnings −6 → equity −6. <b>Balanced.</b>",
        b: "<p>Say it in that order, out loud, and land on \"it balances\". That's what they're listening for.</p>" },
      { h: "The trap",
        b: "<ul><li>Saying cash goes <b>down</b>. Depreciation isn't a cash payment. The only cash effect is the <b>tax you save</b> (a bigger expense means lower taxes), so cash goes <b>up</b>.</li><li>Forgetting that <b>PP&amp;E falls</b> on the balance sheet. That's where the other −10 on the assets side comes from.</li></ul>" },
      { h: "Quick check", check: ["Same question, but the tax rate is 25%. Ending cash changes by:", ["−$2.50", "+$2.50", "+$7.50"], 1, "Taxes fall by 10 × 25% = $2.50, and that tax saving is the only cash effect."] }
    ],
    "f:2": [
      { h: "Two ways to value a company",
        b: "<ul><li><b>Equity value</b> = share price × number of shares. What the <i>shareholders</i> own. (Bankers use “diluted” shares, which also count stock options.)</li><li><b>Enterprise value (EV)</b> = equity value + debt − cash (plus a few rarer items like preferred stock). What the <i>whole business</i> is worth to everyone who funded it.</li></ul>" },
      { h: "Worked example: buying a house",
        ex: "You pay the owner <b>$300</b> for their stake (equity value)<br>You also take over their <b>$200</b> mortgage (debt)<br>There's <b>$20</b> of cash left in a drawer, which is yours now<br>Real cost of the house = 300 + 200 − 20 = <b>$480</b> (enterprise value)",
        b: "<p>That's why debt is added and cash is subtracted: a buyer takes on the debt and gets the cash.</p>" },
      { h: "The traps",
        b: "<ul><li><b>Match the multiple:</b> EV goes with numbers that belong to everyone, like revenue or <b>EBITDA</b> (roughly the profit the core business makes before interest, taxes and depreciation). Equity value goes with numbers left over for shareholders after interest, like <b>P/E</b> (share price ÷ profit per share).</li><li><b>Raising cash doesn't change EV:</b> borrow $100 and keep it as cash → debt +100, cash +100 → EV is unchanged.</li></ul>" },
      { h: "Quick check", check: ["Equity value $800, debt $300, cash $100. Enterprise value is:", ["$1,000", "$1,200", "$600"], 0, "800 + 300 − 100 = $1,000."] }
    ],
    "f:3": [
      { h: "Three ways to value a business",
        b: "<ul><li><b>Trading comps</b> (“comparable companies”): what similar companies on the stock market are worth today.</li><li><b>Precedent transactions:</b> what buyers paid for similar companies in past deals.</li><li><b>DCF</b> (discounted cash flow): forecast the cash the company will make, then convert it into today's dollars (a dollar next year is worth less than a dollar today).</li></ul><p>Bankers show all three side by side on a <b>football field</b> chart (a bar chart of value ranges).</p>" },
      { h: "Worked example: comps and precedents",
        ex: "Target EBITDA = <b>$50</b><br>Similar companies are worth <b>10x</b> (10 times) their EBITDA → EV ≈ 10 × 50 = <b>$500</b><br>Buyers paid <b>12x</b> in recent deals → EV ≈ 12 × 50 = <b>$600</b>",
        b: "<p>Precedents usually come out higher because buyers pay extra (a <b>control premium</b>) to own the whole company and run it their way.</p>" },
      { h: "DCF in one breath",
        b: "<p>Forecast the business's <b>free cash flow</b> (the cash it makes after running and investing in the business, before paying lenders). Discount it at <b>WACC</b>: the average return the company's lenders and owners expect, used as the “interest rate” for discounting. Then add a <b>terminal value</b>: one number for every year after the forecast.</p><p><b>Trap:</b> the terminal value is often <b>more than half</b> of the total. Small changes in growth or the discount rate swing the answer a lot, so say that if asked about weaknesses.</p>" },
      { h: "Quick check", check: ["Peers trade at 8x EBITDA and the target's EBITDA is $25. Implied enterprise value:", ["$33", "$200", "$250"], 1, "8 × $25 = $200."] }
    ],
    "f:4": [
      { h: "Two ways to fund a company",
        b: "<ul><li><b>Debt</b> is borrowed money. The company owes <b>interest</b> and has to pay the original amount back. Lenders are paid first.</li><li><b>Equity</b> is the owners' money. There is no promised payment, but owners keep the upside and are paid <b>last</b>.</li></ul><p>This sits behind PE buyouts (how much debt to use), restructuring (who gets paid when a company can't pay), bank capital markets (raising debt and stock for clients), and consulting (how a client should fund a big project).</p>" },
      { h: "What each costs: the tax shield",
        ex: "Debt costs <b>8%</b>, tax rate <b>25%</b><br>Interest is tax deductible, so after-tax cost = 8% × (1 − 25%) = <b>6%</b><br>Equity holders want more, say 10%, because they are paid last<br>Fund 50% each → blended cost = 0.5 × 6% + 0.5 × 10% = <b>8%</b>",
        b: "<p>That blended number is the <b>cost of capital</b> (WACC). Debt is cheaper than equity for two reasons: lenders take less risk, and the interest lowers your taxes (the <b>tax shield</b>).</p>" },
      { h: "Leverage cuts both ways",
        ex: "Buy a $100 asset: $50 debt + $50 your money (ignore interest)<br>Asset +20% → $120. Repay $50 → you hold $70 → <b>+40%</b><br>Asset −20% → $80. Repay $50 → you hold $30 → <b>−40%</b>",
        b: "<p><b>Leverage</b> means using debt. The same move in the asset becomes a bigger move in your equity. That is why higher risk goes with higher return, and why too much debt is dangerous: interest is due even in a bad year.</p><p><b>Seniority:</b> in a bankruptcy, secured lenders are paid first, then unsecured lenders, then shareholders.</p>" },
      { h: "Quick check", check: ["You buy a $100 asset with $75 of debt and $25 of your own money. It rises 10%. Your return on equity (ignore interest):", ["10%", "30%", "40%"], 2, "The asset gains $10 and your equity was only $25, so 10 ÷ 25 = 40%."] }
    ],
    "ib:8": [
      { h: "Accretive or dilutive?",
        b: "<p>When one company buys another, bankers ask: after the deal, does the buyer's <b>profit per share</b> (earnings per share, or <b>EPS</b>) go up (<b>accretive</b>) or down (<b>dilutive</b>)? Shareholders care because EPS drives the stock price.</p><p>Simple rule: if what the target earns per dollar you pay is <b>more</b> than what that dollar costs you, the deal is accretive.</p>" },
      { h: "What each dollar costs",
        b: "<ul><li><b>Cash:</b> the interest that cash could have earned in the bank, after tax.</li><li><b>Debt:</b> the interest rate × (1 − tax rate). Interest lowers your taxes, so it costs less than it looks.</li><li><b>Stock:</b> new shares mean sharing your profit with more owners. Its cost = 1 ÷ the buyer's P/E (price ÷ earnings per share).</li></ul><p>What the target earns per dollar = 1 ÷ the P/E you pay for it.</p>" },
      { h: "Worked example",
        ex: "Buyer P/E <b>20x</b> → cost of stock = 1 ÷ 20 = <b>5%</b><br>You buy the target at <b>15x</b> earnings → it earns 1 ÷ 15 ≈ <b>6.7%</b> per dollar<br>6.7% &gt; 5% → <b>accretive</b><br>Paid with 8% debt at a 25% tax rate instead: cost = 8% × 0.75 = <b>6%</b> → 6.7% &gt; 6% → still accretive, barely",
        b: "<p>Shortcut for all-stock deals: if the buyer's P/E is higher than the P/E it pays, it's accretive.</p>" },
      { h: "Quick check", check: ["Buyer P/E 10x pays 16x for the target, all in stock. The deal is:", ["Accretive", "Dilutive", "Neutral"], 1, "Cost of stock = 1 ÷ 10 = 10%, but the target only earns 1 ÷ 16 ≈ 6.25% per dollar. Paying 10% for 6.25% is dilutive."] }
    ],
    "ib:0": [
      { h: "How a bank is organized",
        b: "<p>Bankers sit in two kinds of groups:</p><ul><li><b>Coverage groups</b> focus on an <i>industry</i>: tech/media/telecom (TMT), healthcare, industrials (factories, machinery), consumer (brands, retail).</li><li><b>Product groups</b> focus on a <i>type of deal</i>: M&amp;A (buying and selling companies), leveraged finance (loans for buyouts), equity capital markets (ECM: selling stock, like IPOs), debt capital markets (DCM: selling bonds), restructuring (helping companies in financial trouble).</li></ul><p>On a deal, the coverage team brings the client and the product team brings the expertise.</p>" },
      { h: "Who does what",
        ex: "<b>Analyst</b> → builds the models and slides<br><b>Associate</b> → checks the work, runs the analysts<br><b>VP</b> → manages the deal day to day<br><b>Director</b> → senior client contact<br><b>Managing Director</b> → wins clients and brings in deals",
        b: "<p>As an intern or analyst, your job is accuracy and speed. The MD's job is relationships.</p>" },
      { h: "Bank tiers (interviewers ask why their bank)",
        b: "<ul><li><b>Bulge brackets:</b> Goldman Sachs, JPMorgan, Morgan Stanley, BofA, Citi. Every product, biggest deals.</li><li><b>Elite boutiques:</b> Evercore, Lazard, PJT, Centerview, Moelis. Advice-focused (M&amp;A, restructuring), no lending.</li><li><b>Middle market:</b> Houlihan Lokey, William Blair, Harris Williams, Baird. Smaller deals, more hands-on.</li></ul><p><b>Trap:</b> mixing these up in a \"why us\" answer. Know which tier you're talking to.</p>" },
      { h: "Quick check", check: ["Leveraged finance is a:", ["Coverage group", "Product group", "Bank tier"], 1, "Leveraged finance is defined by the deal type (raising debt for buyouts and acquisitions), so it's a product group."] }
    ],
    "ib:1": [
      { h: "The one internship that matters most",
        b: "<p>Most full-time analyst jobs go to interns: you intern the <b>summer after junior year</b>, and if you do well, the bank offers you a full-time job (a <b>return offer</b>). Land that, perform, and you usually have a job before senior year starts.</p><p>The catch: big banks often recruit for junior summer during <b>sophomore year</b>, sometimes earlier.</p>" },
      { h: "What each year is for",
        ex: "<b>Freshman:</b> strong GPA, join an investment club, meet alumni, apply to early-insight programs<br><b>Sophomore:</b> finance basics (“technicals”) and your story ready; most junior-summer applications and interviews happen<br><b>Junior summer:</b> the internship → return offer<br><b>Senior:</b> full-time, if you still need an offer",
        b: "<p>The timeline keeps moving earlier, so check each bank's dates yourself.</p>" },
      { h: "The trap",
        b: "<p>Waiting until junior year of college to start. By then, many large-bank spots are already filled. Start networking and learning technicals as a freshman, even if you only apply to a few early programs.</p>" },
      { h: "Quick check", check: ["Most full-time IB analyst offers come from:", ["Senior-year applications", "Junior-summer internship return offers", "Freshman programs"], 1, "Banks mostly fill full-time analyst classes with their own junior-summer interns."] }
    ],
    "ib:2": [
      { h: "Why networking works",
        b: "<p>Banks get far more applications than spots. A banker who remembers you can flag your resume so a real person reads it. Start with <b>alumni from your school</b>: shared background gets replies.</p>" },
      { h: "Example cold email (under 100 words)",
        ex: "Subject: Ohio State student, quick question about Evercore M&amp;A<br><br>Hi Sarah, I'm a sophomore at Ohio State studying finance and saw you're also a Buckeye. I'm interested in M&amp;A and would love 15 minutes to hear how you got to Evercore. Would any time next week work? Thanks, Alex",
        b: "<p>Who you are, the connection, one specific ask. That's it.</p>" },
      { h: "On the call, and after",
        b: "<ul><li>Ask about their path, their group and what they wish they'd known.</li><li><b>Don't ask for a job.</b> Ask who else you should talk to.</li><li>Send a thank-you within <b>24 hours</b>.</li><li>Track every contact in a spreadsheet: name, date, notes, follow-up.</li></ul><p><b>Trap:</b> long emails with your whole resume. Nobody reads them.</p>" },
      { h: "Quick check", check: ["At the end of a good coffee chat, the best ask is:", ["Can you refer me for a job?", "Who else would you suggest I talk to?", "What's your salary?"], 1, "Asking for more people to talk to grows your network without putting them on the spot."] }
    ],
    "ib:3": [
      { h: "What technical interviews cover",
        b: "<p>Technical questions test whether you understand how companies and deals work. Six topics come up again and again: <b>accounting</b>, <b>equity value vs. enterprise value</b>, <b>valuation</b>, <b>DCF</b>, a <b>basic LBO</b> and <b>merger math</b>. The Foundations track covers the core.</p><p>Interviewers care about <i>why</i>, not just the formula.</p>" },
      { h: "Worked example: same EBITDA, different multiple",
        ex: "Company A: EBITDA (core profit) $100, growing 20% a year → trades at <b>15x</b> → EV $1,500<br>Company B: EBITDA $100, growing 2% a year → trades at <b>8x</b> → EV $800",
        b: "<p>Same earnings today, very different value. Investors pay more for <b>growth</b>, <b>higher margins</b> and <b>lower risk</b>.</p>" },
      { h: "Two follow-ups to have ready",
        b: "<ul><li><b>WACC goes up → DCF value goes down</b>, because a higher “interest rate” makes future cash worth less today.</li><li><b>Shareholders expect a higher return than lenders</b>, because they get paid last if things go wrong (and interest payments also lower taxes).</li></ul><p>Also know <b>one recent deal</b> cold: buyer, target, price, multiple, why, and your view.</p>" },
      { h: "Quick check", check: ["If WACC rises, a DCF valuation:", ["Goes up", "Goes down", "Doesn't change"], 1, "A higher discount rate shrinks the present value of every future cash flow."] }
    ],
    "ib:4": [
      { h: "What a Superday is",
        b: "<p>The final round: <b>3 to 6 interviews back to back</b> in one day, from analysts up to MDs, mixing fit and technical questions.</p><p>Each interviewer scores you on their own, then they compare notes.</p>" },
      { h: "How to win the day",
        ex: "<b>Same story every time:</b> your \"why banking\" and resume walk-through shouldn't change between rooms<br><b>Don't know a technical?</b> Say so, then reason out loud<br><b>Pitch a deal like a banker:</b> terms → strategic rationale → your view",
        b: "<p>Consistency matters because they compare notes. A different reason in each room looks rehearsed or unsure.</p>" },
      { h: "The trap",
        b: "<p><b>Bluffing.</b> A confident wrong answer hurts more than \"I'm not sure, but here's how I'd think about it.\" Interviewers test how you reason under pressure, not whether you've memorized everything.</p>" },
      { h: "Quick check", check: ["An MD asks a technical you don't know. Best move:", ["Guess confidently", "Say you don't know and reason through it", "Change the subject"], 1, "Honest reasoning out loud is what they want to see. Bluffing loses interviewers fast."] }
    ],
    "pe:0": [
      { h: "Who's who in private equity",
        b: "<ul><li><b>GP (general partner):</b> the PE firm. It raises a pool of money (a fund), picks companies to buy and runs them.</li><li><b>LPs (limited partners):</b> the investors who put in most of the money: pension funds, university endowments, insurance companies, and countries' investment funds.</li></ul><p>The GP buys companies, improves them over a few years, then sells them.</p>" },
      { h: "Worked example: 2 and 20 (simplified)",
        ex: "Fund size <b>$1B</b><br>Management fee ≈ 2% × $1B = <b>$20M a year</b> to pay salaries and run the firm<br>The fund makes <b>$500M</b> of profit → the GP keeps about 20% × $500M = <b>$100M</b> (called <b>carried interest</b>, or carry)",
        b: "<p>Real funds usually pay carry only on profits above a <b>hurdle</b> (often 8% a year), so this is the simple version.</p>" },
      { h: "Three ways a deal makes money",
        b: "<ul><li><b>Profit growth:</b> grow sales and cut costs so EBITDA (core profit) goes up.</li><li><b>Multiple expansion:</b> sell for a higher multiple of profit than you paid (buy at 8x, sell at 10x).</li><li><b>Debt paydown:</b> the company's cash repays the loans, so more of the sale price belongs to the PE firm.</li></ul><p><b>Trap:</b> listing \"higher fees\" as a return lever. Fees pay the GP; they don't make the deal better.</p>" },
      { h: "Quick check", check: ["Who puts in most of the money in a PE fund?", ["The GP", "Limited partners", "The portfolio companies"], 1, "LPs like pensions and endowments supply most of the capital; the GP commits a small slice."] }
    ],
    "pe:1": [
      { h: "What an LBO is",
        b: "<p>A <b>leveraged buyout</b> buys a company using mostly <b>borrowed money</b> plus a smaller amount of the PE firm's own money (the <b>equity check</b>).</p><p>Think of it like buying a rental house with a big mortgage: the rent pays off the loan. In an LBO, the company's own cash pays down the debt over the next few years. Less debt at exit means more of the sale price goes to the PE firm.</p>" },
      { h: "Worked example: sources and uses",
        ex: "<b>Uses:</b> purchase price $1,000 + fees $20 = <b>$1,020</b><br><b>Sources:</b> new debt $600 + sponsor equity $420 = <b>$1,020</b>",
        b: "<p>Sources and uses <b>must balance</b>: every dollar spent has to come from somewhere.</p>" },
      { h: "What makes a good LBO candidate",
        b: "<ul><li>Stable, predictable cash flow (to pay the debt)</li><li>Doesn't need to spend much on new equipment (low capex)</li><li>Strong market position</li><li>Room to cut costs or improve operations</li></ul><p><b>Trap:</b> picking a fast-growing but cash-burning tech startup. It can't service the debt.</p>" },
      { h: "Quick check", check: ["In an LBO, the acquisition debt is repaid mainly with:", ["New money from LPs", "The target company's own cash flow", "The PE firm's fees"], 1, "The target's cash flow services and repays the debt over the hold period."] }
    ],
    "pe:2": [
      { h: "Two ways to measure returns",
        b: "<ul><li><b>MOIC</b> (multiple of invested capital) = money out ÷ money in. Put in $100, get back $200 → 2x. Ignores how long it took.</li><li><b>IRR</b> (internal rate of return) = the yearly rate of return, like an interest rate. Time matters.</li></ul><p>2x in 3 years beats 2x in 5 years: same MOIC, higher IRR.</p>" },
      { h: "Benchmarks to memorize",
        ex: "2x in 3 years ≈ <b>26%</b> IRR<br>2x in 5 years ≈ <b>15%</b><br>2.5x in 5 years ≈ <b>20%</b><br>3x in 5 years ≈ <b>25%</b>",
        b: "<p>Interviewers expect you to say these instantly. Doubling in 5 years ≈ 15% is the one asked most.</p>" },
      { h: "The trap",
        b: "<p>Dividing MOIC by years. 3x over 5 years is <b>not</b> 60% a year (or 40%). Returns compound, so 3x in 5 years is about 25% a year.</p>" },
      { h: "Quick check", check: ["Entry equity $200, exit equity $500. MOIC is:", ["2.0x", "2.5x", "3.0x"], 1, "500 ÷ 200 = 2.5x. Over 5 years that's roughly a 20% IRR."] }
    ],
    "pe:3": [
      { h: "The paper LBO",
        b: "<p>In PE interviews they hand you a short scenario and a blank page: no Excel, round numbers. Work the same steps every time:</p><p><b>entry price → debt/equity split → future EBITDA → debt left → exit value → exit equity → MOIC and IRR</b></p>" },
      { h: "Worked example",
        ex: "Entry: EBITDA $100 × 10x = <b>$1,000</b> → $500 debt + $500 equity<br>Year 5: EBITDA $130 × 10x = exit EV <b>$1,300</b><br>Debt left $300 → exit equity = 1,300 − 300 = <b>$1,000</b><br>MOIC = 1,000 ÷ 500 = <b>2.0x</b> → IRR ≈ <b>15%</b> (2x in 5 years)",
        b: "<p>Say each step out loud. Partial credit for a clean process beats a silent wrong number.</p>" },
      { h: "The trap",
        b: "<p>Forgetting to <b>subtract the remaining debt</b> at exit. The PE firm gets exit EV minus debt, not the full EV.</p>" },
      { h: "Quick check", check: ["Entry EBITDA $50 at 8x, with $240 debt. Exit: EBITDA $60 at 8x, $120 debt left. MOIC is:", ["2.25x", "3.0x", "1.5x"], 0, "Entry EV $400, equity 400 − 240 = $160. Exit EV 480 − 120 debt = $360 equity. 360 ÷ 160 = 2.25x."] }
    ],
    "pe:4": [
      { h: "How people get into PE",
        b: "<p>Most people don't start in PE out of college. The classic path: about <b>two years as an investment banking analyst</b>, then a <b>PE associate</b> job.</p><p>Large funds recruit through <b>headhunters</b> (recruiters the funds hire) in a short, intense \"on-cycle\" process that can start in your first year as an analyst, sometimes before you start.</p>" },
      { h: "What the process looks like",
        ex: "<b>Headhunter meetings</b> → fit interviews → <b>modeling test</b> (paper LBO or a timed Excel LBO) → <b>case study</b> with an investment recommendation → offer",
        b: "<p>Middle-market funds often hire <b>off-cycle</b>, on a rolling basis, which gives you a second shot.</p>" },
      { h: "The trap",
        b: "<p>Starting LBO practice after the headhunters call. On-cycle moves in days. Be able to do a paper LBO and talk through a deal <i>before</i> it starts.</p>" },
      { h: "Quick check", check: ["Large-fund on-cycle PE recruiting is mainly run through:", ["Job boards", "Headhunters", "Campus career fairs"], 1, "Big funds hire through headhunters who run fast, coordinated processes."] }
    ],
    "pm:0": [
      { h: "Sell side vs. buy side",
        b: "<ul><li><b>Sell side</b> (banks): <b>salespeople</b> talk to big investors, and <b>traders</b> buy and sell for them all day (“making markets”).</li><li><b>Buy side</b> (investors): <b>asset managers</b> (like the firms behind mutual funds) try to beat a benchmark like the S&amp;P 500. <b>Hedge funds</b> try to make money in any market, using tools like betting against stocks (shorting) and borrowed money (leverage).</li></ul>" },
      { h: "Worked example: how a market maker earns",
        ex: "A trader quotes a stock: will buy at <b>$99.98</b> (the bid), will sell at <b>$100.02</b> (the ask)<br>Buys from one client at $99.98, sells to another at $100.02<br>Earns the <b>$0.04 spread</b>, many thousands of times a day",
        b: "<p>The risk: prices move before the trader can offload the position.</p>" },
      { h: "Fees and the trap",
        b: "<p>Classic hedge fund fees: about <b>2% management + 20% performance</b> (\"2 and 20\").</p><p><b>Trap:</b> saying hedge funds try to beat the S&amp;P 500. That's the long-only asset manager's job. Hedge funds aim for <b>absolute</b> returns.</p>" },
      { h: "Quick check", check: ["A market maker mainly earns money from:", ["Management fees", "The bid-ask spread", "Dividends"], 1, "Buying at the bid and selling at the ask captures the spread."] }
    ],
    "pm:1": [
      { h: "The main hedge fund strategies",
        b: "<ul><li><b>Long/short equity:</b> buy stocks that look too cheap, and bet against (short) stocks that look too expensive.</li><li><b>Event-driven:</b> trade around big company events like mergers, spin-offs and bankruptcies.</li><li><b>Global macro:</b> big bets on interest rates, currencies (like the dollar vs. the euro) and commodities (oil, gold).</li><li><b>Quant:</b> computer models decide the trades.</li><li><b>Credit/distressed:</b> the debt of companies in trouble.</li></ul>" },
      { h: "Worked example: merger arbitrage (event-driven)",
        ex: "A buyer agrees to pay <b>$50 cash</b> per share for a target<br>The target trades at <b>$48</b> after the announcement<br>Buy at $48 → if the deal closes, you get $50 = <b>$2</b> (about 4.2%)",
        b: "<p>The $2 gap pays you for the risk that the deal falls apart and the stock drops back down.</p>" },
      { h: "The trap",
        b: "<p>Shorting means borrowing a stock and selling it, hoping to buy it back cheaper later. You profit when the price <b>falls</b>, and your loss has no ceiling if it rises. That's why short positions are sized carefully.</p>" },
      { h: "Quick check", check: ["A fund betting on where interest rates and currencies go next is:", ["Long/short equity", "Global macro", "Merger arbitrage"], 1, "Rates, currencies and commodities are the classic global macro playbook."] }
    ],
    "pm:2": [
      { h: "How to structure a stock pitch",
        b: "<p><b>Recommendation</b> (long or short + price target) → <b>2–3 thesis points</b> → your <b>variant view</b> (where you think the market is wrong) → <b>catalysts</b> → <b>valuation</b> → <b>risks</b> and what limits them.</p>" },
      { h: "Worked example: upside math",
        ex: "Stock price <b>$40</b>, your price target <b>$52</b><br>Upside = (52 − 40) ÷ 40 = <b>30%</b>",
        b: "<p>Always lead with the number: \"I'm long X with a $52 target, 30% upside.\"</p>" },
      { h: "Catalysts and the trap",
        b: "<p>A <b>catalyst</b> is an event that forces the market to see the value: earnings, a product launch, a spin-off, a new CEO.</p><p><b>Trap:</b> \"it's a great company.\" If everyone already agrees, it's priced in. You need a view the market is <b>missing</b>.</p>" },
      { h: "Quick check", check: ["Stock at $80, price target $100. Upside is:", ["20%", "25%", "80%"], 1, "(100 − 80) ÷ 80 = 25%."] }
    ],
    "pm:3": [
      { h: "Exposure: how much risk is on",
        b: "<ul><li><b>Gross exposure</b> = longs + shorts. How much is invested in total. (“Longs” are stocks you own; “shorts” are bets against stocks.)</li><li><b>Net exposure</b> = longs − shorts. How much you're betting on the market going up.</li></ul><p>Both are shown as a % of the fund's capital.</p>" },
      { h: "Worked example",
        ex: "Long <b>120%</b>, short <b>80%</b> → gross 200%, net <b>40%</b><br><b>Beta</b> measures how much a stock swings with the market. Beta 1.5, market +10% → stock ≈ <b>+15%</b><br><b>Sharpe ratio</b>: return 12%, safe return (Treasury bills) 4%, volatility (how much it swings) 16% → (12 − 4) ÷ 16 = <b>0.5</b>",
        b: "<p>Sharpe = return <i>per unit of risk</i>. Two funds can both return 12%; the one with less volatility has the better Sharpe.</p>" },
      { h: "The trap",
        b: "<p>Sizing one idea so big it can sink the fund. Good managers size positions so any single loss is survivable, no matter how sure they are.</p>" },
      { h: "Quick check", check: ["Long 150%, short 100%. Net exposure is:", ["50%", "250%", "100%"], 0, "Net = longs − shorts = 150% − 100% = 50%. Gross would be 250%."] }
    ]
  };
  window.MA_LESSONS = LESSONS;

  const st = document.createElement("style");
  st.textContent = ".ls-bar{height:4px;border-radius:2px;background:var(--rule,#d9dde6);margin:8px 0 14px;overflow:hidden}.ls-bar i{display:block;height:100%;background:var(--cobalt,#2448D8);border-radius:2px;transition:width .45s ease}" +
    ".ls-step{animation:lsIn .38s cubic-bezier(.2,.7,.2,1)}@keyframes lsIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}" +
    ".ls-kind{font-size:11.5px;letter-spacing:.1em;font-weight:700;text-transform:uppercase;color:var(--cobalt,#2448D8);margin-bottom:4px}" +
    ".ls-body{font-size:16px;line-height:1.6}.ls-body ul{padding-left:20px;margin:8px 0}.ls-body li{margin:6px 0}.ls-body p{margin:8px 0}" +
    ".ls-ex{border:1px solid var(--rule,#d9dde6);border-left:4px solid var(--cobalt,#2448D8);border-radius:4px;padding:12px 14px;margin:8px 0 10px;font-family:var(--mono,monospace);font-size:14px;line-height:1.7;background:var(--paper,#fff)}" +
    "@media (prefers-reduced-motion:reduce){.ls-step{animation:none}.ls-bar i{transition:none}}";
  document.head.appendChild(st);

  /* Lesson flow: one step on screen at a time, sliding smoothly to the next:
     lesson → question → lesson → question → ... → results. The questions are the level's real drill
     (same scoring, stars, review queue), so this replaces "read everything, then quiz". We start the normal
     runLevel() and take over the quiz() call it makes, so all scoring stays in app.js. */
  let pending = null;
  const origQuiz = quiz;
  window.quiz = function(opts){ if (!pending) return origQuiz.apply(this, arguments); const p = pending; pending = null; flow(p.tr, p.i, opts) };
  function lesson(tr, i){ pending = { tr, i }; try { runLevel(tr, i) } finally { pending = null } }

  function flow(tr, i, opts){
    const key = tr.id + ":" + i, teach = LESSONS[key].filter(c => !c.check), Q = opts.qs.map(shuffleOpts), steps = [];
    const per = Math.max(1, Math.ceil(Q.length / teach.length)); let qi = 0;
    teach.forEach(c => { steps.push({ t: "L", c }); if (c.ex && window.MA_REPS && window.MA_REPS[key] && window.MAPractice) steps.push({ t: "R" }); for (let k = 0; k < per && qi < Q.length; k++) steps.push({ t: "Q", q: Q[qi], raw: opts.qs[qi], n: qi++ }) });
    while (qi < Q.length) steps.push({ t: "Q", q: Q[qi], raw: opts.qs[qi], n: qi++ });
    const res = []; let s = 0;
    ev("lesson_open");
    function frame(inner){
      const pct = Math.round(s / steps.length * 100);
      openPanel(`<div class="label">${esc(tr.name)} · Level ${i + 1} · ${esc(tr.levels[i].n)}</div>
        <div class="ls-bar" aria-hidden="true"><i style="width:${pct}%"></i></div>
        <div class="ls-step">${inner}</div>`);
      requestAnimationFrame(() => { const b = panel.querySelector(".ls-bar i"); if (b) b.style.width = Math.round((s + 1) / steps.length * 100) + "%" });
    }
    function next(){ s++; if (s < steps.length) draw(); else done() }
    function draw(){
      const st = steps[s];
      if (st.t === "L") {
        const c = st.c;
        frame(`<div class="ls-kind">Lesson</div><h2>${c.h}</h2><div class="ls-body">${c.ex ? `<div class="ls-ex">${c.ex}</div>` : ""}${c.b || ""}</div>
          <div class="actions"><button class="btn" id="lsNext">${steps[s + 1] && steps[s + 1].t === "Q" ? "Try a question" : "Continue"}</button></div>`);
        const b = document.getElementById("lsNext"); b.onclick = next; b.focus({ preventScroll: true });
      } else if (st.t === "R") {
        frame(`<div class="ls-kind">Your turn</div><div id="rpMount"></div>`);
        MAPractice.mount(document.getElementById("rpMount"), key, { onNext: next });
      } else {
        const q = st.q;
        frame(`<div class="ls-kind">Question ${st.n + 1} of ${Q.length}</div><div class="q">${q.q}</div>
          <div class="opts">${q.o.map((o, k) => `<button class="opt" data-k="${k}"><span class="k">${"ABCD"[k]}</span><span>${o}</span></button>`).join("")}</div><div id="lsFb"></div>`);
        panel.querySelectorAll(".opt").forEach(b => b.onclick = () => {
          const ok = +b.dataset.k === q.a; res.push(ok);
          try { if (opts.onAnswer) opts.onAnswer(st.n, ok); if (!opts.noLog) logAnswer(st.raw, ok) } catch (e) {}
          panel.querySelectorAll(".opt").forEach(x => { x.disabled = true; if (+x.dataset.k === q.a) x.classList.add("right") });
          if (!ok) b.classList.add("wrong");
          const last = s === steps.length - 1;
          document.getElementById("lsFb").innerHTML = `<div class="why"><b>${ok ? "Correct." : "Not quite."}</b> ${q.w}</div><div class="actions"><button class="btn" id="lsNx">${last ? "See results" : steps[s + 1].t === "L" ? "Next lesson" : "Next question"}</button></div>`;
          const nx = document.getElementById("lsNx"); nx.onclick = next; nx.focus({ preventScroll: true });
          try { document.getElementById("lsFb").scrollIntoView({ behavior: "smooth", block: "nearest" }) } catch (e) {} });
      }
    }
    function done(){
      markSeen(key); ev("lesson_done");
      const c = res.filter(Boolean).length;
      panel.innerHTML = `<button class="close" aria-label="Close">×</button><div class="result">${opts.finish(c)}</div>`; bindClose();
      if (!panel.querySelector(".result .actions")) { panel.querySelector(".result").insertAdjacentHTML("beforeend", `<div class="actions"><button class="btn" id="okb">Done</button></div>`); document.getElementById("okb").onclick = closePanel }
      (panel.querySelector(".result .btn") || panel.querySelector(".close")).focus();
    }
    draw();
  }
  window.maLesson = (trId, i) => { const tr = (typeof T === "function") ? T(trId) : null; if (tr && LESSONS[trId + ":" + i]) lesson(tr, i) };

  const orig = showBrief;
  window.showBrief = function(tr, i){
    const key = tr.id + ":" + i;
    if (LESSONS[key] && !seen()[key]) return lesson(tr, i);
    orig.apply(this, arguments);
    if (LESSONS[key]) { const a = document.querySelector("#panel .actions") || document.querySelector(".actions");
      if (a && !a.querySelector("#lsAgain")) { const b = document.createElement("button"); b.className = "ghost outline"; b.id = "lsAgain"; b.type = "button"; b.textContent = "Lesson + questions";
        b.onclick = () => lesson(tr, i); const go = a.querySelector("#go"); go ? go.after(b) : a.appendChild(b) } }
  };
})();
