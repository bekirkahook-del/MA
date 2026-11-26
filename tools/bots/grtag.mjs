// Source Tagger: Finds mnaprep.com links in your posts and bio lists that carry no utm_source, so sign-ups can be traced to a platform.
// Part of the grow pack. Read-only: it reads anonymous numbers and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/grtag.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { GROW } from "./flywheel/growdefs.mjs";
export const grtag = GROW.find(b => b.id === "grtag").fn;
export const scan = (root = ROOT, o = {}) => grtag(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
