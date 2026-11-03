/* M&A resume reader: pulls text out of a PDF / Word / text file and organizes it into profile fields.
   Works without AI. Handles typical student resumes and LinkedIn's "Save to PDF" export. */
(function(){
  const MON = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const MONTH = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Spring|Summer|Fall|Autumn|Winter)\\.?";
  const D = `(?:${MONTH},?\\s*'?\\d{2,4}|\\d{1,2}\\/\\d{2,4}|(?:19|20)\\d{2})`;
  const END = `(?:${D}|Present|Current|Now|Today|Ongoing)`;
  const RANGE = new RegExp(`(${D})\\s*(?:-|–|—|to|until)\\s*(?:Expected\\s+|Anticipated\\s+)?(${END})`, "i");
  const SINGLE = new RegExp(`(?:Expected|Anticipated|Graduat(?:ed|ing|ion)?:?)?\\s*\\b(${MONTH},?\\s*'?\\d{2,4})\\b`, "i");
  const DUR = /^\(?\s*(?:\d+\s+(?:years?|yrs?|months?|mos?))(?:\s+\d+\s+(?:months?|mos?))?\s*\)?$/i;
  const LOC = /\b([A-Z][a-zA-Z.]+(?:[ -][A-Z][a-zA-Z.]+){0,3}),\s*(A[LKZR]|C[AOT]|D[EC]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|PA|RI|S[CD]|T[NX]|UT|V[AT]|W[AIVY]|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|United Kingdom|UK|England|Canada|India|China|Hong Kong|Singapore)\b(?:,\s*(?:United States|USA|US))?/;
  const REMOTE = /^\s*(?:Remote|Hybrid|Virtual|On-?site)\s*$/i;
  const BULLET = /^\s*[•●▪◦‣∙·\-–*➢►■□○]\s*/;
  const TITLE_W = /\b(analyst|intern|internship|associate|president|vice|vp|member|director|manager|assistant|chair|chairman|treasurer|secretary|lead|leader|founder|co-founder|officer|consultant|representative|rep|coordinator|captain|tutor|volunteer|fellow|researcher|research assistant|trader|banker|engineer|developer|head|partner|ambassador|mentor|teaching assistant|ta|cashier|server|lifeguard|counselor|editor|writer|delegate|student|apprentice|clerk|specialist|summer analyst|portfolio manager)\b/i;
  const ORG_W = /\b(inc|llc|ltd|corp|corporation|company|co\.|capital|partners|bank|group|club|university|college|school|association|society|fund|holdings|advisors|advisory|securities|investments?|management|asset|equity|ventures|foundation|council|institute|labs?|technologies|consulting|& co|lp|llp|fraternity|sorority|chapter|team|committee|organization|center|centre|hospital|church)\b/i;
  const HEAD = [
    ["summary", /^(summary|profile|professional summary|objective|about|about me)$/i],
    ["edu", /^(education|academic background|academics|education & honors|education and honors)$/i],
    ["exp", /^(experience|work experience|professional experience|relevant experience|employment|employment history|work history|internships?|finance experience|investment experience|business experience|related experience)$/i],
    ["lead", /^(leadership|leadership experience|leadership & activities|leadership and activities|activities|extracurriculars?|extracurricular activities|involvement|campus involvement|leadership & involvement|leadership and involvement|activities & leadership|organizations|volunteer experience|volunteering|community service)$/i],
    ["proj", /^(projects?|relevant projects|academic projects|investment projects)$/i],
    ["skills", /^(skills|technical skills|top skills|skills & interests|skills and interests|skills, activities & interests|skills, activities and interests|additional information|additional|skills & certifications|skills and certifications|certifications|licenses & certifications|languages|interests|computer skills|software)$/i],
    ["honors", /^(honors|honors-awards|awards|honors & awards|honors and awards|awards & honors)$/i],
    ["contact", /^contact( information)?$/i],
  ];
  const clean = s => String(s || "").replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1").trim();
  const strip = s => clean(String(s).replace(BULLET, ""));
  const headKind = l => { const t = clean(l).replace(/[:|]+$/, "").trim(); if (t.length > 45) return null; for (const [k, re] of HEAD) if (re.test(t)) return k; return null; };

  function toMon(str, end) {
    if (!str) return "";
    const s = String(str).toLowerCase().replace(/\./g, "");
    if (/present|current|now|today|ongoing/.test(s)) return "";
    let y = (s.match(/(?:19|20)\d{2}/) || [])[0];
    if (!y) { const m2 = s.match(/'?(\d{2})\b/); if (m2) y = "20" + m2[1]; }
    const sl = s.match(/^(\d{1,2})\/(\d{2,4})$/);
    if (sl) { const mi = Math.min(12, Math.max(1, +sl[1])); const yy = sl[2].length === 2 ? "20" + sl[2] : sl[2]; return MON[mi - 1].replace(/^./, c => c.toUpperCase()) + " " + yy; }
    if (!y) return "";
    let mi = MON.findIndex(m => s.includes(m));
    if (mi < 0) { if (/spring/.test(s)) mi = end ? 4 : 0; else if (/summer/.test(s)) mi = end ? 7 : 5; else if (/fall|autumn/.test(s)) mi = end ? 11 : 8; else if (/winter/.test(s)) mi = end ? 1 : 11; }
    if (mi < 0) return (end ? "Dec " : "Jan ") + y;
    return MON[mi].replace(/^./, c => c.toUpperCase()) + " " + y;
  }

  /* ---------- text extraction ---------- */
  async function pdfLines(buf) {
    const pdfjs = await import("/vendor/pdfjs/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
    const doc = await pdfjs.getDocument({ data: buf, isEvalSupported: false }).promise;
    const main = [], side = [];
    for (let p = 1; p <= Math.min(doc.numPages, 6); p++) {
      const page = await doc.getPage(p); const vp = page.getViewport({ scale: 1 });
      const tc = await page.getTextContent();
      const items = tc.items.filter(it => it.str && it.str.trim()).map(it => ({ x: it.transform[4], y: vp.height - it.transform[5], w: it.width, h: Math.abs(it.transform[3]) || 10, s: it.str }));
      if (!items.length) continue;
      // Two-column layout (LinkedIn export): a narrow left sidebar whose text never crosses into the main column.
      const W = vp.width, cut = W * 0.33;
      const left = items.filter(i => i.x < cut - 10), crossing = left.filter(i => i.x + i.w > cut + 5), right = items.filter(i => i.x >= cut - 10);
      const twoCol = left.length >= 4 && right.length >= 8 && crossing.length <= Math.max(1, left.length * 0.08);
      const group = arr => { const rows = []; arr.sort((a, b) => a.y - b.y || a.x - b.x);
        for (const it of arr) { const r = rows.find(r => Math.abs(r.y - it.y) <= Math.max(2, it.h * 0.35)); if (r) r.items.push(it); else rows.push({ y: it.y, items: [it] }); }
        return rows.sort((a, b) => a.y - b.y).map(r => { r.items.sort((a, b) => a.x - b.x); let t = "", lastEnd = null;
          for (const it of r.items) { if (lastEnd !== null) { const gap = it.x - lastEnd; t += gap > it.h * 2.2 ? "   " : gap > it.h * 0.15 ? " " : ""; } t += it.s; lastEnd = it.x + it.w; } return t; }); };
      if (twoCol) { side.push(...group(left)); main.push(...group(right)); } else main.push(...group(items));
    }
    return { main, side };
  }
  async function docxText(buf) {
    if (!window.mammoth) await new Promise((res, rej) => { const s = document.createElement("script"); s.src = "/vendor/mammoth.browser.min.js"; s.onload = res; s.onerror = () => rej(new Error("Couldn't load the Word reader")); document.head.appendChild(s); });
    const r = await window.mammoth.extractRawText({ arrayBuffer: buf });
    return r.value;
  }
  async function readFile(file) {
    if (!file) throw new Error("No file");
    if (file.size > 8 * 1024 * 1024) throw new Error("That file is over 8 MB. Try a smaller PDF.");
    const name = file.name || "resume", ext = (name.split(".").pop() || "").toLowerCase();
    const buf = await file.arrayBuffer();
    if (ext === "pdf" || file.type === "application/pdf") { const { main, side } = await pdfLines(buf); const text = [...main, ...(side.length ? ["", ...side] : [])].join("\n"); if (text.replace(/\s/g, "").length < 40) throw new Error("This PDF looks like a scanned image, so there's no text to read. Try the Word version or paste the text."); return { text, main, side, name }; }
    if (ext === "docx") { const text = await docxText(buf); return { text, main: text.split(/\n/), side: [], name }; }
    if (ext === "doc") throw new Error("Old .doc files can't be read. Save it as .docx or PDF first.");
    const text = new TextDecoder().decode(buf); return { text, main: text.split(/\n/), side: [], name };
  }

  /* ---------- parsing ---------- */
  function sections(lines) {
    const out = { top: [] }; let cur = "top";
    for (const raw of lines) { const l = String(raw).replace(/ /g, " ").replace(/\s+$/, ""); if (!l.trim()) continue;
      const k = headKind(l); if (k) { cur = k; out[cur] = out[cur] || []; continue; }
      (out[cur] = out[cur] || []).push(l); }
    return out;
  }
  const isDateLine = l => RANGE.test(l) || (SINGLE.test(l) && clean(l).length < 70);
  const headerish = l => { const t = strip(l); return t && !BULLET.test(l) && t.length <= 90 && !/[.!]$/.test(t) && !DUR.test(t) };

  function splitParts(l) {
    let t = String(l).replace(/\u00a0/g, " ").replace(/\t+/g, "   ").replace(BULLET, "").trim().replace(RANGE, "   ").replace(SINGLE, "   ").replace(/\(\s*\d+\s+(?:years?|months?)[^)]*\)/gi, " ");
    let loc = ""; const lm = t.match(LOC); if (lm) { loc = lm[0]; t = t.replace(lm[0], " "); }
    if (/\bRemote\b/i.test(t) && t.replace(/\bRemote\b/i, "").trim()) { loc = loc || "Remote"; t = t.replace(/\bRemote\b/i, " "); }
    const parts = t.split(/\s{3,}|\s+[|·•]\s+|\s+[–—]\s+|\s+-\s+(?=[A-Z])/).map(clean).map(x => x.replace(/^[,|·–—-]+|[,|·–—-]+$/g, "").trim()).filter(x => x && !REMOTE.test(x) && !/^(expected|anticipated)$/i.test(x));
    return { parts, loc };
  }
  function pickTitleOrg(cands, prevOrg) {
    let list = cands.slice(); const atIdx = list.findIndex(c => / at /i.test(c) && TITLE_W.test(c.split(/ at /i)[0]));
    if (atIdx >= 0) { const [a, b] = list[atIdx].split(/ at /i); return { t: a, o: b }; }
    if (list.length === 1 && list[0].includes(",")) { const [a, ...b] = list[0].split(","); const rest = b.join(",").trim(); if (TITLE_W.test(a) && rest && !TITLE_W.test(rest)) return { t: a.trim(), o: rest }; if (TITLE_W.test(rest) && !TITLE_W.test(a)) return { t: rest, o: a.trim() }; }
    const score = c => (TITLE_W.test(c) ? 2 : 0) - (ORG_W.test(c) ? 1.5 : 0);
    if (list.length === 1) return score(list[0]) > 0 ? { t: list[0], o: prevOrg || "" } : { t: "", o: list[0] };
    list = list.slice(0, 3); let best = 0; list.forEach((c, i) => { if (score(c) > score(list[best])) best = i; });
    const t = list[best]; const o = list.filter((_, i) => i !== best).sort((a, b) => (ORG_W.test(b) ? 1 : 0) - (ORG_W.test(a) ? 1 : 0))[0] || prevOrg || "";
    return { t, o };
  }
  function parseEntries(lines, kind) {
    const L = lines.map(l => String(l)).filter(l => l.trim());
    const dIdx = L.map((l, i) => isDateLine(l) && !BULLET.test(l) ? i : -1).filter(i => i >= 0);
    const entries = []; let prevOrg = "", consumed = -1;
    const headStart = di => { let s = di, got = 0; for (let j = di - 1; j > consumed && j >= 0 && got < 3; j--) { const t = clean(L[j]); if (DUR.test(t)) { s = j; continue; } if (!headerish(L[j]) || isDateLine(L[j])) break; s = j; got++; } return s; };
    dIdx.forEach((di, n) => {
      const hs = headStart(di); const head = L.slice(hs, di + 1);
      const nextHs = n + 1 < dIdx.length ? headStart(dIdx[n + 1]) : L.length;
      let body = L.slice(di + 1, Math.max(di + 1, nextHs));
      const rm = (L[di].match(RANGE) || []); let s = "", e = "", cur = false;
      if (rm.length) { s = toMon(rm[1]); e = toMon(rm[2], true); cur = /present|current|now|today|ongoing/i.test(rm[2]); }
      else { const sm = L[di].match(SINGLE); if (sm) { const v = sm[1]; if (/summer|spring|fall|winter|autumn/i.test(v)) { s = toMon(v); e = toMon(v, true); } else { s = toMon(v); e = /expected|anticipated/i.test(L[di]) ? "" : toMon(v); } } }
      let cands = [], loc = "";
      for (const h of head) { const p = splitParts(h); cands.push(...p.parts); loc = loc || p.loc; }
      // a title written on the line right after a dated org line
      if (body.length && headerish(body[0]) && TITLE_W.test(body[0]) && !cands.some(c => TITLE_W.test(c)) && strip(body[0]).length <= 60) { cands.push(...splitParts(body[0]).parts); body = body.slice(1); }
      cands = cands.filter(c => !DUR.test(c) && !/^\(?\d+ (?:years?|months?)/i.test(c) && !LOC.test(c) && c.length >= 2);
      body = body.filter(b => !REMOTE.test(b) && !DUR.test(clean(b)) && !(LOC.test(b) && clean(b).length < 45 && clean(b).replace(LOC, "").replace(/[,\s]/g, "").length < 3));
      const { t, o } = pickTitleOrg(cands, prevOrg);
      if (o) prevOrg = o;
      let d = ""; const firstB = body.find(b => BULLET.test(b)) || body[0] || "";
      if (firstB) { let txt = strip(firstB); const idx = body.indexOf(firstB); let k = idx + 1;
        while (k < body.length && !BULLET.test(body[k]) && txt.length < 260 && !/[.!]$/.test(txt)) { txt += " " + strip(body[k]); k++; }
        d = txt.length > 300 ? txt.slice(0, 297).replace(/\s+\S*$/, "") + "…" : txt; }
      let T = t, O = o; if (kind === "proj" && !T && O) { T = O; O = "Independent project"; }
      if (T || O) entries.push({ t: T.slice(0, 60), o: O.slice(0, 60), s, e: cur ? "" : e, d, cur });
      consumed = Math.max(di, nextHs - 1);
    });
    return entries;
  }
  function parseEdu(lines) {
    const RAW = lines.filter(l => clean(l)); const L = RAW.map(clean); const r = { school: "", grad: "", major: "" };
    const sch = L.find(l => /\b(University|College|Institute|School|Academy|Polytechnic)\b/i.test(l) && !/high school/i.test(l)) || L.find(l => /\b(University|College|Institute|School|Academy)\b/i.test(l)) || "";
    if (sch) { const sp = splitParts(RAW[L.indexOf(sch)]).parts; let s = sp.find(p => /\b(University|College|Institute|School|Academy|Polytechnic)\b/i.test(p)) || sp[0] || ""; r.school = s.replace(/[,;]\s*$/, "").slice(0, 60); }
    const block = L.slice(Math.max(0, L.indexOf(sch)), L.indexOf(sch) + 6).join("\n") || L.join("\n");
    const years = (block.match(/\b(19|20)\d{2}\b/g) || []).map(Number).filter(y => y >= 1990 && y <= 2040);
    if (years.length) r.grad = String(Math.max(...years));
    const all = RAW.map(l => String(l).replace(/\t+/g, "   ").replace(/\u00a0/g, " ")).join("\n");
    let m = all.match(/(?:Specializ(?:ation|ing)|Concentrat(?:ion|ing)|Major(?:ing)?|Majors?)\s*(?:in|:)?\s*([A-Z][A-Za-z&' ]{2,40}?)(?=\s*(?:[;|·,(\n—–]|\s{2}|$|Minor|GPA|Expected|Anticipated|Graduat|\b(?:19|20)\d{2}))/);
    if (!m) m = all.match(/(?:Bachelor|Master|Associate)(?:'?s)?(?: of [A-Za-z ]+?)?\s*(?:-\s*[A-Z.]{2,5}\s*)?(?:,|\bin\b|–|-)\s*([A-Z][A-Za-z&' ]{2,40}?)(?=\s*(?:[;|·,(\n—–]|\s{2}|$|Minor|GPA|Expected|Anticipated|Graduat|\b(?:19|20)\d{2}))/);
    if (!m) m = all.match(/\b(?:B\.?S\.?B?\.?A?|B\.?A\.?|BBA|BSBA|M\.?S\.?|MBA)(?![A-Za-z])\.?\s*(?:,|\bin\b|–|-)\s*([A-Z][A-Za-z&' ]{2,40}?)(?=\s*(?:[;|·,(\n—–]|\s{2}|$|Minor|GPA|Expected|Anticipated|Graduat|\b(?:19|20)\d{2}))/);
    if (m) r.major = clean(m[1]).replace(/\s+(Expected|Anticipated|Graduat\w*|Jan\w*|Feb\w*|Mar\w*|Apr\w*|May|June?|July?|Aug\w*|Sep\w*|Oct\w*|Nov\w*|Dec\w*|Spring|Summer|Fall|Winter)\.?$/i, "").replace(/\s+(and|&)\s*$/i, "").slice(0, 60);
    if (/business administration/i.test(r.major)) { const sp = all.match(/(?:Specializ(?:ation|ing)|Concentration|Major)\s*(?:in|:)\s*([A-Z][A-Za-z&' ]{2,30})/); if (sp) r.major = clean(sp[1]); }
    return r;
  }
  function parseSkills(lines) {
    const out = [];
    for (const raw of lines) { let l = strip(raw); if (!l) continue;
      if (/^(interests?|hobbies|activities)\s*:/i.test(l)) continue;
      l = l.replace(/^[A-Za-z &/]{2,28}:\s*/, "");
      for (let p of l.split(/[,;|•·]|\s{3,}/)) { p = clean(p).replace(/\s*\((?:[^)]*\b(?:proficien\w*|fluent|native|bilingual|basic|conversational|intermediate|advanced|elementary|limited|professional working)\b[^)]*)\)/i, "").replace(/\.$/, "").trim();
        if (p.length >= 2 && p.length <= 30 && p.split(" ").length <= 4 && !/^(and|etc)$/i.test(p) && !/\d{4}/.test(p)) out.push(p); } }
    const seen = new Set(); return out.filter(x => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 10);
  }
  function parse(input) {
    const main = Array.isArray(input.main) ? input.main : String(input.text || input).split(/\n/);
    const side = input.side || [];
    const all = [...main, ...side].join("\n");
    const S = sections(main), SS = sections(side);
    const r = { name: "", headline: "", school: "", grad: "", major: "", location: "", about: "", linkedin: "", handshake: "", exp: [], skills: [] };
    const joined = all.replace(/-\s*\n\s*/g, "-").replace(/\n(?=[\w-]{2,}\s*\(LinkedIn\))/g, "");
    const li = joined.match(/linkedin\.com\/in\/([A-Za-z0-9_%-]{3,100})/i); if (li) r.linkedin = "https://www.linkedin.com/in/" + li[1].replace(/-+$/, "");
    const hs = joined.match(/(?:app\.)?joinhandshake\.com\/(?:stu\/)?profiles\/([A-Za-z0-9_-]{3,60})/i); if (hs) r.handshake = "https://app.joinhandshake.com/profiles/" + hs[1];
    const top = (S.top || []).map(clean).filter(Boolean);
    const isName = l => /^[A-Z][A-Za-z'’.-]+(?:\s+[A-Z][A-Za-z'’.-]*){1,3}$/.test(l) && !headKind(l) && !/\b(University|College|Resume|Curriculum|Vitae)\b/i.test(l);
    const nm0 = top[0] && /^[A-Z'’. -]+$/.test(top[0]) ? top[0].toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : top[0]; if (nm0 && isName(nm0)) r.name = nm0;
    const locLine = top.slice(0, 5).find(l => LOC.test(l)); if (locLine) { const m = locLine.match(LOC); r.location = clean(m[0].replace(/,\s*(United States|USA|US)$/i, "")).slice(0, 40); }
    const linked = /\(LinkedIn\)/i.test(all) || (SS.contact && SS.contact.length) || /^top skills$/im.test(side.join("\n"));
    if (linked && top[1] && !LOC.test(top[1]) && !/\S+@\S+\.\w|\(\d{3}\)|\d{3}[-.]\d{4}/.test(top[1])) r.headline = top[1].slice(0, 100);
    if (S.summary) { let a = S.summary.map(strip).join(" "); if (a.length > 600) { a = a.slice(0, 600); a = a.slice(0, Math.max(a.lastIndexOf(". ") + 1, 400)); } r.about = a.trim(); }
    const eduLines = S.edu || main.filter(l => /\b(University|College|Institute|School of|Academy)\b/i.test(l)).slice(0, 3);
    if (eduLines.length) Object.assign(r, Object.fromEntries(Object.entries(parseEdu(eduLines)).filter(([, v]) => v)));
    const ex = [...(S.exp || []), ...(S.lead || []), ...(S.proj || [])];
    if (S.exp) r.exp.push(...parseEntries(S.exp)); if (S.lead) r.exp.push(...parseEntries(S.lead)); if (S.proj) r.exp.push(...parseEntries(S.proj, "proj"));
    void ex;
    const loose = main.filter(l => /^\s*(?:technical\s+)?skills\s*:/i.test(l) || /^\s*(?:software|tools|programs)\s*:/i.test(l));
    const sk = [...(S.skills || []), ...(SS.skills || []), ...loose]; r.skills = parseSkills(sk);
    // keep current roles first, then most recent start date
    const key = e => { const m = String(e.s).match(/([A-Za-z]{3}) (\d{4})/); return m ? +m[2] * 12 + MON.indexOf(m[1].toLowerCase()) : (+String(e.s).match(/\d{4}/) || 0) * 12; };
    r.exp.sort((a, b) => (b.cur - a.cur) || key(b) - key(a));
    r.exp = r.exp.slice(0, 5).map(({ cur, ...e }) => e);
    if (!r.headline && r.major && r.school) r.headline = `${r.major} student at ${r.school.split(/,| - | – /)[0].trim()}`.slice(0, 100);
    return r;
  }
  window.maResume = { readFile, parse, _toMon: toMon };
  /* Career → Resume review: start with the resume saved on your profile */
  try { if (typeof renderResume === "function") { const _rr = renderResume; renderResume = function () { _rr.apply(this, arguments); try { const t = document.getElementById("resTxt"), r = (S.profile || {}).resume; if (t && !t.value && r && r.text) { t.value = r.text; t.dispatchEvent(new Event("input")); } } catch (e) {} }; } } catch (e) {}
})();
