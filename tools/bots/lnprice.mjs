// Learn Price Bot: Your prices next to what competitors show publicly.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnprice.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnprice = LEARN.find(b => b.id === "lnprice").fn;
export const scan = (root = ROOT, o = {}) => lnprice(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
