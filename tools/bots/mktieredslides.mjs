// Slide Plan Maker: tiered interview questions: a carousel plan: cover, body slides, a source slide, a call-to-action slide (Tiered interview questions).
// Part of the Doers pack (gear: make). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/mktieredslides.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const mktieredslides = c => { const FAMILY = "Tiered interview questions"; const X = fly(c), f = [], F = FAMILY, top = X.posts.filter(p => p.family === F && hasViews(p)).sort((a, b) => best(b) - best(a)).slice(0, 3), item = X.backlog.find(b => b.family === F), topic = item ? item.text : null, T = topic || "NEEDS a topic (the backlog has none for " + F + ")", ref = top[0] ? top[0].post + " (" + best(top[0]).toLocaleString("en-US") + " views)" : "no scored post yet"; f.push({ code: "slides", severity: "info", where: "slides", detail: "Cover (hook) | 5 to 7 body slides | Source slide | CTA slide. Topic: " + T + ". One idea per slide, big numbers, one line of text. Model: " + ref + "." }); return report("mktieredslides", f, { family: F, models: top.length }); };
export const scan = (root = ROOT, o = {}) => mktieredslides(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
