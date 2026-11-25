// Paywall Tester: Click and dismiss rates for the upgrade bar and prompt, from site events.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grpay.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grpay = GROW.find(b => b.id === "grpay").fn;
export const scan = (root = ROOT, o = {}) => grpay(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
