// Sequel Maker: league tables: the sequel idea for this family's best post, since a post over 2x the average gets a sequel within 3 days (League tables).
// Part of the Doers pack (gear: make). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/mkleaguesequel.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const mkleaguesequel = c => { const FAMILY = "League tables"; const X = fly(c), f = [], F = FAMILY, top = X.posts.filter(p => p.family === F && hasViews(p)).sort((a, b) => best(b) - best(a)).slice(0, 3), item = X.backlog.find(b => b.family === F), topic = item ? item.text : null, T = topic || "NEEDS a topic (the backlog has none for " + F + ")", ref = top[0] ? top[0].post + " (" + best(top[0]).toLocaleString("en-US") + " views)" : "no scored post yet"; if (!top[0]) f.push({ code: "none", severity: "info", where: "sequel", detail: "No scored post yet." }); else f.push({ code: "sequel", severity: "info", where: "sequel", detail: "Sequel to '" + top[0].post + "': same format, next " + (item ? item.text : "topic") + ". Post it within 3 days of the original." }); return report("mkleaguesequel", f, { family: F, models: top.length }); };
export const scan = (root = ROOT, o = {}) => mkleaguesequel(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
