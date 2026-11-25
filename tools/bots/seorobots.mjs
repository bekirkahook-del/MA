// Robots Checker: Checks robots.txt blocking pages it should not.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seorobots.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seorobots = c => { const G = c => c._seo || (c._seo = c.tracked.filter(x => /^guides\/[^/]+\/index\.html$/.test(x)).map(p => { const h = c.rd(p), t = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " "), slug = p.split("/")[1], sch = slug.match(/^(.*)-(consulting|hedge-funds|investment-banking|private-equity|sales-and-trading)$/); return { p, slug, h, words: t.split(/\s+/).filter(Boolean).length, title: (h.match(/<title>([^<]*)/i) || [])[1] || "", desc: (h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "", h2: (h.match(/<h2\b/gi) || []).length, links: (h.match(/<a\b[^>]+href=["']\/guides\//gi) || []).length, school: sch ? sch[1] : null, career: sch ? sch[2] : null, text: t }; })); const f = []; const r = c.robots || ""; f.push({ code: "robots", severity: /Disallow:\s*\/\s*$/m.test(r) ? "critical" : "info", where: "robots.txt", detail: /Disallow:\s*\/\s*$/m.test(r) ? "robots.txt blocks the whole site." : "robots.txt does not block the site. Sitemap line present: " + /Sitemap:/i.test(r) }); return report("seorobots", f, {}); };
export const scan = (root = ROOT, o = {}) => seorobots(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
