// Learn Miss Rate Bot: Overall share of answers that are wrong.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnqoverall.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnqoverall = LEARN.find(b => b.id === "lnqoverall").fn;
export const scan = (root = ROOT, o = {}) => lnqoverall(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
