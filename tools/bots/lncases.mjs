// Learn Case Study Bot: BIWS sells Excel case studies as the core of its courses. How many does Model Lab have?
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lncases.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lncases = LEARN.find(b => b.id === "lncases").fn;
export const scan = (root = ROOT, o = {}) => lncases(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
