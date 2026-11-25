// Idea Average Bot: Average views per post for every idea type, computed straight from the log. The ranking every other flywheel bot uses.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/ideaavg.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const ideaavg = c => { const X = fly(c), f = [], s = X.stats; if (!s.length) return report("ideaavg", [{ code: "no-data", severity: "info", where: "social/winners.md", detail: "No scored posts in the post log yet." }]); f.push({ code: "ranking", severity: "info", where: "social/winners.md", detail: `Ranked by average views per post (IG + TikTok): ${s.slice(0, 5).map(x => `${x.family} ${x.avg} (n=${x.n})`).join("; ")}. Overall average ${X.overall.avg} over ${X.overall.n} scored posts.` }); return report("ideaavg", f, { families: s.length, overallAvg: X.overall.avg }); };
export const scan = (root = ROOT, o = {}) => ideaavg(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
