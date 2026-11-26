// Video Description Targets: Where to put the site link in your own video descriptions and bios, from your posted log.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkyoutube.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkyoutube = c => { const f = []; const X = fly(c), n = X.posts.length; f.push({ code: "bio-links", severity: "info", where: "profiles", detail: "Put mnaprep.com in the bio and in the first line of every video description or caption. Your post log has " + n + " posts; every one that reached people but linked nowhere is a lost visit." }); return report("seolinkyoutube", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkyoutube(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
