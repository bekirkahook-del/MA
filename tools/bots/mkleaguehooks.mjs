// Hook Maker: league tables: three hook drafts for tomorrow, each copying the shape of one of this family's best posts (League tables).
// Part of the Doers pack (gear: make). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/mkleaguehooks.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const mkleaguehooks = c => { const FAMILY = "League tables"; const X = fly(c), f = [], F = FAMILY, top = X.posts.filter(p => p.family === F && hasViews(p)).sort((a, b) => best(b) - best(a)).slice(0, 3), item = X.backlog.find(b => b.family === F), topic = item ? item.text : null, T = topic || "NEEDS a topic (the backlog has none for " + F + ")", ref = top[0] ? top[0].post + " (" + best(top[0]).toLocaleString("en-US") + " views)" : "no scored post yet"; top.forEach((p, i) => f.push({ code: "hook-" + (i + 1), severity: "info", where: "hook", detail: "Hook " + (i + 1) + ": keep the shape of '" + p.post + "' (" + best(p).toLocaleString("en-US") + " views) and swap in: " + T })); if (!top.length) f.push({ code: "no-model", severity: "warn", where: "hook", detail: "No scored " + F + " post to copy a hook from." }); return report("mkleaguehooks", f, { family: F, models: top.length }); };
export const scan = (root = ROOT, o = {}) => mkleaguehooks(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
