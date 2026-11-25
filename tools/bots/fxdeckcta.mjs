// Deck CTA Fixer: Finds upcoming decks with no call to action and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxdeckcta.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxdeckcta = c => { const X = fly(c), f = []; const miss = c.days.filter(d => d.date >= c.today && d.spec && !/mnaprep|follow|save|comment/i.test(JSON.stringify(d.spec))); rule(f, "no-cta", miss, c.days.length || 1, "upcoming day(s) have no call to action", { sev: "warn", fmt: d => d.date, fix: "End the last slide with 'Free practice at mnaprep.com'." }); return report("fxdeckcta", f, {}); };
export const scan = (root = ROOT, o = {}) => fxdeckcta(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
