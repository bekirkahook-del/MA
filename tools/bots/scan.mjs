// Shared helpers for the static-scan bots (read-only: they only read files in the repo).
import fs from "node:fs";
import path from "node:path";
import { git, ROOT } from "./lib.mjs";

export const read = (root, rel) => { try { return fs.readFileSync(path.join(root, rel), "utf8"); } catch (e) { return ""; } };
export function guidePages(root = ROOT) {
  const dir = path.join(root, "guides");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(dir, d.name, "index.html")))
    .map(d => ({ slug: d.name, rel: `guides/${d.name}/index.html`, html: fs.readFileSync(path.join(dir, d.name, "index.html"), "utf8") }));
}
export const textOf = html => html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
export const tag = (html, re) => { const m = html.match(re); return m ? m[1].trim() : ""; };
export const metaContent = (html, key) => { const m = html.match(new RegExp(`<meta[^>]+(?:name|property)=["']${key}["'][^>]*>`, "i")); const c = m && m[0].match(/content=["']([^"']*)["']/i); return c ? c[1].trim() : ""; };

/* group per-item problems into one finding per code: "N pages: what. e.g. a, b, c" */
export function group(items, notes = {}) {
  const by = {};
  for (const i of items) (by[i.code] ||= []).push(i);
  return Object.entries(by).map(([code, list]) => ({
    code, severity: list[0].severity, count: list.length, where: code,
    detail: `${list.length} ${notes[code]?.unit || "pages"}: ${notes[code]?.text || code}. e.g. ${list.slice(0, 3).map(l => l.where).join(", ")}`,
  }));
}
export const report = (bot, findings, stats = {}) => ({ bot, findings, stats, ok: !findings.some(f => f.severity === "critical") });

/* tracked files (git), falling back to a walk when the folder is not a repo */
export function trackedFiles(root = ROOT) {
  const out = git(["ls-files"], root);
  if (out) return out.split("\n").filter(Boolean);
  const res = [], walk = d => { for (const e of fs.readdirSync(path.join(root, d), { withFileTypes: true })) { if (["node_modules", ".git"].includes(e.name)) continue; const r = path.join(d, e.name); e.isDirectory() ? walk(r) : res.push(r); } };
  walk(""); return res;
}
