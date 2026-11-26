// Canonical Tag Bot: Guide pages with no canonical link or one that points somewhere else. Your social traffic lands on these pages.
// Part of the Content Flywheel and operator desk (gear: pages). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/canonical.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const canonical = c => { const f = [], bad = c.pages.filter(p => { const m = p.html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) || p.html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i); return !m || !m[1].includes(p.slug); }); rule(f, "canonical", bad, c.pages.length, "guides have a missing or mismatched canonical link", { sev: "warn", where: "guides" }); return report("canonical", f, { guides: c.pages.length }); };
export const scan = (root = ROOT, o = {}) => canonical(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
