// Faculty Page Targets: Queries for faculty or program pages that list free student tools.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkfaculty.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkfaculty = c => { const f = []; ["finance department \"student resources\" interview prep free","business school \"career resources\" finance recruiting tools","undergraduate finance program recruiting resources page"].forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q })); return report("seolinkfaculty", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkfaculty(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
