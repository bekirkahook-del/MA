// Learn Community Bot: WSO's value is the community and bank-by-bank question lists. What social features do you have?
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lncommunity.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lncommunity = LEARN.find(b => b.id === "lncommunity").fn;
export const scan = (root = ROOT, o = {}) => lncommunity(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
