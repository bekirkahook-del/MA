/* Lessons before drills (Nov 21, 2026). The first time a student opens a level, they get a short lesson:
   the idea, a worked example with numbers, the trap interviewers use, and one practice check with instant
   feedback (not graded). Then "Start drill". Later visits show the normal briefing with a "Lesson" button.
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
        b: "<p>Every company tells its story with three statements. Each one answers a different question:</p><ul><li><b>Income statement:</b> did we make money <i>over a period</i> (a quarter, a year)?</li><li><b>Balance sheet:</b> what do we own and owe <i>on one date</i>?</li><li><b>Cash flow statement:</b> where did the cash <i>actually</i> go?</li></ul><p>Profit and cash are different things. That gap is why the cash flow statement exists.</p>" },
      { h: "Worked example: a coffee shop's year",
        ex: "Sales $100 − costs $70 = <b>net income $30</b> (income statement)<br>But customers still owe $10, so cash from operations = 30 − 10 = <b>$20</b><br>Bought a $15 espresso machine: investing = <b>−$15</b><br>Cash change for the year = 20 − 15 = <b>+$5</b> → cash on the balance sheet goes up $5" ,
        b: "<p>Notice the shop earned $30 but only kept $5 of new cash. Unpaid customer bills and equipment purchases eat cash without hitting profit right away.</p>" },
      { h: "How they connect (interviewers test this)",
        b: "<ul><li>Net income is the <b>first line of the cash flow statement</b> and also adds to <b>retained earnings</b> on the balance sheet.</li><li><b>Ending cash</b> on the cash flow statement becomes <b>cash</b> on the balance sheet.</li><li>The balance sheet always balances: <b>assets = liabilities + equity</b>.</li></ul><p><b>Trap:</b> calling the balance sheet a report \"for the year\". It's a snapshot on one date.</p>" },
      { h: "Quick check", check: ["The coffee shop buys a $15 espresso machine. Which section of the cash flow statement shows it?", ["Operating", "Investing", "Financing"], 1, "Buying long-term equipment (capex) is an investing outflow."] }
    ],
    "f:1": [
      { h: "The most-asked accounting question",
        b: "<p>\"Depreciation goes up by $10. Walk me through the three statements.\"</p><p>Always answer in the same order: <b>income statement → cash flow statement → balance sheet</b>. The income statement changes net income, the cash flow statement turns that into cash, and the balance sheet has to balance at the end.</p><p>Assume a tax rate if none is given (40% keeps the math clean).</p>" },
      { h: "Worked example: depreciation +$10, 40% tax",
        ex: "<b>Income statement:</b> depreciation +10 → pre-tax income −10 → taxes −4 → <b>net income −6</b><br><b>Cash flow:</b> net income −6, add back depreciation +10 → <b>cash +4</b><br><b>Balance sheet:</b> cash +4, PP&amp;E −10 → assets −6. Retained earnings −6 → equity −6. <b>Balanced.</b>",
        b: "<p>Say it in that order, out loud, and land on \"it balances\". That's what they're listening for.</p>" },
      { h: "The trap",
        b: "<ul><li>Saying cash goes <b>down</b>. Depreciation isn't a cash payment. The only cash effect is the <b>tax you save</b>, so cash goes <b>up</b>.</li><li>Forgetting that <b>PP&amp;E falls</b> on the balance sheet. That's where the other −10 on the assets side comes from.</li></ul>" },
      { h: "Quick check", check: ["Same question, but the tax rate is 25%. Ending cash changes by:", ["−$2.50", "+$2.50", "+$7.50"], 1, "Taxes fall by 10 × 25% = $2.50, and that tax saving is the only cash effect."] }
    ],
    "f:2": [
      { h: "Two ways to value a company",
        b: "<ul><li><b>Equity value</b> = share price × diluted shares. What the <i>shareholders</i> own.</li><li><b>Enterprise value (EV)</b> = equity value + debt + preferred stock + noncontrolling interest − cash. What the <i>whole business</i> is worth to everyone who funded it.</li></ul>" },
      { h: "Worked example: buying a house",
        ex: "You pay the owner <b>$300</b> for their stake (equity value)<br>You also take over their <b>$200</b> mortgage (debt)<br>There's <b>$20</b> of cash left in a drawer, which is yours now<br>Real cost of the house = 300 + 200 − 20 = <b>$480</b> (enterprise value)",
        b: "<p>That's why debt is added and cash is subtracted: a buyer takes on the debt and gets the cash.</p>" },
      { h: "The traps",
        b: "<ul><li><b>Match the multiple:</b> EV goes with metrics that belong to everyone (EV/EBITDA, EV/revenue). Equity value goes with metrics after interest (P/E).</li><li><b>Raising cash doesn't change EV:</b> borrow $100 and keep it as cash → debt +100, cash +100 → EV is unchanged.</li></ul>" },
      { h: "Quick check", check: ["Equity value $800, debt $300, cash $100. Enterprise value is:", ["$1,000", "$1,200", "$600"], 0, "800 + 300 − 100 = $1,000."] }
    ],
    "f:3": [
      { h: "Three ways to value a business",
        b: "<ul><li><b>Trading comps:</b> what similar public companies trade at today.</li><li><b>Precedent transactions:</b> what buyers paid for similar companies in past deals.</li><li><b>DCF:</b> forecast the company's free cash flow and discount it back to today.</li></ul><p>Bankers show all three side by side on a <b>football field</b> chart.</p>" },
      { h: "Worked example: comps and precedents",
        ex: "Target EBITDA = <b>$50</b><br>Similar public companies trade at <b>10x</b> EBITDA → EV ≈ 10 × 50 = <b>$500</b><br>Buyers paid <b>12x</b> in recent deals → EV ≈ 12 × 50 = <b>$600</b>",
        b: "<p>Precedents usually come out higher because buyers pay a <b>control premium</b> to own the whole company.</p>" },
      { h: "DCF in one breath",
        b: "<p>Project <b>unlevered free cash flow</b> (cash before interest), discount it at <b>WACC</b> (the blended cost of debt and equity), then add a <b>terminal value</b> for every year after the forecast.</p><p><b>Trap:</b> the terminal value is often <b>more than half</b> of the total. Small changes in growth or the discount rate swing the answer a lot, so say that if asked about weaknesses.</p>" },
      { h: "Quick check", check: ["Peers trade at 8x EBITDA and the target's EBITDA is $25. Implied enterprise value:", ["$33", "$200", "$250"], 1, "8 × $25 = $200."] }
    ],
    "f:4": [
      { h: "Accretive or dilutive?",
        b: "<p>A merger model asks one question: after the deal, does the <b>buyer's earnings per share (EPS)</b> go up (<b>accretive</b>) or down (<b>dilutive</b>)?</p><p>Simple rule: if what the target earns per dollar you pay is <b>more</b> than what that dollar costs you, the deal is accretive.</p>" },
      { h: "What each dollar costs",
        b: "<ul><li><b>Cash:</b> the interest you give up, after tax.</li><li><b>Debt:</b> the interest rate × (1 − tax rate).</li><li><b>Stock:</b> the buyer's earnings yield = 1 ÷ buyer's P/E.</li></ul><p>What the target earns per dollar = 1 ÷ the P/E you pay for it.</p>" },
      { h: "Worked example",
        ex: "Buyer P/E <b>20x</b> → cost of stock = 1 ÷ 20 = <b>5%</b><br>You buy the target at <b>15x</b> earnings → it earns 1 ÷ 15 ≈ <b>6.7%</b> per dollar<br>6.7% &gt; 5% → <b>accretive</b><br>Paid with 8% debt at a 25% tax rate instead: cost = 8% × 0.75 = <b>6%</b> → 6.7% &gt; 6% → still accretive, barely",
        b: "<p>Shortcut for all-stock deals: if the buyer's P/E is higher than the P/E it pays, it's accretive.</p>" },
      { h: "Quick check", check: ["Buyer P/E 10x pays 16x for the target, all in stock. The deal is:", ["Accretive", "Dilutive", "Neutral"], 1, "Cost of stock = 1 ÷ 10 = 10%, but the target only earns 1 ÷ 16 ≈ 6.25% per dollar. Paying 10% for 6.25% is dilutive."] }
    ]
  };
  window.MA_LESSONS = LESSONS;

  const st = document.createElement("style");
  st.textContent = ".ls-dots{display:flex;gap:6px;margin:4px 0 14px}.ls-dots i{flex:1;height:4px;border-radius:2px;background:var(--rule,#d9dde6)}.ls-dots i.on{background:var(--cobalt,#2448D8)}" +
    ".ls-body{font-size:16px;line-height:1.55}.ls-body ul{padding-left:20px;margin:8px 0}.ls-body li{margin:6px 0}.ls-body p{margin:8px 0}" +
    ".ls-ex{border:1px solid var(--rule,#d9dde6);border-left:4px solid var(--cobalt,#2448D8);border-radius:12px;padding:12px 14px;margin:10px 0;font-family:var(--mono,monospace);font-size:14px;line-height:1.7;background:var(--paper,#fff)}" +
    ".ls-opts{display:grid;gap:8px;margin:12px 0}.ls-opts button{font:inherit;font-size:15.5px;text-align:left;padding:12px 14px;border-radius:12px;border:1px solid var(--rule,#d9dde6);background:var(--sheet,#fff);color:var(--ink,#111);cursor:pointer}" +
    ".ls-opts button.ok{border-color:var(--good,#1e8e3e);background:rgba(30,142,62,.08)}.ls-opts button.no{border-color:var(--bad,#c0392b);background:rgba(192,57,43,.07)}" +
    ".ls-why{font-size:15px;margin:6px 0 0}.ls-skip{font:inherit;font-size:13.5px;background:none;border:0;color:var(--ink-2,#555);text-decoration:underline;cursor:pointer}";
  document.head.appendChild(st);

  function lesson(tr, i, n){
    const key = tr.id + ":" + i, L = LESSONS[key], c = L[n], last = n === L.length - 1, lv = tr.levels[i];
    const dots = L.map((_, k) => `<i class="${k <= n ? "on" : ""}"></i>`).join("");
    let body = (c.ex ? `<div class="ls-ex">${c.ex}</div>` : "") + (c.b || "");
    if (c.check) body += `<p><b>${c.check[0]}</b></p><div class="ls-opts">${c.check[1].map((o, k) => `<button type="button" data-k="${k}">${o}</button>`).join("")}</div><div class="ls-why" aria-live="polite"></div>`;
    openPanel(`<div class="label">${tr.name} · Level ${i + 1} · Lesson ${n + 1}/${L.length}</div><div class="ls-dots" aria-hidden="true">${dots}</div>
      <h2>${c.h}</h2><div class="ls-body">${body}</div>
      <div class="actions">${n > 0 ? '<button class="ghost" id="lsBack">Back</button>' : ""}<button class="btn" id="lsNext">${last ? "Start drill · " + lvlN(tr) + " questions" : "Next"}</button>
      ${last ? "" : '<button type="button" class="ls-skip" id="lsSkip">Skip to the drill</button>'}</div>`);
    const q = s => document.getElementById(s);
    if (c.check) document.querySelectorAll(".ls-opts button").forEach(b => b.onclick = () => {
      const k = +b.dataset.k, right = k === c.check[2];
      document.querySelectorAll(".ls-opts button").forEach(x => { x.disabled = true; if (+x.dataset.k === c.check[2]) x.classList.add("ok") });
      if (!right) b.classList.add("no");
      document.querySelector(".ls-why").innerHTML = (right ? "<b>Right.</b> " : "<b>Not quite.</b> ") + c.check[3]; ev(right ? "lesson_check_ok" : "lesson_check_miss") });
    if (q("lsBack")) q("lsBack").onclick = () => lesson(tr, i, n - 1);
    if (q("lsSkip")) q("lsSkip").onclick = () => { markSeen(key); ev("lesson_skip"); runLevel(tr, i) };
    q("lsNext").onclick = () => { if (!last) return lesson(tr, i, n + 1); markSeen(key); ev("lesson_done"); runLevel(tr, i) };
    if (n === 0) ev("lesson_open");
  }
  window.maLesson = (trId, i) => { const tr = (typeof T === "function") ? T(trId) : null; if (tr && LESSONS[trId + ":" + i]) lesson(tr, i, 0) };

  const orig = showBrief;
  window.showBrief = function(tr, i){
    const key = tr.id + ":" + i;
    if (LESSONS[key] && !seen()[key]) return lesson(tr, i, 0);
    orig.apply(this, arguments);
    if (LESSONS[key]) { const a = document.querySelector("#panel .actions") || document.querySelector(".actions");
      if (a && !a.querySelector("#lsAgain")) { const b = document.createElement("button"); b.className = "ghost outline"; b.id = "lsAgain"; b.type = "button"; b.textContent = "Lesson";
        b.onclick = () => lesson(tr, i, 0); const go = a.querySelector("#go"); go ? go.after(b) : a.appendChild(b) } }
  };
})();
