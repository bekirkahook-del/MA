// Env Var Bot: inventory of every environment variable the functions read (names only, never values), and names that look like typos of each other.
// Usage: node tools/bots/envvars.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";

export function envVars(files) {
  const use = {};
  for (const f of files) for (const m of f.text.matchAll(/(?:process\.env\.|Netlify\.env\.get\(\s*["']|process\.env\[\s*["'])([A-Za-z][A-Za-z0-9_]+)/g)) (use[m[1]] ||= new Set()).add(f.name);
  const names = Object.keys(use), norm = n => n.replace(/_/g, "").toLowerCase(), by = {};
  for (const n of names) (by[norm(n)] ||= []).push(n);
  const near = Object.values(by).filter(l => l.length > 1), once = names.filter(n => use[n].size === 1 && /(KEY|SECRET|TOKEN)/.test(n));
  const f = near.length ? [{ code: "env-lookalikes", severity: "info", where: near[0][0], detail: `${near.length} variable names differ only by underscores or capitals: ${near.slice(0, 3).map(l => l.join(" / ")).join("; ")}. Fine if one is a deliberate fallback; otherwise one is a typo that silently reads as empty.` }] : [];
  return { ...report("envvars", f, { variables: names.length, secretsReadInOneFile: once.length }), inventory: Object.fromEntries(names.sort().map(n => [n, [...use[n]].sort()])) };
}
export function scan(root = ROOT) { const d = path.join(root, "netlify/functions"), out = []; const walk = p => { for (const e of fs.readdirSync(p, { withFileTypes: true })) e.isDirectory() ? walk(path.join(p, e.name)) : /\.m?js$/.test(e.name) && out.push({ name: path.relative(d, path.join(p, e.name)), text: fs.readFileSync(path.join(p, e.name), "utf8") }); }; if (fs.existsSync(d)) walk(d); return envVars(out); }
cli(import.meta.url, () => scan());
