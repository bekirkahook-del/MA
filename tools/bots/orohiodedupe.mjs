// Region De-dupe: Ohio: schools in the region already emailed, so none gets a second email (Ohio).
// Part of the Doers pack (gear: reach). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/orohiodedupe.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const orohiodedupe = c => { const f = []; try { const s = JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); c.sentOrgs = Object.keys(s).filter(k => k.startsWith("org:")).map(k => k.slice(4)); } catch { c.sentOrgs = []; } const sent = c.sentOrgs || []; const hit = ["Ohio State","Miami University","University of Cincinnati","Ohio University","Kent State","Bowling Green","Xavier","University of Dayton"].filter(s => sent.some(o => o.includes(s.toLowerCase()))); f.push({ code: "already", severity: "info", where: "Ohio", detail: hit.length ? "Already emailed (do not repeat): " + hit.join(", ") : "No school in Ohio emailed yet." }); return report("orohiodedupe", f, { region: "Ohio" }); };
export const scan = (root = ROOT, o = {}) => orohiodedupe(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
