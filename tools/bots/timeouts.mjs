// Timeout Bot: Netlify functions stop at 10 seconds. A function that calls another service with no timeout can hang until it dies and the student sees an error.
// Usage: node tools/bots/timeouts.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";

export function timeouts(files) {
  const risky = files.filter(f => !f.name.startsWith("_") && /\bfetch\s*\(/.test(f.text) && !/AbortSignal|AbortController|signal\s*:|timeout/i.test(f.text)), f = [];
  if (risky.length) f.push({ code: "fetch-no-timeout", severity: risky.length > 5 ? "warn" : "info", where: risky[0].name, detail: `${risky.length} of ${files.length} functions call fetch() with no timeout, so a slow partner can hold them until the 10s limit. e.g. ${risky.slice(0, 5).map(r => r.name).join(", ")}` });
  return report("timeouts", f, { functions: files.length, risky: risky.length });
}
export function scan(root = ROOT) { const d = path.join(root, "netlify/functions"); return timeouts(fs.existsSync(d) ? fs.readdirSync(d).filter(n => /\.m?js$/.test(n)).map(n => ({ name: n, text: fs.readFileSync(path.join(d, n), "utf8") })) : []); }
cli(import.meta.url, () => scan());
