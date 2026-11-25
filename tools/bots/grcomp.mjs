// Competitor Watcher: Warns when competitor facts are over 7 days old; the weekly task re-reads the public pages.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grcomp.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grcomp = GROW.find(b => b.id === "grcomp").fn;
export const scan = (root = ROOT, o = {}) => grcomp(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
