// Platform Router Bot: Where each idea type should and should not go, from your platform scoreboard (green/yellow/untested = post, red = skip).
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/platformroute.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const platformroute = c => { const X = fly(c), f = []; for (const s of FW.winners(X.stats, 4, 1)) { const r = FW.route(X.board, s.family), P = a => a.map(k => PLATFORMS[k]).join(", "); f.push({ code: "route", severity: "info", where: "social/winners.md", detail: `${s.family}: post to ${P(r.post) || "none"}${r.skip.length ? `; skip ${P(r.skip)}` : ""}.` }); } return report("platformroute", f, { families: X.board.length }); };
export const scan = (root = ROOT, o = {}) => platformroute(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
