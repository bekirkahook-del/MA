// Learn Sample Size Bot: Says how much to trust the usage numbers. Under 100 users, treat every pattern as a hint, not a result.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnsample.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnsample = LEARN.find(b => b.id === "lnsample").fn;
export const scan = (root = ROOT, o = {}) => lnsample(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
