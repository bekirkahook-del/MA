// Credit Burn Bot: Netlify credit use against the 1,000 a month and the reset date you noted (the 3rd).
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/creditburn.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const creditburn = c => { const f = [], cr = c.credits; if (!cr) return report("creditburn", [{ code: "no-data", severity: "info", where: "netlify", detail: "No credit data available here." }]); const d = c.now.getUTCDate(), left = Math.max(1, (d <= 3 ? 3 - d : 33 - d)); f.push({ code: cr.ofBudget >= 80 ? "credits-high" : "credits-ok", severity: cr.ofBudget >= 80 ? "warn" : "info", where: "netlify", detail: `${cr.creditsUsed} of 1,000 credits used (${cr.ofBudget}%), about ${left} day(s) to the reset. ${cr.advice}` }); return report("creditburn", f, { used: cr.creditsUsed }); };
export const scan = (root = ROOT, o = {}) => creditburn(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
