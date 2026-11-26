// Dependency Bot: package.json hygiene and known vulnerabilities (npm audit, when it can run). The site itself has no build step, so this mostly watches the functions.
// Usage: node tools/bots/deps.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";

export function deps({ pkgs, audit }) {
  const f = [], add = (code, severity, detail, where) => f.push({ code, severity, detail, where });
  if (!pkgs.length) return report("deps", [], { packageFiles: 0, note: "no package.json: nothing to audit" });
  for (const p of pkgs) {
    const all = { ...(p.json.dependencies || {}), ...(p.json.devDependencies || {}) }, loose = Object.entries(all).filter(([, v]) => /^(\*|latest|x|)$/.test(v) || /^(git|http|github)/.test(v));
    if (loose.length) add("deps-unpinned", "warn", `${p.file}: ${loose.length} dependencies are unpinned or from a git URL: ${loose.slice(0, 4).map(([k, v]) => `${k}@${v || "''"}`).join(", ")}`, p.file);
    if (Object.keys(all).length && !p.lock) add("deps-no-lockfile", "info", `${p.file} has ${Object.keys(all).length} dependencies but no lockfile, so installs can differ between deploys.`, p.file);
  }
  const v = audit && audit.metadata && audit.metadata.vulnerabilities;
  if (v) { const hi = (v.high || 0) + (v.critical || 0); if (hi) add("deps-vulnerable", "critical", `npm audit: ${v.critical || 0} critical and ${v.high || 0} high vulnerabilities (${v.moderate || 0} moderate, ${v.low || 0} low).`, "npm audit"); else if (v.moderate || v.low) add("deps-vulnerable-minor", "info", `npm audit: ${v.moderate || 0} moderate and ${v.low || 0} low vulnerabilities.`, "npm audit"); }
  return report("deps", f, { packageFiles: pkgs.length, audited: !!v });
}
export function scan(root = ROOT, o = {}) {
  const pkgs = ["package.json", "netlify/functions/package.json"].filter(p => fs.existsSync(path.join(root, p))).map(file => ({ file, json: JSON.parse(fs.readFileSync(path.join(root, file), "utf8")), lock: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"].some(l => fs.existsSync(path.join(root, path.dirname(file), l))) }));
  let audit = null; if (o.audit && pkgs.some(p => p.lock)) try { audit = JSON.parse(execFileSync("npm", ["audit", "--json"], { cwd: root, encoding: "utf8", timeout: 25000, stdio: ["ignore", "pipe", "ignore"] })); } catch (e) { try { audit = JSON.parse(e.stdout || "null"); } catch (_) { /* audit unavailable */ } }
  return deps({ pkgs, audit });
}
cli(import.meta.url, a => scan(ROOT, { audit: a.includes("--audit") }));
