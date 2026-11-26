// Opt-out Guard: Hard-rule check: addresses on the opt-out list that were emailed anyway.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfsuppress.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfsuppress = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; let sup = []; try { sup = JSON.parse(c.readRaw("tools/bots/state/outreach-suppressed.json") || "[]"); } catch {} const s = sent(c), hit = sup.filter(a => s[a] || s[String(a).toLowerCase()]); rule(f, "emailed-after-optout", hit, sup.length || 1, "address(es) were emailed after opting out", { sev: "critical", fmt: () => "an address", fix: "Never contact them again." }); return report("sfsuppress", f, {}); };
export const scan = (root = ROOT, o = {}) => sfsuppress(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
