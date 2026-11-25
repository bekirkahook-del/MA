// School Roster: ACC: which schools in the region still have no club emailed (ACC).
// Part of the Doers pack (gear: reach). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/oraccroster.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const oraccroster = c => { const f = []; try { const s = JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); c.sentOrgs = Object.keys(s).filter(k => k.startsWith("org:")).map(k => k.slice(4)); } catch { c.sentOrgs = []; } const sent = c.sentOrgs || []; const left = ["Notre Dame","Duke","UNC","Virginia","Georgia Tech","Wake Forest","Boston College","Syracuse"].filter(s => !sent.some(o => o.includes(s.toLowerCase()))); f.push({ code: "roster", severity: left.length ? "info" : "warn", where: "ACC", detail: left.length + " of 8 schools still to try: " + left.join(", ") }); return report("oraccroster", f, { region: "ACC" }); };
export const scan = (root = ROOT, o = {}) => oraccroster(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
