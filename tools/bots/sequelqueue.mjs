// Series Queue Bot: The RANKED conference series: which conferences are still unmade, and whether the series has gone quiet. A promised conference is a promise to the audience.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/sequelqueue.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const sequelqueue = c => { const X = fly(c), f = [], left = X.queue.filter(q => !q.done), lastRanked = X.posts.filter(p => p.family === "RANKED schools").pop(); if (left.length) f.push({ code: "series-remaining", severity: "info", where: "social/winners.md", detail: `RANKED series still to make: ${left.map(q => q.name).join(", ")}.` }); if (lastRanked && daysAgo(lastRanked.date, c.today) >= 3 && left.length) f.push({ code: "series-quiet", severity: "warn", where: "social/winners.md", detail: `Last RANKED post was ${lastRanked.date} (${daysAgo(lastRanked.date, c.today)} days ago). Your rule is one every day or two. Next up: ${left[0].name}.` }); return report("sequelqueue", f, { remaining: left.length }); };
export const scan = (root = ROOT, o = {}) => sequelqueue(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
