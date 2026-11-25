// Duplicate Post Gate: Topics repeated inside 30 days. Your rule: never repeat a topic unless it was a top-3 performer, and then make a sequel.
// Part of the Content Flywheel and operator desk (gear: gate). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/dupegate.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const dupegate = c => { const X = fly(c), f = [], hit = []; for (let i = 0; i < X.posts.length; i++) for (let j = 0; j < i; j++) { const a = X.posts[i], b = X.posts[j]; if (a.date !== b.date && Math.abs(dayNum(a.date) - dayNum(b.date)) <= 30 && sim(a.post, b.post) >= 0.8 && !/repost|part 2|sequel/i.test(a.post + a.notes)) hit.push([a, b]); } rule(f, "repeat-topic", hit, X.posts.length, "posts nearly repeat an earlier topic", { sev: "info", fmt: h => `${h[0].post.slice(0, 30)} ~ ${h[1].post.slice(0, 30)}`, where: "social/winners.md" }); return report("dupegate", f, {}); };
export const scan = (root = ROOT, o = {}) => dupegate(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
