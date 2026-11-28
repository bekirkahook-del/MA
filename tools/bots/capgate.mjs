// TikTok Cap Gate: Exactly 6 posts a day per platform (Bekir, Nov 28: "Cap is 6 and minimum is 6"). Flags any day over 6.
// Part of the Content Flywheel and operator desk (gear: gate). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/capgate.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const capgate = c => { const f = [], by = {}; for (const p of c.posted) by[p.date] = (by[p.date] || 0) + 1; const over = Object.entries(by).filter(([d, n]) => n > 6 && d >= "2026-11-17"); for (const [d, n] of over) f.push({ code: "over-cap", severity: n > 6 ? "warn" : "info", where: "social/posted.md", detail: `${d}: ${n} TikToks logged. Cap is 6 a day.` }); return report("capgate", f, {}); };
export const scan = (root = ROOT, o = {}) => capgate(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
