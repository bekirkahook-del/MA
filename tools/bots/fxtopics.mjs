// Topics Gap Fixer: Finds families with an empty topic list and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxtopics.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxtopics = c => { const X = fly(c), f = []; const fams = ["RANKED schools", "Character stories", "Tiered interview questions", "Live market news", "League tables"], empty = fams.filter(F => !X.backlog.some(b => b.family === F)); rule(f, "empty-backlog", empty, fams.length, "top families have no topic queued", { sev: "warn", fmt: F => F, fix: "Add 5 topics to social/topics.md for each." }); return report("fxtopics", f, {}); };
export const scan = (root = ROOT, o = {}) => fxtopics(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
