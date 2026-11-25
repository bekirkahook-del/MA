// Repurpose Bot: Winning posts missing from a platform where that idea type wins. A post that did well on one network should be cut for the others.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/repurpose.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const repurpose = c => { const X = fly(c), f = [], avg = X.overall.avg || 0, hit = []; for (const p of X.posts.filter(p => hasViews(p) && total(p) >= avg && daysAgo(p.date, c.today) >= 0 && daysAgo(p.date, c.today) <= 7)) { const r = FW.route(X.board, p.family); if (p.ig == null && r.post.includes("ig")) hit.push({ p, to: "Instagram" }); if (p.tt == null && r.post.includes("tt")) hit.push({ p, to: "TikTok" }); } rule(f, "cut-for-platform", hit, X.posts.length, "above-average posts are missing from a platform where their idea type works", { sev: "info", fmt: h => `${h.p.post.slice(0, 36)} -> ${h.to}`, where: "social/winners.md" }); return report("repurpose", f, {}); };
export const scan = (root = ROOT, o = {}) => repurpose(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
