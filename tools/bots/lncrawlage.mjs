// Learn Crawl Age Bot: Warns when competitor facts are over 14 days old.
// Part of the learn pack. Read-only: it reads anonymous usage numbers, public competitor facts and your own files. It never posts, sends, deploys or signs in.
// Usage: node tools/bots/lncrawlage.mjs
import { ROOT, cli } from "./lib.mjs";
import { loadOps } from "./ops.mjs";
import * as COST from "./cost.mjs";
import { LEARN } from "./flywheel/learndefs.mjs";
export const lncrawlage = LEARN.find(b => b.id === "lncrawlage").fn;
export const scan = (root = ROOT, o = {}) => lncrawlage(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
