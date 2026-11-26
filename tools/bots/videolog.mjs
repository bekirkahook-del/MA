// Video Log Bot: Video files that are not mentioned in any of your logs, so every video is scored 48h later.
// Part of the Content Flywheel and operator desk (gear: gate). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/videolog.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const videolog = c => { const f = [], text = (c.posted.map(p => p.title + p.key).join(" ") + c.punch.map(r => r.topic).join(" ") + c.winners + c.daily).toLowerCase(), un = c.videos.filter(v => daysAgo(v.date, c.today) <= 10 && !text.includes(v.file.replace(/\.mp4$/, "").toLowerCase())); rule(f, "video-not-logged", un, c.videos.length, "recent videos are not named in any log", { sev: "info", fmt: v => v.date.slice(5) + "/" + v.file, where: "social/vid" }); return report("videolog", f, { videos: c.videos.length }); };
export const scan = (root = ROOT, o = {}) => videolog(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
