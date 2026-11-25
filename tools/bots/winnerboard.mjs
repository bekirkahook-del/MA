// Winner Board Bot: Rebuilds the idea ranking from the log and says when the 'Idea types ranked' table in winners.md is out of date.
// Part of the Content Flywheel and operator desk (gear: learn). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/winnerboard.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const winnerboard = c => { const X = fly(c), f = [], m = c.winners.match(/\|\s*1\s*\|\s*\*{0,2}([^|*]+)/), fileTop = m ? family(m[1]) : null, top = X.stats[0]; if (top && fileTop && top.family !== fileTop) f.push({ code: "table-out-of-date", severity: "warn", where: "social/winners.md", detail: `The ranked table says #1 is ${fileTop}, but the log says ${top.family} (avg ${top.avg} over ${top.n} posts). Re-rank it.` }); if (top) f.push({ code: "proposed-top3", severity: "info", where: "social/winners.md", detail: `Proposed top 3: ${FW.winners(X.stats, 3, 2, X.losers.map(family)).map((s, i) => `${i + 1}. ${s.family} (${s.avg})`).join("; ")}.` }); return report("winnerboard", f, { top: top && top.family }); };
export const scan = (root = ROOT, o = {}) => winnerboard(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
