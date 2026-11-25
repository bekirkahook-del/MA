// Community Answer Targets: Questions students ask in public forums that a guide here answers. List only; answer by hand, one useful reply at a time, never a drive-by link.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkreddit.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkreddit = c => { const f = []; ["how do I prepare for investment banking interviews as a freshman","what technical questions are asked in IB interviews","when does private equity recruiting start"].forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q })); return report("seolinkreddit", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkreddit(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
