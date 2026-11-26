// Page Speed Watcher: Tracks size of the main scripts against a saved baseline so slow pages are caught.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grspeed.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grspeed = GROW.find(b => b.id === "grspeed").fn;
export const scan = (root = ROOT, o = {}) => grspeed(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
