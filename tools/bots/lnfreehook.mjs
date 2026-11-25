// Learn Free Hook Bot: How competitors turn free readers into emails and what you have.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lnfreehook.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lnfreehook = LEARN.find(b => b.id === "lnfreehook").fn;
export const scan = (root = ROOT, o = {}) => lnfreehook(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
