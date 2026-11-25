// SEO Meta Bot: checks every guide page for the basics search engines and AI answer engines read.
// Usage: node tools/bots/seo.mjs
import { ROOT, cli } from "./lib.mjs";
import { guidePages, tag, metaContent, group, report } from "./scan.mjs";

const NOTES = {
  "title-length": { text: "title is under 15 or over 65 characters" }, "title-missing": { text: "no <title>" },
  "desc-length": { text: "meta description missing, under 50 or over 160 characters" },
  "h1-count": { text: "does not have exactly one <h1>" }, "canonical": { text: "canonical link missing or points at a different URL" },
  "og": { text: "missing og:title or og:description" }, "dup-title": { text: "same <title> as another guide" },
};
export function auditPage({ slug, rel, html }) {
  const out = [], add = (code, severity = "info") => out.push({ code, severity, where: slug });
  const title = tag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!title) add("title-missing", "warn"); else if (title.length < 15 || title.length > 65) add("title-length");
  const d = metaContent(html, "description"); if (!d || d.length < 50 || d.length > 160) add("desc-length", d ? "info" : "warn");
  const h1 = (html.match(/<h1[\s>]/gi) || []).length; if (h1 !== 1) add("h1-count");
  const can = tag(html, /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || tag(html, /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  if (!can || !can.replace(/\/$/, "").endsWith("/guides/" + slug)) add("canonical", "warn");
  if (!metaContent(html, "og:title") || !metaContent(html, "og:description")) add("og");
  return { title, items: out };
}
export function seo(pages) {
  const items = [], titles = {};
  for (const p of pages) { const r = auditPage(p); items.push(...r.items); if (r.title) (titles[r.title.toLowerCase()] ||= []).push(p.slug); }
  for (const list of Object.values(titles)) if (list.length > 1) list.forEach(s => items.push({ code: "dup-title", severity: "warn", where: s }));
  return report("seo", group(items, NOTES), { pages: pages.length });
}
export const scan = (root = ROOT) => seo(guidePages(root));
cli(import.meta.url, () => scan());
