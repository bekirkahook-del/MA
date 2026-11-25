// Snapshot Puller: Warns when the usage snapshot is over a day old. The daily scheduled task refreshes it with the read-only SQL in state/learn/refresh.sql.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grsnap.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grsnap = GROW.find(b => b.id === "grsnap").fn;
export const scan = (root = ROOT, o = {}) => grsnap(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
