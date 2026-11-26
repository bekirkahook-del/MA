// Ticker Null Fixer: Finds ticker rows with a missing price and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxtickernull.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxtickernull = c => { const X = fly(c), f = []; const W = c.wire || {}, bad = (W.TICKER || []).filter(r => r[1] == null || r[1] === ""); rule(f, "null-price", bad, (W.TICKER || []).length || 1, "ticker row(s) have no price", { sev: "warn", fmt: r => r[0], fix: "Refresh the ticker feed or drop the row." }); return report("fxtickernull", f, {}); };
export const scan = (root = ROOT, o = {}) => fxtickernull(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
