// Generates the SEO pack for mnaprep.com: 60 bots, one file each, plus circle/pack5.mjs. Read-only.
// They find ranking problems on the 1,100+ guide pages, write the exact fix, build content briefs for the
// topics that can win searches, and list the places that could link to the site. They never post, send or deploy.
// No search-volume or traffic numbers are invented: keyword ideas are phrases only; counts come from your own files.
// Run: node tools/bots/flywheel/gen5.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), bots = path.join(here, "..");
const J = JSON.stringify, all = [];
const add = (id, name, does, fn) => all.push({ id, name, gear: "seo", does, fn });

// shared page model, built once per run (memoized on the ops context)
const MODEL = `const G = c => c._seo || (c._seo = c.tracked.filter(x => /^guides\\/[^/]+\\/index\\.html$/.test(x)).map(p => { const h = c.rd(p), t = h.replace(/<script[\\s\\S]*?<\\/script>|<style[\\s\\S]*?<\\/style>|<[^>]+>/g, " "), slug = p.split("/")[1], sch = slug.match(/^(.*)-(consulting|hedge-funds|investment-banking|private-equity|sales-and-trading)$/); return { p, slug, h, words: t.split(/\\s+/).filter(Boolean).length, title: (h.match(/<title>([^<]*)/i) || [])[1] || "", desc: (h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1] || "", h2: (h.match(/<h2\\b/gi) || []).length, links: (h.match(/<a\\b[^>]+href=["']\\/guides\\//gi) || []).length, school: sch ? sch[1] : null, career: sch ? sch[2] : null, text: t }; }));`;

// ---- A. content briefs per topic cluster (12) ----
const CL = [
  ["ibinterview", "Investment banking interview questions", /interview/, ["investment banking interview questions", "investment banking technical questions and answers", "IB interview prep for students"]],
  ["lbo", "LBO model", /lbo/, ["LBO model explained", "LBO interview question walkthrough", "how an LBO works for beginners"]],
  ["dcf", "DCF", /dcf|discounted/, ["DCF valuation step by step", "DCF interview questions", "how to build a DCF for recruiting"]],
  ["accretion", "Accretion and dilution", /accretion|merger-model/, ["accretion dilution analysis explained", "merger model interview question", "accretive vs dilutive deal"]],
  ["comps", "Comparable company analysis", /comps|comparable|precedent/, ["comparable company analysis explained", "trading comps vs precedent transactions", "valuation multiples for interviews"]],
  ["perecruit", "Private equity recruiting", /private-equity|pe-recruit|recruiting-timeline/, ["private equity recruiting timeline", "how to get into private equity from undergrad", "PE interview prep"]],
  ["superday", "Superday", /superday/, ["investment banking superday tips", "what happens at a superday", "superday questions"]],
  ["network", "Networking and cold email", /network|cold-email|coffee/, ["investment banking networking email", "coffee chat questions for bankers", "how to cold email an analyst"]],
  ["resume", "Resume", /resume|cv/, ["investment banking resume format", "finance resume for freshmen", "IB resume bullet points"]],
  ["restructuring", "Restructuring", /restructur/, ["restructuring investment banking explained", "restructuring interview questions", "restructuring vs M&A groups"]],
  ["hedgefund", "Hedge funds", /hedge/, ["how to get into a hedge fund as a student", "hedge fund recruiting", "stock pitch for interviews"]],
  ["accounting", "Accounting for finance interviews", /accounting/, ["accounting questions for investment banking interviews", "three statements linking questions", "how the 3 statements connect"]],
];
for (const [id, label, re, qs] of CL) add("seobrief" + id, `SEO Brief: ${label}`, `Content brief for the "${label}" cluster: does a guide exist, how strong is it, and what to add. Phrases only; no volume numbers.`,
  `c => { ${MODEL} const f = [], g = G(c).filter(x => ${re}.test(x.slug) && !x.school), qs = ${J(qs)}; if (!g.length) f.push({ code: "no-guide", severity: "warn", where: "guides", detail: "No guide covers ${label}. Write one targeting: " + qs.join(" | ") + ". Outline: definition, worked example, 5 practice questions, link to the matching mnaprep level." }); else { const best = g.sort((a, b) => b.words - a.words)[0]; f.push({ code: "have-guide", severity: best.words < 700 ? "warn" : "info", where: best.p, detail: g.length + " guide(s); the longest ('" + best.slug + "') has " + best.words + " words and " + best.h2 + " sections. " + (best.words < 700 ? "Expand it with a worked example and practice questions. " : "") + "Make sure these phrases appear in the title or a heading: " + qs.join(" | ") }); } return report(${J("seobrief" + id)}, f, { guides: g.length }); }`);

// ---- B. on-page checks across guides (14) ----
const PAGE = [
  ["seothin", "Thin Page Checker", "guides under 400 words", `const bad = G(c).filter(x => x.words < 400); rule(f, "thin", bad, G(c).length || 1, "guide(s) are under 400 words", { sev: "warn", fmt: x => x.slug + " (" + x.words + ")", fix: "Add a worked example and practice questions, or merge into a stronger page." });`],
  ["seoh2", "Heading Depth Checker", "guides with fewer than 3 sections", `const bad = G(c).filter(x => x.h2 < 3); rule(f, "few-h2", bad, G(c).length || 1, "guide(s) have fewer than 3 h2 sections", { sev: "info", fmt: x => x.slug, fix: "Break the page into question-style sections." });`],
  ["seoinlinks", "Internal Link Count Checker", "guides linking to fewer than 3 other guides", `const bad = G(c).filter(x => x.links < 3); rule(f, "few-links", bad, G(c).length || 1, "guide(s) link to fewer than 3 other guides", { sev: "warn", fmt: x => x.slug + " (" + x.links + ")", fix: "Add 3 contextual links to related guides." });`],
  ["seofaq", "FAQ Schema Checker", "guides with no FAQ markup", `const bad = G(c).filter(x => !/FAQPage/.test(x.h)); rule(f, "no-faq", bad, G(c).length || 1, "guide(s) have no FAQPage markup", { sev: "info", fmt: x => x.slug, fix: "Add 3 real questions with answers in FAQPage JSON-LD; Google can show them in results." });`],
  ["seoarticle", "Article Schema Checker", "guides with no Article or BreadcrumbList markup", `const bad = G(c).filter(x => !/"@type"\\s*:\\s*"(Article|BlogPosting|BreadcrumbList)"/.test(x.h)); rule(f, "no-article", bad, G(c).length || 1, "guide(s) have no Article or Breadcrumb markup", { sev: "info", fmt: x => x.slug, fix: "Add Article and BreadcrumbList JSON-LD." });`],
  ["seotitlekw", "Title Keyword Checker", "titles that do not contain the page's main topic words", `const bad = G(c).filter(x => { const w = x.slug.split("-").filter(s => s.length > 3).slice(0, 2); return w.length && !w.some(s => x.title.toLowerCase().includes(s)); }); rule(f, "title-mismatch", bad, G(c).length || 1, "title(s) leave out the page's topic words", { sev: "info", fmt: x => x.slug, fix: "Put the main phrase first in the title." });`],
  ["seodescmiss", "Description Checker", "guides with a missing or very short meta description", `const bad = G(c).filter(x => x.desc.length < 70); rule(f, "short-desc", bad, G(c).length || 1, "guide(s) have a missing or short description", { sev: "warn", fmt: x => x.slug + " (" + x.desc.length + ")", fix: "Write 120-155 characters with the main phrase and a reason to click." });`],
  ["seodupetitle", "Duplicate Title Checker", "guides sharing the exact same title", `const m = {}; G(c).forEach(x => (m[x.title] = m[x.title] || []).push(x.slug)); const bad = Object.entries(m).filter(([t, a]) => t && a.length > 1); rule(f, "dupe-title", bad, G(c).length || 1, "title(s) are used by more than one guide", { sev: "warn", fmt: ([t, a]) => a.length + "x " + t.slice(0, 40), fix: "Give each page a unique title." });`],
  ["seodupedesc", "Duplicate Description Checker", "guides sharing the exact same description", `const m = {}; G(c).forEach(x => x.desc && (m[x.desc] = m[x.desc] || []).push(x.slug)); const bad = Object.entries(m).filter(([t, a]) => a.length > 1); rule(f, "dupe-desc", bad, G(c).length || 1, "description(s) are used by more than one guide", { sev: "warn", fmt: ([t, a]) => a.length + "x " + t.slice(0, 40), fix: "Write a unique description per page." });`],
  ["seoupdated", "Freshness Checker", "guides with no visible updated date", `const bad = G(c).filter(x => !/updated|last reviewed|dateModified/i.test(x.h)); rule(f, "no-date", bad, G(c).length || 1, "guide(s) show no updated date", { sev: "info", fmt: x => x.slug, fix: "Add a visible 'Updated <month year>' line and dateModified markup." });`],
  ["seocta", "Guide CTA Checker", "guides with no link into the training site", `const bad = G(c).filter(x => !/href=["'](\\/#|\\/\\?|https:\\/\\/mnaprep\\.com\\/?(#|\\?|["']))|href=["']\\/["']/.test(x.h) && !/mnaprep\\.com\\/#/.test(x.h)); rule(f, "no-cta", bad, G(c).length || 1, "guide(s) have no obvious link back into the practice site", { sev: "info", fmt: x => x.slug, fix: "End each guide with a button to the matching practice level." });`],
  ["seoimgalt", "Image Alt Checker", "guides with images missing alt text", `const bad = G(c).filter(x => /<img\\b(?![^>]*\\balt=)/i.test(x.h)); rule(f, "no-alt", bad, G(c).length || 1, "guide(s) have an image without alt text", { sev: "info", fmt: x => x.slug, fix: "Describe each image in the alt attribute." });`],
  ["seoh1match", "H1 Match Checker", "pages whose h1 shares no words with the title", `const bad = G(c).filter(x => { const h = ((x.h.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/i) || [])[1] || "").replace(/<[^>]+>/g, " ").toLowerCase().split(/\\W+/).filter(s => s.length > 3); return h.length && !h.some(w => x.title.toLowerCase().includes(w)); }); rule(f, "h1-mismatch", bad, G(c).length || 1, "page(s) have an h1 that shares no words with the title", { sev: "info", fmt: x => x.slug, fix: "Align the h1 and the title around one phrase." });`],
  ["seolong", "Page Length Balance Checker", "the spread of guide lengths, to spot template pages that are all the same", `const w = G(c).map(x => x.words).sort((a, b) => a - b), med = w[Math.floor(w.length / 2)] || 0; f.push({ code: "lengths", severity: "info", where: "guides", detail: G(c).length + " guides; shortest " + (w[0] || 0) + " words, median " + med + ", longest " + (w[w.length - 1] || 0) + "." });`],
];
for (const [id, nm, what, body] of PAGE) add(id, nm, `Scans every guide for ${what}.`, `c => { ${MODEL} const f = []; ${body} return report(${J(id)}, f, { guides: G(c).length }); }`);

// ---- C. programmatic school pages (8) ----
const CAREERS = [["consulting", "Consulting"], ["hedge-funds", "Hedge funds"], ["investment-banking", "Investment banking"], ["private-equity", "Private equity"], ["sales-and-trading", "Sales and trading"]];
for (const [k, label] of CAREERS) add("seoschool" + k.replace(/-/g, ""), `School Pages: ${label}`, `Checks the school-specific ${label} guides for thin or copy-paste content.`,
  `c => { ${MODEL} const f = [], g = G(c).filter(x => x.career === ${J(k)}), thin = g.filter(x => x.words < 500); f.push({ code: "count", severity: "info", where: "guides", detail: g.length + " school pages for ${label}." }); rule(f, "thin-school", thin, g.length || 1, "school page(s) are under 500 words, which risks being treated as thin template pages", { sev: "warn", fmt: x => x.slug + " (" + x.words + ")", fix: "Add one fact only that school has (a real club, a real recruiting event) from its own site." }); return report(${J("seoschool" + k.replace(/-/g, ""))}, f, { pages: g.length }); }`);
add("seoschoolsame", "School Page Sameness Checker", "How similar the school pages are to each other. Near-identical text across hundreds of pages is the main ranking risk of a programmatic site.",
  `c => { ${MODEL} const f = [], g = G(c).filter(x => x.school), seen = {}; for (const x of g) { const k = x.text.replace(new RegExp(x.school.replace(/-/g, " "), "gi"), "SCHOOL").replace(/\\s+/g, " ").slice(600, 900); (seen[k] = seen[k] || []).push(x.slug); } const groups = Object.values(seen).filter(a => a.length > 20); f.push({ code: "template-share", severity: groups.length ? "warn" : "info", where: "guides", detail: groups.length ? groups.reduce((s, a) => s + a.length, 0) + " school pages share an identical middle section after the school name is swapped. Add school-specific facts so each page earns its own ranking." : "School pages differ in the sampled section." }); return report("seoschoolsame", f, { schoolPages: g.length }); }`);
add("seoschoolgap", "School Coverage Checker", "Schools that have some career pages but not all five.",
  `c => { ${MODEL} const f = [], by = {}; G(c).filter(x => x.school).forEach(x => (by[x.school] = by[x.school] || new Set()).add(x.career)); const part = Object.entries(by).filter(([, s]) => s.size < 5); rule(f, "partial", part, Object.keys(by).length || 1, "school(s) are missing some of the 5 career pages", { sev: "info", fmt: ([s, set]) => s + " (" + set.size + "/5)", fix: "Generate the missing pages or drop the school." }); return report("seoschoolgap", f, { schools: Object.keys(by).length }); }`);
add("seoschoollink", "School Hub Link Checker", "Whether each school page links to the school's other career pages, which spreads ranking power across the set.",
  `c => { ${MODEL} const f = [], g = G(c).filter(x => x.school), bad = g.filter(x => x.links < 2); rule(f, "isolated", bad, g.length || 1, "school page(s) link to fewer than 2 other guides", { sev: "warn", fmt: x => x.slug, fix: "Link each school page to that school's other four pages and to the hub." }); return report("seoschoollink", f, { schoolPages: g.length }); }`);

// ---- D. technical and AI-search (14) ----
const TECH = [
  ["seorobots", "Robots Checker", "robots.txt blocking pages it should not", `const r = c.robots || ""; f.push({ code: "robots", severity: /Disallow:\\s*\\/\\s*$/m.test(r) ? "critical" : "info", where: "robots.txt", detail: /Disallow:\\s*\\/\\s*$/m.test(r) ? "robots.txt blocks the whole site." : "robots.txt does not block the site. Sitemap line present: " + /Sitemap:/i.test(r) });`],
  ["seosmsize", "Sitemap Size Checker", "sitemap URL count against the guide count", `const n = (c.sitemap.match(/<loc>/g) || []).length, g = G(c).length; f.push({ code: "sitemap", severity: n < g ? "warn" : "info", where: "sitemap.xml", detail: n + " URLs in the sitemap and " + g + " guide pages." + (n < g ? " Some guides are missing from it." : "") });`],
  ["seolastmod", "Sitemap Date Checker", "sitemap entries with no lastmod", `const u = (c.sitemap.match(/<url>/g) || []).length, l = (c.sitemap.match(/<lastmod>/g) || []).length; f.push({ code: "lastmod", severity: l < u ? "info" : "info", where: "sitemap.xml", detail: l + " of " + u + " sitemap entries have a lastmod date." });`],
  ["seollms", "llms.txt Checker", "llms.txt, the file AI search tools read", `const t = c.rd("llms.txt"); f.push({ code: "llms", severity: t.length < 200 ? "warn" : "info", where: "llms.txt", detail: t.length < 200 ? "llms.txt is missing or very short. List the site, the main guides and what each teaches." : "llms.txt is " + t.split("\\n").length + " lines." });`],
  ["seocanonconf", "Canonical Conflict Checker", "canonicals pointing at a different page", `const bad = G(c).filter(x => { const m = x.h.match(/rel=["']canonical["'][^>]*href=["']([^"']+)/i); return m && !m[1].includes("/guides/" + x.slug); }); rule(f, "canon-off", bad, G(c).length || 1, "guide(s) have a canonical pointing somewhere else", { sev: "warn", fmt: x => x.slug, fix: "Point the canonical at the page's own URL." });`],
  ["seonoindex", "Noindex Checker", "pages accidentally set to noindex", `const bad = G(c).filter(x => /name=["']robots["'][^>]*noindex/i.test(x.h)); rule(f, "noindex", bad, G(c).length || 1, "guide(s) are set to noindex", { sev: "critical", fmt: x => x.slug, fix: "Remove noindex unless it is intentional." });`],
  ["seoslug", "URL Slug Checker", "slugs that are very long", `const bad = G(c).filter(x => x.slug.length > 60); rule(f, "long-slug", bad, G(c).length || 1, "slug(s) are over 60 characters", { sev: "info", fmt: x => x.slug, fix: "Shorten the slug and add a redirect." });`],
  ["seoweight", "Page Weight Checker", "guide pages over 300 KB of HTML", `const bad = G(c).filter(x => x.h.length > 300000); rule(f, "heavy", bad, G(c).length || 1, "guide(s) are over 300 KB of HTML", { sev: "warn", fmt: x => x.slug, fix: "Move inline data to a file." });`],
  ["seoscripts", "Blocking Script Checker", "guides with render-blocking scripts in the head", `const bad = G(c).filter(x => /<head>[\\s\\S]*?<script\\b(?![^>]*\\b(defer|async|type=["']application\\/ld))[^>]*src=/i.test(x.h)); rule(f, "blocking", bad, G(c).length || 1, "guide(s) load a blocking script in the head", { sev: "info", fmt: x => x.slug, fix: "Add defer." });`],
  ["seohttps", "Sitemap HTTPS Checker", "sitemap URLs that are not https on the main domain", `const bad = (c.sitemap.match(/<loc>([^<]+)/g) || []).filter(l => !/<loc>https:\\/\\/mnaprep\\.com\\//.test(l)); rule(f, "off-domain", bad, 1, "sitemap URL(s) are not on https://mnaprep.com", { sev: "warn", fmt: () => "a URL", fix: "Fix the domain in the sitemap." });`],
  ["seoredirect", "Redirect Rule Checker", "redirect rules in netlify.toml", `const n = (c.toml.match(/\\[\\[redirects\\]\\]/g) || []).length; f.push({ code: "redirects", severity: "info", where: "netlify.toml", detail: n + " redirect rule(s). Every renamed guide needs one so old links and rankings carry over." });`],
  ["seobreadcrumb", "Breadcrumb Checker", "guides with no breadcrumb markup", `const bad = G(c).filter(x => !/BreadcrumbList/.test(x.h)); rule(f, "no-breadcrumb", bad, G(c).length || 1, "guide(s) have no BreadcrumbList", { sev: "info", fmt: x => x.slug, fix: "Add BreadcrumbList JSON-LD." });`],
  ["seoaicite", "AI Citation Checker", "guides that answer a question in the first 150 words, which is what AI search quotes", `const bad = G(c).filter(x => { const t = x.text.replace(/\\s+/g, " ").slice(0, 900); return !/\\b(is|are|means|refers to|works by)\\b/i.test(t); }); rule(f, "no-answer-first", bad, G(c).length || 1, "guide(s) do not state a plain answer near the top", { sev: "info", fmt: x => x.slug, fix: "Open with a one-sentence definition or direct answer." });`],
  ["seoogtitle", "Social Preview Checker", "guides missing og:title or og:description", `const bad = G(c).filter(x => !/og:title/.test(x.h) || !/og:description/.test(x.h)); rule(f, "no-og", bad, G(c).length || 1, "guide(s) are missing og tags", { sev: "info", fmt: x => x.slug, fix: "Add og:title and og:description." });`],
];
for (const [id, nm, what, body] of TECH) add(id, nm, `Checks ${what}.`, `c => { ${MODEL} const f = []; ${body} return report(${J(id)}, f, {}); }`);

// ---- E. promotion: places that can link to the site (12) ----
const PROMO = [
  ["seolinkcareer", "Career Center Link Targets", "Search queries that find university career-center resource pages that list free prep tools", ["\"investment banking\" \"resources\" site:.edu career center free prep", "\"finance recruiting resources\" site:.edu", "\"interview prep\" \"banking\" career services links"]],
  ["seolinkclubs", "Club Resource Link Targets", "Queries that find club sites with a resources or links page", ["\"finance club\" \"resources\" site:.edu", "\"investment banking club\" \"useful links\"", "\"private equity club\" resources links"]],
  ["seolinkreddit", "Community Answer Targets", "Questions students ask in public forums that a guide here answers. List only; answer by hand, one useful reply at a time, never a drive-by link", ["how do I prepare for investment banking interviews as a freshman", "what technical questions are asked in IB interviews", "when does private equity recruiting start"]],
  ["seolinkunlinked", "Unlinked Mention Finder", "Queries that find pages that mention M&A Prep without linking to it", ["\"M&A Prep\" \"mnaprep\" -site:mnaprep.com", "\"mnaprep.com\" -site:mnaprep.com", "\"M&A Prep\" investment banking game"]],
  ["seolinkroundup", "Roundup Page Targets", "Queries that find 'best free resources' lists that could add the site", ["best free investment banking interview prep resources", "free finance recruiting resources for students list", "best free resources to learn financial modeling"]],
  ["seolinknewsletter", "Newsletter Targets", "Queries for student finance newsletters that feature tools", ["student finance newsletter investment banking recruiting", "college finance club newsletter submit resource", "undergraduate finance society newsletter"]],
  ["seolinkpodcast", "Guest Spot Targets", "Queries for student-run finance podcasts and blogs that take guests or guest posts", ["student finance podcast investment banking recruiting guest", "finance blog write for us recruiting", "undergraduate investing blog guest post"]],
  ["seolinkdir", "Directory Targets", "Queries for free education and tool directories", ["free education tools directory submit", "student resources directory submit a site", "finance education tools list submit"]],
  ["seolinkwiki", "Reference Page Targets", "Queries for public wiki or guide pages that cite free study tools", ["investment banking recruiting guide resources section", "finance recruiting wiki free tools", "how to break into investment banking guide links"]],
  ["seolinkfaculty", "Faculty Page Targets", "Queries for faculty or program pages that list free student tools", ["finance department \"student resources\" interview prep free", "business school \"career resources\" finance recruiting tools", "undergraduate finance program recruiting resources page"]],
  ["seolinkyoutube", "Video Description Targets", "Where to put the site link in your own video descriptions and bios, from your posted log", `__SPECIAL__`],
  ["seolinkpitch", "Link Pitch Drafter", "A short, honest pitch for a resource-page link: what the site is, one fact it can support, no numbers you cannot show", `__PITCH__`],
];
for (const [id, nm, does, qs] of PROMO) {
  const body = qs === "__SPECIAL__" ? `const X = fly(c), n = X.posts.length; f.push({ code: "bio-links", severity: "info", where: "profiles", detail: "Put mnaprep.com in the bio and in the first line of every video description or caption. Your post log has " + n + " posts; every one that reached people but linked nowhere is a lost visit." });`
    : qs === "__PITCH__" ? `f.push({ code: "pitch", severity: "info", where: "pitch", detail: "Subject: Free resource for your recruiting page. Body: Hi, I run mnaprep.com, a free game-style site for investment banking and private equity recruiting practice. If you keep a resources list, it may fit. I can send a short description. Reply 'no thanks' and I will not write again. (Add your address line. One email per site, ever.)" });`
      : `${J(qs)}.forEach((q, i) => f.push({ code: "query", severity: "info", where: "search", detail: "Search " + (i + 1) + ": " + q }));`;
  add(id, nm, `${does}.`, `c => { const f = []; ${body} return report(${J(id)}, f, {}); }`);
}

// ---------- write ----------
const header = b => `// ${b.name}: ${b.does}
// Part of the SEO pack for mnaprep.com. Read-only: it reads your own files and tells you what to fix or where to look. It never posts, sends or deploys.
// Usage: node tools/bots/${b.id}.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { rule } from "./scan2.mjs";
import { loadOps } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly } = FW;
`;
const seen = new Set();
for (const b of all) {
  if (seen.has(b.id)) throw new Error("duplicate id " + b.id); seen.add(b.id);
  fs.writeFileSync(path.join(bots, b.id + ".mjs"), `${header(b)}
export const ${b.id} = ${b.fn};
export const scan = (root = ROOT, o = {}) => ${b.id}(o.ctx || loadOps(root, o.now || new Date(), { cost: COST }));
cli(import.meta.url, () => scan(ROOT));
`);
}
fs.writeFileSync(path.join(bots, "circle", "pack5.mjs"), `// Generated by tools/bots/flywheel/gen5.mjs. The SEO pack: ${all.length} bots. Do not edit by hand.\nexport const PACK5 = ${J(all.map(({ id, name, gear, does }) => ({ id, name, gear, does })), null, 1)};\n`);
console.log("wrote", all.length, "bots");
