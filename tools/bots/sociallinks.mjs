// Social Link Bot: Every mnaprep.com page you link to in your social files and decks must exist on the site, or the link you posted is a dead end.
// Part of the Content Flywheel and operator desk (gear: reach). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/sociallinks.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const sociallinks = c => { const f = [], urls = new Set(); const txt = c.tracked.filter(x => /^social\/[^/]+\.md$/.test(x)).map(x => c.rd(x)).join("\n") + c.days.map(d => JSON.stringify(d.spec || "")).join("\n"); for (const m of txt.matchAll(/https?:\/\/(?:www\.)?mnaprep\.com(\/[^\s"'`)\\?#<>]*)/g)) urls.add(m[1]); const dead = [...urls].filter(p => p !== "/" && !/^\/(favicon|img\/|fonts\/)/.test(p) && !c.exists(p.replace(/^\//, "").replace(/\/$/, "") + "/index.html") && !c.exists(p.replace(/^\//, "").replace(/\/$/, "")) && !c.exists(p.replace(/^\//, ""))); rule(f, "dead-link", dead, urls.size, "mnaprep.com links in your social files point to pages that do not exist", { sev: "warn", fmt: x => x, where: "social/" }); return report("sociallinks", f, { links: urls.size }); };
export const scan = (root = ROOT, o = {}) => sociallinks(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
