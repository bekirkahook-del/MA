// Blackout Guard: Hard-rule check: an upcoming deck dated on a no-post blackout day.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfblackout.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfblackout = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const bl = parseBlackouts(c.daily, c.now) || [], bad = c.days.filter(d => d.date >= c.today && bl.includes(d.date)); rule(f, "blackout", bad, c.days.length || 1, "deck(s) are dated on a no-post day", { sev: "warn", fmt: d => d.date, fix: "Move the post." }); return report("sfblackout", f, {}); };
export const scan = (root = ROOT, o = {}) => sfblackout(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
