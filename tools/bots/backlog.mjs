// Topic Backlog Bot: How many fresh, unposted topics each winning idea type has. A winner with an empty backlog is the first thing that stalls the flywheel.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/backlog.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const backlog = c => { const X = fly(c), f = [], by = {}; for (const b of X.backlog) by[b.family] = (by[b.family] || 0) + 1; for (const w of FW.winners(X.stats)) if ((by[w.family] || 0) < 3) f.push({ code: "winner-backlog-low", severity: "warn", where: "social/topics.md", detail: `${w.family} (a top winner) has only ${by[w.family] || 0} unposted topic(s). Refill it.` }); f.push({ code: "backlog-depth", severity: "info", where: "social/topics.md", detail: `Unposted topics by type: ${Object.entries(by).map(([k, v]) => `${k} ${v}`).join("; ") || "none"}.` }); return report("backlog", f, { topics: X.backlog.length }); };
export const scan = (root = ROOT, o = {}) => backlog(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
