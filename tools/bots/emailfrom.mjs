// Sender Address Bot: Every Netlify email function should send from the same default address (hello@mnaprep.com).
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/emailfrom.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const emailfrom = c => { const f = [], seen = {}; for (const x of c.tracked.filter(x => /^netlify\/functions\/[^/]+\.mjs$/.test(x))) for (const m of c.rd(x).matchAll(/MAIL_FROM\s*\|\|\s*["'`]([^"'`]+)["'`]/g)) (seen[m[1]] ||= []).push(x.split("/").pop()); const k = Object.keys(seen); if (k.length > 1) f.push({ code: "mixed-senders", severity: "warn", where: "netlify/functions", detail: `${k.length} different default senders: ${k.map(a => `${a} (${seen[a].length})`).join("; ")}.` }); return report("emailfrom", f, { senders: k.length }); };
export const scan = (root = ROOT, o = {}) => emailfrom(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
