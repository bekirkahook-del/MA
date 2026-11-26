// Idea Type Fixer: Finds post-log rows whose idea type matches no family and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxfamily.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxfamily = c => { const X = fly(c), f = []; const odd = X.posts.filter(p => p.family === "Other"); rule(f, "other-family", odd, X.posts.length || 1, "post(s) do not match a known idea family", { sev: "info", fmt: p => p.post.slice(0, 30), fix: "Use one of the standard idea type names so the scoreboard counts it." }); return report("fxfamily", f, {}); };
export const scan = (root = ROOT, o = {}) => fxfamily(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
