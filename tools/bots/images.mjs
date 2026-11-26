// Broken Image Bot: every <img> and social-preview image must point at a file that exists.
// Usage: node tools/bots/images.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { guidePages, read, metaContent, report } from "./scan.mjs";

export function imageRefs(html) {
  const refs = [...html.replace(/<script[\s\S]*?<\/script>/gi, "").matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m => m[1]);
  for (const k of ["og:image", "twitter:image"]) { const c = metaContent(html, k); if (c) refs.push(c); }
  return refs.filter(r => !/^data:/.test(r));
}
export function images(pages, exists) {
  const missing = [];
  for (const p of pages) for (const r of imageRefs(p.html)) {
    if (/^https?:\/\//.test(r) && !/^https?:\/\/(www\.)?mnaprep\.com/.test(r)) continue;
    const rel = r.replace(/^https?:\/\/(www\.)?mnaprep\.com/, "").split("?")[0], abs = rel.startsWith("/") ? rel : path.posix.join("/" + path.posix.dirname(p.rel || p.slug), rel);
    if (!exists(abs)) missing.push({ page: p.slug, ref: r });
  }
  const f = missing.length ? [{ code: "missing-images", severity: "warn", where: missing[0].page, detail: `${missing.length} image references point at files that do not exist. e.g. ${missing.slice(0, 3).map(m => `${m.page} -> ${m.ref}`).join("; ")}` }] : [];
  return report("images", f, { pages: pages.length, missing: missing.length });
}
export function scan(root = ROOT) { const ex = p => { try { return fs.statSync(path.join(root, p)).isFile(); } catch (e) { return false; } }; return images([{ slug: "index.html", rel: "index.html", html: read(root, "index.html") }, ...guidePages(root)], ex); }
cli(import.meta.url, () => scan());
