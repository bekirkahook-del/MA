// News Quiz Bot: News quiz questions with an answer index that does not exist, or that are not about anything on today's wire.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/quizanswer.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const quizanswer = c => { const f = [], qz = (c.wire && c.wire.NEWS_QUIZ) || [], pool = ((c.wire && c.wire.NEWS) || []).map(n => n.h + " " + n.w).concat(((c.wire && c.wire.DEALS) || []).map(d => d.buyer + " " + d.target + " " + d.value)).join(" "); for (const q of qz) { if (!Array.isArray(q[1]) || q[2] < 0 || q[2] >= q[1].length) f.push({ code: "bad-answer-index", severity: "critical", where: "data/wire.json", detail: `Quiz "${String(q[0]).slice(0, 50)}" has answer index ${q[2]} of ${(q[1] || []).length}.` }); else if (sim(q[0], pool) < 0.25) f.push({ code: "quiz-off-wire", severity: "info", where: "data/wire.json", detail: `Quiz "${String(q[0]).slice(0, 50)}" does not match anything on today's wire.` }); } return report("quizanswer", f, { quizzes: qz.length }); };
export const scan = (root = ROOT, o = {}) => quizanswer(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
