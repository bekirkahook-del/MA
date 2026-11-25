// Learn Format Bot: Formats competitors use that you do not: video lessons, certificates, live sessions.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnformat.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnformat = LEARN.find(b => b.id === "lnformat").fn;
export const scan = (root = ROOT, o = {}) => lnformat(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
