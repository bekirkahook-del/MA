// Learn Topic Gap Bot: Topics competitors teach or sell that your lessons and guides never mention.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lntopicgap.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lntopicgap = LEARN.find(b => b.id === "lntopicgap").fn;
export const scan = (root = ROOT, o = {}) => lntopicgap(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
