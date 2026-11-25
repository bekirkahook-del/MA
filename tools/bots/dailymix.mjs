// Daily Mix Bot: Whether today's posts exist yet and meet your daily rules: 3-4 posts, at least one video, nothing missing.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/dailymix.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const dailymix = c => { const f = [], d = c.days.find(x => x.date === c.today), n = d && d.spec ? Object.keys(d.spec.decks || {}).length : 0, vids = c.videos.filter(v => v.date === c.today).length + (d ? d.files.filter(x => /\.mp4$/.test(x)).length : 0); if (!d) f.push({ code: "no-folder-today", severity: "warn", where: "social/" + c.today, detail: `No content folder for today (${c.today}). Rule: 3-4 A+ posts a day to every network.` }); else { if (n < 3 && !vids) f.push({ code: "thin-day", severity: "warn", where: "social/" + c.today, detail: `Only ${n} deck(s) and ${vids} video(s) made for today. Target 3-4 posts.` }); if (!vids) f.push({ code: "no-video-today", severity: "info", where: "social/" + c.today, detail: "No video for today. Rule: at least 1 video a day." }); } return report("dailymix", f, { decks: n, videos: vids }); };
export const scan = (root = ROOT, o = {}) => dailymix(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
