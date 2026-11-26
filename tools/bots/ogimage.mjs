// Guide Share Image Bot: Guides with no share image, so a guide posted on social shows as a bare link.
// Part of the Content Flywheel and operator desk (gear: pages). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/ogimage.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const ogimage = c => { const f = [], bad = c.pages.filter(p => !/<meta[^>]+property=["']og:image["']/i.test(p.html)); rule(f, "no-og-image", bad, c.pages.length, "guides have no og:image", { sev: "warn", where: "guides" }); return report("ogimage", f, { guides: c.pages.length }); };
export const scan = (root = ROOT, o = {}) => ogimage(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
