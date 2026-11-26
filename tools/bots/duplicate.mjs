// Duplicate Content Bot: finds near-identical guide pages. Search engines demote or merge pages that say the same thing.
// Method: sample 4-word shingles of each page's text, find pairs sharing many, report pairs whose Jaccard similarity is high.
// Usage: node tools/bots/duplicate.mjs [--threshold 0.8]
import crypto from "node:crypto";
import { ROOT, cli, arg } from "./lib.mjs";
import { guidePages, textOf, report } from "./scan.mjs";

const h32 = s => crypto.createHash("md5").update(s).digest().readUInt32LE(0);
export function shingles(text, k = 4, mod = 4) {
  const w = text.toLowerCase().replace(/[^a-z0-9$%.\s]/g, " ").split(/\s+/).filter(Boolean), out = new Set();
  for (let i = 0; i + k <= w.length; i++) { const x = h32(w.slice(i, i + k).join(" ")); if (x % mod === 0) out.add(x); }
  return out;
}
export function nearDuplicates(docs, threshold = 0.8, minShingles = 40) {
  const sets = docs.map(d => ({ name: d.name, s: shingles(d.text) })).filter(d => d.s.size >= minShingles), idx = new Map(), pairs = new Map();
  sets.forEach((d, i) => { for (const x of d.s) { let l = idx.get(x); if (!l) idx.set(x, l = []); l.push(i); } });
  for (const l of idx.values()) { if (l.length > 40) continue; for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++) { const k = l[a] * 100000 + l[b]; pairs.set(k, (pairs.get(k) || 0) + 1); } }
  const out = [];
  for (const [k, shared] of pairs) { const a = sets[Math.floor(k / 100000)], b = sets[k % 100000], j = shared / (a.s.size + b.s.size - shared); if (j >= threshold) out.push({ a: a.name, b: b.name, similarity: Math.round(j * 100) / 100 }); }
  return out.sort((x, y) => y.similarity - x.similarity);
}
export function duplicates(docs, threshold = 0.8) {
  const pairs = nearDuplicates(docs, threshold), f = [];
  if (pairs.length) f.push({ code: "near-duplicates", severity: pairs.length >= 20 ? "warn" : "info", where: "guides", detail: `${pairs.length} pairs of guides are at least ${Math.round(threshold * 100)}% the same text. Closest: ${pairs.slice(0, 3).map(p => `${p.a} / ${p.b} (${p.similarity})`).join("; ")}` });
  return { ...report("duplicate", f, { pages: docs.length, pairs: pairs.length }), pairs: pairs.slice(0, 50) };
}
export const scan = (root = ROOT, threshold = 0.8) => duplicates(guidePages(root).map(g => ({ name: g.slug, text: textOf(g.html) })), threshold);
cli(import.meta.url, a => scan(ROOT, +(arg(a, "threshold") || 0.8)));
