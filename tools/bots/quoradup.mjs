// Quora Repeat Bot: Quora questions answered twice, which Quora treats as spam.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/quoradup.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const quoradup = c => { const f = [], p = c.quora.posted, hit = []; for (let i = 0; i < p.length; i++) for (let j = 0; j < i; j++) if (p[i].url === p[j].url || sim(p[i].question, p[j].question) >= 0.85) hit.push(p[i]); rule(f, "answered-twice", hit, p.length, "logged answers repeat an earlier question", { sev: "warn", fmt: x => x.question.slice(0, 50), where: "social/quora/posted.md" }); return report("quoradup", f, {}); };
export const scan = (root = ROOT, o = {}) => quoradup(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
