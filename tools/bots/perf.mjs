// Performance Budget Bot: file weight and render-blocking scripts. Students open this on phones, so weight is a feature.
// Usage: node tools/bots/perf.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { read, guidePages, report } from "./scan.mjs";

export const BUDGET = { jsFile: 250e3, jsTotal: 3e6, indexHtml: 400e3, guideHtml: 150e3, image: 400e3, blocking: 12 };
const kb = n => Math.round(n / 1024) + " KB";
export function perf({ jsFiles, indexHtml, guideSizes, images }, B = BUDGET) {
  const f = [], add = (code, severity, detail, where) => f.push({ code, severity, detail, where });
  const total = jsFiles.reduce((n, x) => n + x.size, 0), big = jsFiles.filter(x => x.size > B.jsFile).sort((a, b) => b.size - a.size);
  if (big.length) add("js-file-big", "warn", `${big.length} script files are over ${kb(B.jsFile)}: ${big.slice(0, 3).map(x => `${x.name} ${kb(x.size)}`).join(", ")}`, "js");
  if (total > B.jsTotal) add("js-total", "warn", `All scripts together weigh ${kb(total)} (budget ${kb(B.jsTotal)}).`, "js");
  if (indexHtml.size > B.indexHtml) add("index-big", "warn", `index.html is ${kb(indexHtml.size)} (budget ${kb(B.indexHtml)}).`, "index.html");
  const blocking = (indexHtml.html.match(/<script\b[^>]*\bsrc=[^>]*>/gi) || []).filter(s => !/\b(defer|async)\b|type=["']module/i.test(s)).length;
  if (blocking > B.blocking) add("blocking-scripts", "info", `${blocking} scripts in index.html block the first paint (no defer or async). Budget ${B.blocking}.`, "index.html");
  const bigG = guideSizes.filter(g => g.size > B.guideHtml).sort((a, b) => b.size - a.size);
  if (bigG.length) add("guide-big", "info", `${bigG.length} guide pages are over ${kb(B.guideHtml)}. e.g. ${bigG.slice(0, 3).map(g => g.name).join(", ")}`, "guides");
  const bigI = images.filter(x => x.size > B.image).sort((a, b) => b.size - a.size);
  if (bigI.length) add("image-big", "warn", `${bigI.length} images are over ${kb(B.image)}. e.g. ${bigI.slice(0, 3).map(x => `${x.name} ${kb(x.size)}`).join(", ")}`, "images");
  return report("perf", f, { jsFiles: jsFiles.length, jsTotalKB: Math.round(total / 1024), blockingScripts: blocking, indexKB: Math.round(indexHtml.size / 1024) });
}
export function scan(root = ROOT) {
  const dir = p => { try { return fs.readdirSync(path.join(root, p)); } catch (e) { return []; } };
  const jsFiles = dir("js").filter(n => n.endsWith(".js")).map(n => ({ name: n, size: fs.statSync(path.join(root, "js", n)).size }));
  const html = read(root, "index.html");
  const images = []; for (const d of ["", "img", "images", "assets", "social"]) for (const n of dir(d)) if (/\.(png|jpe?g|webp|gif|svg)$/i.test(n)) { const p = path.join(root, d, n); if (fs.existsSync(p)) images.push({ name: path.join(d, n), size: fs.statSync(p).size }); }
  return perf({ jsFiles, indexHtml: { html, size: Buffer.byteLength(html) }, guideSizes: guidePages(root).map(g => ({ name: g.slug, size: Buffer.byteLength(g.html) })), images });
}
cli(import.meta.url, () => scan());
