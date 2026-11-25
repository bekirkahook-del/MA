// Legal Address Fixer: Finds legal pages without the mailing address and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxlegaladdr.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxlegaladdr = c => { const X = fly(c), f = []; const miss = ["privacy/index.html", "terms/index.html"].filter(p => c.exists(p) && !/80 W 11th Ave/i.test(c.rd(p))); rule(f, "no-address", miss, 2, "legal page(s) lack the mailing address", { sev: "warn", fmt: p => p, fix: "Add the Contact paragraph before the Changes heading." }); return report("fxlegaladdr", f, {}); };
export const scan = (root = ROOT, o = {}) => fxlegaladdr(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
