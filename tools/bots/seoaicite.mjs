// AI Citation Checker: Checks guides that answer a question in the first 150 words, which is what AI search quotes.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seoaicite.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seoaicite = c => { const G = c => c._seo || (c._seo = c.tracked.filter(x => /^guides\/[^/]+\/index\.html$/.test(x)).map(p => { const h = c.rd(p), t = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " "), slug = p.split("/")[1], sch = slug.match(/^(.*)-(consulting|hedge-funds|investment-banking|private-equity|sales-and-trading)$/); return { p, slug, h, words: t.split(/\s+/).filter(Boolean).length, title: (h.match(/<title>([^<]*)/i) || [])[1] || "", desc: (h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "", h2: (h.match(/<h2\b/gi) || []).length, links: (h.match(/<a\b[^>]+href=["']\/guides\//gi) || []).length, school: sch ? sch[1] : null, career: sch ? sch[2] : null, text: t }; })); const f = []; const bad = G(c).filter(x => { const t = x.text.replace(/\s+/g, " ").slice(0, 900); return !/\b(is|are|means|refers to|works by)\b/i.test(t); }); rule(f, "no-answer-first", bad, G(c).length || 1, "guide(s) do not state a plain answer near the top", { sev: "info", fmt: x => x.slug, fix: "Open with a one-sentence definition or direct answer." }); return report("seoaicite", f, {}); };
export const scan = (root = ROOT, o = {}) => seoaicite(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
