// Funnel Leak: Walks the sign-up funnel and names the biggest drop.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grleak.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grleak = GROW.find(b => b.id === "grleak").fn;
export const scan = (root = ROOT, o = {}) => grleak(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
