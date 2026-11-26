// Wire Past Rows Fixer: Finds calendar rows already in the past and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxwirepast.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxwirepast = c => { const X = fly(c), f = []; const W = c.wire || {}, past = (W.CAL || []).filter(r => { const d = parseWireDate(r[0], c.now); return d && d < c.today; }); rule(f, "past-cal", past, (W.CAL || []).length || 1, "calendar row(s) are already past", { sev: "info", fmt: r => r[0], fix: "The Fixer prunes these automatically; merge data/wire.json." }); return report("fxwirepast", f, {}); };
export const scan = (root = ROOT, o = {}) => fxwirepast(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
