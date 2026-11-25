// Club Finder Queries: ACC: three search queries to find undergraduate finance clubs (ACC).
// Part of the Doers pack (gear: reach). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/oraccqueries.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const oraccqueries = c => { const f = []; try { const s = JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); c.sentOrgs = Object.keys(s).filter(k => k.startsWith("org:")).map(k => k.slice(4)); } catch { c.sentOrgs = []; } const Q = ["Notre Dame","Duke","UNC","Virginia","Georgia Tech","Wake Forest","Boston College","Syracuse"].map(s => ["\"" + s + "\" investment banking club contact", "\"" + s + "\" finance society contact us", "\"" + s + "\" private equity club email"]); Q.slice(0, 3).forEach((q, i) => f.push({ code: "query", severity: "info", where: "ACC", detail: "Search: " + q.join("  |  ") })); return report("oraccqueries", f, { region: "ACC" }); };
export const scan = (root = ROOT, o = {}) => oraccqueries(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
