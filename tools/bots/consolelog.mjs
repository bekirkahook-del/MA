// Leftover Debug Bot: console.log and debugger statements left in the scripts students download.
// Usage: node tools/bots/consolelog.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";

export function debugLeft(files) {
  const rows = files.map(f => { const lines = f.text.split("\n"); let logs = 0, dbg = 0; for (const l of lines) { const t = l.trim(); if (t.startsWith("//") || t.startsWith("*")) continue; if (/\bconsole\.log\s*\(/.test(t)) logs++; if (/(^|[;{}\s])debugger\s*;?/.test(t) && !/["'`].*debugger.*["'`]/.test(t)) dbg++; } return { name: f.name, logs, dbg }; }), f = [];
  const withDbg = rows.filter(r => r.dbg), logs = rows.filter(r => r.logs).sort((a, b) => b.logs - a.logs), total = logs.reduce((n, r) => n + r.logs, 0);
  if (withDbg.length) f.push({ code: "debugger-left", severity: "warn", where: withDbg[0].name, detail: `${withDbg.length} script(s) contain a debugger statement (pauses the page for anyone with dev tools open): ${withDbg.map(r => r.name).join(", ")}` });
  if (total >= 15) f.push({ code: "console-logs", severity: "info", where: "js", detail: `${total} console.log calls across ${logs.length} scripts. Most: ${logs.slice(0, 3).map(r => `${r.name} (${r.logs})`).join(", ")}` });
  return report("consolelog", f, { scripts: files.length, logs: total });
}
export function scan(root = ROOT) { const d = path.join(root, "js"); return debugLeft(fs.existsSync(d) ? fs.readdirSync(d).filter(n => n.endsWith(".js") && !/^(companies|guideidx)\.js$/.test(n)).map(n => ({ name: n, text: fs.readFileSync(path.join(d, n), "utf8") })) : []); }
cli(import.meta.url, () => scan());
