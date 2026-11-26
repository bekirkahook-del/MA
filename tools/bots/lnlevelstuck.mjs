// Learn Drop-off Bot: Flags a level where at least half the players from the level before never show up.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnlevelstuck.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnlevelstuck = LEARN.find(b => b.id === "lnlevelstuck").fn;
export const scan = (root = ROOT, o = {}) => lnlevelstuck(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
