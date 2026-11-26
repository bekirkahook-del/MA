// Pending Outreach Bot: Contacts you have not emailed yet (clubs with only a form, career centers with no verified inbox), so the list does not get forgotten.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/pendingoutreach.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const pendingoutreach = c => { const f = []; const w = outreachWindow(c.now); for (const p of c.outreach.pending || []) f.push({ code: "pending-contacts", severity: "info", where: "outreach", detail: `${p.count} waiting: ${p.name}. Next: ${p.next}. Send only Mon-Fri 9am-4pm ET${w.open ? " (open now)" : ` (next ${w.next})`}.` }); return report("pendingoutreach", f, { groups: (c.outreach.pending || []).length }); };
export const scan = (root = ROOT, o = {}) => pendingoutreach(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
