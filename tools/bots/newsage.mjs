// News Age Bot: Headlines on the wire older than 2 days, and how old the whole wire is.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/newsage.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const newsage = c => { const f = [], n = (c.wire && c.wire.NEWS) || [], old = n.filter(x => { const d = parseWireDate(x.d); return d && daysAgo(d, c.today) > 2; }); rule(f, "stale-news", old, n.length, "wire headlines are more than 2 days old", { sev: old.length > n.length / 2 ? "warn" : "info", fmt: x => x.d + " " + x.h.slice(0, 40), where: "data/wire.json" }); const nd = c.wire && parseWireDate(c.wire.NEWS_DATE); if (nd && daysAgo(nd, c.today) > 2) f.push({ code: "wire-stale", severity: "warn", where: "data/wire.json", detail: `NEWS_DATE is ${c.wire.NEWS_DATE}, ${daysAgo(nd, c.today)} days old.` }); return report("newsage", f, { headlines: n.length }); };
export const scan = (root = ROOT, o = {}) => newsage(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
