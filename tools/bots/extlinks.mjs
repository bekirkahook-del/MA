// External Link Bot: insecure (http://) links and new-tab links without rel="noopener". Inventory of which outside sites the pages send students to.
// Usage: node tools/bots/extlinks.mjs
import { ROOT, cli } from "./lib.mjs";
import { guidePages, read, report } from "./scan.mjs";

export function extLinks(html) {
  const out = []; for (const m of html.replace(/<script[\s\S]*?<\/script>/gi, "").matchAll(/<a\b([^>]*)>/gi)) { const h = (m[1].match(/\bhref=["'](https?:\/\/[^"']+)/i) || [])[1]; if (!h || /^https?:\/\/(www\.)?mnaprep\.com/.test(h)) continue; out.push({ url: h, insecure: h.startsWith("http://"), newTab: /target=["']_blank/i.test(m[1]), safe: /rel=["'][^"']*(noopener|noreferrer)/i.test(m[1]) }); }
  return out;
}
export function extlinks(pages) {
  const all = pages.flatMap(p => extLinks(p.html).map(l => ({ ...l, page: p.slug }))), f = [], domains = {};
  for (const l of all) { const d = l.url.replace(/^https?:\/\//, "").split("/")[0].replace(/^www\./, ""); domains[d] = (domains[d] || 0) + 1; }
  const ins = all.filter(l => l.insecure), unsafe = all.filter(l => l.newTab && !l.safe);
  if (ins.length) f.push({ code: "insecure-links", severity: "warn", where: ins[0].page, detail: `${ins.length} links use http:// instead of https://. e.g. ${ins.slice(0, 3).map(l => `${l.page} -> ${l.url}`).join("; ")}` });
  if (unsafe.length) f.push({ code: "no-noopener", severity: "info", where: unsafe[0].page, detail: `${unsafe.length} new-tab links have no rel="noopener". e.g. ${unsafe.slice(0, 3).map(l => l.page).join(", ")}` });
  return { ...report("extlinks", f, { externalLinks: all.length, domains: Object.keys(domains).length }), topDomains: Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 10) };
}
export const scan = (root = ROOT) => extlinks([{ slug: "index.html", html: read(root, "index.html") }, ...guidePages(root)]);
cli(import.meta.url, () => scan());
