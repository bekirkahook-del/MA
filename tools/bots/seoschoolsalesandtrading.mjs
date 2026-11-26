// School Pages: Sales and trading: Checks the school-specific Sales and trading guides for thin or copy-paste content.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seoschoolsalesandtrading.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seoschoolsalesandtrading = c => { const G = c => c._seo || (c._seo = c.tracked.filter(x => /^guides\/[^/]+\/index\.html$/.test(x)).map(p => { const h = c.rd(p), t = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " "), slug = p.split("/")[1], sch = slug.match(/^(.*)-(consulting|hedge-funds|investment-banking|private-equity|sales-and-trading)$/); return { p, slug, h, words: t.split(/\s+/).filter(Boolean).length, title: (h.match(/<title>([^<]*)/i) || [])[1] || "", desc: (h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "", h2: (h.match(/<h2\b/gi) || []).length, links: (h.match(/<a\b[^>]+href=["']\/guides\//gi) || []).length, school: sch ? sch[1] : null, career: sch ? sch[2] : null, text: t }; })); const f = [], g = G(c).filter(x => x.career === "sales-and-trading"), thin = g.filter(x => x.words < 500); f.push({ code: "count", severity: "info", where: "guides", detail: g.length + " school pages for Sales and trading." }); rule(f, "thin-school", thin, g.length || 1, "school page(s) are under 500 words, which risks being treated as thin template pages", { sev: "warn", fmt: x => x.slug + " (" + x.words + ")", fix: "Add one fact only that school has (a real club, a real recruiting event) from its own site." }); return report("seoschoolsalesandtrading", f, { pages: g.length }); };
export const scan = (root = ROOT, o = {}) => seoschoolsalesandtrading(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
