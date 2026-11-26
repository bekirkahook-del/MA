// Free Merge Bot: Staged commits that touch no site files (bots, tests, notes) and so would not trigger a build.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/buildfree.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const buildfree = c => { const nb = /^(data\/wire\.json|social\/|guides\/_src\/|supabase\/|tests\/|tools\/|.*\.md$)/, free = c.queue.filter(x => x.files.every(y => nb.test(y))), f = []; if (free.length) f.push({ code: "free-to-main", severity: "info", where: "staging", detail: `${free.length} staged commit(s) touch no built files and can go straight to main for free: ${eg(free, 2, x => x.subject.slice(0, 50))}.` }); return report("buildfree", f, {}); };
export const scan = (root = ROOT, o = {}) => buildfree(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
