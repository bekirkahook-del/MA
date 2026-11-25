// Link Booster: Guide pages that link to no other guide, which wastes the page's ranking and the reader's next step.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grlink.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grlink = GROW.find(b => b.id === "grlink").fn;
export const scan = (root = ROOT, o = {}) => grlink(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
