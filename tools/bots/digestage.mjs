// Digest Age Bot: Whether the circle has run today. If not, every number in the digest is yesterday's.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/digestage.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const digestage = c => { const f = [], gap = c.digestDate ? daysAgo(c.digestDate, c.today) : null; if (gap == null || gap > 0) f.push({ code: "digest-old", severity: "info", where: "tools/bots/state/digest.md", detail: gap == null ? "No digest yet." : `The last digest is from ${c.digestDate}. Run the circle to refresh it.` }); return report("digestage", f, {}); };
export const scan = (root = ROOT, o = {}) => digestage(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
