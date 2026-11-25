// Directory Bot: The next 2 free directory listings to submit today (your note: 1-2 a day, never all at once), from your directories file.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/dirnext.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const dirnext = c => { const f = [], rows = [...c.directories.matchAll(/^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|/gm)].map(m => ({ n: +m[1], site: m[2] })), done = (c.root && JSON.parse(c.rd("tools/bots/state/directories-done.json") || '{"done":[]}').done) || [], left = rows.filter(r => !done.some(d => r.site.toLowerCase().includes(String(d).toLowerCase()))); if (!rows.length) return report("dirnext", [{ code: "no-table", severity: "info", where: "social/directories.md", detail: "No directory table found." }]); f.push({ code: left.length ? "submit-today" : "all-done", severity: left.length ? "warn" : "info", where: "social/directories.md", detail: left.length ? `${left.length} of ${rows.length} listings not done. Today: ${left.slice(0, 2).map(r => r.site).join(" and ")}. Mark them done in tools/bots/state/directories-done.json.` : "All directory listings are marked done." }); return report("dirnext", f, { total: rows.length, left: left.length }); };
export const scan = (root = ROOT, o = {}) => dirnext(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
