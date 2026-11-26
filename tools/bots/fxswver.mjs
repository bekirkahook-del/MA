// Service Worker Fixer: Finds service worker cache version older than the last site change and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxswver.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxswver = c => { const X = fly(c), f = []; const sw = c.rd("sw.js"), v = (sw.match(/CACHE\w*\s*=\s*["']([^"']+)/) || [])[1]; f.push({ code: "sw", severity: "info", where: "sw.js", detail: v ? "Cache name is '" + v + "'. Bump it in the same commit as any change to cached files." : "No cache name found in sw.js." }); return report("fxswver", f, {}); };
export const scan = (root = ROOT, o = {}) => fxswver(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
