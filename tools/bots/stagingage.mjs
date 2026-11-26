// Staging Age Bot: How long the oldest change has sat on staging. Work that waits too long goes stale and conflicts with main.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/stagingage.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const stagingage = c => { const f = [], old = Math.max(0, ...c.queue.map(x => x.days)); if (c.queue.length && old >= 3) f.push({ code: "waiting-long", severity: old >= 7 ? "warn" : "info", where: "staging", detail: `The oldest staged change is ${old} days old. Batch and deploy, or decide to drop it.` }); return report("stagingage", f, { oldestDays: old }); };
export const scan = (root = ROOT, o = {}) => stagingage(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
