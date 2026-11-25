// Learn Ladder Bot: BIWS sorts courses into Levels 1-3 so buyers know the next step. Do your tracks say what to do next?
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnladder.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnladder = LEARN.find(b => b.id === "lnladder").fn;
export const scan = (root = ROOT, o = {}) => lnladder(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
