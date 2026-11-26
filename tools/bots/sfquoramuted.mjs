// Quora Mute Guard: Hard-rule check: any Quora task that is still queued although Quora is dropped.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfquoramuted.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfquoramuted = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const bad = c.tracked.filter(x => /^social\/quora\/[^/]+\.md$/.test(x) && x > "social/quora/" + c.today); rule(f, "quora-queued", bad, 1, "future Quora draft(s) exist", { sev: "info", fmt: x => x, fix: "Quora is dropped; do not post these." }); return report("sfquoramuted", f, {}); };
export const scan = (root = ROOT, o = {}) => sfquoramuted(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
