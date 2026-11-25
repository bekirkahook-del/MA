// Caption Ending Bot: Rotates the caption endings from your growth sprint so the same call to action is not on every post, and every post ends with a reason to visit.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/ctarotation.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const ctarotation = c => { const ends = [...c.sprint.matchAll(/^\s*\d\.\s*`([^`]+)`/gm)].map(m => m[1]); if (!ends.length) return report("ctarotation", [{ code: "no-endings", severity: "info", where: "social/growth-sprint", detail: "No caption endings found in the growth sprint file." }]); const i = dayNum(c.today) % ends.length; return report("ctarotation", [{ code: "todays-ending", severity: "info", where: "social/growth-sprint-nov23.md", detail: `Today's caption ending: "${ends[i]}" (${ends.length} to rotate).` }], { endings: ends.length }); };
export const scan = (root = ROOT, o = {}) => ctarotation(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
