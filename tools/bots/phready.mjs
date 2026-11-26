// Product Hunt Ready Bot: Product Hunt image sizes: thumbnail 240x240 and gallery images 1270x760 (Product Hunt's stated sizes). Also the next launch dates, Tuesday to Thursday.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/phready.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const phready = c => { const f = [], files = c.tracked.filter(x => /^social\/producthunt\/.+\.(jpg|png)$/.test(x)); for (const x of files) { const s = imgSize(c.readRaw(x) || Buffer.alloc(0)); if (!s) continue; const want = /thumbnail/.test(x) ? [240, 240] : [1270, 760]; if (Math.abs(s.w - want[0]) > 2 || Math.abs(s.h - want[1]) > 2) f.push({ code: "wrong-size", severity: "warn", where: x, detail: `${x.split("/").pop()} is ${s.w}x${s.h}; Product Hunt wants ${want.join("x")}.` }); } const days = []; for (let k = 1; days.length < 3 && k < 21; k++) { const d = new Date((dayNum(c.today) + k) * 864e5), w = d.getUTCDay(); if (w >= 2 && w <= 4) days.push(d.toISOString().slice(0, 10)); } f.push({ code: "launch-dates", severity: "info", where: "social/producthunt", detail: `Next Tue-Thu launch days: ${days.join(", ")} (12:01am PT). Hub status: not started.` }); return report("phready", f, { images: files.length }); };
export const scan = (root = ROOT, o = {}) => phready(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
