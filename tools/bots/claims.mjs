// Claims Bot: numbers the site brags about ("1,000+ guides", "49 levels", "1,248 questions") must match what actually exists. An overstated claim is a trust problem.
// Usage: node tools/bots/claims.mjs [tracks.json]
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { read, guidePages, textOf, report } from "./scan.mjs";

const NOUNS = { guides: "guides", questions: "questions", levels: "levels", companies: "companies", tracks: "tracks" };
export function findClaims(text, where) {
  const out = []; for (const m of text.matchAll(/\b(\d[\d,]*)(\+?)\s+(?:free\s+|interview\s+|practice\s+|school\s+)?(guides|questions|levels|companies|tracks)\b/gi)) { const n = +m[1].replace(/,/g, ""); if (n >= 3) out.push({ n, plus: !!m[2], noun: NOUNS[m[3].toLowerCase()], where, text: m[0] }); }
  return out;
}
export function claims(docs, actual) {
  const all = docs.flatMap(d => findClaims(d.text, d.name)), f = [], bad = [], stale = [];
  for (const c of all) { const a = actual[c.noun]; if (!a) continue; if (c.n > a * 1.02) bad.push({ ...c, a }); else if (!c.plus && c.n < a * 0.8 && c.n > 30) stale.push({ ...c, a }); }
  if (bad.length) f.push({ code: "claim-overstated", severity: "warn", where: bad[0].where, detail: `${bad.length} claims are bigger than reality: ${bad.slice(0, 4).map(b => `"${b.text}" in ${b.where} (actual ${b.a})`).join("; ")}` });
  if (stale.length) f.push({ code: "claim-stale", severity: "info", where: stale[0].where, detail: `${stale.length} claims understate the site (probably out of date): ${stale.slice(0, 4).map(b => `"${b.text}" in ${b.where} (actual ${b.a})`).join("; ")}` });
  return report("claims", f, { claimsFound: all.length, actual });
}
export function scan(root = ROOT, tracksFile) {
  const t = Array.isArray(tracksFile) ? tracksFile : tracksFile && fs.existsSync(tracksFile) ? JSON.parse(fs.readFileSync(tracksFile, "utf8")).tracks : null, actual = { guides: guidePages(root).length };
  if (t) { actual.tracks = t.length; actual.levels = t.reduce((n, x) => n + x.levels.length, 0); actual.questions = t.reduce((n, x) => n + x.levels.reduce((m, l) => m + (l.q || []).length, 0), 0); }
  try { const c = read(root, "js/companies.js").match(/CO_RAW\s*=\s*"((?:[^"\\]|\\.)*)"/); if (c) actual.companies = (c[1].match(/\\n/g) || []).length + 1; } catch (e) { /* skip */ }
  return claims([{ name: "index.html", text: textOf(read(root, "index.html")) }, { name: "guides/index.html", text: textOf(read(root, "guides/index.html")) }, ...fs.readdirSync(path.join(root, "js")).filter(n => /^(app|grow|header|attract|firstrun|easyjoin|gate|rewards)\.js$/.test(n)).map(n => ({ name: "js/" + n, text: read(root, "js/" + n) }))], actual);
}
cli(import.meta.url, a => scan(ROOT, a[0]));
