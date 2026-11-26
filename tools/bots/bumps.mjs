// Outreach Bump Bot: Follow-up emails that are due: club emails (bump after 5 days) and career-center emails (after 7), from the send dates in outreach-log.json.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/bumps.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const bumps = c => { const f = []; for (const g of c.outreach.groups || []) { if (g.bumped) continue; const due = new Date((dayNum(g.sent) + g.bumpAfterDays) * 864e5).toISOString().slice(0, 10), late = daysAgo(due, c.today); const w = outreachWindow(c.now); f.push({ code: late >= 0 ? "bump-due" : "bump-soon", severity: late > 0 ? "warn" : "info", where: "outreach", detail: `${g.name}: ${g.count} sent ${g.sent}. Bump ${late >= 0 ? `was due ${due}${late ? ` (${late} day(s) overdue)` : " today"}` : `due ${due}`}. ${late >= 0 ? (w.open ? "The outreach window is open now (Mon-Fri 9am-4pm ET), so send it." : `Send inside Mon-Fri 9am-4pm ET: next window ${w.next}.`) : ""}` }); } return report("bumps", f, { groups: (c.outreach.groups || []).length }); };
export const scan = (root = ROOT, o = {}) => bumps(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
