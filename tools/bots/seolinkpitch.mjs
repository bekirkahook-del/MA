// Link Pitch Drafter: A short, honest pitch for a resource-page link: what the site is, one fact it can support, no numbers you cannot show.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seolinkpitch.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seolinkpitch = c => { const f = []; f.push({ code: "pitch", severity: "info", where: "pitch", detail: "Subject: Free resource for your recruiting page. Body: Hi, I run mnaprep.com, a free game-style site for investment banking and private equity recruiting practice. If you keep a resources list, it may fit. I can send a short description. Reply 'no thanks' and I will not write again. (Add your address line. One email per site, ever.)" }); return report("seolinkpitch", f, {}); };
export const scan = (root = ROOT, o = {}) => seolinkpitch(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
