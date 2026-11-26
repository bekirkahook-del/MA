// Shared helpers for the site bots. Everything here is pure or read-only. No bot sends, deploys, deletes or edits the live site.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
export const redact = s => String(s ?? "").replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]");
export const short = id => String(id || "").slice(0, 6);
export const readJson = (p, d) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { return d; } };
export const git = (args, cwd = ROOT) => { try { return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return ""; } };
export const sev = { critical: 0, warn: 1, info: 2 };
export const sortBySev = a => a.slice().sort((x, y) => (sev[x.severity] ?? 3) - (sev[y.severity] ?? 3));

/* "Nov 24", "Nov 24, 2026", "2026-11-24", ISO -> Date (UTC midday) or null. A bare "Nov 24" takes the year of `now`. */
const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
export function parseDate(s, now = new Date()) {
  if (!s) return null; s = String(s).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
  m = s.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?/); if (m && MON[m[1].toLowerCase()] != null) return new Date(Date.UTC(m[3] ? +m[3] : now.getUTCFullYear(), MON[m[1].toLowerCase()], +m[2], 12));
  return null;
}
export const daysBetween = (a, b) => Math.floor((b - a) / 864e5);

/* run a bot from the command line: node file.mjs input.json  -> JSON report on stdout */
export function cli(metaUrl, fn) {
  if (!process.argv[1] || metaUrl !== pathToFileURL(process.argv[1]).href) return;
  Promise.resolve(fn(process.argv.slice(2))).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e.message); process.exit(1); });
}
export const arg = (a, n) => { const i = a.indexOf("--" + n); return i >= 0 ? a[i + 1] : null; };

/* tiny static server + headless browser, for the bots that need to load the real site */
export function serve(root = ROOT) {
  const T = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2" };
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0].split("#")[0]); if (p.endsWith("/")) p += "index.html";
    let f = path.join(root, p); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": T[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(0, "127.0.0.1", () => r({ url: "http://127.0.0.1:" + srv.address().port, close: () => srv.close() })));
}
export function loadPlaywright() {
  for (const base of [import.meta.url, null]) {
    try { return (base ? createRequire(base) : createRequire(path.join(process.cwd(), "x.js")))("playwright"); } catch (e) { /* next */ }
  }
  const g = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
  return createRequire(path.join(g, "x.js"))("playwright");
}
