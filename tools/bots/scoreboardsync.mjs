// Scoreboard Sync Bot: Idea types that appear in the post log but have no row in the platform scoreboard, so routing has no evidence for them.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/scoreboardsync.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const scoreboardsync = c => { const X = fly(c), f = [], inLog = [...new Set(X.posts.map(p => p.family))].filter(x => x !== "Other"), miss = inLog.filter(x => !X.board.some(b => b.family === x)); rule(f, "no-scoreboard-row", miss, inLog.length, "idea types in the log have no platform scoreboard row", { sev: "info", fmt: x => x, where: "social/winners.md" }); return report("scoreboardsync", f, { families: inLog.length, boardRows: X.board.length }); };
export const scan = (root = ROOT, o = {}) => scoreboardsync(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
