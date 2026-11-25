// Render Gate: Each deck must have one rendered image per slide in its folder before posting.
// Part of the Content Flywheel and operator desk (gear: gate). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/rendergate.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const rendergate = c => { const f = [], bad = []; for (const d of c.days.filter(d => d.date >= c.today && d.spec)) for (const [k, v] of Object.entries(d.spec.decks || {})) { const n = d.files.filter(x => x.startsWith(k + "-") && /\.(jpg|png)$/.test(x)).length; if (n !== (v.slides || []).length) bad.push(`${d.date}/${k} (${n} of ${(v.slides || []).length})`); } rule(f, "render-mismatch", bad, bad.length || 1, "upcoming decks have a different number of images than slides", { sev: "warn", where: "social/" }); return report("rendergate", f, {}); };
export const scan = (root = ROOT, o = {}) => rendergate(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
