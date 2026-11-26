// Spike Bot: Posts over 2x the average that still have no sequel. Your rule: a spike gets a sequel within 3 days.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/spikes.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const spikes = c => { const X = fly(c), f = [], open = X.spikes.filter(s => !s.hasSequel); for (const s of open) f.push({ code: s.overdue ? "sequel-overdue" : "sequel-due", severity: s.overdue ? "warn" : "info", where: "social/winners.md", detail: `${s.post.family}: "${s.post.post}" did ${total(s.post)} views (${s.multiple}x the average). ${s.overdue ? "Sequel is overdue" : "Sequel due"} by ${s.sequelBy}.` }); return report("spikes", f, { spikes: X.spikes.length, withoutSequel: open.length }); };
export const scan = (root = ROOT, o = {}) => spikes(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
