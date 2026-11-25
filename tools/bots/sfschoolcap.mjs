// School Cap Guard: Hard-rule check: more than 2 clubs emailed at one school.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfschoolcap.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfschoolcap = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const s = sent(c), by = {}; for (const k of Object.keys(s)) { const m = k.match(/@([\w.-]+\.edu)$/i); if (m) by[m[1].toLowerCase()] = (by[m[1].toLowerCase()] || 0) + 1; } const over = Object.entries(by).filter(([, n]) => n > 2); rule(f, "school-cap", over, Object.keys(by).length || 1, "school(s) have more than 2 clubs emailed", { sev: "warn", fmt: ([d, n]) => d + ": " + n, fix: "Max 2 clubs per school." }); return report("sfschoolcap", f, {}); };
export const scan = (root = ROOT, o = {}) => sfschoolcap(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
