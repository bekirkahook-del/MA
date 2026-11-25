// Deploy Planner: What is staged, whether it builds the site (15 credits) and how many deploys the month still affords. It advises; only you say deploy.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/deployplan.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const deployplan = c => { const f = [], nb = /^(data\/wire\.json|social\/|guides\/_src\/|supabase\/|tests\/|tools\/|.*\.md$)/, q = c.queue, build = q.filter(x => x.files.some(y => !nb.test(y))), cr = c.credits; if (!q.length) return report("deployplan", [{ code: "nothing-staged", severity: "info", where: "staging", detail: "Nothing is waiting on staging." }]); f.push({ code: "staged", severity: "info", where: "staging", detail: `${q.length} change(s) staged, ${build.length} build the site (one deploy, ~15 credits). ${cr ? `Credits used ${cr.creditsUsed} of 1,000 (${cr.ofBudget}%).` : ""}` }); return report("deployplan", f, { staged: q.length, builds: build.length }); };
export const scan = (root = ROOT, o = {}) => deployplan(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
