// Opt-out Line Guard: Hard-rule check: an email template with no opt-out line.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfoptout.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfoptout = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const t = c.rd("tools/bots/outreach.mjs"), n = (t.match(/no thanks/gi) || []).length; rule(f, "no-optout", n >= 2 ? [] : ["template"], 1, "template(s) lack the opt-out line", { sev: "critical", fmt: x => x, fix: "Both templates need: Reply \"no thanks\" and I won't email again." }); return report("sfoptout", f, {}); };
export const scan = (root = ROOT, o = {}) => sfoptout(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
