// Home Baseline Guard: Hard-rule check: any change to the Home page without your OK.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfhome.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfhome = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const base = (c.homeBaseline && c.homeBaseline.ids) || [], now = (c.rd("index.html").match(/\bid=["']([^"']+)/g) || []).length; f.push({ code: "home", severity: now > base.length ? "critical" : "info", where: "index.html", detail: now > base.length ? "Home page has " + (now - base.length) + " new id(s) since the baseline. Never add to Home unless Bekir asks." : "Home page matches the baseline (" + base.length + " ids)." }); return report("sfhome", f, {}); };
export const scan = (root = ROOT, o = {}) => sfhome(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
