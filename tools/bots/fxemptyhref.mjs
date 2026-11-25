// Empty Link Fixer: Finds links with an empty href across the public pages and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxemptyhref.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxemptyhref = c => { const f = [], pages = c.tracked.filter(x => /^(guides\/[^/]+|refund|terms|privacy|cookies|disclaimer|accessibility)\/index\.html$/.test(x)), check = (h, p) => { const n = (h.match(/href=["']\s*["']/gi) || []).length; return n ? n + " link(s) point nowhere; fill or remove them." : null; }, hit = []; for (const p of pages) { const m = check(c.rd(p), p); if (m) hit.push({ p, m }); } rule(f, "emptyhref", hit, pages.length || 1, "links with an empty href", { sev: "info", fmt: x => x.p + ": " + x.m, fix: "Apply the line shown for each page; one commit to staging." }); return report("fxemptyhref", f, { pages: pages.length, hits: hit.length }); };
export const scan = (root = ROOT, o = {}) => fxemptyhref(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
