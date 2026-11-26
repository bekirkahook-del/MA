// Sitemap Bot: sitemap.xml must list every real guide page and nothing that does not exist; robots.txt must point at it.
// Usage: node tools/bots/sitemap.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { guidePages, read, report } from "./scan.mjs";

export function sitemap({ xml, robots, pages, exists }) {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()), f = [], seen = new Set(), dup = [];
  for (const l of locs) { if (seen.has(l)) dup.push(l); seen.add(l); }
  const paths = locs.map(l => l.replace(/^https?:\/\/[^/]+/, "")), missing = paths.filter(p => !exists(p));
  const listed = new Set(paths.map(p => p.replace(/\/$/, ""))), unlisted = pages.filter(g => !listed.has("/guides/" + g.slug));
  const add = (code, severity, detail, where) => f.push({ code, severity, detail, where });
  if (!xml) add("sitemap-missing", "critical", "sitemap.xml is missing or empty.", "sitemap.xml");
  if (missing.length) add("dead-urls", "critical", `${missing.length} sitemap URLs point at pages that do not exist. e.g. ${missing.slice(0, 3).join(", ")}`, "sitemap.xml");
  if (unlisted.length) add("unlisted-guides", "warn", `${unlisted.length} guide pages are not in the sitemap. e.g. ${unlisted.slice(0, 3).map(g => g.slug).join(", ")}`, "sitemap.xml");
  if (dup.length) add("duplicate-urls", "info", `${dup.length} URLs appear twice in the sitemap.`, "sitemap.xml");
  if (!/^Sitemap:\s*https?:\/\//im.test(robots)) add("robots-no-sitemap", "warn", "robots.txt has no Sitemap: line.", "robots.txt");
  if (/^Disallow:\s*\/\s*$/im.test(robots.split(/User-agent:/i).find(b => /^\s*\*/.test(b)) || "")) add("robots-blocks-all", "critical", "robots.txt blocks all crawlers.", "robots.txt");
  return report("sitemap", f, { urls: locs.length, guides: pages.length });
}
export function scan(root = ROOT) {
  const exists = p => { const f = path.join(root, p.split("?")[0]); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, "index.html"))); };
  return sitemap({ xml: read(root, "sitemap.xml"), robots: read(root, "robots.txt"), pages: guidePages(root), exists });
}
cli(import.meta.url, () => scan());
