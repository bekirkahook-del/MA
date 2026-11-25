// Experiment Bot: Designs the one test slot for tomorrow with a written hypothesis and a pass/fail rule, so tests teach something instead of just filling a slot.
// Part of the Content Flywheel and operator desk (gear: learn). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/experiments.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const experiments = c => { const X = fly(c), f = [], tomorrow = new Date((dayNum(c.today) + 1) * 864e5).toISOString().slice(0, 10), p = planDay({ date: tomorrow, posts: X.posts, board: X.board, losers: X.losers.map(family), backlog: X.backlog.map(b => ({ ...b })), spikesDue: X.spikes }), t = p.slots.find(s => s.role === "TEST"); if (t) f.push({ code: "test-slot", severity: "info", where: "plan " + tomorrow, detail: `Test ${t.family}: ${t.topic}. Hypothesis: it beats the overall average (${X.overall.avg}). Pass: 48h views above ${X.overall.avg}, then promote it. Fail: under 120 twice, then it goes to LOSERS.` }); return report("experiments", f, {}); };
export const scan = (root = ROOT, o = {}) => experiments(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
