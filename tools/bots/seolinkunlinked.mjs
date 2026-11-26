// Unlinked Mention Finder: Queries that find pages that mention M&A Prep without linking to it.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkunlinked.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkunlinked = c => { const f = []; ["\"M&A Prep\" \"mnaprep\" -site:mnaprep.com","\"mnaprep.com\" -site:mnaprep.com","\"M&A Prep\" investment banking game"].forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q })); return report("seolinkunlinked", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkunlinked(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
