// Source Gate: Ranking and stat decks need a source on the slides. Your rule: source every number.
// Part of the Content Flywheel and operator desk (gear: gate). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/sourcegate.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const sourcegate = c => { const f = [], bad = []; for (const d of c.days.filter(d => d.date >= c.today && d.spec)) for (const [k, v] of Object.entries(d.spec.decks || {})) { const t = (v.slides || []).join(" "); if (/\b(top \d|ranked|rank|%|\$\d)/i.test(t) && !/source|per |according/i.test(t)) bad.push(`${d.date}/${k}`); } rule(f, "no-source-line", bad, bad.length || 1, "upcoming decks show numbers or rankings with no source", { sev: "warn", where: "social/" }); return report("sourcegate", f, {}); };
export const scan = (root = ROOT, o = {}) => sourcegate(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
