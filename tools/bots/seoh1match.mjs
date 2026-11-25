// H1 Match Checker: Scans every guide for pages whose h1 shares no words with the title.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seoh1match.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seoh1match = c => { const G = c => c._seo || (c._seo = c.tracked.filter(x => /^guides\/[^/]+\/index\.html$/.test(x)).map(p => { const h = c.rd(p), t = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " "), slug = p.split("/")[1], sch = slug.match(/^(.*)-(consulting|hedge-funds|investment-banking|private-equity|sales-and-trading)$/); return { p, slug, h, words: t.split(/\s+/).filter(Boolean).length, title: (h.match(/<title>([^<]*)/i) || [])[1] || "", desc: (h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "", h2: (h.match(/<h2\b/gi) || []).length, links: (h.match(/<a\b[^>]+href=["']\/guides\//gi) || []).length, school: sch ? sch[1] : null, career: sch ? sch[2] : null, text: t }; })); const f = []; const bad = G(c).filter(x => { const h = ((x.h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, " ").toLowerCase().split(/\W+/).filter(s => s.length > 3); return h.length && !h.some(w => x.title.toLowerCase().includes(w)); }); rule(f, "h1-mismatch", bad, G(c).length || 1, "page(s) have an h1 that shares no words with the title", { sev: "info", fmt: x => x.slug, fix: "Align the h1 and the title around one phrase." }); return report("seoh1match", f, { guides: G(c).length }); };
export const scan = (root = ROOT, o = {}) => seoh1match(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
