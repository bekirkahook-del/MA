// Calendar Freshness Bot: Calendar events on the wire that are already over, and no events in the next 3 days.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/calpast.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const calpast = c => { const f = [], cal = (c.wire && c.wire.CAL) || [], past = cal.filter(e => { const d = parseWireDate(e[0]); return d && daysAgo(d, c.today) > 0; }), soon = cal.filter(e => { const d = parseWireDate(e[0]); return d && daysAgo(d, c.today) <= 0 && daysAgo(d, c.today) >= -3; }); rule(f, "calendar-past", past, cal.length, "calendar events on the wire are already over", { sev: "warn", fmt: e => e[0] + " " + e[1], where: "data/wire.json" }); if (!soon.length) f.push({ code: "calendar-empty", severity: "warn", where: "data/wire.json", detail: "No calendar events in the next 3 days. The wire looks stale." }); return report("calpast", f, { events: cal.length }); };
export const scan = (root = ROOT, o = {}) => calpast(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
