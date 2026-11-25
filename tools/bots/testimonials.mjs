// Testimonial Slot Bot: Whether the testimonial slot on the site holds any real quotes. Real quotes only; this bot never writes one.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/testimonials.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const testimonials = c => { const m = c.attract.match(/MA_TESTIMONIALS\s*=\s*(\[[\s\S]*?\])\s*;/), n = m ? (m[1].match(/\{/g) || []).length : null, f = []; if (n === 0) f.push({ code: "slot-empty", severity: "info", where: "js/attract.js", detail: "The testimonial slot is empty. Ask early users for real quotes; the bots will never invent one." }); return report("testimonials", f, { quotes: n }); };
export const scan = (root = ROOT, o = {}) => testimonials(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
