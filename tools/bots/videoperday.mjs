// Video Streak Bot: Days in the last week with no video at all. Your rule: at least one video a day, and videos are where the winners are.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/videoperday.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const videoperday = c => { const f = [], miss = []; for (let k = 1; k <= 7; k++) { const d = new Date((dayNum(c.today) - k) * 864e5).toISOString().slice(0, 10), day = c.days.find(x => x.date === d); if (day && !day.files.some(x => /\.mp4$/.test(x)) && !c.videos.some(v => v.date === d)) miss.push(d); } rule(f, "no-video", miss, 7, "recent days had content but no video file", { sev: "info", fmt: x => x, where: "social/" }); return report("videoperday", f, {}); };
export const scan = (root = ROOT, o = {}) => videoperday(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
