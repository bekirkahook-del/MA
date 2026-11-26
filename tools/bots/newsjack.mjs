// Newsjack Bot: Live-market post candidates from your wire data: $10B+ deals, earnings today or tomorrow, macro releases. Live headline posts are a top-3 winner and only work within 24 hours.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/newsjack.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const newsjack = c => { const f = [], items = FW.newsjack(c.wire, c.today), X = fly(c); for (const n of items.slice(0, 5)) if (!X.posts.some(p => sim(p.post, n.text) >= 0.5)) f.push({ code: "post-today-" + n.kind, severity: n.kind === "deal" ? "warn" : "info", where: "data/wire.json", detail: `${n.text}. Post within 24 hours of ${n.due}.` }); return report("newsjack", f, { candidates: items.length }); };
export const scan = (root = ROOT, o = {}) => newsjack(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
