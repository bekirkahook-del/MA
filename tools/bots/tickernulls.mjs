// Ticker Gap Bot: Ticker rows with a missing price or a dash, so the tape never shows an empty cell.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/tickernulls.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const tickernulls = c => { const f = [], t = (c.wire && c.wire.TICKER) || [], bad = t.filter(r => !r[1] || /^[-—–]+$/.test(String(r[1]))); rule(f, "empty-price", bad, t.length, "ticker rows have no price", { sev: "warn", fmt: r => r[0], where: "data/wire.json" }); return report("tickernulls", f, { rows: t.length }); };
export const scan = (root = ROOT, o = {}) => tickernulls(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
