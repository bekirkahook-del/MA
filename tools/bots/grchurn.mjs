// Churn Watch: Paying members, cancel-at-end and users gone quiet for 7 days.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grchurn.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grchurn = GROW.find(b => b.id === "grchurn").fn;
export const scan = (root = ROOT, o = {}) => grchurn(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
