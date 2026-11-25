// Retirement Bot: Idea types with 3+ scored posts averaging under 120 views: retire them so slots go to winners.
// Part of the Content Flywheel and operator desk (gear: learn). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/retirements.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const retirements = c => { const X = fly(c), f = [], bad = X.stats.filter(s => s.n >= 2 && s.avg < 120 && !X.losers.map(family).includes(s.family)); rule(f, "retire", bad, X.stats.length, "idea types average under 120 views and are not in LOSERS", { sev: "warn", fmt: s => `${s.family} (avg ${s.avg}, n=${s.n})`, where: "social/winners.md" }); return report("retirements", f, {}); };
export const scan = (root = ROOT, o = {}) => retirements(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
