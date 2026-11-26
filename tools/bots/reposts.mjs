// Repost Bot: Winners from the last 5 days that have not been reposted. Your finding: reposting a winner 18h later worked (coffee chat 1,185 vs 1,216) and reposting a flop did not.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/reposts.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const reposts = c => { const X = fly(c), f = [], avg = { ig: FW.overall(X.posts.filter(p => p.ig != null).map(p => ({ ...p, tt: null }))).avg, tt: FW.overall(X.posts.filter(p => p.tt != null).map(p => ({ ...p, ig: null }))).avg }, hit = []; for (const p of X.posts.filter(p => daysAgo(p.date, c.today) >= 0 && daysAgo(p.date, c.today) <= 5 && !/repost/i.test(p.notes))) for (const k of ["ig", "tt"]) if (p[k] != null && avg[k] && p[k] >= 2 * avg[k]) hit.push({ p, k }); rule(f, "repost-winner", hit, X.posts.length, "recent posts beat 2x their platform average and have no repost logged", { sev: "info", fmt: h => `${h.p.post.slice(0, 40)} (${h.k.toUpperCase()} ${h.p[h.k]})`, where: "social/winners.md" }); return report("reposts", f, { igAvg: avg.ig, ttAvg: avg.tt }); };
export const scan = (root = ROOT, o = {}) => reposts(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
