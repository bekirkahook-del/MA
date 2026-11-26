// Readability Bot: the site promises lessons a high school senior can follow. This measures it (Flesch-Kincaid grade level) on every lesson and guide.
// Usage: node tools/bots/readability.mjs
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { guidePages, textOf, report } from "./scan.mjs";

export function syllables(w) {
  w = w.toLowerCase().replace(/[^a-z]/g, ""); if (!w) return 0; if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = w.match(/[aeiouy]{1,2}/g); return Math.max(1, m ? m.length : 1);
}
export function grade(text) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.split(/\s+/).filter(Boolean).length >= 3), words = text.split(/\s+/).filter(w => /[a-z]/i.test(w));
  if (sentences.length < 2 || words.length < 40) return null;
  const syl = words.reduce((n, w) => n + syllables(w), 0), wps = words.length / sentences.length;
  return { grade: Math.round((0.39 * wps + 11.8 * (syl / words.length) - 15.59) * 10) / 10, wordsPerSentence: Math.round(wps * 10) / 10, words: words.length };
}
export function loadLessons(root = ROOT) {
  const w = {}, ctx = vm.createContext({ window: w, console, Math, Object, localStorage: { getItem() { return null }, setItem() {} }, document: { createElement: () => ({}), head: { appendChild() {} }, getElementById() {}, querySelector() {} }, requestAnimationFrame() {}, setTimeout() {}, showBrief() {}, quiz() {}, runLevel() {}, openPanel() {} });
  for (const f of ["lessons.js", "lessons2.js"]) try { vm.runInContext(fs.readFileSync(path.join(root, "js", f), "utf8"), ctx); } catch (e) { /* partial is fine */ }
  const L = w.MA_LESSONS || {}, out = [];
  for (const [key, v] of Object.entries(L)) for (const [i, s] of (Array.isArray(v) ? v : [v]).entries()) if (s && s.b) out.push({ name: `${key}#${i + 1}`, text: textOf(String(s.b)) });
  return out;
}
export function readability({ lessons, guides }, { max = 12, guideMax = 14 } = {}) {
  const f = [], rate = (docs, limit, code, label) => {
    const rows = docs.map(d => ({ name: d.name, ...grade(d.text) })).filter(r => r.grade != null), hard = rows.filter(r => r.grade > limit).sort((a, b) => b.grade - a.grade);
    const avg = rows.length ? Math.round(rows.reduce((n, r) => n + r.grade, 0) / rows.length * 10) / 10 : 0;
    if (hard.length) f.push({ code, severity: hard.length / rows.length > 0.25 ? "warn" : "info", where: code, detail: `${hard.length} of ${rows.length} ${label} read above grade ${limit} (average grade ${avg}). Hardest: ${hard.slice(0, 3).map(r => `${r.name} (${r.grade})`).join(", ")}` });
    return { n: rows.length, avg };
  };
  const l = rate(lessons, max, "lessons-hard", "lesson cards"), g = rate(guides, guideMax, "guides-hard", "guides");
  return report("readability", f, { lessonCards: l.n, lessonAvgGrade: l.avg, guides: g.n, guideAvgGrade: g.avg });
}
export const scan = (root = ROOT) => readability({ lessons: loadLessons(root), guides: guidePages(root).map(g => ({ name: g.slug, text: textOf(g.html) })) });
cli(import.meta.url, () => scan());
