// Career Center Link Targets: Search queries that find university career-center resource pages that list free prep tools.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkcareer.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkcareer = c => { const f = []; ["\"investment banking\" \"resources\" site:.edu career center free prep","\"finance recruiting resources\" site:.edu","\"interview prep\" \"banking\" career services links"].forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q })); return report("seolinkcareer", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkcareer(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
