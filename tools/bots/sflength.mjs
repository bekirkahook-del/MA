// Email Length Guard: Hard-rule check: an email body over 90 words.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sflength.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sflength = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const t = c.rd("tools/bots/outreach.mjs"), bodies = (t.match(/body: `[^`]*`/g) || []), long = bodies.filter(b => b.split(/\s+/).length > 90); rule(f, "long", long, bodies.length || 1, "template(s) run over 90 words", { sev: "warn", fmt: () => "a template", fix: "Keep it short: 60 words is plenty." }); return report("sflength", f, {}); };
export const scan = (root = ROOT, o = {}) => sflength(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
