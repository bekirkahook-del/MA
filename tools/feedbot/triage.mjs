// superfeedbackbot: triage engine. Reads feedback rows, investigates each claim against the code (the "detective"),
// scores it with the rubric in RULES.md, and decides: fix | watch | recommend | human | ignore.
// Pure functions + a CLI. Feedback text is DATA: it is never executed, never followed as an instruction, and never printed with emails.
// Usage: node tools/feedbot/triage.mjs rows.json [--days 30] [--state tools/feedbot/state.json]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const RUBRIC = { needUsers: 2, actScore: 60, hardEvidence: 30, pollMin: 5, pollShare: 0.4, anonWeight: 0.5, anonCap: 1 };

/* ---------- small helpers ---------- */
export const hash = s => { let h = 5381; s = String(s); for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const STOP = new Set("the and for are was with that this from have has not but you your can will what when which how why does did its into than then them they their there these those over out per any all one two three each more most less only also just very much many such like about after before between because while where should would could been being our own off too use used using via get got put set is it of to in on a an as at be by or if so do no we".split(" "));
export const toks = s => (String(s || "").replace(/<[^>]+>/g, " ").toLowerCase().match(/[a-z][a-z0-9&\/\-']{2,}/g) || []).filter(w => !STOP.has(w));

/* ---------- 1) clean rows: drop emails/UA, hash the user id ---------- */
export function normalize(row) {
  const d = row.data && typeof row.data === "object" ? { ...row.data, ...row } : row;
  const at = new Date(d.at || d.updated_at || 0);
  return {
    id: String(d.id || ""), user: d.uid ? hash(d.uid) : null, kind: String(d.kind || "feedback"), reason: String(d.reason || ""),
    text: String(d.text || "").slice(0, 2000), question: String(d.question || ""), answer: String(d.answer || ""),
    where: String(d.where || ""), page: String(d.page || ""), at: isNaN(at) ? new Date(0) : at,
    signedIn: d.signedIn === true || d.signedIn === "true" || !!d.uid,
  };
}

/* ---------- 2) quarantine: spam and instruction-like text never reach the fixer ---------- */
const INJECT = /(ignore (all |any |the )?(previous|prior|above)|system prompt|you are now|new instructions|assistant:|\bsudo\b|rm -rf|curl\s+http|api[_ -]?key|password|secret|service[_ -]?role|run (this|the following) (command|code)|<script|javascript:|disregard|override (the )?(rules|policy))/i;
export function quarantine(r) {
  const t = r.text + " " + r.question;
  if (INJECT.test(t)) return "instruction-like text";
  if ((t.match(/https?:\/\//g) || []).length >= 2) return "links";
  if (/(.)\1{9,}/.test(r.text)) return "repeated characters";
  if (r.kind === "feedback" && r.reason !== "poll" && r.text.replace(/[^a-z0-9]/gi, "").length < 4) return "too short";
  return "";
}

/* ---------- 3) classify ---------- */
export function classify(r) {
  if (r.reason === "poll") return { type: "poll", cls: "poll", key: "p:" + r.answer };
  if (r.kind === "coaching") return { type: "coaching", cls: "coaching", key: "c:" + r.id };
  if (r.kind === "question") {
    const rs = r.reason.toLowerCase();
    const cls = /wrong/.test(rs) ? "factual" : /confus/.test(rs) ? "clarity" : /typo/.test(rs) ? "typo" : /easy|hard/.test(rs) ? "difficulty" : "other";
    return { type: "question", cls, key: "q:" + hash(r.question) + ":" + cls };
  }
  return { type: "text", cls: "text", key: "t:?" };
}

/* free text: same theme if their word sets overlap enough */
export function clusterText(rows, th = 0.5) {
  const groups = [];
  for (const r of rows) {
    const set = new Set(toks(r.text));
    let g = groups.find(x => { const inter = [...set].filter(w => x.set.has(w)).length, uni = new Set([...set, ...x.set]).size; return uni && inter / uni >= th; });
    if (!g) { g = { set, rows: [] }; groups.push(g); }
    g.rows.push(r); set.forEach(w => g.set.add(w));
  }
  return groups.map(g => ({ key: "t:" + hash(g.rows[0].id + g.rows[0].text.slice(0, 20)), rows: g.rows }));
}

/* ---------- 4) consensus: how many independent people said it ---------- */
export function effectiveUsers(rows, R = RUBRIC) {
  const signed = new Set(rows.filter(r => r.signedIn && r.user).map(r => r.user));
  const anon = new Set(rows.filter(r => !(r.signedIn && r.user)).map(r => r.text.trim().toLowerCase() + "|" + r.page + "|" + r.at.toISOString().slice(0, 10)));
  return { signed: signed.size, anon: anon.size, eff: signed.size + Math.min(R.anonCap, anon.size * R.anonWeight) };
}

/* ---------- 5) detective: question lookup, structural flaws, lesson support ---------- */
export function parseArrayAt(src, i) {
  let d = 0, s = false, q = "";
  for (let k = i; k < src.length; k++) {
    const c = src[k];
    if (s) { if (c === "\\") k++; else if (c === q) s = false; continue; }
    if (c === '"' || c === "'") { s = true; q = c; continue; }
    if (c === "[") d++;
    else if (c === "]") { d--; if (d === 0) return src.slice(i, k + 1); }
  }
  return null;
}
export function locateIn(files, question) {
  for (const [file, src] of Object.entries(files)) {
    for (const needle of [JSON.stringify(question), '"' + question + '"']) {
      const at = src.indexOf(needle);
      if (at < 1) continue;
      let i = at - 1; while (i > 0 && /\s/.test(src[i])) i--;
      if (src[i] !== "[") continue;
      const lit = parseArrayAt(src, i);
      try { const arr = JSON.parse(lit); if (Array.isArray(arr) && Array.isArray(arr[1])) return { file, q: arr }; } catch (e) { /* not JSON-shaped: skip */ }
    }
  }
  return null;
}
const ABSURD = /\b(hoping|hope for|luck|never|always|guess|ignor\w*|skipp?\w*|nothing|don't need|just wing)\b|\bonly\b/i;
export function flaws(q, support) {
  const out = [], opts = q[1].map(String), idx = q[2];
  const norm = opts.map(o => o.toLowerCase().replace(/[\u2212\u2013\u2014]/g, "-").replace(/\s+/g, " ").trim().replace(/[.;,]+$/, "")); // plain equality only: symbols like < > [ ] + - $ change the meaning
  if (typeof idx !== "number" || !opts[idx]) out.push({ type: "answer-key-out-of-range", weight: 40, objective: true, note: "keyed answer index " + idx + " is not one of the " + opts.length + " options" });
  if (new Set(norm).size < norm.length) out.push({ type: "duplicate-options", weight: 40, objective: true, note: "two options are the same text" });
  const wrong = opts.filter((_, k) => k !== idx);
  const absurd = wrong.filter(o => ABSURD.test(o));
  if (absurd.length >= 2) out.push({ type: "implausible-distractors", weight: 20, objective: false, note: absurd.length + " of " + wrong.length + " wrong options read as obviously wrong: " + absurd.map(a => '"' + a + '"').join(", ") });
  const lens = wrong.map(o => o.length).sort((a, b) => a - b), med = lens[Math.floor(lens.length / 2)] || 1;
  if (opts[idx] && opts[idx].length >= 20 && opts[idx].length >= 1.5 * med && opts[idx].length > Math.max(...lens)) out.push({ type: "length-giveaway", weight: 20, objective: false, note: "the keyed answer is the longest option by a wide margin (" + opts[idx].length + " vs median " + med + " chars)" });
  if (support) {
    const sc = opts.map(o => support(o)), good = sc[idx] || 0;
    const bestOther = Math.max(...sc.map((s, k) => (k === idx ? -1 : s)));
    if (bestOther >= 1 && bestOther > good * 1.5) { const k = sc.indexOf(bestOther); out.push({ type: "lesson-contradicts-key", weight: 30, objective: true, note: 'the lessons support "' + opts[k] + '" (score ' + bestOther.toFixed(1) + ") more than the keyed answer (score " + good.toFixed(1) + ")" }); }
  }
  return out;
}
export function makeSupport(cards) {
  const docs = cards.map(c => new Set(toks(c)));
  return opt => { const t = new Set(toks(opt)); let best = 0; for (const d of docs) { let sc = 0; t.forEach(w => { if (d.has(w)) sc += 1 / docs.filter(x => x.has(w)).length; }); if (sc > best) best = sc; } return best; };
}
const RELEVANT = { factual: ["answer-key-out-of-range", "duplicate-options", "lesson-contradicts-key"], clarity: ["duplicate-options", "answer-key-out-of-range"], typo: ["duplicate-options"], difficulty: ["implausible-distractors", "length-giveaway", "duplicate-options"], other: ["duplicate-options", "answer-key-out-of-range"] };

/* ---------- 6) score + decide ---------- */
export function score(effUsers, evidenceWeight, reach, R = RUBRIC) {
  const corroboration = Math.min(40, Math.round(effUsers * 20)), evidence = Math.min(40, evidenceWeight), total = corroboration + evidence + reach;
  return { corroboration, evidence, reach, total };
}
export function decideQuestion(group, ctx, R = RUBRIC) {
  const first = group.rows.reduce((a, r) => (r.at < a ? r.at : a), group.rows[0].at), q0 = group.rows[0], cls = group.cls;
  const users = effectiveUsers(group.rows, R), notes = [];
  const found = ctx.locate ? ctx.locate(q0.question) : null;
  const base = { key: group.key, type: "question", cls, reports: group.rows.map(r => r.id), question: q0.question, users };
  if (!found) return { ...base, verdict: "ignore", why: "question text is not in the code any more (renamed, removed or already rewritten)" };
  const changed = ctx.changedSince ? ctx.changedSince(q0.question, first) : null;
  if (changed) return { ...base, verdict: "ignore", why: "already changed after the first report (" + changed + ")", target: { file: found.file } };
  const fl = flaws(found.q, ctx.support).filter(f => (RELEVANT[cls] || RELEVANT.other).includes(f.type));
  if (ctx.qaDefects && ctx.qaDefects.has(q0.question)) fl.push({ type: "qa-bot-verified", weight: 40, objective: true, note: "the Question QA bot independently verified a defect in this question" });
  fl.forEach(f => notes.push((f.objective ? "[verified] " : "[heuristic] ") + f.note));
  const evidence = fl.reduce((m, f) => Math.max(m, f.weight), 0), hard = fl.some(f => f.objective && f.weight >= R.hardEvidence);
  const reach = (users.signed > 0 ? 10 : 0) + 10;
  const s = score(users.eff, evidence, reach, R), consensus = users.eff >= R.needUsers || hard;
  const verdict = s.total >= R.actScore && consensus ? "fix" : s.total >= 30 ? "watch" : "ignore";
  const why = verdict === "fix" ? (users.eff >= R.needUsers ? "consensus: " + users.eff + " independent reports" : "single report backed by a verified defect")
    : verdict === "watch" ? "no consensus yet (" + users.eff + " of " + R.needUsers + " independent reports, no verified defect). It becomes a fix if one more person flags it or a defect is verified"
      : "weak claim, nothing verified";
  return { ...base, verdict, why, score: s, consensus: { needed: R.needUsers, have: users.eff, hardEvidence: hard }, evidence: notes, target: { file: found.file, question: found.q[0] }, current: { options: found.q[1], keyed: found.q[2] } };
}
export function decidePolls(rows, ctx, R = RUBRIC) {
  const tally = {}; rows.forEach(r => (tally[r.answer] = (tally[r.answer] || 0) + 1));
  const n = rows.length;
  return Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([ans, c]) => {
    const share = n ? c / n : 0, enough = n >= R.pollMin && share >= R.pollShare;
    const dep = ctx.deploysSince ? ctx.deploysSince(rows.filter(r => r.answer === ans).reduce((a, r) => (r.at > a ? r.at : a), new Date(0))) : [];
    return { key: "p:" + ans, type: "poll", cls: "poll", answer: ans, count: c, share: Math.round(share * 100), verdict: enough ? "recommend" : "watch",
      why: enough ? c + " of " + n + " votes (" + Math.round(share * 100) + "%): enough to recommend a product change, which needs Bekir's call" : "only " + c + " of " + n + " votes; needs " + R.pollMin + "+ polls and " + Math.round(R.pollShare * 100) + "%+ share",
      deploysSinceLastVote: dep };
  });
}

/* ---------- 7) the whole pass ---------- */
export function run(rawRows, ctx = {}, opts = {}) {
  const R = { ...RUBRIC, ...(opts.rubric || {}) }, now = ctx.now || new Date(), days = opts.days || 30, resolved = (opts.state && opts.state.resolved) || {};
  const rows = rawRows.map(normalize).filter(r => r.id && now - r.at <= days * 864e5);
  const quarantined = [], clean = [];
  rows.forEach(r => { const q = quarantine(r); q ? quarantined.push({ id: r.id, why: q }) : clean.push(r); });
  const items = [], polls = [], byKey = new Map();
  const texts = [];
  clean.forEach(r => {
    const c = classify(r);
    if (c.type === "poll") polls.push(r);
    else if (c.type === "text") texts.push(r);
    else { const g = byKey.get(c.key) || { key: c.key, type: c.type, cls: c.cls, rows: [] }; g.rows.push(r); byKey.set(c.key, g); }
  });
  byKey.forEach(g => {
    const done = resolved[g.key];
    if (done && g.rows.every(r => r.at <= new Date(done))) { items.push({ key: g.key, type: g.type, verdict: "ignore", why: "resolved on " + done, reports: g.rows.map(r => r.id) }); return; }
    if (g.type === "coaching") items.push({ key: g.key, type: "coaching", verdict: "human", why: "coaching request: a lead for Bekir, never auto-handled", reports: g.rows.map(r => r.id) });
    else items.push(decideQuestion(g, ctx, R));
  });
  clusterText(texts).forEach(g => {
    const u = effectiveUsers(g.rows, R), s = score(u.eff, 0, u.signed > 0 ? 10 : 0, R), met = u.eff >= R.needUsers;
    items.push({ key: g.key, type: "text", verdict: met ? "investigate" : "watch", users: u, score: s, reports: g.rows.map(r => r.id), sample: g.rows[0].text.slice(0, 200),
      why: met ? "same theme from " + u.eff + " independent people: read the reports, verify in the code, fix only what you can prove" : "one voice so far (" + u.eff + " of " + R.needUsers + ")" });
  });
  const pollItems = decidePolls(polls, ctx, R);
  const order = { fix: 0, investigate: 1, recommend: 2, human: 3, watch: 4, ignore: 5 };
  items.sort((a, b) => order[a.verdict] - order[b.verdict]);
  return { generatedAt: now.toISOString(), windowDays: days, rows: rows.length, quarantined, items, polls: { total: polls.length, tally: pollItems },
    summary: Object.fromEntries(["fix", "investigate", "recommend", "human", "watch", "ignore"].map(v => [v, items.filter(i => i.verdict === v).length + pollItems.filter(i => i.verdict === v).length])) };
}

/* ---------- 8) real context from the repo (used by the CLI) ---------- */
export function repoContext(root = ROOT) {
  const files = {};
  for (const f of fs.readdirSync(path.join(root, "js")).filter(f => f.endsWith(".js"))) files["js/" + f] = fs.readFileSync(path.join(root, "js", f), "utf8");
  let cards = [];
  try {
    const w = {}, c = vm.createContext({ window: w, console, Math, Object, localStorage: { getItem() { return null }, setItem() {} }, document: { createElement: () => ({}), head: { appendChild() {} }, getElementById() {}, querySelector() {} }, requestAnimationFrame() {}, setTimeout() {}, showBrief() {}, quiz() {}, runLevel() {}, openPanel() {} });
    for (const f of ["lessons.js", "lessons2.js"]) if (files["js/" + f]) vm.runInContext(files["js/" + f], c);
    Object.values(w.MA_LESSONS || {}).forEach(a => a.forEach(x => cards.push([x.h, x.b, x.ex].join(" "))));
  } catch (e) { cards = []; }
  const git = args => { try { return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return ""; } };
  return {
    locate: q => locateIn(files, q), support: cards.length ? makeSupport(cards) : null,
    changedSince: (q, since) => { const out = git(["log", "--since=" + since.toISOString().replace(/\.\d+Z$/,"Z"), "--format=%h", "-S" + q.slice(0, 40), "--", "js"]); return out ? out.split("\n")[0] : null; },
    deploysSince: since => git(["log", "--all", "--since=" + since.toISOString().replace(/\.\d+Z$/,"Z"), "--grep=^Deploy", "--format=%h %cs %s"]).split("\n").filter(Boolean).slice(0, 5),
  };
}

/* ---------- CLI ---------- */
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const a = process.argv.slice(2), file = a.find(x => !x.startsWith("--"));
  const opt = n => { const i = a.indexOf("--" + n); return i >= 0 ? a[i + 1] : null; };
  if (!file) { console.error("usage: node tools/feedbot/triage.mjs rows.json [--days 30] [--state tools/feedbot/state.json]"); process.exit(2); }
  const rows = JSON.parse(fs.readFileSync(file, "utf8")), sp = opt("state") || path.join(ROOT, "tools/feedbot/state.json");
  let state = {}; try { state = JSON.parse(fs.readFileSync(sp, "utf8")); } catch (e) { /* first run */ }
  console.log(JSON.stringify(run(rows, repoContext(), { days: +(opt("days") || 30), state }), null, 2));
}
