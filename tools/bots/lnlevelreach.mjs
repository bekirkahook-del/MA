// Learn Reach Bot: How many players reached each level, per track. Shows where people stop.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnlevelreach.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnlevelreach = LEARN.find(b => b.id === "lnlevelreach").fn;
export const scan = (root = ROOT, o = {}) => lnlevelreach(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
