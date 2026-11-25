// Sent Log Hygiene Guard: Hard-rule check: sent-log entries whose date is not YYYY-MM-DD.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfsentdates.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfsentdates = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const s = sent(c), bad = Object.entries(s).filter(([, d]) => !/^\d{4}-\d{2}-\d{2}$/.test(d)); rule(f, "bad-date", bad, Object.keys(s).length || 1, "sent-log entr(ies) have a bad date", { sev: "warn", fmt: () => "an entry", fix: "Use YYYY-MM-DD." }); return report("sfsentdates", f, {}); };
export const scan = (root = ROOT, o = {}) => sfsentdates(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
