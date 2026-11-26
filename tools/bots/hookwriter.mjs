// Hook Template Bot: Opening-line templates built from your own winning examples (conflict-first, number-first). It supplies the pattern, never a made-up number.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/hookwriter.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const hookwriter = c => { const ex = [...c.winners.matchAll(/["“]([^"”]{8,50}isn't[^"”]{0,30})["”]/g)].map(m => m[1]).slice(0, 3), f = [{ code: "templates", severity: "info", where: "social/winners.md", detail: `Conflict-first: "{School} isn't even top {N}" (from your winners: ${ex.join("; ") || "see Patterns that win"}). Number-first: "Only {x%} get in. Guess which one." Question-first: "Guess #1." Fill {} from sourced data only.` }]; return report("hookwriter", f, {}); };
export const scan = (root = ROOT, o = {}) => hookwriter(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
