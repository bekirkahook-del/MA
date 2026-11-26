// Mailing Address Guard: Hard-rule check: an email template with no mailing address.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfaddr.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfaddr = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const t = c.rd("tools/bots/outreach.mjs"), n = (t.match(/80 W 11th Ave/g) || []).length; rule(f, "no-address", n >= 2 ? [] : ["template"], 1, "template(s) lack the mailing address", { sev: "critical", fmt: x => x, fix: "CAN-SPAM needs a physical address in every email." }); return report("sfaddr", f, {}); };
export const scan = (root = ROOT, o = {}) => sfaddr(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
