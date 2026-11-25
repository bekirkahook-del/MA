// Learn Crawl Queue Bot: The next public sites worth reading, not yet in the file.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lncrawlqueue.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lncrawlqueue = LEARN.find(b => b.id === "lncrawlqueue").fn;
export const scan = (root = ROOT, o = {}) => lncrawlqueue(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
