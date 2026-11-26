// Earnings Freshness Bot: Earnings rows dated before yesterday still sitting on the wire.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/earnpast.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const earnpast = c => { const f = [], e = (c.wire && c.wire.EARN) || [], past = e.filter(r => daysAgo(r[0], c.today) > 1); rule(f, "earnings-past", past, e.length, "earnings rows on the wire are more than a day old", { sev: "info", fmt: r => r[0] + " " + r[1], where: "data/wire.json" }); if (e.length && !e.some(r => daysAgo(r[0], c.today) <= 0)) f.push({ code: "no-upcoming", severity: "warn", where: "data/wire.json", detail: "No upcoming earnings rows on the wire." }); return report("earnpast", f, { rows: e.length }); };
export const scan = (root = ROOT, o = {}) => earnpast(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
