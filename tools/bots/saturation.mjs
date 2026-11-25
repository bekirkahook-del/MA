// Saturation Bot: One idea type taking over the feed, or a winner that has gone quiet. Winners fade when you repeat them every day.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/saturation.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const saturation = c => { const X = fly(c), f = [], last = X.posts.slice(-10), by = {}; for (const p of last) by[p.family] = (by[p.family] || 0) + 1; for (const [fam, n] of Object.entries(by)) if (n / last.length > 0.5) f.push({ code: "one-type-dominates", severity: "warn", where: "social/winners.md", detail: `${fam} is ${n} of the last ${last.length} posts. Mix in a second winner so it does not burn out.` }); for (const w of FW.winners(X.stats)) if (!X.posts.slice(-6).some(p => p.family === w.family)) f.push({ code: "winner-gone-quiet", severity: "info", where: "social/winners.md", detail: `${w.family} (avg ${w.avg}) is a top winner but not in the last 6 posts.` }); return report("saturation", f, { families: Object.keys(by).length }); };
export const scan = (root = ROOT, o = {}) => saturation(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
