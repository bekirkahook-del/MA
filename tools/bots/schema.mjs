// Structured Data Bot: every JSON-LD block on a guide page must parse and carry the fields search engines need.
// Usage: node tools/bots/schema.mjs
import { ROOT, cli } from "./lib.mjs";
import { guidePages, group, report } from "./scan.mjs";

const NOTES = { "no-jsonld": { text: "no JSON-LD block" }, "bad-json": { text: "JSON-LD that does not parse (search engines ignore it)", unit: "pages" }, "no-type": { text: "JSON-LD block without an @type" }, "article-fields": { text: "Article/BlogPosting missing headline or a date" }, "faq-empty": { text: "FAQPage with no questions or with a question missing its answer" } };
export function auditJsonLd(html, slug) {
  const out = [], add = (code, severity = "warn") => out.push({ code, severity, where: slug });
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
  if (!blocks.length) { add("no-jsonld", "info"); return out; }
  for (const b of blocks) {
    let j; try { j = JSON.parse(b); } catch (e) { add("bad-json", "critical"); continue; }
    for (const n of [].concat(j["@graph"] || j)) {
      const t = [].concat(n["@type"] || []);
      if (!t.length) { add("no-type"); continue; }
      if (t.some(x => /Article|BlogPosting/.test(x)) && (!n.headline || !(n.datePublished || n.dateModified))) add("article-fields");
      if (t.includes("FAQPage") && (!(n.mainEntity || []).length || (n.mainEntity || []).some(q => !q.name || !q.acceptedAnswer || !q.acceptedAnswer.text))) add("faq-empty");
    }
  }
  return out;
}
export function schema(pages) { return report("schema", group(pages.flatMap(p => auditJsonLd(p.html, p.slug)), NOTES), { pages: pages.length }); }
export const scan = (root = ROOT) => schema(guidePages(root));
cli(import.meta.url, () => scan());
