// Accessibility Bot: static checks on index.html and every guide page. Finds the failures a screen-reader user hits first.
// It cannot judge colour contrast or keyboard flow (that needs a real browser); it says so in its stats.
// Usage: node tools/bots/a11y.mjs
import { ROOT, cli } from "./lib.mjs";
import { guidePages, read, group, report } from "./scan.mjs";

const NOTES = { "no-lang": { text: "<html> has no lang attribute" }, "no-viewport": { text: "no viewport meta tag (breaks phones)" }, "img-alt": { text: "<img> without alt text", unit: "images" }, "button-name": { text: "buttons with no text, aria-label or title", unit: "buttons" }, "input-label": { text: "form fields with no label, aria-label or placeholder", unit: "fields" }, "heading-skip": { text: "heading levels jump (for example h2 straight to h4)" }, "zoom-blocked": { text: "viewport blocks pinch zoom" }, "link-name": { text: "links with no text or aria-label", unit: "links" } };
const attr = (s, n) => { const m = s.match(new RegExp(`\\b${n}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i")); return m ? (m[2] ?? m[3]) : null; };
export function auditHtml(html, where) {
  const out = [], add = (code, severity = "warn") => out.push({ code, severity, where });
  const h = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  if (!/<html[^>]+\blang=/i.test(h)) add("no-lang");
  const vp = h.match(/<meta[^>]+name=["']viewport["'][^>]*>/i); if (!vp) add("no-viewport"); else if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/i.test(vp[0])) add("zoom-blocked");
  for (const m of h.matchAll(/<img\b[^>]*>/gi)) if (attr(m[0], "alt") === null && attr(m[0], "role") !== "presentation") add("img-alt");
  for (const m of h.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) if (!m[2].replace(/<[^>]+>/g, "").trim() && !attr(m[1], "aria-label") && !attr(m[1], "title")) add("button-name");
  for (const m of h.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) if (attr(m[1], "href") && !m[2].replace(/<[^>]+>/g, "").trim() && !/<img[^>]+alt=["'][^"']+/i.test(m[2]) && !attr(m[1], "aria-label") && !attr(m[1], "title")) add("link-name");
  const ids = new Set([...h.matchAll(/<label[^>]+for=["']([^"']+)["']/gi)].map(m => m[1]));
  for (const m of h.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) { const a = m[2], t = (attr(a, "type") || "text").toLowerCase(); if (["hidden", "submit", "button", "checkbox", "radio", "range"].includes(t)) continue; if (!attr(a, "aria-label") && !attr(a, "aria-labelledby") && !attr(a, "placeholder") && !attr(a, "title") && !(attr(a, "id") && ids.has(attr(a, "id")))) add("input-label"); }
  let last = 0; for (const m of h.matchAll(/<h([1-6])\b/gi)) { const n = +m[1]; if (last && n > last + 1) { add("heading-skip", "info"); break; } last = n; }
  return out;
}
export function a11y(pages) {
  const items = pages.flatMap(p => auditHtml(p.html, p.slug));
  const f = group(items, NOTES).map(x => ({ ...x, severity: x.code === "no-viewport" || x.code === "no-lang" ? "warn" : x.code === "heading-skip" ? "info" : "warn" }));
  return report("a11y", f, { pages: pages.length, notChecked: "colour contrast and keyboard order need a real browser" });
}
export const scan = (root = ROOT) => a11y([{ slug: "index.html", html: read(root, "index.html") }, ...guidePages(root)]);
cli(import.meta.url, () => scan());
