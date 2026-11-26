// Deck Source Fixer: Finds upcoming decks with no source line and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxdecksrc.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxdecksrc = c => { const X = fly(c), f = []; const miss = c.days.filter(d => d.date >= c.today && d.spec && !/source/i.test(JSON.stringify(d.spec))); rule(f, "no-source", miss, c.days.length || 1, "upcoming day(s) have no source line in the deck spec", { sev: "warn", fmt: d => d.date, fix: "Add a 'Source: <name>' line to the last slide of each deck." }); return report("fxdecksrc", f, {}); };
export const scan = (root = ROOT, o = {}) => fxdecksrc(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
