// Quora Link Rule Bot: Your hard rule: no mnaprep.com link in Quora answers. Scans the Quora drafts folder for one.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/quoralink.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const quoralink = c => { const f = [], files = c.tracked.filter(x => /^social\/quora\/[^/]+\.md$/.test(x) && !/posted|asked/.test(x)), hit = files.filter(x => /mnaprep\.com|https?:\/\/mnaprep/i.test(c.rd(x))); rule(f, "link-in-answer", hit, files.length || 1, "Quora draft files contain a mnaprep.com link", { sev: "warn", fmt: x => x, where: "social/quora" }); return report("quoralink", f, { drafts: files.length }); };
export const scan = (root = ROOT, o = {}) => quoralink(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
