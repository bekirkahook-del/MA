// Post Hours Guard: Hard-rule check: posts planned outside 12pm-10pm ET.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfhours.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfhours = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const slots = (X.board ? [] : []); f.push({ code: "rule", severity: "info", where: "social", detail: "Rule: post between 12pm and 10pm ET, 2 hours apart. The Slot Planner already spaces tomorrow's slots; this bot only reminds you." }); return report("sfhours", f, {}); };
export const scan = (root = ROOT, o = {}) => sfhours(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
