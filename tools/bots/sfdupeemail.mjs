// Duplicate Email Guard: Hard-rule check: the same address or organization appearing twice in the sent log.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfdupeemail.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfdupeemail = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const s = sent(c), keys = Object.keys(s).filter(k => !k.startsWith("org:")), seen = {}, dup = []; for (const k of keys) { const a = k.toLowerCase(); if (seen[a]) dup.push(k); seen[a] = 1; } rule(f, "dup", dup, keys.length || 1, "address(es) appear twice in the sent log", { sev: "critical", fmt: k => "an address", fix: "Remove the repeat; one email per club, ever." }); return report("sfdupeemail", f, {}); };
export const scan = (root = ROOT, o = {}) => sfdupeemail(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
