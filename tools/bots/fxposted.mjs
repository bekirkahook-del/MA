// Posted Log Fixer: Finds posted.md rows missing a date and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxposted.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxposted = c => { const X = fly(c), f = []; const rows = (c.posted || []).filter(r => !r.date); rule(f, "no-date", rows, (c.posted || []).length || 1, "posted row(s) have no date", { sev: "info", fmt: r => String(r.title || r.text || "").slice(0, 30), fix: "Add YYYY-MM-DD to each row." }); return report("fxposted", f, {}); };
export const scan = (root = ROOT, o = {}) => fxposted(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
