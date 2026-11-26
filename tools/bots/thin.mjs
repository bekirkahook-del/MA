// Thin Content Bot: guide pages with very few words. Search engines rank thin pages poorly and students learn nothing from them.
// Usage: node tools/bots/thin.mjs
import { ROOT, cli } from "./lib.mjs";
import { guidePages, textOf, report } from "./scan.mjs";

export function thin(pages, min = 300) {
  const rows = pages.map(p => ({ slug: p.slug, words: textOf(p.html).split(/\s+/).filter(Boolean).length })), low = rows.filter(r => r.words < min).sort((a, b) => a.words - b.words), f = [];
  if (low.length) f.push({ code: "thin-guides", severity: low.length / rows.length > 0.1 ? "warn" : "info", where: "guides", detail: `${low.length} of ${rows.length} guides have under ${min} words. Thinnest: ${low.slice(0, 3).map(r => `${r.slug} (${r.words})`).join(", ")}` });
  const med = rows.map(r => r.words).sort((a, b) => a - b)[Math.floor(rows.length / 2)] || 0;
  return report("thin", f, { guides: rows.length, medianWords: med, thin: low.length });
}
export const scan = (root = ROOT) => thin(guidePages(root));
cli(import.meta.url, () => scan());
