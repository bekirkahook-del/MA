// Nudge Writer: Drafts one reminder text for users who signed up but never cleared a level. Draft only; bulk email is never sent.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grnudge.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grnudge = GROW.find(b => b.id === "grnudge").fn;
export const scan = (root = ROOT, o = {}) => grnudge(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
