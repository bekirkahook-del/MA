// Gap Day Bot: The next 3 days with no content made yet, so batching happens before the day starts, not during it.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/gapdays.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const gapdays = c => { const f = [], gaps = []; for (let k = 1; k <= 3; k++) { const d = new Date((dayNum(c.today) + k) * 864e5).toISOString().slice(0, 10); if (!c.days.some(x => x.date === d) && !c.videos.some(v => v.date === d)) gaps.push(d); } if (gaps.length) f.push({ code: "gap-days", severity: gaps.length === 3 ? "warn" : "info", where: "social/", detail: `Nothing made yet for ${gaps.join(", ")}. Batch ahead.` }); return report("gapdays", f, { gaps: gaps.length }); };
export const scan = (root = ROOT, o = {}) => gapdays(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
