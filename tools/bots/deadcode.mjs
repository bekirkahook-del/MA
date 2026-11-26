// Dead Code Bot: scripts and functions that nothing references. Leads only: a function can be called from outside (webhooks, schedules), so it never says "delete".
// Usage: node tools/bots/deadcode.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { trackedFiles, read, report } from "./scan.mjs";

const EXTERNAL = /(webhook|cron|schedule|scheduled)/i;
export function deadcode({ scripts, functions, corpus }) {
  const count = (needle, selfRel) => Object.entries(corpus).filter(([f, t]) => f !== selfRel && t.includes(needle)).length;
  const deadScripts = scripts.filter(s => count(s, "js/" + s) === 0), deadFns = functions.filter(fn => { const base = fn.replace(/\.m?js$/, ""); return !EXTERNAL.test(base) && count(base, "netlify/functions/" + fn) === 0 && !/^_/.test(fn); });
  const f = [];
  if (deadScripts.length) f.push({ code: "scripts-unreferenced", severity: "info", where: "js", detail: `${deadScripts.length} script files are never loaded or named anywhere: ${deadScripts.slice(0, 6).join(", ")}` });
  if (deadFns.length) f.push({ code: "functions-unreferenced", severity: "info", where: "netlify/functions", detail: `${deadFns.length} functions are never called from the site or other code (might be called from outside): ${deadFns.slice(0, 6).join(", ")}` });
  return { ...report("deadcode", f, { scripts: scripts.length, functions: functions.length }), dead: { scripts: deadScripts, functions: deadFns } };
}
export function scan(root = ROOT) {
  const ls = d => { try { return fs.readdirSync(path.join(root, d)); } catch (e) { return []; } };
  const corpus = {}; for (const f of trackedFiles(root)) if (/\.(m?js|html|toml|json|webmanifest)$/.test(f) && !f.startsWith("guides/") && !f.startsWith("tests/") && !f.startsWith("tools/")) { const t = read(root, f); if (t.length < 4e6) corpus[f] = t; }
  for (const g of ["guides/index.html"]) corpus[g] = read(root, g);
  return deadcode({ scripts: ls("js").filter(n => n.endsWith(".js")), functions: ls("netlify/functions").filter(n => /\.m?js$/.test(n)), corpus });
}
cli(import.meta.url, () => scan());
