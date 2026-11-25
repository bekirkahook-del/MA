// Learn Tool Usage Bot: Which practice tools anyone has used: timed mock, spaced review, rapid, gauntlet.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lntoolusage.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lntoolusage = LEARN.find(b => b.id === "lntoolusage").fn;
export const scan = (root = ROOT, o = {}) => lntoolusage(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
