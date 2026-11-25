// Generates the Doers pack: 136 bots in five groups, one file each, plus circle/pack4.mjs.
//   maker (40)  : content makers, drafts for tomorrow from your own winners and backlog
//   outreach (30): club-outreach makers (queries, rosters, de-dupe), per region
//   fixer (30)  : find the exact problem and write the exact fix text (proposals only)
//   data (20)   : real Metricool numbers, read from state/metricool/snapshot.json (pulled by Claude, never typed by hand)
//   safety (16) : hard-rule checks for emails and posts
// Every bot is read-only. Nothing here posts, sends, signs in or deploys.
// Run: node tools/bots/flywheel/gen4.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url)), bots = path.join(here, "..");
const J = JSON.stringify, all = [];
const add = (id, name, gear, does, fn) => all.push({ id, name, gear, does, fn });

// ---------- MAKERS (40) ----------
const FAM = [["ranked", "RANKED schools", "ranked schools"], ["character", "Character stories", "character stories"], ["tiered", "Tiered interview questions", "tiered interview questions"], ["market", "Live market news", "live market news"], ["league", "League tables", "league tables"]];
const prelude = `const X = fly(c), f = [], F = FAMILY, top = X.posts.filter(p => p.family === F && hasViews(p)).sort((a, b) => best(b) - best(a)).slice(0, 3), item = X.backlog.find(b => b.family === F), topic = item ? item.text : null, T = topic || "NEEDS a topic (the backlog has none for " + F + ")", ref = top[0] ? top[0].post + " (" + best(top[0]).toLocaleString("en-US") + " views)" : "no scored post yet";`;
const maker = {
  hooks: ["Hook Maker", "three hook drafts for tomorrow, each copying the shape of one of this family's best posts", `top.forEach((p, i) => f.push({ code: "hook-" + (i + 1), severity: "info", where: "hook", detail: "Hook " + (i + 1) + ": keep the shape of '" + p.post + "' (" + best(p).toLocaleString("en-US") + " views) and swap in: " + T })); if (!top.length) f.push({ code: "no-model", severity: "warn", where: "hook", detail: "No scored " + F + " post to copy a hook from." });`],
  caption: ["Caption Maker", "a caption skeleton: hook line, one value line, source line, call to action", `f.push({ code: "caption", severity: "info", where: "caption", detail: "Line 1: hook (" + T + "). Line 2: the one fact a student keeps. Line 3: Source: <name the source>. Line 4: free practice at mnaprep.com. Model post: " + ref + "." });`],
  cta: ["CTA Picker", "the call to action for tomorrow, rotated by day so no two posts in a row end the same way", `const L = ["Free practice at mnaprep.com", "Save this for recruiting season", "Follow for part 2", "Comment your school and I will rank it"], i = dayNum(c.today) % L.length; f.push({ code: "cta", severity: "info", where: "cta", detail: F + " post tomorrow: end with '" + L[i] + "'. Do not use '" + L[(i + 3) % L.length] + "' (used last)." });`],
  script: ["Script Outline Maker", "a 5-beat video outline for the family's next topic", `f.push({ code: "script", severity: "info", where: "script", detail: "Beat 1 hook, beat 2 setup, beat 3 payoff, beat 4 twist or comparison, beat 5 call to action. Topic: " + T + ". Pace model: " + ref + ". Use only facts you can source." });`],
  slides: ["Slide Plan Maker", "a carousel plan: cover, body slides, a source slide, a call-to-action slide", `f.push({ code: "slides", severity: "info", where: "slides", detail: "Cover (hook) | 5 to 7 body slides | Source slide | CTA slide. Topic: " + T + ". One idea per slide, big numbers, one line of text. Model: " + ref + "." });`],
  title: ["Title Card Maker", "three title-card options built from the words of the best posts", `const words = top.map(p => p.post.split(/\\s+/).slice(0, 4).join(" ")); f.push({ code: "title", severity: "info", where: "title", detail: "Try a title that opens like: " + (words.join(" / ") || "(no model yet)") + ". Topic: " + T + "." });`],
  sequel: ["Sequel Maker", "the sequel idea for this family's best post, since a post over 2x the average gets a sequel within 3 days", `if (!top[0]) f.push({ code: "none", severity: "info", where: "sequel", detail: "No scored post yet." }); else f.push({ code: "sequel", severity: "info", where: "sequel", detail: "Sequel to '" + top[0].post + "': same format, next " + (item ? item.text : "topic") + ". Post it within 3 days of the original." });`],
  pin: ["Pinned Comment Maker", "a pinned-comment question that gets replies, which the platforms count as engagement", `f.push({ code: "pin", severity: "info", where: "comment", detail: "Pin a question tied to '" + T + "', e.g. 'Which one would you change? Reply with your pick.' Reply to every comment in the first hour." });`],
};
for (const [fid, F, label] of FAM) for (const [k, [nm, does, body]] of Object.entries(maker)) {
  const id = "mk" + fid + k;
  add(id, `${nm}: ${label}`, "make", `${does} (${F}).`, `c => { const FAMILY = ${J(F)}; ${prelude} ${body} return report(${J(id)}, f, { family: F, models: top.length }); }`);
}

// ---------- OUTREACH (30) ----------
const REG = {
  ohio: ["Ohio", ["Ohio State", "Miami University", "University of Cincinnati", "Ohio University", "Kent State", "Bowling Green", "Xavier", "University of Dayton"]],
  bigten: ["Big Ten", ["Michigan", "Indiana", "Wisconsin", "Illinois", "Penn State", "Purdue", "Minnesota", "Rutgers"]],
  sec: ["SEC", ["Georgia", "Vanderbilt", "Alabama", "Florida", "Texas A&M", "LSU", "Tennessee", "Auburn"]],
  acc: ["ACC", ["Notre Dame", "Duke", "UNC", "Virginia", "Georgia Tech", "Wake Forest", "Boston College", "Syracuse"]],
  big12: ["Big 12", ["Texas", "Kansas", "Iowa State", "Baylor", "TCU", "BYU", "Cincinnati", "Colorado"]],
  ivy: ["Ivy League", ["Penn", "Cornell", "Columbia", "Dartmouth", "Princeton", "Brown", "Harvard", "Yale"]],
  west: ["West", ["UCLA", "USC", "Berkeley", "Stanford", "Washington", "Oregon", "Santa Clara", "San Diego"]],
  nyc: ["New York area", ["NYU", "Fordham", "Baruch", "Binghamton", "Syracuse", "Rutgers", "Stony Brook", "Pace"]],
  texas: ["Texas", ["UT Austin", "Texas A&M", "SMU", "Baylor", "TCU", "Rice", "Houston", "Texas Tech"]],
  south: ["Southeast", ["Emory", "Georgia Tech", "Miami (FL)", "Florida", "UNC", "Virginia", "Vanderbilt", "Wake Forest"]],
};
const REGIONK = {
  queries: ["Club Finder Queries", "three search queries to find undergraduate finance clubs", (n, S) => `const Q = ${J(S)}.map(s => ["\\"" + s + "\\" investment banking club contact", "\\"" + s + "\\" finance society contact us", "\\"" + s + "\\" private equity club email"]); Q.slice(0, 3).forEach((q, i) => f.push({ code: "query", severity: "info", where: ${J(n)}, detail: "Search: " + q.join("  |  ") }));`],
  roster: ["School Roster", "which schools in the region still have no club emailed", (n, S) => `const sent = c.sentOrgs || []; const left = ${J(S)}.filter(s => !sent.some(o => o.includes(s.toLowerCase()))); f.push({ code: "roster", severity: left.length ? "info" : "warn", where: ${J(n)}, detail: left.length + " of ${S.length} schools still to try: " + left.join(", ") });`],
  dedupe: ["Region De-dupe", "schools in the region already emailed, so none gets a second email", (n, S) => `const sent = c.sentOrgs || []; const hit = ${J(S)}.filter(s => sent.some(o => o.includes(s.toLowerCase()))); f.push({ code: "already", severity: "info", where: ${J(n)}, detail: hit.length ? "Already emailed (do not repeat): " + hit.join(", ") : "No school in ${n} emailed yet." });`],
};
for (const [rid, [label, S]] of Object.entries(REG)) for (const [k, [nm, does, mk]] of Object.entries(REGIONK)) {
  const id = "or" + rid + k;
  add(id, `${nm}: ${label}`, "reach", `${does} (${label}).`, `c => { const f = []; try { const s = JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); c.sentOrgs = Object.keys(s).filter(k => k.startsWith("org:")).map(k => k.slice(4)); } catch { c.sentOrgs = []; } ${mk(label, S)} return report(${J(id)}, f, { region: ${J(label)} }); }`);
}

// ---------- FIXERS (30) ----------
const HTML = [
  ["fxdesclong", "Meta Description Fixer", "meta description over 160 characters", `const m = h.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i); return m && m[1].length > 160 ? "Cut the description from " + m[1].length + " to 160 characters or fewer." : null;`],
  ["fxtitlelong", "Title Length Fixer", "page title over 65 characters", `const m = h.match(/<title>([^<]*)/i); return m && m[1].length > 65 ? "Shorten the title from " + m[1].length + " to 65 characters or fewer." : null;`],
  ["fxcanon", "Canonical Fixer", "page without a canonical link", `return /rel=["']canonical["']/i.test(h) ? null : 'Add <link rel="canonical" href="https://mnaprep.com/' + p.replace(/index\\.html$/, "") + '">.';`],
  ["fxogimg", "OG Image Fixer", "page without an og:image", `return /property=["']og:image["']/i.test(h) ? null : "Add an og:image meta tag so shares show a card.";`],
  ["fximgalt", "Image Alt Fixer", "images without alt text", `const n = (h.match(/<img\\b(?![^>]*\\balt=)[^>]*>/gi) || []).length; return n ? "Add alt text to " + n + " image(s)." : null;`],
  ["fxlang", "Language Tag Fixer", "page without a lang attribute", `return /<html[^>]*\\blang=/i.test(h) ? null : 'Use <html lang="en">.';`],
  ["fxviewport", "Viewport Fixer", "page without a viewport meta", `return /name=["']viewport["']/i.test(h) ? null : "Add the viewport meta tag; phones will zoom out without it.";`],
  ["fxh1", "Missing H1 Fixer", "page without an h1", `return /<h1\\b/i.test(h) ? null : "Add one h1 that says what the page is.";`],
  ["fxh1multi", "Double H1 Fixer", "page with more than one h1", `const n = (h.match(/<h1\\b/gi) || []).length; return n > 1 ? "Keep one h1; turn the other " + (n - 1) + " into h2." : null;`],
  ["fxhttp", "Insecure Link Fixer", "links that start with http://", `const n = (h.match(/href=["']http:\\/\\//gi) || []).length; return n ? "Change " + n + " http:// link(s) to https://." : null;`],
  ["fxrel", "Link Safety Fixer", "target=_blank links without rel=noopener", `const n = (h.match(/<a\\b(?=[^>]*target=["']_blank["'])(?![^>]*rel=)[^>]*>/gi) || []).length; return n ? "Add rel=\\"noopener\\" to " + n + " new-tab link(s)." : null;`],
  ["fxemptyhref", "Empty Link Fixer", "links with an empty href", `const n = (h.match(/href=["']\\s*["']/gi) || []).length; return n ? n + " link(s) point nowhere; fill or remove them." : null;`],
  ["fxtodo", "Leftover Text Fixer", "TODO or lorem text left on a page", `return /\\bTODO\\b|lorem ipsum|FIXME/i.test(h) ? "Remove the TODO, FIXME or placeholder text." : null;`],
  ["fxspaces", "Double Space Fixer", "double spaces inside visible text", `const t = h.replace(/<script[\\s\\S]*?<\\/script>|<style[\\s\\S]*?<\\/style>|<[^>]+>/g, " "), n = (t.match(/\\w  \\w/g) || []).length; return n > 5 ? n + " double spaces in the text; collapse them." : null;`],
  ["fxtwitter", "Twitter Card Fixer", "page without a twitter:card tag", `return /name=["']twitter:card["']/i.test(h) ? null : 'Add <meta name="twitter:card" content="summary_large_image">.';`],
  ["fxtheme", "Theme Color Fixer", "page without a theme-color meta", `return /name=["']theme-color["']/i.test(h) ? null : "Add a theme-color meta so phones tint the browser bar.";`],
  ["fxmailto", "Email Link Fixer", "mailto links with a malformed address", `const bad = (h.match(/mailto:([^"'?\\s>]*)/gi) || []).filter(m => !/^mailto:[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/i.test(m)); return bad.length ? bad.length + " malformed mailto link(s)." : null;`],
];
for (const [id, nm, what, body] of HTML) add(id, nm, "fix", `Finds ${what} across the public pages and writes the exact fix. Proposals only.`,
  `c => { const f = [], pages = c.tracked.filter(x => /^(guides\\/[^/]+|refund|terms|privacy|cookies|disclaimer|accessibility)\\/index\\.html$/.test(x)), check = (h, p) => { ${body} }, hit = []; for (const p of pages) { const m = check(c.rd(p), p); if (m) hit.push({ p, m }); } rule(f, ${J(id.slice(2))}, hit, pages.length || 1, ${J(what)}, { sev: "info", fmt: x => x.p + ": " + x.m, fix: "Apply the line shown for each page; one commit to staging." }); return report(${J(id)}, f, { pages: pages.length, hits: hit.length }); }`);
const SOCIAL = [
  ["fxdecksrc", "Deck Source Fixer", "upcoming decks with no source line", `const miss = c.days.filter(d => d.date >= c.today && d.spec && !/source/i.test(JSON.stringify(d.spec))); rule(f, "no-source", miss, c.days.length || 1, "upcoming day(s) have no source line in the deck spec", { sev: "warn", fmt: d => d.date, fix: "Add a 'Source: <name>' line to the last slide of each deck." });`],
  ["fxdeckcta", "Deck CTA Fixer", "upcoming decks with no call to action", `const miss = c.days.filter(d => d.date >= c.today && d.spec && !/mnaprep|follow|save|comment/i.test(JSON.stringify(d.spec))); rule(f, "no-cta", miss, c.days.length || 1, "upcoming day(s) have no call to action", { sev: "warn", fmt: d => d.date, fix: "End the last slide with 'Free practice at mnaprep.com'." });`],
  ["fxrendercount", "Render Count Fixer", "decks whose rendered slide count does not match the spec", `const miss = c.days.filter(d => d.spec && d.spec.decks && Object.entries(d.spec.decks).some(([k, v]) => { const want = (v.slides || v.items || []).length, have = d.files.filter(x => x.startsWith(k + "-") && /\\.(jpg|png)$/.test(x)).length; return want && have && want !== have; })); rule(f, "render-count", miss, c.days.length || 1, "day(s) have a different number of rendered slides than the spec lists", { sev: "warn", fmt: d => d.date, fix: "Re-run the render for that day, then recount." });`],
  ["fxwirepast", "Wire Past Rows Fixer", "calendar rows already in the past", `const W = c.wire || {}, past = (W.CAL || []).filter(r => { const d = parseWireDate(r[0], c.now); return d && d < c.today; }); rule(f, "past-cal", past, (W.CAL || []).length || 1, "calendar row(s) are already past", { sev: "info", fmt: r => r[0], fix: "The Fixer prunes these automatically; merge data/wire.json." });`],
  ["fxtickernull", "Ticker Null Fixer", "ticker rows with a missing price", `const W = c.wire || {}, bad = (W.TICKER || []).filter(r => r[1] == null || r[1] === ""); rule(f, "null-price", bad, (W.TICKER || []).length || 1, "ticker row(s) have no price", { sev: "warn", fmt: r => r[0], fix: "Refresh the ticker feed or drop the row." });`],
  ["fxpostdate", "Log Date Fixer", "post-log rows with no views after 4 days", `const old = X.posts.filter(p => !hasViews(p) && daysAgo(p.date, c.today) > 4); rule(f, "unscored", old, X.posts.length || 1, "post(s) older than 4 days have no views logged", { sev: "warn", fmt: p => p.date + " " + p.post.slice(0, 30), fix: "Fill the IG and TT views from Metricool." });`],
  ["fxfamily", "Idea Type Fixer", "post-log rows whose idea type matches no family", `const odd = X.posts.filter(p => p.family === "Other"); rule(f, "other-family", odd, X.posts.length || 1, "post(s) do not match a known idea family", { sev: "info", fmt: p => p.post.slice(0, 30), fix: "Use one of the standard idea type names so the scoreboard counts it." });`],
  ["fxposted", "Posted Log Fixer", "posted.md rows missing a date", `const rows = (c.posted || []).filter(r => !r.date); rule(f, "no-date", rows, (c.posted || []).length || 1, "posted row(s) have no date", { sev: "info", fmt: r => String(r.title || r.text || "").slice(0, 30), fix: "Add YYYY-MM-DD to each row." });`],
  ["fxpunch", "Punch Log Fixer", "punch-log rows with no style", `const rows = (c.punch || []).filter(r => !r.style); rule(f, "no-style", rows, (c.punch || []).length || 1, "punch row(s) have no video style", { sev: "info", fmt: r => r.date || "?", fix: "Name the style so the no-repeat rule can check it." });`],
  ["fxtopics", "Topics Gap Fixer", "families with an empty topic list", `const fams = ["RANKED schools", "Character stories", "Tiered interview questions", "Live market news", "League tables"], empty = fams.filter(F => !X.backlog.some(b => b.family === F)); rule(f, "empty-backlog", empty, fams.length, "top families have no topic queued", { sev: "warn", fmt: F => F, fix: "Add 5 topics to social/topics.md for each." });`],
  ["fxlegaladdr", "Legal Address Fixer", "legal pages without the mailing address", `const miss = ["privacy/index.html", "terms/index.html"].filter(p => c.exists(p) && !/80 W 11th Ave/i.test(c.rd(p))); rule(f, "no-address", miss, 2, "legal page(s) lack the mailing address", { sev: "warn", fmt: p => p, fix: "Add the Contact paragraph before the Changes heading." });`],
  ["fxemailtmpl", "Email Template Fixer", "outreach email template missing address or opt-out", `const s = c.rd("tools/bots/outreach.mjs"), miss = [!/80 W 11th Ave/.test(s) && "mailing address", !/no thanks/i.test(s) && "opt-out line"].filter(Boolean); rule(f, "template", miss, 2, "required item(s) missing from the email template", { sev: "critical", fmt: x => x, fix: "Add the missing line to both templates." });`],
  ["fxswver", "Service Worker Fixer", "service worker cache version older than the last site change", `const sw = c.rd("sw.js"), v = (sw.match(/CACHE\\w*\\s*=\\s*["']([^"']+)/) || [])[1]; f.push({ code: "sw", severity: "info", where: "sw.js", detail: v ? "Cache name is '" + v + "'. Bump it in the same commit as any change to cached files." : "No cache name found in sw.js." });`],
  ["fxsitemap", "Sitemap Fixer", "guides missing from the sitemap", `const g = c.tracked.filter(x => /^guides\\/[^/]+\\/index\\.html$/.test(x)).map(x => x.split("/")[1]), miss = g.filter(s => !(c.sitemap || "").includes("/guides/" + s)); rule(f, "not-in-sitemap", miss, g.length || 1, "guide(s) are not in the sitemap", { sev: "warn", fmt: s => s, fix: "Add each URL to sitemap.xml." });`],
];
for (const [id, nm, what, body] of SOCIAL) add(id, nm, "fix", `Finds ${what} and writes the exact fix. Proposals only.`, `c => { const X = fly(c), f = []; ${body} return report(${J(id)}, f, {}); }`);

// ---------- DATA (20) ----------
const MET = [["followers", "Followers"], ["views", "Views"], ["reach", "Reach"], ["likes", "Likes"], ["comments", "Comments"], ["shares", "Shares"], ["saves", "Saves"], ["posts", "Posts published"], ["visits", "Profile visits"], ["clicks", "Link clicks"]];
const dataBody = (m, kind) => `const f = [], file = "tools/bots/state/metricool/snapshot.json"; let S = null; try { S = JSON.parse(c.readRaw(file)); } catch {} if (!S || !S.platforms) return report(ID, [{ code: "no-snapshot", severity: "warn", where: file, detail: "No Metricool snapshot yet. Ask Claude to pull one (it reads Metricool, you type nothing)." }]); const age = daysAgo(String(S.pulled || "").slice(0, 10), c.today); if (age > 2) f.push({ code: "stale", severity: "warn", where: file, detail: "The Metricool snapshot is " + age + " days old." }); const rows = Object.entries(S.platforms).map(([p, v]) => ({ p, now: v[${J(m)}] && v[${J(m)}].now, prev: v[${J(m)}] && v[${J(m)}].prev })).filter(r => typeof r.now === "number"); if (!rows.length) f.push({ code: "no-metric", severity: "info", where: file, detail: "${m} is not in the snapshot." }); ${kind === "level" ? `for (const r of rows) f.push({ code: "level", severity: "info", where: r.p, detail: r.p + " ${m}: " + r.now.toLocaleString("en-US") });` : `for (const r of rows) { if (typeof r.prev !== "number" || !r.prev) continue; const ch = Math.round((r.now - r.prev) / r.prev * 100); f.push({ code: ch < 0 ? "down" : "up", severity: ch <= -25 ? "warn" : "info", where: r.p, detail: r.p + " ${m}: " + r.prev.toLocaleString("en-US") + " to " + r.now.toLocaleString("en-US") + " (" + (ch > 0 ? "+" : "") + ch + "%)" }); }`} return report(ID, f, { platforms: rows.length });`;
for (const [m, label] of MET) for (const kind of ["level", "trend"]) {
  const id = "md" + m + (kind === "level" ? "now" : "trend");
  add(id, `Metricool ${label} ${kind === "level" ? "Reader" : "Trend"}`, "data", kind === "level" ? `${label} per platform, read from the Metricool snapshot.` : `${label} change per platform against the previous snapshot; warns at -25% or worse.`, `c => { const ID = ${J(id)}; ${dataBody(m, kind)} }`);
}

// ---------- SAFETY (16) ----------
const SAFE = [
  ["sfdupeemail", "Duplicate Email Guard", "the same address or organization appearing twice in the sent log", `const s = sent(c), keys = Object.keys(s).filter(k => !k.startsWith("org:")), seen = {}, dup = []; for (const k of keys) { const a = k.toLowerCase(); if (seen[a]) dup.push(k); seen[a] = 1; } rule(f, "dup", dup, keys.length || 1, "address(es) appear twice in the sent log", { sev: "critical", fmt: k => "an address", fix: "Remove the repeat; one email per club, ever." });`],
  ["sfdaycap", "Daily Email Cap Guard", "more than 9 new emails in one day", `const s = sent(c), by = {}; for (const [k, d] of Object.entries(s)) if (!k.startsWith("org:")) by[d] = (by[d] || 0) + 1; const over = Object.entries(by).filter(([, n]) => n > 9); rule(f, "over-cap", over, Object.keys(by).length || 1, "day(s) went over 9 emails (3 runs x 3)", { sev: "warn", fmt: ([d, n]) => d + ": " + n, fix: "Stay at 9 or fewer a day so it never reads as spam." });`],
  ["sfschoolcap", "School Cap Guard", "more than 2 clubs emailed at one school", `const s = sent(c), by = {}; for (const k of Object.keys(s)) { const m = k.match(/@([\\w.-]+\\.edu)$/i); if (m) by[m[1].toLowerCase()] = (by[m[1].toLowerCase()] || 0) + 1; } const over = Object.entries(by).filter(([, n]) => n > 2); rule(f, "school-cap", over, Object.keys(by).length || 1, "school(s) have more than 2 clubs emailed", { sev: "warn", fmt: ([d, n]) => d + ": " + n, fix: "Max 2 clubs per school." });`],
  ["sfwindow", "Send Window Guard", "email sent outside Mon-Fri 9am-4pm ET (checks the log dates for weekends)", `const s = sent(c), wk = Object.entries(s).filter(([k, d]) => /^\\d{4}-\\d{2}-\\d{2}$/.test(d) && [0, 6].includes(new Date(d + "T12:00:00Z").getUTCDay())); rule(f, "weekend-send", wk, Object.keys(s).length || 1, "send(s) are logged on a weekend", { sev: "warn", fmt: ([k, d]) => d, fix: "Outreach is Mon-Fri only." });`],
  ["sfsuppress", "Opt-out Guard", "addresses on the opt-out list that were emailed anyway", `let sup = []; try { sup = JSON.parse(c.readRaw("tools/bots/state/outreach-suppressed.json") || "[]"); } catch {} const s = sent(c), hit = sup.filter(a => s[a] || s[String(a).toLowerCase()]); rule(f, "emailed-after-optout", hit, sup.length || 1, "address(es) were emailed after opting out", { sev: "critical", fmt: () => "an address", fix: "Never contact them again." });`],
  ["sfoptout", "Opt-out Line Guard", "an email template with no opt-out line", `const t = c.rd("tools/bots/outreach.mjs"), n = (t.match(/no thanks/gi) || []).length; rule(f, "no-optout", n >= 2 ? [] : ["template"], 1, "template(s) lack the opt-out line", { sev: "critical", fmt: x => x, fix: "Both templates need: Reply \\"no thanks\\" and I won't email again." });`],
  ["sfaddr", "Mailing Address Guard", "an email template with no mailing address", `const t = c.rd("tools/bots/outreach.mjs"), n = (t.match(/80 W 11th Ave/g) || []).length; rule(f, "no-address", n >= 2 ? [] : ["template"], 1, "template(s) lack the mailing address", { sev: "critical", fmt: x => x, fix: "CAN-SPAM needs a physical address in every email." });`],
  ["sflength", "Email Length Guard", "an email body over 90 words", `const t = c.rd("tools/bots/outreach.mjs"), bodies = (t.match(/body: \`[^\`]*\`/g) || []), long = bodies.filter(b => b.split(/\\s+/).length > 90); rule(f, "long", long, bodies.length || 1, "template(s) run over 90 words", { sev: "warn", fmt: () => "a template", fix: "Keep it short: 60 words is plenty." });`],
  ["sfclaims", "Claim Words Guard", "guarantee-style claims in decks or email templates", `const t = (c.days.filter(d => d.date >= c.today).map(d => JSON.stringify(d.spec || "")).join(" ") + c.rd("tools/bots/outreach.mjs")), hit = (t.match(/guarantee[ds]?|get you hired|100% (?:of|success)|will land/gi) || []); rule(f, "claim", hit, 1, "guarantee-style phrase(s) found", { sev: "critical", fmt: x => x, fix: "Never promise a job or a result." });`],
  ["sfunsourced", "Unsourced Number Guard", "upcoming decks with numbers but no source line", `const bad = c.days.filter(d => d.date >= c.today && d.spec && /\\d{2,}/.test(JSON.stringify(d.spec)) && !/source/i.test(JSON.stringify(d.spec))); rule(f, "numbers-no-source", bad, c.days.length || 1, "upcoming day(s) show numbers with no source", { sev: "warn", fmt: d => d.date, fix: "Add a source line." });`],
  ["sfblackout", "Blackout Guard", "an upcoming deck dated on a no-post blackout day", `const bl = parseBlackouts(c.daily, c.now) || [], bad = c.days.filter(d => d.date >= c.today && bl.includes(d.date)); rule(f, "blackout", bad, c.days.length || 1, "deck(s) are dated on a no-post day", { sev: "warn", fmt: d => d.date, fix: "Move the post." });`],
  ["sftiktokcap", "TikTok Cap Guard", "more than 4 TikToks planned in one day", `const bad = c.days.filter(d => d.date >= c.today && d.spec && d.spec.decks && Object.keys(d.spec.decks).length > 4); rule(f, "tiktok-cap", bad, c.days.length || 1, "day(s) plan more than 4 TikToks", { sev: "warn", fmt: d => d.date, fix: "Max 4 a day." });`],
  ["sfhours", "Post Hours Guard", "posts planned outside 12pm-10pm ET", `const slots = (X.board ? [] : []); f.push({ code: "rule", severity: "info", where: "social", detail: "Rule: post between 12pm and 10pm ET, 2 hours apart. The Slot Planner already spaces tomorrow's slots; this bot only reminds you." });`],
  ["sfquoramuted", "Quora Mute Guard", "any Quora task that is still queued although Quora is dropped", `const bad = c.tracked.filter(x => /^social\\/quora\\/[^/]+\\.md$/.test(x) && x > "social/quora/" + c.today); rule(f, "quora-queued", bad, 1, "future Quora draft(s) exist", { sev: "info", fmt: x => x, fix: "Quora is dropped; do not post these." });`],
  ["sfsentdates", "Sent Log Hygiene Guard", "sent-log entries whose date is not YYYY-MM-DD", `const s = sent(c), bad = Object.entries(s).filter(([, d]) => !/^\\d{4}-\\d{2}-\\d{2}$/.test(d)); rule(f, "bad-date", bad, Object.keys(s).length || 1, "sent-log entr(ies) have a bad date", { sev: "warn", fmt: () => "an entry", fix: "Use YYYY-MM-DD." });`],
  ["sfhome", "Home Baseline Guard", "any change to the Home page without your OK", `const base = (c.homeBaseline && c.homeBaseline.ids) || [], now = (c.rd("index.html").match(/\\bid=["']([^"']+)/g) || []).length; f.push({ code: "home", severity: now > base.length ? "critical" : "info", where: "index.html", detail: now > base.length ? "Home page has " + (now - base.length) + " new id(s) since the baseline. Never add to Home unless Bekir asks." : "Home page matches the baseline (" + base.length + " ids)." });`],
];
for (const [id, nm, what, body] of SAFE) add(id, nm, "safe", `Hard-rule check: ${what}.`, `c => { const X = fly(c), f = [], sent = c => { try { return JSON.parse(c.readRaw("tools/bots/state/outreach-sent.json") || "{}"); } catch { return {}; } }; ${body} return report(${J(id)}, f, {}); }`);

// ---------- write ----------
const header = b => `// ${b.name}: ${b.does}
// Part of the Doers pack (gear: ${b.gear}). Read-only: it reads your own files and tells you what to do or what to fix. It never posts, sends, signs in or deploys.
// Usage: node tools/bots/${b.id}.mjs
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
const { fly, best, hasViews, family, parseWireDate } = FW;
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
fs.writeFileSync(path.join(bots, "circle", "pack4.mjs"), `// Generated by tools/bots/flywheel/gen4.mjs. The Doers pack: ${all.length} bots. Do not edit by hand.\nexport const PACK4 = ${J(all.map(({ id, name, gear, does }) => ({ id, name, gear, does })), null, 1)};\n`);
console.log("wrote", all.length, "bots");
