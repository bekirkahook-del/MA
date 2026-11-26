// Metricool Puller: Checks the Metricool numbers file exists and is fresh; the scheduled task fills it.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grmetri.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grmetri = GROW.find(b => b.id === "grmetri").fn;
export const scan = (root = ROOT, o = {}) => grmetri(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
