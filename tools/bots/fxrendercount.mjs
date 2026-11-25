// Render Count Fixer: Finds decks whose rendered slide count does not match the spec and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxrendercount.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxrendercount = c => { const X = fly(c), f = []; const miss = c.days.filter(d => d.spec && d.spec.decks && Object.entries(d.spec.decks).some(([k, v]) => { const want = (v.slides || v.items || []).length, have = d.files.filter(x => x.startsWith(k + "-") && /\.(jpg|png)$/.test(x)).length; return want && have && want !== have; })); rule(f, "render-count", miss, c.days.length || 1, "day(s) have a different number of rendered slides than the spec lists", { sev: "warn", fmt: d => d.date, fix: "Re-run the render for that day, then recount." }); return report("fxrendercount", f, {}); };
export const scan = (root = ROOT, o = {}) => fxrendercount(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
