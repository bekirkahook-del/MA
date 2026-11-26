// Redirect Bot: netlify.toml redirects that loop, chain, repeat, or point at nothing.
// Usage: node tools/bots/redirects.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { read, report } from "./scan.mjs";

export function parseRedirects(toml) {
  return toml.split(/\[\[redirects\]\]/).slice(1).map(b => { const g = k => { const m = b.match(new RegExp(`^\\s*${k}\\s*=\\s*["']([^"']*)["']`, "m")); return m ? m[1] : ""; }; const s = b.match(/^\s*status\s*=\s*(\d+)/m); return { from: g("from"), to: g("to"), status: s ? +s[1] : 301 }; }).filter(r => r.from);
}
export function redirects(list, exists) {
  const f = [], add = (code, severity, detail, where) => f.push({ code, severity, detail, where }), froms = {};
  for (const r of list) (froms[r.from] ||= []).push(r);
  const loops = list.filter(r => r.from === r.to), dups = Object.entries(froms).filter(([, l]) => l.length > 1 && !l.some(x => x.status === 200 && x.force === false));
  const chains = list.filter(r => froms[r.to] && r.to !== r.from && !/\*|:/.test(r.to));
  const dead = list.filter(r => r.status !== 200 && r.to.startsWith("/") && !/[*:]/.test(r.to) && !exists(r.to.split(/[?#]/)[0] || "/") && !froms[r.to]);
  if (loops.length) add("redirect-loop", "critical", `${loops.length} redirects point at themselves: ${loops.slice(0, 3).map(r => r.from).join(", ")}`, loops[0].from);
  if (dups.length) add("duplicate-redirect", "info", `${dups.length} "from" paths are listed more than once (only the first wins): ${dups.slice(0, 3).map(d => d[0]).join(", ")}`, dups[0][0]);
  if (chains.length) add("redirect-chain", "info", `${chains.length} redirects go to a path that redirects again (slower, and loses ranking): ${chains.slice(0, 3).map(r => `${r.from} -> ${r.to}`).join("; ")}`, chains[0].from);
  if (dead.length) add("redirect-dead-target", "warn", `${dead.length} redirects point at a page that does not exist: ${dead.slice(0, 3).map(r => `${r.from} -> ${r.to}`).join("; ")}`, dead[0].from);
  return report("redirects", f, { redirects: list.length });
}
export function scan(root = ROOT) { const ex = p => { const f = path.join(root, p); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, "index.html"))); }; return redirects(parseRedirects(read(root, "netlify.toml")), ex); }
cli(import.meta.url, () => scan());
