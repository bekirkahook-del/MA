// Learn Missed Questions Bot: Lists questions most players get wrong so they get reviewed, re-worded or taught first.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnqmiss.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnqmiss = LEARN.find(b => b.id === "lnqmiss").fn;
export const scan = (root = ROOT, o = {}) => lnqmiss(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
