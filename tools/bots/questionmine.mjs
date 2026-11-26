// Question Mine Bot: Interview-question posts pulled from your own question bank: ready-to-use questions with numbers and the right answer, so the tiered-question winner never runs dry.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/questionmine.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const questionmine = c => { const X = fly(c), f = [], picks = FW.questionPicks(c.qs, X.posts, c.today, 5); if (!c.qs) return report("questionmine", [{ code: "needs-tracks", severity: "info", where: "question bank", detail: "No question data loaded. Run with the tracks file to mine questions." }]); for (const p of picks.slice(0, 3)) f.push({ code: "question-candidate", severity: "info", where: p.where, detail: `"${p.text}" Answer: ${p.answer}.` }); return report("questionmine", f, { candidates: picks.length, bank: c.qs.length }); };
export const scan = (root = ROOT, o = {}) => questionmine(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
