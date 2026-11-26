// Send Window Guard: Hard-rule check: email sent outside Mon-Fri 9am-4pm ET (checks the log dates for weekends).
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfwindow.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfwindow = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const s = sent(c), wk = Object.entries(s).filter(([k, d]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && [0, 6].includes(new Date(d + "T12:00:00Z").getUTCDay())); rule(f, "weekend-send", wk, Object.keys(s).length || 1, "send(s) are logged on a weekend", { sev: "warn", fmt: ([k, d]) => d, fix: "Outreach is Mon-Fri only." }); return report("sfwindow", f, {}); };
export const scan = (root = ROOT, o = {}) => sfwindow(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
