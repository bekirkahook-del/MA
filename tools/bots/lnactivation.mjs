// Learn Activation Bot: How many sign-ups ever clear a level. The first-level wall is the biggest leak in a learning site.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnactivation.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnactivation = LEARN.find(b => b.id === "lnactivation").fn;
export const scan = (root = ROOT, o = {}) => lnactivation(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
