// Claim Words Guard: Hard-rule check: guarantee-style claims in decks or email templates.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfclaims.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfclaims = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const t = (c.days.filter(d => d.date >= c.today).map(d => JSON.stringify(d.spec || "")).join(" ") + c.rd("tools/bots/outreach.mjs")), hit = (t.match(/guarantee[ds]?|get you hired|100% (?:of|success)|will land/gi) || []); rule(f, "claim", hit, 1, "guarantee-style phrase(s) found", { sev: "critical", fmt: x => x, fix: "Never promise a job or a result." }); return report("sfclaims", f, {}); };
export const scan = (root = ROOT, o = {}) => sfclaims(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
