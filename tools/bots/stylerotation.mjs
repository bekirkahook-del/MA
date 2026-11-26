// Style Rotation Bot: Your video rules: never the same style twice in a row, and rotate Top 5 / 7 / 10. Also which style performs best.
// Part of the Content Flywheel and operator desk (gear: measure). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/stylerotation.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const stylerotation = c => { const f = [], r = c.punch; for (let i = 1; i < r.length; i++) if (r[i].style && r[i].style === r[i - 1].style) f.push({ code: "style-repeat", severity: "warn", where: "social/punch-log.md", detail: `${r[i - 1].date} and ${r[i].date} both use style "${r[i].style}". Rule: change the style every post.` }); for (let i = 2; i < r.length; i++) if (r[i].n && r[i].n === r[i - 1].n && r[i].n === r[i - 2].n) f.push({ code: "topn-repeat", severity: "info", where: "social/punch-log.md", detail: `Three Top ${r[i].n} videos in a row ending ${r[i].date}. Rotate 5 / 7 / 10.` }); const by = {}; for (const x of r.filter(x => x.views != null)) (by[x.style] ||= []).push(x.views); const rows = Object.entries(by).map(([k, v]) => ({ k, n: v.length, avg: Math.round(v.reduce((a, b) => a + b, 0) / v.length) })).sort((a, b) => b.avg - a.avg); if (rows.length) f.push({ code: "style-ranking", severity: "info", where: "social/punch-log.md", detail: `Styles by average TikTok views: ${rows.map(x => `${x.k} ${x.avg} (n=${x.n})`).join("; ")}.` }); return report("stylerotation", f, { videos: r.length }); };
export const scan = (root = ROOT, o = {}) => stylerotation(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
