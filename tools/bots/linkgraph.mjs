// Internal Link Graph Bot: guides that nothing links to (orphans) and guides that link out to almost nothing. Search engines find pages by following links.
// Usage: node tools/bots/linkgraph.mjs
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { guidePages, read, report } from "./scan.mjs";

export function guideLinks(html, fromSlug) {
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*\bhref=["']([^"'#?]+)/gi)) {
    let h = m[1].trim(); if (/^(https?:)?\/\//.test(h)) { if (!/^https?:\/\/(www\.)?mnaprep\.com/.test(h)) continue; h = h.replace(/^https?:\/\/(www\.)?mnaprep\.com/, ""); }
    if (!h.startsWith("/")) h = path.posix.join("/guides/" + (fromSlug || ""), h);
    const mm = path.posix.normalize(h).match(/^\/guides\/([^/]+)\/?(index\.html)?$/); if (mm && mm[1] !== fromSlug && !mm[1].startsWith("_")) out.add(mm[1]);
  }
  return out;
}
export function linkgraph(pages, hubs = []) {
  const slugs = new Set(pages.map(p => p.slug)), inbound = Object.fromEntries([...slugs].map(s => [s, 0])), out = {};
  for (const p of pages) { const l = [...guideLinks(p.html, p.slug)].filter(s => slugs.has(s)); out[p.slug] = l.length; l.forEach(s => inbound[s]++); }
  for (const h of hubs) for (const s of guideLinks(h, "")) if (slugs.has(s)) inbound[s]++;
  const orphans = [...slugs].filter(s => !inbound[s]), weak = [...slugs].filter(s => out[s] < 2), f = [];
  if (orphans.length) f.push({ code: "orphan-guides", severity: orphans.length / slugs.size > 0.05 ? "warn" : "info", where: "guides", detail: `${orphans.length} guides have no link pointing at them. e.g. ${orphans.slice(0, 4).join(", ")}` });
  if (weak.length) f.push({ code: "weak-outlinks", severity: "info", where: "guides", detail: `${weak.length} guides link to fewer than 2 other guides. e.g. ${weak.slice(0, 4).join(", ")}` });
  const avg = Math.round(Object.values(out).reduce((a, b) => a + b, 0) / Math.max(1, slugs.size) * 10) / 10;
  return report("linkgraph", f, { guides: slugs.size, avgOutlinks: avg, orphans: orphans.length });
}
export const scan = (root = ROOT) => linkgraph(guidePages(root), [read(root, "guides/index.html"), read(root, "index.html")]);
cli(import.meta.url, () => scan());
