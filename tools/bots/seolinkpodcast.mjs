// Guest Spot Targets: Queries for student-run finance podcasts and blogs that take guests or guest posts.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkpodcast.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkpodcast = c => { const f = []; ["student finance podcast investment banking recruiting guest","finance blog write for us recruiting","undergraduate investing blog guest post"].forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q })); return report("seolinkpodcast", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkpodcast(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
