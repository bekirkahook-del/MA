// Character Series Bot: Your rule: one character-story episode every 2-3 days. Days since the last one, and what is already scheduled.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/characterladder.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const characterladder = c => { const X = fly(c), f = [], ps = X.posts.filter(p => p.family === "Character stories" && daysAgo(p.date, c.today) >= 0), last = ps[ps.length - 1], future = X.posts.filter(p => p.family === "Character stories" && daysAgo(p.date, c.today) < 0); if (last && daysAgo(last.date, c.today) >= 3 && !future.length) f.push({ code: "episode-due", severity: "warn", where: "social/winners.md", detail: `${daysAgo(last.date, c.today)} days since the last character episode (${last.post}). Character stories lead Instagram, so one is due.` }); if (future.length) f.push({ code: "episodes-planned", severity: "info", where: "social/winners.md", detail: `Already planned: ${future.slice(0, 3).map(p => p.date.slice(5) + " " + p.post.slice(0, 30)).join("; ")}.` }); return report("characterladder", f, { episodes: ps.length }); };
export const scan = (root = ROOT, o = {}) => characterladder(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
