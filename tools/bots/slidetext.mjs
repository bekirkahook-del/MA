// Slide Readability Gate: Slides with too many words to read in about 3 seconds, and first slides with a weak, wordy hook.
// Part of the Content Flywheel and operator desk (gear: gate). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/slidetext.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const slidetext = c => { const f = [], dense = [], longHook = [], wc = h => String(h).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length; for (const d of c.days.filter(d => d.date >= c.today && d.spec)) for (const [k, v] of Object.entries(d.spec.decks || {})) { (v.slides || []).forEach((s, i) => { if (wc(s) > 45) dense.push(`${d.date}/${k}#${i + 1}`); }); if ((v.slides || [])[0] && wc(v.slides[0]) > 16) longHook.push(`${d.date}/${k}`); } rule(f, "dense-slide", dense, dense.length || 1, "upcoming slides have over 45 words", { sev: "info", where: "social/" }); rule(f, "wordy-hook", longHook, longHook.length || 1, "upcoming first slides have over 16 words", { sev: "info", where: "social/" }); return report("slidetext", f, {}); };
export const scan = (root = ROOT, o = {}) => slidetext(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
