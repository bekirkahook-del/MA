// Answer Position Bot: Where the right answers sit (A, B, C, D). Your hub note says the keys skew to B; students notice and game it.
// Part of the Content Flywheel and operator desk (gear: pages). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/answerskew.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const answerskew = c => { if (!c.qs) return report("answerskew", [{ code: "needs-tracks", severity: "info", where: "question bank", detail: "No question data loaded; run with the tracks file." }]); const n = [0, 0, 0, 0], f = []; for (const q of c.qs) if (q.ans >= 0 && q.ans < 4) n[q.ans]++; const t = n.reduce((a, b) => a + b, 0), L = "ABCD", top = n.indexOf(Math.max(...n)); if (t && n[top] / t > 0.32) f.push({ code: "answer-skew", severity: "warn", where: "question bank", detail: `Correct answers by position: ${n.map((x, i) => `${L[i]} ${Math.round(x / t * 100)}%`).join(", ")}. Shuffle so no position is above 30%.` }); return report("answerskew", f, { questions: t }); };
export const scan = (root = ROOT, o = {}) => answerskew(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
