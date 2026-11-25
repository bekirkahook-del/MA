// Home Page Guard: Your hard rule: nothing is added to the Home page unless you ask. Flags any new element id on index.html since the saved baseline.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/homeguard.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const homeguard = c => { const f = [], base = c.homeBaseline; if (!base) return report("homeguard", [{ code: "no-baseline", severity: "info", where: "index.html", detail: "No Home baseline saved yet." }]); const ids = [...new Set([...c.index.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]))], added = ids.filter(i => !base.ids.includes(i)); if (added.length) f.push({ code: "home-changed", severity: "critical", where: "index.html", detail: `${added.length} new id(s) on index.html since the baseline: ${added.slice(0, 5).join(", ")}. Confirm you asked for this.` }); return report("homeguard", f, { ids: ids.length }); };
export const scan = (root = ROOT, o = {}) => homeguard(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
