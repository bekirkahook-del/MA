// Install Bot (PWA): the manifest that lets students add the site to their phone, and the service worker's list of cached files.
// Usage: node tools/bots/pwa.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { read, report } from "./scan.mjs";

export function pwa({ manifest, sw, exists }) {
  const f = [], add = (code, severity, detail, where) => f.push({ code, severity, detail, where });
  let m = null; try { m = JSON.parse(manifest); } catch (e) { add("manifest-bad", "warn", "manifest.webmanifest is missing or is not valid JSON, so the site cannot be installed.", "manifest.webmanifest"); }
  if (m) {
    const miss = ["name", "short_name", "start_url", "display", "icons"].filter(k => !m[k] || (Array.isArray(m[k]) && !m[k].length));
    if (miss.length) add("manifest-fields", "warn", `Manifest is missing: ${miss.join(", ")}.`, "manifest.webmanifest");
    const icons = m.icons || [], bad = icons.filter(i => i.src && !exists("/" + i.src.replace(/^\//, "")));
    if (bad.length) add("manifest-icons-missing", "warn", `${bad.length} manifest icons point at files that do not exist: ${bad.map(i => i.src).join(", ")}`, "manifest.webmanifest");
    const sizes = icons.flatMap(i => String(i.sizes || "").split(" ")).map(s => parseInt(s)); if (icons.length && !(sizes.some(s => s >= 192) && sizes.some(s => s >= 512))) add("manifest-icon-sizes", "info", "Manifest needs a 192px and a 512px icon for install prompts.", "manifest.webmanifest");
  }
  const cached = [...sw.matchAll(/["'](\/?[\w./-]+\.(?:js|css|html|json|png|svg|webp))["']/g)].map(x => x[1]).filter(p => !/^(https?:)/.test(p) && !/node_modules/.test(p)), gone = [...new Set(cached.filter(p => !exists(p.startsWith("/") ? p : "/" + p)))];
  if (sw && gone.length) add("sw-cache-missing", "warn", `${gone.length} files the service worker lists do not exist (install fails if one is missing): ${gone.slice(0, 4).join(", ")}`, "sw.js");
  if (!sw.trim()) add("sw-missing", "info", "sw.js is missing, so the site has no offline support.", "sw.js");
  return report("pwa", f, { cachedFiles: cached.length });
}
export function scan(root = ROOT) { const ex = p => { try { return fs.statSync(path.join(root, p)).isFile(); } catch (e) { return false; } }; return pwa({ manifest: read(root, "manifest.webmanifest"), sw: read(root, "sw.js"), exists: ex }); }
cli(import.meta.url, () => scan());
