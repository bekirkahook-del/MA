// Blackout Gate: No-post days you declared in DAILY.md. Nothing may be made for or logged on them.
// Part of the Content Flywheel and operator desk (gear: gate). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/blackoutgate.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const blackoutgate = c => { const f = [], blk = parseBlackouts(c.daily), made = c.days.filter(d => blk.includes(d.date) && d.date >= c.today); for (const d of made) f.push({ code: "content-on-blackout", severity: "critical", where: "social/" + d.date, detail: `${d.date} is a no-post day in DAILY.md but has content made for it.` }); return report("blackoutgate", f, { blackouts: blk.length }); };
export const scan = (root = ROOT, o = {}) => blackoutgate(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
