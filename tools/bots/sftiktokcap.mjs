// TikTok Cap Guard: Hard-rule check: more than 4 TikToks planned in one day.
// Part of the Doers pack (gear: safe). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/sftiktokcap.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const sftiktokcap = c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; const bad = c.days.filter(d => d.date >= c.today && d.spec && d.spec.decks && Object.keys(d.spec.decks).length > 4); rule(f, "tiktok-cap", bad, c.days.length || 1, "day(s) plan more than 4 TikToks", { sev: "warn", fmt: d => d.date, fix: "Max 4 a day." }); return report("sftiktokcap", f, {}); };
export const scan = (root = ROOT, o = {}) => sftiktokcap(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
