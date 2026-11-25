// Flop Bot: Idea types whose last three posts all stayed under 120 views on both platforms. Your rule: three in a row sends the idea to LOSERS.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/flops.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const flops = c => { const X = fly(c), f = [], bad = FW.flopStreaks(X.stats), listed = X.losers.map(family); for (const s of bad) f.push({ code: listed.includes(s.family) ? "flop-confirmed" : "flop-not-in-losers", severity: listed.includes(s.family) ? "info" : "warn", where: "social/winners.md", detail: `${s.family}: last 3 posts all under 120 views (${s.posts.slice(-3).map(p => best(p)).join(", ")}). ${listed.includes(s.family) ? "Already in LOSERS." : "Move it to LOSERS and stop posting it."}` }); return report("flops", f, { flops: bad.length }); };
export const scan = (root = ROOT, o = {}) => flops(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
