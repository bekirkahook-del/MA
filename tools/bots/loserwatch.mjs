// Loser Watch Bot: Recent or planned posts whose idea type is already in your LOSERS table, so nothing you decided to stop sneaks back in.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/loserwatch.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const loserwatch = c => { const X = fly(c), f = [], lf = [...new Set(X.losers.map(family))].filter(x => x !== "Other"), hit = X.posts.filter(p => lf.includes(p.family) && daysAgo(p.date, c.today) <= 4); rule(f, "posting-a-loser", hit, X.posts.length, "recent or planned posts are an idea type you put in LOSERS", { sev: "warn", fmt: p => `${p.date.slice(5)} ${p.post.slice(0, 40)} (${p.family})`, where: "social/winners.md" }); return report("loserwatch", f, { loserFamilies: lf.length }); };
export const scan = (root = ROOT, o = {}) => loserwatch(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
