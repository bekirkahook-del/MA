// Leftover Text Fixer: Finds TODO or lorem text left on a page across the public pages and writes the exact fix. Proposals only.
// Part of the Doers pack (gear: fix). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/fxtodo.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;

export const fxtodo = c => { const f = [], pages = c.tracked.filter(x => /^(guides\/[^/]+|refund|terms|privacy|cookies|disclaimer|accessibility)\/index\.html$/.test(x)), check = (h, p) => { return /\bTODO\b|lorem ipsum|FIXME/i.test(h) ? "Remove the TODO, FIXME or placeholder text." : null; }, hit = []; for (const p of pages) { const m = check(c.rd(p), p); if (m) hit.push({ p, m }); } rule(f, "todo", hit, pages.length || 1, "TODO or lorem text left on a page", { sev: "info", fmt: x => x.p + ": " + x.m, fix: "Apply the line shown for each page; one commit to staging." }); return report("fxtodo", f, { pages: pages.length, hits: hit.length }); };
export const scan = (root = ROOT, o = {}) => fxtodo(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
