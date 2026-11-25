// Refund Window Bot: The refund promise on the refund page versus what the pricing text says, so the site never promises two different windows.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/refundwindow.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const refundwindow = c => { const f = [], rw = [...c.rd("refund/index.html").matchAll(/(\d+)[- ]day/gi)].map(m => +m[1]), iw = [...c.index.matchAll(/(\d+)[- ]day (money|refund|guarantee)/gi)].map(m => +m[1]); if (rw.length && iw.length && !iw.every(x => rw.includes(x))) f.push({ code: "refund-mismatch", severity: "warn", where: "refund / index", detail: `Refund page says ${[...new Set(rw)].join("/")} days but the home page says ${[...new Set(iw)].join("/")}.` }); return report("refundwindow", f, { refundDays: rw.length }); };
export const scan = (root = ROOT, o = {}) => refundwindow(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
