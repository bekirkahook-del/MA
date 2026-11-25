// Email Template Fixer: Finds outreach email template missing address or opt-out and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxemailtmpl.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxemailtmpl = c => { const X = fly(c), f = []; const s = c.rd("tools/bots/outreach.mjs"), miss = [!/80 W 11th Ave/.test(s) && "mailing address", !/no thanks/i.test(s) && "opt-out line"].filter(Boolean); rule(f, "template", miss, 2, "required item(s) missing from the email template", { sev: "critical", fmt: x => x, fix: "Add the missing line to both templates." }); return report("fxemailtmpl", f, {}); };
export const scan = (root = ROOT, o = {}) => fxemailtmpl(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
