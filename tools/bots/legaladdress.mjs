// Mailing Address Bot: Marketing email needs a physical mailing address (CAN-SPAM). Looks for one on your legal pages; flags it if none exists.
// Part of the Content Flywheel and operator desk (gear: site). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/legaladdress.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const legaladdress = c => { const txt = ["privacy/index.html", "terms/index.html", "index.html"].map(x => c.rd(x)).join(" "), has = /\b\d{1,5}\s+[A-Z][\w.]+\s+(St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane)\b|P\.?O\.? Box \d+|,\s*[A-Z]{2}\s+\d{5}\b/.test(txt); return report("legaladdress", has ? [] : [{ code: "no-address", severity: "warn", where: "privacy / terms", detail: "No mailing address found on the privacy or terms pages. Marketing email needs one; only you can supply it." }], {}); };
export const scan = (root = ROOT, o = {}) => legaladdress(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
