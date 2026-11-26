// Sitemap Fixer: Finds guides missing from the sitemap and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxsitemap.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxsitemap = c => { const X = fly(c), f = []; const g = c.tracked.filter(x => /^guides\/[^/]+\/index\.html$/.test(x)).map(x => x.split("/")[1]), miss = g.filter(s => !(c.sitemap || "").includes("/guides/" + s)); rule(f, "not-in-sitemap", miss, g.length || 1, "guide(s) are not in the sitemap", { sev: "warn", fmt: s => s, fix: "Add each URL to sitemap.xml." }); return report("fxsitemap", f, {}); };
export const scan = (root = ROOT, o = {}) => fxsitemap(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
