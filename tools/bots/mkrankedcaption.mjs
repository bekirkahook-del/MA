// Caption Maker: ranked schools: a caption skeleton: hook line, one value line, source line, call to action (RANKED schools).
// Part of the Doers pack (gear: make). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/mkrankedcaption.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const mkrankedcaption = c => { const FAMILY = "RANKED schools"; const X = fly(c), f = [], F = FAMILY, top = X.posts.filter(p => p.family === F && hasViews(p)).sort((a, b) => best(b) - best(a)).slice(0, 3), item = X.backlog.find(b => b.family === F), topic = item ? item.text : null, T = topic || "NEEDS a topic (the backlog has none for " + F + ")", ref = top[0] ? top[0].post + " (" + best(top[0]).toLocaleString("en-US") + " views)" : "no scored post yet"; f.push({ code: "caption", severity: "info", where: "caption", detail: "Line 1: hook (" + T + "). Line 2: the one fact a student keeps. Line 3: Source: <name the source>. Line 4: free practice at mnaprep.com. Model post: " + ref + "." }); return report("mkrankedcaption", f, { family: F, models: top.length }); };
export const scan = (root = ROOT, o = {}) => mkrankedcaption(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
