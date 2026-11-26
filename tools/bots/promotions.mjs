// Promotion Bot: Test ideas whose posts already beat the overall average, so a promising idea gets a second sample instead of being forgotten.
// Part of the Content Flywheel and operator desk (gear: learn). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/promotions.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const promotions = c => { const X = fly(c), f = [], avg = X.overall.avg; for (const s of X.stats.filter(s => s.n < 2 && avg && s.avg > avg)) f.push({ code: "second-sample", severity: "info", where: "social/winners.md", detail: `${s.family}: one scored post at ${s.avg} beat the ${avg} average. Post it again to see if it holds.` }); for (const s of X.stats.filter(s => s.n >= 2 && avg && s.avg > 1.5 * avg && !FW.winners(X.stats).some(w => w.family === s.family))) f.push({ code: "promote", severity: "warn", where: "social/winners.md", detail: `${s.family} averages ${s.avg} over ${s.n} posts but is not in your top 3. Promote it.` }); return report("promotions", f, {}); };
export const scan = (root = ROOT, o = {}) => promotions(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
