// Learn Tracking: Model Lab: Checks that Model Lab reports usage events, so you can see if anyone uses it.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnevmodel.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnevmodel = LEARN.find(b => b.id === "lnevmodel").fn;
export const scan = (root = ROOT, o = {}) => lnevmodel(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
