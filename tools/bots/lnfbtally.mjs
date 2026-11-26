// Learn Feedback Tally Bot: Counts what users actually told you, by poll answer and report type.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnfbtally.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnfbtally = LEARN.find(b => b.id === "lnfbtally").fn;
export const scan = (root = ROOT, o = {}) => lnfbtally(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
