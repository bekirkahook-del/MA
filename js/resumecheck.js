/* resumecheck.js: instant, rule-based resume review (no AI, works offline and signed out).
   Returns the same shape the AI review uses, so resumeHTML() in app.js renders either:
   {score, headline, strengths[], top_fixes[], bullets[{original, issue, rewrite}], formatting[], instant:true} */
(function () {
  "use strict";
  const VERBS = /^(led|owned|built|created|managed|analy[sz]ed|developed|designed|ran|launched|grew|raised|cut|reduced|increased|improved|modeled|modelled|prepared|researched|wrote|presented|organized|coordinated|supported|drove|negotiated|sourced|valued|pitched|executed|tracked|streamlined|automated|trained|taught|founded|co-founded|delivered|produced|conducted|performed|completed|won|earned|served|advised|recruited|planned|handled|reviewed|audited|forecast(ed)?|built|made|sold|generated|identified|evaluated|assessed|constructed|spearheaded|initiated|implemented|established|secured|directed|oversaw|mentored|collaborated|partnered|compiled|calculated|screened|underwrote|structured|drafted|authored|tutored|volunteered|interned|assisted|helped|worked|participated|managed|operated|achieved|expanded|launched|mobilized|optimized|programmed|coded|scaled|saved|boosted|accelerated|consolidated|synthesized|benchmarked|monitored|maintained|processed|resolved|translated|hosted|selected|elected|served)\b/i;
  const WEAK = [/\bresponsible for\b/i, /\bhelped (with|to)?\b/i, /\bassisted (with|in)?\b/i, /\bworked on\b/i, /\bparticipated in\b/i, /\bduties included\b/i, /\btasked with\b/i, /\bin charge of\b/i];
  const BUZZ = /\b(passionate|hard-?working|self-starter|go-?getter|detail-oriented|results-driven|team player|synergy|dynamic|motivated individual)\b/i;
  const HEAD = /^(education|experience|work experience|professional experience|leadership|leadership experience|activities|leadership & activities|skills|skills & interests|skills, activities & interests|additional|additional information|interests|projects|honors|awards|certifications|relevant coursework|coursework|summary|objective|profile)\b/i;

  function sections(lines) {
    const out = []; let cur = { name: "top", lines: [] };
    for (const l of lines) {
      if (HEAD.test(l) && l.length < 45) { out.push(cur); cur = { name: l.toLowerCase(), lines: [] }; }
      else cur.lines.push(l);
    }
    out.push(cur); return out;
  }
  // bullets: explicit bullet lines, or sentence-like lines inside experience/leadership sections
  function bulletsOf(lines, secs) {
    const marked = lines.filter(l => /^[•●▪◦‣\-–*·]\s*/.test(l)).map(l => l.replace(/^[•●▪◦‣\-–*·]\s*/, ""));
    if (marked.length >= 3) return marked;
    const exp = secs.filter(s => /experience|leadership|activities|projects/.test(s.name)).flatMap(s => s.lines);
    return exp.filter(l => l.split(/\s+/).length >= 7 && !/\b(19|20)\d\d\b.*\b(19|20)\d\d\b/.test(l) && !/\|/.test(l));
  }

  function review(text, role) {
    const t = String(text || "").replace(/ /g, " ").replace(/\r/g, "");
    const lines = t.split("\n").map(l => l.trim()).filter(Boolean);
    const words = t.split(/\s+/).filter(Boolean).length;
    const secs = sections(lines);
    const names = secs.map(s => s.name);
    const bul = bulletsOf(lines, secs);
    const fixes = [], strengths = [], fmt = [], rew = [];
    let score = 10;
    const pen = (n, msg, list = fixes) => { score -= n; list.push(msg); };

    // structure
    const eduIdx = names.findIndex(n => /education/.test(n)), expIdx = names.findIndex(n => /experience/.test(n));
    if (eduIdx < 0) pen(2, "Add an Education section with school, degree, expected graduation and GPA.");
    else if (expIdx >= 0 && expIdx < eduIdx) pen(1, "Put Education first. Banking recruiters expect it at the top while you're in school.");
    else strengths.push("Education leads the page, which is what banking recruiters expect.");
    if (eduIdx >= 0 && !/\bGPA\b|\b[234]\.\d{1,2}\s*\/\s*4/i.test(t)) pen(1, "Show your GPA (if it's 3.5+). A missing GPA usually reads as a low one.");
    if (expIdx < 0 && !names.some(n => /leadership|activities|projects/.test(n))) pen(2, "Add an Experience or Leadership section. Even a club role or part-time job counts.");
    if (!names.some(n => /skill|interest|additional/.test(n))) pen(1, "Add a short Skills & Interests line (Excel, modeling, languages, 2–3 real interests).", fmt);
    if (/objective|summary|profile/.test(names.join(" "))) pen(1, "Cut the Objective/Summary. Finance resumes skip it and use the space for experience.", fmt);
    if (words > 700) pen(2, `It's about ${words} words, which almost always spills past one page. Banking resumes are one page, so trim to ~450–650.`, fmt);
    else if (words < 250) pen(1, `Only about ${words} words. Add detail to each role (what you did and the result).`, fmt);
    else strengths.push(`Length looks right for one page (~${words} words).`);
    if (!/[\w.+-]+@[\w-]+\.[\w.]+/.test(t)) pen(1, "Add your email at the top.", fmt);
    if (!/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(t)) pen(0.5, "Add a phone number at the top.", fmt);
    if (/\b(I|me|my)\b/.test(bul.join(" "))) pen(1, "Drop first-person words (I, me, my) from bullets.", fmt);
    if (BUZZ.test(t)) pen(0.5, `Cut buzzwords like "${t.match(BUZZ)[0]}". Show it with a result instead.`, fmt);
    const months = (t.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(19|20)\d\d/g) || []);
    const abbr = months.filter(m => /^[A-Z][a-z]{2}\.?\s/.test(m)).length, full = months.length - abbr;
    if (abbr && full) pen(0.5, "Use one date style everywhere (e.g. all 'Jun 2026' or all 'June 2026').", fmt);

    // bullets
    if (bul.length) {
      const noNum = bul.filter(b => !/\d/.test(b)), weak = bul.filter(b => WEAK.some(w => w.test(b))), noVerb = bul.filter(b => !VERBS.test(b)), long = bul.filter(b => b.length > 220);
      const pctNum = Math.round(100 * (bul.length - noNum.length) / bul.length);
      if (pctNum < 50) pen(2, `Only ${pctNum}% of your bullets have a number. Add sizes, counts, dollars or % to at least half (e.g. "for a $40M deal", "for 12 clients", "cut time 30%").`);
      else strengths.push(`${pctNum}% of your bullets are quantified.`);
      if (weak.length) pen(Math.min(2, weak.length * 0.5), `${weak.length} bullet${weak.length > 1 ? "s use" : " uses"} weak openers like "responsible for" or "helped". Start with what you did: Built, Led, Analyzed.`);
      if (noVerb.length > bul.length / 3) pen(1, "Start every bullet with a strong past-tense verb (present tense only for a current role).");
      else if (!weak.length) strengths.push("Bullets start with action verbs.");
      if (long.length) pen(0.5, `${long.length} bullet${long.length > 1 ? "s run" : " runs"} past two lines. Keep each to 1–2 lines.`, fmt);
      // rewrites for the weakest bullets (smartfill.js does the honest rewrite: no invented facts)
      const worst = bul.map(b => ({ b, s: (WEAK.some(w => w.test(b)) ? 2 : 0) + (/\d/.test(b) ? 0 : 1) + (VERBS.test(b) ? 0 : 1) })).filter(x => x.s >= 2).sort((a, z) => z.s - a.s).slice(0, 4);
      for (const { b } of worst) {
        const issue = [WEAK.some(w => w.test(b)) && "weak opener", !/\d/.test(b) && "no number", !VERBS.test(b) && "no action verb"].filter(Boolean).join(", ");
        const sf = window.MA_SF ? window.MA_SF.bullet({ d: b }) : { line: b };
        let rw = sf.line || b; if (!/\d/.test(rw)) rw += " [add a number: how many / how much / % change]";
        if (rw !== b) rew.push({ original: b, issue: issue.charAt(0).toUpperCase() + issue.slice(1), rewrite: rw });
      }
    } else pen(1, "Couldn't find bullet points. Use 2–4 bullets under each role, each starting with a verb.", fmt);

    if (/investment banking|private equity|restructuring/i.test(role || "") && !/\b(excel|model(ing|ling)?|valuation|dcf|lbo|financial statement|accounting)\b/i.test(t))
      pen(1, "Nothing shows finance skills yet. Add Excel/modeling, a valuation course, a stock pitch or an investment club role.");

    score = Math.max(1, Math.min(10, Math.round(score)));
    const headline = score >= 8 ? "Solid base. A few quick fixes will make it recruiter-ready." : score >= 6 ? "Good start, but the fixes below will noticeably help." : "Needs work before you apply. Start with the first three fixes.";
    return { score, headline, strengths: strengths.slice(0, 3), top_fixes: fixes.slice(0, 5), bullets: rew, formatting: fmt.slice(0, 4), instant: true };
  }
  window.maResumeCheck = review;
})();
