// CTA Picker: character stories: the call to action for tomorrow, rotated by day so no two posts in a row end the same way (Character stories).
// Part of the Doers pack (gear: make). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/mkcharactercta.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const mkcharactercta = c => { const FAMILY = "Character stories"; const X = fly(c), f = [], F = FAMILY, top = X.posts.filter(p => p.family === F && hasViews(p)).sort((a, b) => best(b) - best(a)).slice(0, 3), item = X.backlog.find(b => b.family === F), topic = item ? item.text : null, T = topic || "NEEDS a topic (the backlog has none for " + F + ")", ref = top[0] ? top[0].post + " (" + best(top[0]).toLocaleString("en-US") + " views)" : "no scored post yet"; const L = ["Free practice at mnaprep.com", "Save this for recruiting season", "Follow for part 2", "Comment your school and I will rank it"], i = dayNum(c.today) % L.length; f.push({ code: "cta", severity: "info", where: "cta", detail: F + " post tomorrow: end with '" + L[i] + "'. Do not use '" + L[(i + 3) % L.length] + "' (used last)." }); return report("mkcharactercta", f, { family: F, models: top.length }); };
export const scan = (root = ROOT, o = {}) => mkcharactercta(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
