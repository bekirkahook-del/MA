// Metricool Likes Reader: Likes per platform, read from the Metricool snapshot.
// Part of the Doers pack (gear: data). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/mdlikesnow.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const mdlikesnow = c => { const ID = "mdlikesnow"; const f = [], file = "tools/bots/state/metricool/snapshot.json"; let S = null; try { S = JSON.parse(c.readRaw(file)); } catch {} if (!S || !S.platforms) return report(ID, [{ code: "no-snapshot", severity: "warn", where: file, detail: "No Metricool snapshot yet. Ask Claude to pull one (it reads Metricool, you type nothing)." }]); const age = daysAgo(String(S.pulled || "").slice(0, 10), c.today); if (age > 2) f.push({ code: "stale", severity: "warn", where: file, detail: "The Metricool snapshot is " + age + " days old." }); const rows = Object.entries(S.platforms).map(([p, v]) => ({ p, now: v["likes"] && v["likes"].now, prev: v["likes"] && v["likes"].prev })).filter(r => typeof r.now === "number"); if (!rows.length) f.push({ code: "no-metric", severity: "info", where: file, detail: "likes is not in the snapshot." }); for (const r of rows) f.push({ code: "level", severity: "info", where: r.p, detail: r.p + " likes: " + r.now.toLocaleString("en-US") }); return report(ID, f, { platforms: rows.length }); };
export const scan = (root = ROOT, o = {}) => mdlikesnow(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
