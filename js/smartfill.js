/* smartfill.js: rule-based (no AI) versions of three features that used to call Claude:
   quiz mistake explanations, networking email drafts and profile writing help.
   Pure functions, no network, no invented facts. app.js calls window.MA_SF at click time. */
(function () {
  "use strict";
  const strip = (x) => String(x == null ? "" : x).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const low1 = (s) => (s && /^[A-Z][a-z]*(\s|$)/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  const noDot = (s) => String(s || "").trim().replace(/[.!\s]+$/, "");
  const first = (n) => String(n || "").trim().split(/\s+/)[0] || "";
  const listJoin = (a) => (a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]);

  /* ---------------- 1. quiz mistake explanations ---------------- */
  // pull one number out of an option like "$1,050", "−10%", "+$30", "2.5x"
  const num = (s) => {
    const t = strip(s).replace(/[−–]/g, "-").replace(/[,$\s]/g, "");
    const m = t.match(/^([+-]?)(\d+(\.\d+)?)(%|x|bps|bp|mm|m|bn|b|k)?$/i);
    return m ? parseFloat(m[1] + m[2]) : null;
  };
  const near = (a, b) => Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * 0.005);
  const qNums = (q) => (strip(q).replace(/[−–]/g, "-").replace(/,/g, "").match(/\d+(\.\d+)?/g) || []).map(Number);

  function numericMistake(q, pv, rv) {
    if (pv == null || rv == null || near(pv, rv)) return null;
    if (rv !== 0 && near(pv, -rv)) return "You got the size right but the sign backwards. Check which items add and which subtract.";
    const ins = qNums(q);
    for (const x of ins) {
      if (x === 0) continue;
      if (near(pv, rv + 2 * x) || near(pv, rv - 2 * x)) return `You flipped the sign on the ${x}: it should go the other way (added vs. subtracted).`;
      if (near(pv, rv + x)) return `You're ${x} too high: that item was double-counted or should have been taken out.`;
      if (near(pv, rv - x)) return `You're ${x} too low: that item was left out of the calculation.`;
    }
    if (ins.some((x) => near(pv, x))) return "You picked a number straight from the question. That's an input, not the answer, so there's one more step.";
    for (const x of ins) {
      if (x > 0 && x < 100) {
        const t = x / 100;
        if (near(pv, rv / (1 - t)) || near(pv, rv * (1 - t))) return `Your answer is off by exactly (1 − ${x}%). Check whether tax should be applied here.`;
      }
    }
    if (rv !== 0) {
      const r = pv / rv;
      if (near(r, 2) || near(r, 0.5)) return `You're off by a factor of 2. Look for something counted twice, or a step that should be halved.`;
      if (near(r, 10) || near(r, 0.1) || near(r, 100) || near(r, 0.01) || near(r, 1000) || near(r, 0.001)) return "The digits are right but the scale isn't. Check your units (%, decimals, thousands vs. millions).";
    }
    return pv > rv ? "Your number is too high. Re-check each step against the explanation above." : "Your number is too low. Re-check each step against the explanation above.";
  }

  const UP = /\b(rise|rises|increase|increases|higher|up|more|grows?|positive|accretive|expands?)\b/i;
  const DOWN = /\b(fall|falls|decrease|decreases|lower|down|less|shrinks?|negative|dilutive|contracts?)\b/i;
  const SAME = /\b(no change|doesn'?t change|unchanged|neutral|stays the same|no effect|nothing)\b/i;
  function wordMistake(pick, right) {
    const p = strip(pick), r = strip(right);
    if (/impossible to tell|can'?t tell|not enough|depends/i.test(p)) return "You had enough information to decide. The question gives what you need, so commit to the rule in the explanation.";
    if (/impossible to tell|can'?t tell|not enough|depends/i.test(r)) return "This one really does depend on facts the question doesn't give, so no single answer works.";
    if (SAME.test(p) && !SAME.test(r)) return "It does move. Trace the change through one step at a time and you'll see which line it hits.";
    if (SAME.test(r) && !SAME.test(p)) return "It actually doesn't move. The effects cancel out or never reach this line.";
    if ((UP.test(p) && DOWN.test(r)) || (DOWN.test(p) && UP.test(r))) return "Right idea, wrong direction. Re-trace the cause and effect: what goes up, and what does that push down?";
    if (/\b(always|never|doubles|all|only|guaranteed)\b/i.test(p) && !/\b(always|never|doubles|all|only|guaranteed)\b/i.test(r)) return "Your pick is too absolute. Finance rules almost always come with conditions, so watch for 'always', 'never' and 'doubles'.";
    return null;
  }

  // topic memory tricks: standard textbook rules, matched on keywords in the question
  const TRICKS = [
    [/enterprise value|\bEV\b/i, "EV = equity value + debt + preferred + minority interest − cash. Things owed to other investors add; cash subtracts."],
    [/retained earnings/i, "Retained earnings go up by net income and down by dividends."],
    [/\bWACC\b|cost of capital/i, "Debt's cost is after tax: rate × (1 − tax). Higher taxes make debt cheaper."],
    [/accreti|dilut/i, "All-stock deal: if the buyer's P/E is higher than the P/E it pays, it's accretive; lower, dilutive."],
    [/depreciation/i, "Depreciation cuts net income by D × (1 − tax), but cash goes up by D × tax because it isn't a cash cost."],
    [/working capital/i, "An increase in working capital uses cash, so it's subtracted on the cash flow statement."],
    [/free cash flow|\bFCF\b/i, "Unlevered FCF = EBIT × (1 − tax) + D&A − capex − change in working capital."],
    [/\bLBO\b|leveraged buyout/i, "LBO returns come from debt paydown, EBITDA growth and multiple expansion."],
    [/\bIRR\b|money multiple|\bMOIC\b/i, "Rule of 72: 2x in 5 years ≈ 15% IRR; 3x in 5 years ≈ 25%."],
    [/goodwill/i, "Goodwill = purchase price − fair value of net identifiable assets."],
    [/\bbond|yield|duration/i, "Bond prices and yields move in opposite directions."],
    [/\bP\/E\b|multiple/i, "Pick the multiple that matches the metric: EV with EBITDA/revenue, equity value with net income."],
    [/dividend/i, "Dividends reduce cash and retained earnings; they never hit the income statement."],
    [/inventory|\bLIFO\b|\bFIFO\b/i, "In rising prices, LIFO means higher COGS, lower taxes and lower inventory."],
    [/interest/i, "Interest expense is tax-deductible, so its hit to net income is interest × (1 − tax)."],
  ];

  function explain(raw, pickText, rightText) {
    const q = strip(raw && raw[0]), pick = strip(pickText), right = strip(rightText), why = strip(raw && raw[3]);
    const mistake =
      numericMistake(q, num(pick), num(right)) ||
      wordMistake(pick, right) ||
      `"${pick}" is tempting, but the deciding fact is: ${(why.match(/^[^.]+\.?/) || [why])[0] || "see the explanation above."}`;
    const hit = TRICKS.find(([re]) => re.test(q));
    return { mistake, trick: hit ? hit[1] : "" };
  }

  /* ---------------- 2. networking email drafts ---------------- */
  function cleanExtra(x) {
    let s = noDot(strip(x)).replace(/^(we|i)\s+(talked|spoke|chatted)\s+about\s+/i, "").replace(/^(we discussed|discussed|mention(ing)?|about)\s+/i, "");
    s = s.replace(/\btheir\b/gi, "your").replace(/\bthey\b/gi, "you");
    return low1(s);
  }
  function email(type, c, me) {
    c = c || {}; me = me || {};
    const to = first(c.name) || "there";
    const firm = (c.firm || "").trim();
    const where = firm ? ` at ${firm}` : "";
    const who = [me.name || "", ""].filter(Boolean)[0];
    const bits = [];
    if (me.grad) bits.push(`class of ${me.grad}`);
    const studying = me.major ? ` studying ${me.major}` : "";
    const school = me.school ? ` at ${me.school}` : "";
    const intro = `My name is ${who || "[your name]"}, and I'm a student${school}${studying}${bits.length ? ` (${bits.join(", ")})` : ""}.`;
    const target = me.target && !/not sure/i.test(me.target) ? low1(me.target) : "";
    const conn = noDot(strip(c.conn));
    const extra = cleanExtra(c.extra || "");
    const sign = `\n\nBest,\n${who || "[your name]"}`;
    let subject, body;
    if (type === "follow") {
      subject = `Following up${firm ? ` · ${firm}` : ""}`;
      body = `Hi ${to},\n\nI wanted to follow up on my earlier note in case it got buried. ${intro.replace(/^My name is [^,]+, and /, "As a reminder, ")} ${target ? `I'm preparing for ${target} recruiting, and ` : ""}I'd really value 15 minutes to hear about your path${where}.${extra ? ` I'd especially like to hear about ${extra}.` : ""}\n\nI'm flexible on timing and happy to work around your schedule. Thanks again for considering it.${sign}`;
    } else if (type === "thanks") {
      subject = "Thank you for your time";
      body = `Hi ${to},\n\nThank you for taking the time to speak with me. I really appreciated your insight into your work${where}.${extra ? ` I especially enjoyed hearing about ${extra}.` : ""}\n\n${target ? `Our conversation made me even more excited about ${target}, and ` : ""}I'll keep you posted on how recruiting goes. Thanks again.${sign}`;
    } else if (type === "referral") {
      subject = `Quick question${firm ? ` about ${firm}` : ""}`;
      body = `Hi ${to},\n\nThank you again for your help so far.${extra ? ` Our conversation about ${extra} made me even more interested in the team.` : ""} I'm planning to apply${firm ? ` to ${firm}` : ""}${target ? ` for ${target} roles` : ""}, and I wanted to ask whether you'd be comfortable referring me.\n\nI completely understand if that's not possible, and I'm happy to send my resume either way.${sign}`;
    } else {
      subject = `${me.school ? me.school + " student" : "Student"} reaching out${firm ? ` · ${firm}` : ""}`;
      body = `Hi ${to},\n\n${intro}${conn ? (/\balum/i.test(conn) ? ` I saw that you're a fellow${me.school ? " " + me.school : ""} alum, so I wanted to reach out.` : ` I found you through ${low1(conn)}.`) : ""} ${target ? `I'm interested in ${target}, and ` : ""}I'd love to hear about your experience${where}${c.role ? ` as ${/^[aeiou]/i.test(c.role) ? "an" : "a"} ${c.role}` : ""}.${extra ? ` I'd especially like to hear about ${extra}.` : ""}\n\nWould you have 15 minutes for a quick call in the next couple of weeks? I'm happy to work around your schedule.${sign}`;
    }
    return { subject, body: body.replace(/ {2,}/g, " ").replace(/ \n/g, "\n") };
  }

  /* ---------------- 3. profile writing help ---------------- */
  const BUZZ = /\b(passionate|driven|hard-?working|go-?getter|synerg(y|ies)|detail-oriented|self-starter|results-driven|team player|motivated|dynamic|guru|ninja|rockstar)\b\s*/gi;
  const FILLER = /\b(very|really|extremely|basically|actually|literally|successfully|various|a lot of|just)\b\s*/gi;
  function tighten(t, max) {
    const B = BUZZ.source.replace(/\\s\*$/, "");
    let s = strip(t).replace(/!+/g, ".").replace(FILLER, "").replace(new RegExp(B + "(?:,?\\s*(?:and|&|,)\\s*" + B + ")*\\s*", "gi"), "").replace(/\s+([,.;])/g, "$1").replace(/\s{2,}/g, " ").replace(/\b(a|an) (\w)/gi, (m, a, c) => (/[aeiou]/i.test(c) ? (a[0] === "A" ? "An " : "an ") : (a[0] === "A" ? "A " : "a ")) + c).replace(/\bI am\b/g, "I'm").replace(/\.{2,}/g, ".");
    s = s.replace(/(^|[.?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase());
    if (s.length > max) { const cut = s.slice(0, max); const end = cut.lastIndexOf(". "); s = end > 80 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "") + "."; }
    return s.trim();
  }
  function about(P, name, exp, cur) {
    if (cur && cur.trim()) return { about: tighten(cur, 550) };
    P = P || {}; exp = (exp || []).filter((e) => e && (e.t || e.o));
    const out = [];
    const school = (P.school || "").trim(), major = (P.major || "").trim(), grad = (P.grad || "").trim();
    if (school || major) out.push(`I'm ${major ? `${/^[aeiou]/i.test(major) ? "an" : "a"} ${major} student` : "a student"}${school ? ` at ${school}` : ""}${grad ? `, class of ${grad}` : ""}.`);
    const target = P.target && !/not sure/i.test(P.target) ? low1(P.target) : "";
    const open = (P.open || "").trim();
    if (target && open) out.push(`I'm working toward a career in ${target} and I'm open to ${low1(open)}.`);
    else if (target) out.push(`I'm working toward a career in ${target}.`);
    else if (open) out.push(`I'm open to ${low1(open)}.`);
    const role = (e) => `${e.t ? `${/^[aeiou]/i.test(e.t) ? "an" : "a"} ${e.t}` : "part of the team"}${e.o ? ` at ${e.o}` : ""}`;
    if (exp[0]) out.push(exp[0].cur ? `Right now I'm ${role(exp[0])}.` : `Most recently I was ${role(exp[0])}.`);
    if (exp[1]) out.push(`Before that, I was ${role(exp[1])}.`);
    const sk = (P.skills || []).filter(Boolean).slice(0, 4);
    if (sk.length) out.push(`I'm comfortable with ${listJoin(sk)}.`);
    if (!out.length) return { about: "", tip: "Add your school, major or target career first, then try again." };
    return { about: tighten(out.join(" "), 550) };
  }

  const PAST = { running: "Ran", leading: "Led", building: "Built", making: "Made", writing: "Wrote", teaching: "Taught", selling: "Sold", growing: "Grew", taking: "Took", managing: "Managed", creating: "Created", analyzing: "Analyzed", analysing: "Analysed", developing: "Developed", designing: "Designed", launching: "Launched", raising: "Raised", reducing: "Reduced", increasing: "Increased", improving: "Improved", modeling: "Modeled", preparing: "Prepared", researching: "Researched", presenting: "Presented", organizing: "Organized", coordinating: "Coordinated", supporting: "Supported", helping: "Helped", negotiating: "Negotiated", sourcing: "Sourced", valuing: "Valued", pitching: "Pitched", executing: "Executed", tracking: "Tracked", automating: "Automated", training: "Trained", delivering: "Delivered", producing: "Produced", conducting: "Conducted", performing: "Performed", completing: "Completed", advising: "Advised", recruiting: "Recruited", planning: "Planned", handling: "Handled", reviewing: "Reviewed", working: "Worked" };
  const ingToPast = (w) => PAST[w.toLowerCase()] || cap(w);
  const WEAK = [
    [/^(i\s+)?(was\s+)?responsible for\s+/i, "Owned "],
    [/^(i\s+)?(was\s+)?in charge of\s+/i, "Led "],
    [/^(i\s+)?(was\s+)?tasked with\s+/i, ""],
    [/^(my\s+)?(duties|responsibilities)\s+(included|include)\s*:?\s*/i, ""],
    [/^(i\s+)?helped with\s+/i, "Helped with "],
    [/^(i\s+)?helped to\s+/i, "Helped "],
    [/^(i\s+)?participated in\s+/i, "Took part in "],
    [/^(i\s+)?assisted (with|in)\s+/i, "Supported "],
    [/^i\s+/i, ""],
  ];
  const VERBS = /^(led|owned|built|created|managed|analy[sz]ed|developed|designed|ran|launched|grew|raised|cut|reduced|increased|improved|modeled|prepared|researched|wrote|presented|organized|coordinated|supported|helped|took|drove|negotiated|sourced|valued|pitched|executed|tracked|streamlined|automated|trained|taught|founded|co-founded|delivered|produced|conducted|performed|completed|won|earned|served|advised|recruited|planned|handled|reviewed|audited|forecast|built|made|sold)\b/i;
  function bullet(e) {
    let s = strip(e && e.d);
    if (!s) return { line: "", tip: "Write a few words about what you did first." };
    s = s.replace(/^[-•*\s]+/, "").split(/(?<=[.;])\s+|\n+/).map((p) => noDot(p)).filter(Boolean).slice(0, 3).join("; ");
    for (const [re, rep] of WEAK) if (re.test(s)) { const rest = s.replace(re, ""), g = rest.match(/^([A-Za-z]+ing)\b/); s = g && PAST[g[1].toLowerCase()] && !/^Helped/.test(rep) ? rest : rep + rest; break; }
    s = s.replace(/^([A-Za-z]+ing)\b/, (m) => ingToPast(m));
    s = s.replace(BUZZ, "").replace(FILLER, "").replace(/\s{2,}/g, " ").trim();
    s = cap(s);
    if (s.length > 220) s = s.slice(0, 220).replace(/[\s,;]+\S*$/, "");
    const tips = [];
    if (!/\d/.test(s)) tips.push("add a number (how many, how much, or % change)");
    if (!VERBS.test(s)) tips.push("start with a strong verb like Built, Led or Analyzed");
    return { line: s, tip: tips.length ? "Tip: " + tips.join(" and ") + "." : "" };
  }

  window.MA_SF = { explain, email, about, bullet };
})();
