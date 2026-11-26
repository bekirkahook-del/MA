// Post Log Bot: Posts old enough to score (48h) that still have no views in the winners log: these are the numbers the whole flywheel runs on.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/logscore.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const logscore = c => { const X = fly(c), f = [], due = X.posts.filter(p => !hasViews(p) && daysAgo(p.date, c.today) >= 2); rule(f, "needs-scoring", due, X.posts.length, "logged posts are 2+ days old with no views", { sev: due.length > 3 ? "warn" : "info", fmt: p => p.date.slice(5) + " " + p.post.slice(0, 40), where: "social/winners.md" }); const other = X.posts.filter(p => p.family === "Other"); rule(f, "unknown-idea-type", other, X.posts.length, "logged posts have an idea type the flywheel does not recognise", { sev: "info", fmt: p => p.idea, where: "social/winners.md" }); return report("logscore", f, { logged: X.posts.length, scored: X.overall.n }); };
export const scan = (root = ROOT, o = {}) => logscore(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
