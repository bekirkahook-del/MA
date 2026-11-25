// Growth Rate Bot: Week-over-week change in average views per post, doubling time, and whether the log is on the compounding goal. The honest scoreboard for 'growing exponentially'.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/growthrate.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const growthrate = c => { const X = fly(c), g = X.growth, f = []; if (g.weeks.length < 2) return report("growthrate", [{ code: "need-more-weeks", severity: "info", where: "social/winners.md", detail: `Only ${g.weeks.length} week(s) with 3+ scored posts. Growth needs two.` }]); const last = g.weeks[g.weeks.length - 1], prev = g.weeks[g.weeks.length - 2], pct = x => (x == null ? "n/a" : (x >= 0 ? "+" : "") + Math.round(x * 100) + "%"); f.push({ code: g.onTrack ? "on-track" : "below-goal", severity: g.onTrack ? "info" : "warn", where: "social/winners.md", detail: `Average views per post went ${prev.avg} -> ${last.avg} (${pct(g.rate)}), median ${prev.median} -> ${last.median} (${pct(g.medianRate)}). Goal ${pct(g.goal)} a week${g.doublingWeeks ? `; at this pace views per post double every ${g.doublingWeeks} weeks` : ""}.` }); const first = g.weeks[0]; if (first.top > 3 * first.median) f.push({ code: "outlier-week", severity: "info", where: "social/winners.md", detail: `The week of ${first.week} is carried by one post at ${first.top} views (median ${first.median}), so the first drop looks bigger than it is. Judge growth on the median.` }); return report("growthrate", f, { weeks: g.weeks.length, rate: g.rate, medianRate: g.medianRate }); };
export const scan = (root = ROOT, o = {}) => growthrate(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
