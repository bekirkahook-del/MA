// Final Numbers Bot: Posts still marked 'at ~34h' or 'score Nov 25' that are now old enough for final numbers.
// Part of the Content Flywheel and operator desk (gear: learn). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/finalnumbers.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const finalnumbers = c => { const X = fly(c), f = [], due = X.posts.filter(p => hasViews(p) && provisional(p) && daysAgo(p.date, c.today) >= 3); rule(f, "rescore", due, X.posts.length, "posts still show provisional views but are 3+ days old", { sev: due.length > 2 ? "warn" : "info", fmt: p => p.date.slice(5) + " " + p.post.slice(0, 36), where: "social/winners.md" }); return report("finalnumbers", f, {}); };
export const scan = (root = ROOT, o = {}) => finalnumbers(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
