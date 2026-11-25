// Log Date Fixer: Finds post-log rows with no views after 4 days and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxpostdate.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxpostdate = c => { const X = fly(c), f = []; const old = X.posts.filter(p => !hasViews(p) && daysAgo(p.date, c.today) > 4); rule(f, "unscored", old, X.posts.length || 1, "post(s) older than 4 days have no views logged", { sev: "warn", fmt: p => p.date + " " + p.post.slice(0, 30), fix: "Fill the IG and TT views from Metricool." }); return report("fxpostdate", f, {}); };
export const scan = (root = ROOT, o = {}) => fxpostdate(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
