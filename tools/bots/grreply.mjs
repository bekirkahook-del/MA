// Reply Triage: Sorts email replies (opt-out, interest, question, decline, auto) from state/learn/replies.json and finds opt-outs not yet on the suppression list.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grreply.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grreply = GROW.find(b => b.id === "grreply").fn;
export const scan = (root = ROOT, o = {}) => grreply(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
