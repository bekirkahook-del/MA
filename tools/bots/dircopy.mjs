// Listing Copy Bot: Measures your directory copy against the limits it states: tagline 60 characters, short description 160.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/dircopy.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const dircopy = c => { const f = [], tag = (c.directories.match(/\*\*Tagline[^*]*\*\*\s*([^\n]+)/) || [])[1], sd = (c.directories.match(/\*\*Short description[^*]*\*\*\s*([^\n]+)/) || [])[1]; if (tag && tag.trim().length > 60) f.push({ code: "tagline-long", severity: "warn", where: "social/directories.md", detail: `Tagline is ${tag.trim().length} characters; the limit is 60.` }); if (sd && sd.trim().length > 160) f.push({ code: "description-long", severity: "warn", where: "social/directories.md", detail: `Short description is ${sd.trim().length} characters; the limit is 160.` }); return report("dircopy", f, { tagline: tag && tag.trim().length, short: sd && sd.trim().length }); };
export const scan = (root = ROOT, o = {}) => dircopy(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
