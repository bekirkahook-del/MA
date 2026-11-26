// Compounding Bot: Views per post now versus the first full week in the log, as a multiple. The one number that says whether the flywheel is turning.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/compound.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const compound = c => { const X = fly(c), w = X.growth.weeks, f = []; if (w.length < 2) return report("compound", f, { weeks: w.length }); const m = +(w[w.length - 1].avg / w[0].avg).toFixed(2), mm = +(w[w.length - 1].median / w[0].median).toFixed(2); f.push({ code: "multiple", severity: m >= 1 ? "info" : "warn", where: "social/winners.md", detail: `Views per post are ${m}x the week of ${w[0].week} (${mm}x on the median). The target is above 1.0x and rising.` }); return report("compound", f, { multiple: m, medianMultiple: mm }); };
export const scan = (root = ROOT, o = {}) => compound(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
