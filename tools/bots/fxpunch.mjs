// Punch Log Fixer: Finds punch-log rows with no style and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxpunch.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxpunch = c => { const X = fly(c), f = []; const rows = (c.punch || []).filter(r => !r.style); rule(f, "no-style", rows, (c.punch || []).length || 1, "punch row(s) have no video style", { sev: "info", fmt: r => r.date || "?", fix: "Name the style so the no-repeat rule can check it." }); return report("fxpunch", f, {}); };
export const scan = (root = ROOT, o = {}) => fxpunch(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
