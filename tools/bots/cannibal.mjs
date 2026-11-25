// Keyword Cannibalization Bot: guides with the same headline compete with each other in search results.
// Usage: node tools/bots/cannibal.mjs
import { ROOT, cli } from "./lib.mjs";
import { guidePages, tag, textOf, report } from "./scan.mjs";

const norm = s => textOf(s).toLowerCase().replace(/&amp;/g, "&").replace(/[^a-z0-9& ]/g, " ").replace(/\s+/g, " ").trim();
export function cannibal(pages) {
  const by = {};
  for (const p of pages) { const h = norm(tag(p.html, /<h1[^>]*>([\s\S]*?)<\/h1>/i)); if (h) (by[h] ||= []).push(p.slug); }
  const groups = Object.entries(by).filter(([, l]) => l.length > 1), f = [];
  if (groups.length) f.push({ code: "same-h1", severity: "warn", where: "guides", detail: `${groups.length} headlines are used by more than one guide. e.g. "${groups[0][0].slice(0, 60)}": ${groups[0][1].slice(0, 3).join(", ")}` });
  return report("cannibal", f, { guides: pages.length, groups: groups.length });
}
export const scan = (root = ROOT) => cannibal(guidePages(root));
cli(import.meta.url, () => scan());
