// Reference Page Targets: Queries for public wiki or guide pages that cite free study tools.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkwiki.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkwiki = c => { const f = []; ["investment banking recruiting guide resources section","finance recruiting wiki free tools","how to break into investment banking guide links"].forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q })); return report("seolinkwiki", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkwiki(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
