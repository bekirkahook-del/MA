// Learn Guarantee Bot: BIWS uses a 90-day money-back guarantee as the conversion lever. What do you offer?
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnguarantee.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnguarantee = LEARN.find(b => b.id === "lnguarantee").fn;
export const scan = (root = ROOT, o = {}) => lnguarantee(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
