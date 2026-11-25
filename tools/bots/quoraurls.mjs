// Quora Log Bot: Log rows with a missing or malformed answer link, so every answer can be checked and scored later.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/quoraurls.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const quoraurls = c => { const f = [], bad = c.quora.posted.filter(x => !/^https:\/\/www\.quora\.com\/.+/.test(x.url)); rule(f, "bad-url", bad, c.quora.posted.length || 1, "logged Quora answers have a missing or odd link", { sev: "info", fmt: x => x.question.slice(0, 40), where: "social/quora/posted.md" }); return report("quoraurls", f, {}); };
export const scan = (root = ROOT, o = {}) => quoraurls(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
