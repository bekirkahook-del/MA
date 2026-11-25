// Timing Bot: Post times for tomorrow, spaced at least 2 hours apart between 12pm and 10pm ET, with a small daily jitter so the schedule does not look robotic.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/timing.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const timing = c => { const t = FW.slotTimes(new Date((dayNum(c.today) + 1) * 864e5).toISOString().slice(0, 10), 4), mins = t.map(x => +x.slice(0, 2) * 60 + +x.slice(3)), ok = mins.every((m, i) => !i || m - mins[i - 1] >= 120), f = [{ code: ok ? "times" : "spacing-broken", severity: ok ? "info" : "warn", where: "plan", detail: `Tomorrow's slots (ET): ${t.join(", ")}.${ok ? "" : " Two are under 2 hours apart."}` }]; return report("timing", f, { slots: t.length }); };
export const scan = (root = ROOT, o = {}) => timing(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
