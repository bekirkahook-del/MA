// Sign-up Alert: Flags a day with zero sign-ups or a spike of more than 5, so you look at what changed.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/gralert.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const gralert = GROW.find(b => b.id === "gralert").fn;
export const scan = (root = ROOT, o = {}) => gralert(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
