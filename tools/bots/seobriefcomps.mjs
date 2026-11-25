// SEO Brief: Comparable company analysis: Content brief for the "Comparable company analysis" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers.
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/seobriefcomps.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;

export const seobriefcomps = c => { const G = c => c._seo || (c._seo = c.tracked.filter(x => /^guides\/[^/]+\/index\.html$/.test(x)).map(p => { const h = c.rd(p), t = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, " "), slug = p.split("/")[1], sch = slug.match(/^(.*)-(consulting|hedge-funds|investment-banking|private-equity|sales-and-trading)$/); return { p, slug, h, words: t.split(/\s+/).filter(Boolean).length, title: (h.match(/<title>([^<]*)/i) || [])[1] || "", desc: (h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "", h2: (h.match(/<h2\b/gi) || []).length, links: (h.match(/<a\b[^>]+href=["']\/guides\//gi) || []).length, school: sch ? sch[1] : null, career: sch ? sch[2] : null, text: t }; })); const f = [], g = G(c).filter(x => /comps|comparable|precedent/.test(x.slug) && !x.school), qs = ["comparable company analysis explained","trading comps vs precedent transactions","valuation multiples for interviews"]; if (!g.length) f.push({ code: "no-guide", severity: "warn", where: "guides", detail: "No guide covers Comparable company analysis. Write one targeting: " + qs.join(" | ") + ". Outline: definition, worked example, 5 practice questions, link to the matching mnaprep level." }); else { const best = g.sort((a, b) => b.words - a.words)[0]; f.push({ code: "have-guide", severity: best.words < 700 ? "warn" : "info", where: best.p, detail: g.length + " guide(s); the longest ('" + best.slug + "') has " + best.words + " words and " + best.h2 + " sections. " + (best.words < 700 ? "Expand it with a worked example and practice questions. " : "") + "Make sure these phrases appear in the title or a heading: " + qs.join(" | ") }); } return report("seobriefcomps", f, { guides: g.length }); };
export const scan = (root = ROOT, o = {}) => seobriefcomps(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
