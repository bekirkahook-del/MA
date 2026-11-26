// Learn Hard Levels Bot: Levels where players average under 2.3 stars (out of 3). These are where it feels hardest.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnlevelstars.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnlevelstars = LEARN.find(b => b.id === "lnlevelstars").fn;
export const scan = (root = ROOT, o = {}) => lnlevelstars(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
