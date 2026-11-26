// Shared helpers for the third bot pack (75 small, single-purpose sensors).
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";
export const eg = (arr, n = 3, f = x => x) => arr.slice(0, n).map(f).join("; ");
/* push one finding: "<count> of <total> <msg>. e.g. ..." (warn when more than 10% of the total, else info) */
export function rule(f, code, list, total, msg, { sev, fmt = x => x.slug || String(x), n = 3, where = "guides" } = {}) {
  if (!list.length) return;
  f.push({ code, severity: sev || (list.length / (total || 1) > 0.1 ? "warn" : "info"), where, detail: `${list.length} of ${total} ${msg}. e.g. ${list.slice(0, n).map(fmt).join("; ")}` });
}
const ls = (root, dir, re) => { const d = path.join(root, dir); return fs.existsSync(d) ? fs.readdirSync(d).filter(n => re.test(n)).map(n => ({ rel: `${dir}/${n}`, src: fs.readFileSync(path.join(d, n), "utf8") })) : []; };
export const jsFiles = (root = ROOT) => [...ls(root, "js", /\.js$/), ...ls(root, "netlify/functions", /\.mjs$/), ...ls(root, ".", /^sw\.js$/).map(x => ({ ...x, rel: "sw.js" }))];
export const fnFiles = (root = ROOT) => ls(root, "netlify/functions", /\.mjs$/);
export const sqlFiles = (root = ROOT) => ls(root, "supabase", /\.sql$/);
export const lineCount = s => s.split("\n").length;
export const words = s => (String(s).toLowerCase().match(/[a-z0-9]{3,}/g) || []);
/* PNG / JPEG pixel size from the file header (no image library needed) */
export function imgSize(buf) {
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  if (buf[0] === 0xff && buf[1] === 0xd8) { let i = 2; while (i < buf.length - 9) { if (buf[i] !== 0xff) { i++; continue; } const m = buf[i + 1]; if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) }; i += 2 + buf.readUInt16BE(i + 2); } }
  return null;
}
