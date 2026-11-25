// Deals Freshness Bot: How recent the newest deal on the wire is. Deals are your live-market content engine.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/dealsage.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const dealsage = c => { const f = [], d = (c.wire && c.wire.DEALS) || [], dates = d.map(x => parseWireDate(x.date)).filter(Boolean).sort(), newest = dates[dates.length - 1]; if (newest && daysAgo(newest, c.today) > 3) f.push({ code: "deals-stale", severity: "warn", where: "data/wire.json", detail: `Newest deal on the wire is ${newest} (${daysAgo(newest, c.today)} days ago).` }); return report("dealsage", f, { deals: d.length, newest }); };
export const scan = (root = ROOT, o = {}) => dealsage(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
