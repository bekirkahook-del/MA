// Daily Email Cap Guard: Hard-rule check: more than 9 new emails in one day.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfdaycap.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfdaycap = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const s = sent(c), by = {}; for (const [k, d] of Object.entries(s)) if (!k.startsWith("org:")) by[d] = (by[d] || 0) + 1; const over = Object.entries(by).filter(([, n]) => n > 9); rule(f, "over-cap", over, Object.keys(by).length || 1, "day(s) went over 9 emails (3 runs x 3)", { sev: "warn", fmt: ([d, n]) => d + ": " + n, fix: "Stay at 9 or fewer a day so it never reads as spam." }); return report("sfdaycap", f, {}); };
export const scan = (root = ROOT, o = {}) => sfdaycap(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
