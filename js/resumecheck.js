/* resumecheck.js: instant, rule-based resume review (no AI, works offline and signed out).
   Returns the same shape the AI review uses, so resumeHTML() in app.js renders either:
   {score, score100, categories[{name,max,got,notes[{pts,why}]}], headline, strengths[], top_fixes[], bullets[], formatting[], instant:true} */
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
    return exp.filter(l => l.split(/\s+/).length >= 5 && !/\b(19|20)\d\d\b.*\b(19|20)\d\d\b/.test(l) && !/\|/.test(l));
  }

  /* Graded against the standard Wall Street one-page template (Education → Experience → Leadership & Activities → Skills & Interests).
     100 points in 6 categories; every lost point comes with the reason. */
  function review(text, role) {
    const t = String(text || "").replace(/ /g, " ").replace(/\r/g, "");
    const lines = t.split("\n").map(l => l.trim()).filter(Boolean);
    const words = t.split(/\s+/).filter(Boolean).length;
    const secs = sections(lines), names = secs.map(s => s.name);
    const bul = bulletsOf(lines, secs);
    const cats = [], strengths = [], rew = [];
    const cat = (name, max) => { const c = { name, max, got: max, notes: [] }; cats.push(c); return c; };
    const lose = (c, n, why) => { n = Math.min(n, c.got); if (n > 0) { c.got -= n; c.notes.push({ pts: -n, why }); } };
    const ok = (c, why) => c.notes.push({ pts: 0, why, ok: true });
    const idx = re => names.findIndex(n => re.test(n));
    const eduI = idx(/education/), expI = idx(/experience/), ldrI = idx(/leadership|activities|projects/), sklI = idx(/skill|interest|additional/);
    const top = (secs[0] ? secs[0].lines.slice(0, 4).join(" ") : "") + " " + lines.slice(0, 4).join(" ");

    // 1. Header (5)
    const H = cat("Header & contact", 5);
    if (!/[\w.+-]+@[\w-]+\.[\w.]+/.test(t)) lose(H, 2, "No email address at the top.");
    if (!/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(t)) lose(H, 1, "No phone number.");
    if (!/linkedin\.com/i.test(t)) lose(H, 1, "No LinkedIn URL (standard on Wall Street resumes).");
    if (!/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(top) && !/\|/.test(top)) lose(H, 1, "Header should be one line: City, ST | phone | email | LinkedIn.");
    if (H.got === 5) ok(H, "Complete one-line header.");

    // 2. Education (20)
    const E = cat("Education", 20);
    if (eduI < 0) lose(E, 20, "No Education section. On the template it's the first section.");
    else {
      if (expI >= 0 && expI < eduI) lose(E, 4, "Education should come first while you're in school.");
      else ok(E, "Education is first.");
      if (!/\b(B\.?S\.?|B\.?A\.?|BBA|Bachelor|B\.?Com|Candidate for)\b/i.test(t)) lose(E, 2, "State the degree (e.g. B.S. in Business Administration, Finance).");
      if (!/\b(expected|anticipated|candidate|graduat)[^\n]{0,30}(19|20)\d\d|\b(May|June|Dec(ember)?)\s+20\d\d/i.test(t)) lose(E, 3, "Add an expected graduation date (e.g. Expected May 2028).");
      const g = t.match(/\bGPA[^0-9]{0,12}([0-4]\.\d{1,2})|\b([0-4]\.\d{1,2})\s*\/\s*4\.0?/i), gpa = g ? parseFloat(g[1] || g[2]) : null;
      if (gpa === null) lose(E, 6, "No GPA. Banks screen on it; leaving it off reads as below 3.5.");
      else if (gpa < 3.3) lose(E, 4, `GPA ${gpa} is below most banks' ~3.5 screen. Consider a major GPA if it's higher.`);
      else if (gpa < 3.5) lose(E, 2, `GPA ${gpa} is close to the common 3.5 screen.`);
      else ok(E, `GPA ${gpa} clears the common 3.5 screen.`);
      if (!/coursework|courses/i.test(t)) lose(E, 2, "Add a 'Relevant Coursework' line (accounting, corporate finance, valuation).");
      if (!/honors|dean'?s list|scholar|award|scholarship/i.test(t)) lose(E, 2, "Add honors/awards (Dean's List, scholarships) if you have any.");
      if (!/SAT|ACT/.test(t)) lose(E, 1, "Optional: SAT/ACT if strong (1450+/32+) helps underclassmen.");
    }

    // 3. Experience (35)
    const X = cat("Experience & bullets", 35);
    if (expI < 0 && ldrI < 0) lose(X, 20, "No Experience section. Even part-time jobs or club roles belong here.");
    const dated = (t.match(/\b(19|20)\d\d\b\s*[–—-]\s*(\b(19|20)\d\d\b|Present|Current)|(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(19|20)\d\d\s*[–—-]/gi) || []).length;
    if (dated < 1) lose(X, 4, "Roles need date ranges on the right (e.g. Jun 2026 – Aug 2026).");
    if (!bul.length) lose(X, 15, "No bullet points found. Use 2–4 bullets per role.");
    else {
      const noNum = bul.filter(b => !/\d/.test(b)).length, weak = bul.filter(b => WEAK.some(w => w.test(b))).length, noVerb = bul.filter(b => !VERBS.test(b)).length;
      const pq = Math.round(100 * (bul.length - noNum) / bul.length), pv = Math.round(100 * (bul.length - noVerb) / bul.length);
      if (pq < 60) lose(X, Math.round((60 - pq) / 60 * 12), `Only ${pq}% of bullets are quantified (target 60%+). Add $, %, counts or sizes.`); else ok(X, `${pq}% of bullets are quantified.`);
      if (pv < 90) lose(X, Math.round((90 - pv) / 90 * 8), `${100 - pv}% of bullets don't start with an action verb.`); else ok(X, "Bullets lead with action verbs.");
      if (weak) lose(X, Math.min(6, weak * 2), `${weak} bullet${weak > 1 ? "s use" : " uses"} weak phrasing ("responsible for", "helped", "worked on").`);
      if (/\b(I|me|my)\b/.test(bul.join(" "))) lose(X, 2, "First-person words (I, me, my) in bullets.");
      if (bul.some(b => b.length > 220)) lose(X, 2, "Some bullets run past two lines.");
      if (!/\b(financ|invest|bank|capital|valuation|model|equity|fund|M&A|accounting|analyst)\w*/i.test(bul.join(" "))) lose(X, 3, "No finance-relevant work shows up in your bullets.");
      const worst = bul.map(b => ({ b, s: (WEAK.some(w => w.test(b)) ? 2 : 0) + (/\d/.test(b) ? 0 : 1) + (VERBS.test(b) ? 0 : 1) })).filter(x => x.s >= 2).sort((a, z) => z.s - a.s).slice(0, 4);
      for (const { b } of worst) {
        const issue = [WEAK.some(w => w.test(b)) && "weak opener", !/\d/.test(b) && "no number", !VERBS.test(b) && "no action verb"].filter(Boolean).join(", ");
        const sf = window.MA_SF ? window.MA_SF.bullet({ d: b }) : { line: b };
        let rw = sf.line || b; if (!/\d/.test(rw)) rw += " [add a number: how many / how much / % change]";
        if (rw !== b) rew.push({ original: b, issue: issue.charAt(0).toUpperCase() + issue.slice(1), rewrite: rw });
      }
    }

    // 4. Leadership & activities (10)
    const L = cat("Leadership & activities", 10);
    if (ldrI < 0) lose(L, 5, "Add a Leadership & Activities section (clubs, sports, student government).");
    if (!/\b(investment|finance|banking|consulting|economics|trading|stock|fund)\b[^\n]{0,40}\b(club|society|association|group|team|fund)\b|\bstock pitch|case competition/i.test(t)) lose(L, 3, "No finance club, student fund, stock pitch or case competition.");
    if (!/\b(president|vice president|vp|chair|head|captain|founder|co-founder|director|lead|treasurer)\b/i.test(t)) lose(L, 2, "No leadership title (President, Treasurer, Captain, Founder…).");
    if (L.got === 10) ok(L, "Leadership and finance involvement are clear.");

    // 5. Skills & interests (10)
    const K = cat("Skills & interests", 10);
    if (sklI < 0) lose(K, 4, "Add the last section: Skills & Interests (one or two lines).");
    if (!/\bexcel\b/i.test(t)) lose(K, 2, "List Excel (and PowerPoint).");
    if (!/\b(financial model|modeling|modelling|dcf|lbo|valuation|bloomberg|capital iq|factset|python|sql)\b/i.test(t)) lose(K, 2, "List a technical skill: financial modeling, Bloomberg, Capital IQ, Python…");
    if (!/interests?\s*:/i.test(t)) lose(K, 2, "Add 2–3 specific interests (conversation starters: 'marathon running', not 'reading').");
    if (K.got === 10) ok(K, "Skills and interests line is complete.");

    // 6. Formatting & length (20)
    const F = cat("Format & length", 20);
    if (words > 750) lose(F, 8, `~${words} words: almost certainly over one page. Wall Street resumes are exactly one page (~450–650 words).`);
    else if (words > 680) lose(F, 4, `~${words} words: likely tight on one page.`);
    else if (words < 180) lose(F, 6, `Only ~${words} words: the page will look empty. Add detail to each role.`);
    else if (words < 300) lose(F, 3, `~${words} words: a bit thin. A full page is ~450–650 words, so add a bullet or two per role.`);
    else ok(F, `~${words} words fits one page.`);
    if (/objective|summary|profile/.test(names.join(" "))) lose(F, 3, "Remove the Objective/Summary; it isn't on the Wall Street template.");
    const months = (t.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+(19|20)\d\d/g) || []);
    const abbr = months.filter(m => /^[A-Z][a-z]{2}\.?\s/.test(m)).length;
    if (abbr && months.length - abbr) lose(F, 2, "Mixed date styles (Jun 2026 vs June 2026). Pick one.");
    if (BUZZ.test(t)) lose(F, 2, `Buzzword "${t.match(BUZZ)[0]}". Show it with a result instead.`);
    if (/\b(references available|reference upon request)\b/i.test(t)) lose(F, 2, "Remove 'references available'.");
    if (/\b(photo|headshot|date of birth|age:)\b/i.test(t)) lose(F, 3, "No photo, age or birth date on U.S. finance resumes.");
    const order = [eduI, expI, ldrI, sklI].filter(i => i >= 0);
    if (order.some((v, i) => i && v < order[i - 1])) lose(F, 3, "Section order should be Education → Experience → Leadership → Skills & Interests.");

    if (/investment banking|private equity|restructuring/i.test(role || "") && !/\b(excel|model(ing|ling)?|valuation|dcf|lbo|financial statement|accounting)\b/i.test(t))
      lose(X, 3, "Nothing shows finance skills yet for this role.");

    const score100 = cats.reduce((a, c) => a + c.got, 0);
    const score = Math.max(1, Math.min(10, Math.round(score100 / 10)));
    cats.forEach(c => { if (c.got / c.max >= 0.85) strengths.push(`${c.name}: ${c.got}/${c.max}`); });
    const top_fixes = cats.flatMap(c => c.notes.filter(n => n.pts < 0).map(n => ({ ...n, c: c.name }))).sort((a, z) => a.pts - z.pts).slice(0, 5).map(n => `${n.why} (${n.pts} pts, ${n.c})`);
    const headline = score100 >= 85 ? "Recruiter-ready. Polish the last few points." : score100 >= 70 ? "Solid, but a banker would flag the items below." : score100 >= 55 ? "Needs work before you apply. Fix the biggest point losses first." : "Far from the Wall Street template. Rebuild it section by section.";
    return { score, score100, categories: cats, headline, strengths: strengths.slice(0, 3), top_fixes, bullets: rew, formatting: [], instant: true };
  }
  window.maResumeCheck = review;
})();
