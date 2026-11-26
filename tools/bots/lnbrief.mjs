// Learn Brief Bot: One short list: the best things to build in the Learn section next, in order, with the reason for each.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnbrief.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnbrief = LEARN.find(b => b.id === "lnbrief").fn;
export const scan = (root = ROOT, o = {}) => lnbrief(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
