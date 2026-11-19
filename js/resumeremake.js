/* resumeremake.js (Pro): rebuilds an uploaded resume into the standard Wall Street one-page template.
   1) Code pass: reorder sections, one-line header, drop objective/summary, clean + rewrite bullets (no invented facts),
      consistent dates, max 4 bullets per role, yellow [placeholders] wherever a fact is missing.
   2) AI pass (fast model): sharpens every bullet using only facts already in it; numbers it can't know become [X].
   Output is editable in place, scored before/after with maResumeCheck, and downloads as Word (.doc) or PDF (print). */
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const escH = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const BUL = /^\s*[•●▪◦‣∙·\-–*➢►■□○]\s*/;
  const KIND = [["drop", /^(summary|profile|professional summary|objective|career objective|about( me)?)$/i], ["edu", /^(education|academic background|academics|education & honors|education and honors)$/i],
    ["exp", /^(experience|work experience|professional experience|relevant experience|employment|work history|internships?|finance experience|investment experience|business experience)$/i],
    ["lead", /^(leadership|leadership experience|leadership & activities|leadership and activities|activities|extracurriculars?|involvement|campus involvement|leadership & involvement)$/i],
    ["proj", /^(projects?|relevant projects|academic projects|investment projects)$/i],
    ["skills", /^(skills|technical skills|skills & interests|skills and interests|skills, activities & interests|additional information|additional|interests|skills & certifications)$/i],
    ["honors", /^(honors|awards|honors & awards|honors and awards|awards & honors|certifications)$/i]];
  const MON = "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?";
  const DATE_RE = new RegExp(`((?:${MON}\\s+)?(?:19|20)\\d\\d|Summer \\d{4}|Spring \\d{4}|Fall \\d{4})\\s*[–—-]\\s*((?:${MON}\\s+)?(?:19|20)\\d\\d|Present|Current)|(?:(?:Expected|Anticipated)\\s+)?${MON}\\s+(?:19|20)\\d\\d|\\b(?:Summer|Spring|Fall) (?:19|20)\\d\\d\\b`, "i");
  const LOC_RE = /\b[A-Z][a-zA-Z.]+(?: [A-Z][a-zA-Z.]+)?,\s*[A-Z]{2}\b|\bRemote\b/;
  const ORGW = /^(Business|University|College|School|Partners|Capital|Union|Club|Bank|Group|LLC|Inc|Fund|Advisors|Management|Securities|Society|Association)$/;
  // "City, ST" at the end of a line; 1–2 words, but not an org word like "Business Columbus, OH"
  const tailLoc = l => { const m = l.match(/(?:^|\s)([A-Z][a-zA-Z.]+)(?: ([A-Z][a-zA-Z.]+))?,\s*([A-Z]{2})\s*$/); if (!m) return null; const city = m[2] && !ORGW.test(m[1]) ? m[1] + " " + m[2] : (m[2] || m[1]); return city + ", " + m[3]; };
  const shortMon = s => s.replace(new RegExp(MON, "g"), m => m.slice(0, 3)).replace(/\s*[–—-]\s*/, " – ");
  const ph = t => `[${t}]`;

  function kindOf(line) { const t = line.replace(/\s+/g, " ").replace(/[:|]+$/, "").trim(); if (t.length > 45) return null; for (const [k, re] of KIND) if (re.test(t)) return k; return null; }

  /* text -> {name, contact[], sections:{edu,exp,lead,proj,skills,honors}: [{head:[{l,r}], bullets:[]}] or lines} */
  function structure(text) {
    const lines = String(text || "").replace(/ /g, " ").split(/\r?\n/).map(l => l.replace(/[ ]+$/, "").trim()).filter(Boolean);
    const out = { name: "", contact: [], sec: {} }; let cur = "top", topLines = [];
    for (const l of lines) { const k = kindOf(l); if (k) { cur = k; out.sec[k] = out.sec[k] || []; continue; } if (cur === "top") topLines.push(l); else out.sec[cur].push(l); }
    out.name = (topLines[0] || "").replace(/\b([A-Z])([A-Z]+)\b/g, (m, a, b) => a + b.toLowerCase());
    out.contact = [topLines.slice(1).join(" | ").replace(/\s+/g, " ")];
    out.name = out.name.replace(/\s+/g, " ");
    // entries for exp / lead / proj
    for (const k of ["exp", "lead", "proj"]) {
      if (!out.sec[k]) continue; const ents = []; let e = null; const marked = out.sec[k].some(l => BUL.test(l));
      for (const l of out.sec[k]) {
        const isB = marked ? BUL.test(l) : (l.split(" ").length >= 6 && !DATE_RE.test(l));
        if (isB) { if (!e) { e = { head: [], bullets: [] }; ents.push(e); } e.bullets.push(l.replace(BUL, "").replace(/\s+/g, " ").trim()); }
        else { if (!e || e.bullets.length) { e = { head: [], bullets: [] }; ents.push(e); } e.head.push(l); }
      }
      out.sec[k] = ents;
    }
    return out;
  }
  // split "Org  City, ST" / "Title  Jun 2026 – Aug 2026" into left/right
  function splitLR(raw) {
    const parts = String(raw).split(/\t+|\s{2,}/).map(x => x.trim()).filter(Boolean);
    if (parts.length > 1) return { l: parts.slice(0, -1).join(" "), r: shortMon(parts[parts.length - 1]) };
    const l = String(raw).replace(/\s+/g, " ").trim();
    const d = l.match(DATE_RE); if (d && d.index > 0) return { l: l.replace(d[0], "").replace(/[\s,;|–—-]+$/, "").trim(), r: shortMon(d[0].trim()) };
    const loc = tailLoc(l); if (loc && l.length > loc.length + 2) return { l: l.slice(0, l.lastIndexOf(loc.split(",")[0])).replace(/[\s,;|–—-]+$/, "").trim(), r: loc };
    return { l, r: "" };
  }

  /* code pass */
  function improve(S) {
    const fixes = [];
    const R = { name: S.name || ph("Your Name"), contact: [], sections: [] };
    const all = S.contact.join(" ");
    const email = (all.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [])[0], phone = (all.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/) || [])[0];
    const li = (all.match(/linkedin\.com\/in\/[\w%-]+/i) || [])[0], lm = all.match(/\b([A-Z][a-zA-Z.]+(?: [A-Z][a-zA-Z.]+)?),\s*([A-Z]{2})\b/), loc = lm ? lm[0] : null;
    R.contact = [loc || ph("City, ST"), phone || ph("phone"), email || ph("email"), li || ph("linkedin.com/in/you")];
    if (!loc || !phone || !email || !li) fixes.push("Header rebuilt as one line: City, ST | phone | email | LinkedIn (fill the yellow parts).");
    if (S.sec.drop) fixes.push("Removed the Objective/Summary (not on the Wall Street template).");
    // Education
    const edu = (S.sec.edu || []).map(l => l.replace(BUL, ""));const sq = x => x.replace(/\s+/g, " ").trim();
    const eduHasGPA = edu.some(l => /GPA/i.test(l)), eduCourse = edu.some(l => /coursework|courses/i.test(l)), honors = (S.sec.honors || []).map(l => l.replace(BUL, ""));
    const eduEnt = { head: [], bullets: [] };
    edu.forEach((l, i) => { if (i < 2 && !/GPA|coursework|honors|dean|SAT|ACT/i.test(l)) eduEnt.head.push(splitLR(l)); else eduEnt.bullets.push(sq(l)); });
    if (!eduEnt.head.length) eduEnt.head.push({ l: ph("University Name"), r: ph("City, ST") }, { l: ph("B.S. in Finance"), r: ph("Expected May 20XX") });
    if (!eduHasGPA) { eduEnt.bullets.unshift(`GPA: ${ph("x.xx")}/4.00 ${ph("include if 3.5+")}`); fixes.push("Added a GPA line (fill it in if it's 3.5 or higher)."); }
    if (honors.length) { eduEnt.bullets.push("Honors: " + honors.join("; ")); fixes.push("Moved Honors into Education."); }
    if (!eduCourse) { eduEnt.bullets.push(`Relevant Coursework: ${ph("Financial Accounting, Corporate Finance, Valuation")}`); fixes.push("Added a Relevant Coursework line."); }
    R.sections.push({ t: "Education", ents: [eduEnt] });
    // Experience / leadership / projects
    let bulletFix = 0, numPh = 0, cut = 0;
    const fixEnt = e => {
      const head = e.head.map(splitLR);
      let bs = e.bullets.map(b => {
        let x = b.replace(/\b(I|my|me)\b\s*/g, "").replace(/\.$/, "").trim();
        const sf = window.MA_SF ? window.MA_SF.bullet({ d: x }) : { line: x };
        const y = (sf.line || x).replace(/\.$/, "");
        if (y !== b.replace(/\.$/, "")) bulletFix++;
        if (!/\d/.test(y)) { numPh++; return y + " " + ph("add a number"); }
        return y;
      });
      if (bs.length > 4) { cut += bs.length - 4; bs = bs.slice(0, 4); }
      return { head, bullets: bs };
    };
    if (S.sec.exp && S.sec.exp.length) R.sections.push({ t: "Experience", ents: S.sec.exp.map(fixEnt) });
    else { R.sections.push({ t: "Experience", ents: [{ head: [{ l: ph("Company"), r: ph("City, ST") }, { l: ph("Role"), r: ph("Mon 20XX – Mon 20XX") }], bullets: [ph("Action verb + what you did + result with a number")] }] }); fixes.push("Added an Experience section template."); }
    const lead = [...(S.sec.lead || []), ...(S.sec.proj || [])];
    if (lead.length) R.sections.push({ t: "Leadership & Activities", ents: lead.map(fixEnt) });
    else { R.sections.push({ t: "Leadership & Activities", ents: [{ head: [{ l: ph("Investment / finance club"), r: ph("City, ST") }, { l: ph("Title"), r: ph("Mon 20XX – Present") }], bullets: [ph("What you led or built, with a number")] }] }); fixes.push("Added a Leadership & Activities section (finance club, sport, student org)."); }
    if (bulletFix) fixes.push(`Rewrote ${bulletFix} bullet${bulletFix > 1 ? "s" : ""} to start with action verbs and drop weak phrasing.`);
    if (numPh) fixes.push(`Marked ${numPh} bullet${numPh > 1 ? "s" : ""} that need a number (yellow): add $, %, counts or sizes.`);
    if (cut) fixes.push(`Trimmed ${cut} extra bullet${cut > 1 ? "s" : ""} (max 4 per role keeps it to one page).`);
    // Skills & interests
    const sk = (S.sec.skills || []).map(l => l.replace(BUL, "").replace(/\s+/g, " ").trim());
    let skills = sk.find(l => /^(technical\s+)?skills?\s*:/i.test(l)), inter = sk.find(l => /^interests?\s*:/i.test(l));
    const rest = sk.filter(l => l !== skills && l !== inter);
    if (!skills) skills = "Skills: " + (rest.length ? rest.join("; ") : ph("Excel, PowerPoint, financial modeling, Bloomberg"));
    if (!/excel/i.test(skills)) skills += "; Excel"; if (!inter) { inter = `Interests: ${ph("2–3 specific interests, e.g. marathon running, chess")}`; fixes.push("Added an Interests line (great conversation starters)."); }
    R.sections.push({ t: "Skills & Interests", ents: [{ head: [], bullets: [skills, inter], plain: true }] });
    fixes.push("Reordered to Education → Experience → Leadership & Activities → Skills & Interests, one page, standard fonts.");
    return { R, fixes };
  }

  /* AI pass: bullets only, strict no-invention rules */
  async function aiPolish(R) {
    const items = []; R.sections.forEach((s, si) => { if (s.t === "Education" || s.t === "Skills & Interests") return; s.ents.forEach((e, ei) => e.bullets.forEach((b, bi) => { if (!/^\[.*\]$/.test(b)) items.push({ si, ei, bi, role: e.head.map(h => h.l).join(" — "), b }); })); });
    if (!items.length) return 0;
    await samplePromise; if (!SAMPLE) throw new Error("signin");
    const r = await SAMPLE.json(`You are a senior investment banking recruiter rewriting resume bullets for a college student's Wall Street resume.
Rules: start with a strong past-tense action verb (present tense only if the role is current); one line, max 140 characters; lead with impact; keep EVERY fact, name and number exactly as given; NEVER invent numbers, results, tools or facts. If a bullet needs a number it doesn't have, insert a short placeholder in square brackets like [X] or [$X] or [X%]. Remove filler words. No first person.
Bullets (JSON): ${JSON.stringify(items.map((x, i) => ({ i, role: x.role, text: x.b.replace(/\s*\[add a number\]$/, "") })))}
Return JSON: {"bullets":[{"i": number, "text": "rewritten bullet"}]}`, { modelTier: "quick" });
    let n = 0; (r && r.bullets || []).forEach(o => { const it = items[o.i]; if (!it || !o.text) return; const t = String(o.text).trim().replace(/\.$/, "").slice(0, 200);
      // safety: every number in the original must survive
      const nums = (it.b.match(/\d[\d,.]*/g) || []); if (nums.some(x => !t.includes(x.replace(/[.,]$/, "")))) return;
      R.sections[it.si].ents[it.ei].bullets[it.bi] = t; n++; });
    return n;
  }

  const CSS = `.rs-doc{font-family:"Times New Roman",Times,serif;color:#000;background:#fff;max-width:8.5in;margin:0 auto;padding:.5in .6in;font-size:10.5pt;line-height:1.22;box-shadow:0 1px 6px rgba(0,0,0,.12);border-radius:4px}
.rs-doc h1,.rs-doc h2,.rs-doc b{font-family:"Times New Roman",Times,serif!important;color:#000!important}.rs-doc h1{font-size:16pt;text-align:center;margin:0;font-weight:700;letter-spacing:.02em}.rs-doc .ct{text-align:center;margin:2px 0 6px}
.rs-doc h2{font-size:10.5pt;text-transform:uppercase;font-weight:700;border-bottom:1px solid #000;margin:8px 0 3px;padding-bottom:1px;letter-spacing:.04em}
.rs-doc .hr{display:flex;justify-content:space-between;gap:10px}.rs-doc .hr.o b{font-weight:700}.rs-doc .hr.t span:first-child{font-style:italic}
.rs-doc ul{margin:1px 0 4px;padding-left:18px}.rs-doc li{margin:0}.rs-doc ul.plain{list-style:none;padding-left:0}
.rs-doc .ph{background:#fff3a3;border-radius:2px}`;

  function html(R) {
    const p = s => escH(s).replace(/\[([^\]]+)\]/g, '<span class="ph">[$1]</span>');
    return `<div class="rs-doc" contenteditable="true" spellcheck="true"><h1>${p(R.name)}</h1><div class="ct">${R.contact.map(p).join(" | ")}</div>
${R.sections.map(s => `<h2>${escH(s.t)}</h2>${s.ents.map(e => `${e.head.map((h, i) => `<div class="hr ${i ? "t" : "o"}"><span>${i ? p(h.l) : `<b>${p(h.l)}</b>`}</span><span>${p(h.r)}</span></div>`).join("")}<ul class="${e.plain ? "plain" : ""}">${e.bullets.map(b => `<li>${p(b)}</li>`).join("")}</ul>`).join("")}`).join("")}</div>`;
  }
  const textOf = el => el.innerText;

  function download(el, name) {
    const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:.5in .6in}${CSS.replace(/box-shadow[^;]+;|max-width[^;]+;|padding:\.5in \.6in;/g, "")}.ph{background:none}</style></head><body>${el.outerHTML.replace(' contenteditable="true"', "")}</body></html>`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + doc], { type: "application/msword" })); a.download = (name || "Resume") + " - Wall Street.doc"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function printPDF(el) {
    const w = window.open("", "_blank"); if (!w) { toast("Allow pop-ups to save as PDF"); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Resume</title><style>@page{size:letter;margin:0}body{margin:0}${CSS}.rs-doc{box-shadow:none;border-radius:0}.ph{background:none}</style></head><body>${el.outerHTML.replace(' contenteditable="true"', "")}<script>setTimeout(()=>print(),300)<\/script></body></html>`); w.document.close();
  }

  async function open() {
    if (!(typeof isPro === "function" && isPro())) { upgrade("The resume remaker is part of Pro"); return; }
    const src = (($("#resTxt") || {}).value || ((S.profile || {}).resume || {}).text || "").trim();
    if (src.split(/\s+/).length < 35) { toast("Upload your resume first"); return; }
    const before = window.maResumeCheck ? maResumeCheck(src) : null;
    const { R, fixes } = improve(structure(src));
    openPanel(`<div class="label">Resume remaker · Pro</div><h2>Your Wall Street resume</h2><p class="sub" id="rsSub">Rebuilt on the standard template. AI is sharpening every bullet…</p>
      <div class="rs-score" id="rsScore"></div><style>${CSS}.rs-score{display:flex;gap:10px;align-items:center;margin:0 0 10px;font-size:15px}.rs-fx{font-size:14px;line-height:1.5;margin:8px 0 14px;padding-left:18px}</style>
      <ul class="rs-fx" id="rsFx">${fixes.map(f => `<li>${escH(f)}</li>`).join("")}</ul>
      <div class="actions" style="margin:0 0 12px"><button class="btn" id="rsDoc">Download Word</button><button class="ghost" id="rsPdf">Save as PDF</button><button class="ghost" id="rsUse">Use as my resume</button></div>
      <p class="note">Click anywhere on the page to edit. Fill the <span style="background:#fff3a3">yellow</span> parts with your real facts; never put numbers you can't back up.</p>
      <div id="rsWrap">${html(R)}</div>`);
    try { panel.classList.add("wide"); } catch (e) {}
    const score = () => { const el = $("#rsWrap .rs-doc"); if (!el || !window.maResumeCheck) return; const t = textOf(el).replace(/\[[^\]]*\]/g, "");
      const a = maResumeCheck(t); $("#rsScore").innerHTML = before ? `<span class="note">Score</span> <b>${before.score100}</b> → <b style="color:var(--good)">${a.score100}/100</b> <span class="note">(placeholders count as missing until you fill them)</span>` : ""; };
    const bind = () => { const el = $("#rsWrap .rs-doc"); let t; el.addEventListener("input", () => { clearTimeout(t); t = setTimeout(score, 500); });
      $("#rsDoc").onclick = () => download($("#rsWrap .rs-doc"), R.name.replace(/[^\w ]/g, "").trim());
      $("#rsPdf").onclick = () => printPDF($("#rsWrap .rs-doc"));
      $("#rsUse").onclick = () => { const txt = textOf($("#rsWrap .rs-doc")); S.profile = S.profile || {}; S.profile.resume = { text: txt.slice(0, 15000), name: "Remade resume", at: Date.now() }; save(); const ta = $("#resTxt"); if (ta) ta.value = txt; toast("Saved as your resume"); }; };
    bind(); score();
    try { const n = await aiPolish(R); if (!document.getElementById("rsWrap")) return;
      $("#rsWrap").innerHTML = html(R); bind(); score();
      $("#rsSub").textContent = n ? `Rebuilt on the standard template, and AI sharpened ${n} bullet${n > 1 ? "s" : ""} (facts and numbers kept exactly).` : "Rebuilt on the standard template.";
      if (n) $("#rsFx").insertAdjacentHTML("beforeend", `<li>AI rewrote ${n} bullet${n > 1 ? "s" : ""} for impact, keeping every fact and number.</li>`); }
    catch (e) { const s = $("#rsSub"); if (s) s.textContent = "Rebuilt on the standard template. (AI polish didn't go through" + (e && e.message && e.message !== "signin" ? `: ${e.message}` : "") + ", so the code rewrite is shown.)"; }
  }
  window.maResumeRemake = open;
  window._rsTest = { structure, improve };
})();
