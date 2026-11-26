// Unsourced Number Guard: Hard-rule check: upcoming decks with numbers but no source line.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sfunsourced.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sfunsourced = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const bad = c.days.filter(d => d.date >= c.today && d.spec && /\d{2,}/.test(JSON.stringify(d.spec)) && !/source/i.test(JSON.stringify(d.spec))); rule(f, "numbers-no-source", bad, c.days.length || 1, "upcoming day(s) show numbers with no source", { sev: "warn", fmt: d => d.date, fix: "Add a source line." }); return report("sfunsourced", f, {}); };
export const scan = (root = ROOT, o = {}) => sfunsourced(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
