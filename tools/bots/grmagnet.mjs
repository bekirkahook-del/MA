// Lead Magnet Bot: Checks whether any free download or emailed guide exists to capture emails.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grmagnet.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grmagnet = GROW.find(b => b.id === "grmagnet").fn;
export const scan = (root = ROOT, o = {}) => grmagnet(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
