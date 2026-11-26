// Duplicate ID Bot: two elements with the same id on one page break scripts that look them up and break screen readers.
// Usage: node tools/bots/dupids.mjs
import { ROOT, cli } from "./lib.mjs";
import { read, guidePages, report } from "./scan.mjs";

export function dupIds(html) {
  const clean = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, ""), seen = {};
  for (const m of clean.matchAll(/<[a-z][^>]*?\sid=["']([^"']+)["']/gi)) seen[m[1]] = (seen[m[1]] || 0) + 1;
  return Object.entries(seen).filter(([, n]) => n > 1).map(([id, n]) => ({ id, n }));
}
export function dupIdsReport(pages) {
  const bad = pages.map(p => ({ page: p.slug, ids: dupIds(p.html) })).filter(p => p.ids.length), f = [];
  if (bad.length) f.push({ code: "duplicate-ids", severity: "warn", where: bad[0].page, detail: `${bad.length} pages reuse an id. e.g. ${bad.slice(0, 3).map(b => `${b.page}: ${b.ids.slice(0, 3).map(i => `#${i.id} x${i.n}`).join(", ")}`).join("; ")}` });
  return report("dupids", f, { pages: pages.length, affected: bad.length });
}
export const scan = (root = ROOT) => dupIdsReport([{ slug: "index.html", html: read(root, "index.html") }, ...guidePages(root)]);
cli(import.meta.url, () => scan());
