// Deal Value Bot: Deals whose text value and numeric usd field disagree (for example $41.0B vs 4.1).
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/dealsmath.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const dealsmath = c => { const f = [], bad = ((c.wire && c.wire.DEALS) || []).filter(d => { const m = String(d.value).match(/\$([\d.,]+)\s*([BM])/i); if (!m || d.usd == null) return false; const v = parseFloat(m[1].replace(/,/g, "")) * (/m/i.test(m[2]) ? 0.001 : 1); return Math.abs(v - d.usd) > 0.01 * Math.max(1, d.usd); }); rule(f, "value-mismatch", bad, ((c.wire && c.wire.DEALS) || []).length, "wire deals show a text value that does not match the usd number", { sev: "warn", fmt: d => `${d.buyer}/${d.target} ${d.value} vs ${d.usd}`, where: "data/wire.json" }); return report("dealsmath", f, {}); };
export const scan = (root = ROOT, o = {}) => dealsmath(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
