// Script Outline Maker: live market news: a 5-beat video outline for the family's next topic (Live market news).
// Part of the Doers pack (gear: make). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/mkmarketscript.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const mkmarketscript = c => { const FAMILY = "Live market news"; const X = fly(c), f = [], F = FAMILY, top = X.posts.filter(p => p.family === F && hasViews(p)).sort((a, b) => best(b) - best(a)).slice(0, 3), item = X.backlog.find(b => b.family === F), topic = item ? item.text : null, T = topic || "NEEDS a topic (the backlog has none for " + F + ")", ref = top[0] ? top[0].post + " (" + best(top[0]).toLocaleString("en-US") + " views)" : "no scored post yet"; f.push({ code: "script", severity: "info", where: "script", detail: "Beat 1 hook, beat 2 setup, beat 3 payoff, beat 4 twist or comparison, beat 5 call to action. Topic: " + T + ". Pace model: " + ref + ". Use only facts you can source." }); return report("mkmarketscript", f, { family: F, models: top.length }); };
export const scan = (root = ROOT, o = {}) => mkmarketscript(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
