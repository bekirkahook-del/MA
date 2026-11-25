// Feedback Bot Idle Bot: Days since the feedback bot last ran. Student feedback is your fastest signal.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/feedbotidle.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const feedbotidle = c => { const gap = c.feedbotLast ? daysAgo(c.feedbotLast, c.today) : null, f = []; if (gap == null) f.push({ code: "never-ran", severity: "info", where: "tools/feedbot", detail: "The feedback bot has no logged run." }); else if (gap >= 2) f.push({ code: "idle", severity: "warn", where: "tools/feedbot/LOG.md", detail: `The feedback bot last ran ${c.feedbotLast} (${gap} days ago).` }); return report("feedbotidle", f, { lastRun: c.feedbotLast }); };
export const scan = (root = ROOT, o = {}) => feedbotidle(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
