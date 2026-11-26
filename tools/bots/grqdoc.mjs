// Question Doctor: Prints the hardest questions with their text and key so each gets checked for a wrong key, vague wording or a missing lesson.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grqdoc.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grqdoc = GROW.find(b => b.id === "grqdoc").fn;
export const scan = (root = ROOT, o = {}) => grqdoc(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
