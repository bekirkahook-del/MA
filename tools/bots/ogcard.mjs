// Share Card Bot: The home-page share image used by directories and link previews: it should exist at roughly 1200x630.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/ogcard.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const ogcard = c => { const f = [], b = c.readRaw("img/og/home.jpg"); if (!b) return report("ogcard", [{ code: "missing", severity: "warn", where: "img/og/home.jpg", detail: "img/og/home.jpg is missing. Your directory kit points to it." }]); const s = imgSize(b); if (s && (s.w < 1200 || s.h < 600)) f.push({ code: "small", severity: "warn", where: "img/og/home.jpg", detail: `Share image is ${s.w}x${s.h}; link previews want about 1200x630.` }); return report("ogcard", f, { size: s ? `${s.w}x${s.h}` : "unknown" }); };
export const scan = (root = ROOT, o = {}) => ogcard(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
