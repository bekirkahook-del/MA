// Quora Cadence Bot: Days since your last Quora answer and answers per week. Quora is your one channel that can still link to the site.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/quoragap.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const quoragap = c => { const f = [], p = c.quora.posted; if (!p.length) return report("quoragap", [{ code: "none", severity: "info", where: "social/quora/posted.md", detail: "No Quora answers logged." }]); const last = p[p.length - 1].date, gap = daysAgo(last, c.today), wk = p.filter(x => daysAgo(x.date, c.today) <= 7).length; f.push({ code: gap >= 3 ? "quora-gap" : "quora-ok", severity: gap >= 3 ? "warn" : "info", where: "social/quora/posted.md", detail: `Last Quora answer ${last} (${gap} days ago). ${wk} answer(s) in the last 7 days, ${p.length} total.` }); return report("quoragap", f, { total: p.length, week: wk }); };
export const scan = (root = ROOT, o = {}) => quoragap(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
