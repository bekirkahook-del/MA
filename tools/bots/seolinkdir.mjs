// Directory Targets: Queries for free education and tool directories.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkdir.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkdir = c => { const f = []; ["free education tools directory submit","student resources directory submit a site","finance education tools list submit"].forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q })); return report("seolinkdir", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkdir(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
