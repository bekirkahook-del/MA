// Hook Bot: Which kind of opening line wins (number-first, question-first, conflict-first), from the punch log views.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/hookstats.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const hookstats = c => { const kind = h => /^["']?[$\d]/.test(h) ? "number-first" : /\?|^["']?(guess|which|what|why|how)\b/i.test(h) ? "question-first" : /n't|nobody|not |wrong|only/i.test(h) ? "conflict-first" : "other", by = {}; for (const r of c.punch.filter(r => r.views != null && r.hook)) (by[kind(r.hook)] ||= []).push(r.views); const rows = Object.entries(by).map(([k, v]) => ({ k, n: v.length, avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length) })).sort((a, b) => b.avg - a.avg), f = []; if (rows.length) f.push({ code: "hook-ranking", severity: "info", where: "social/punch-log.md", detail: `TikTok video hooks by average views: ${rows.map(r => `${r.k} ${r.avg} (n=${r.n})`).join("; ")}.` }); return report("hookstats", f, { kinds: rows.length }); };
export const scan = (root = ROOT, o = {}) => hookstats(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
