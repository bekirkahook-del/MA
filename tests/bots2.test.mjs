/* The 15 bots added on Nov 25: static scanners, practice-problem auditor, coverage, and the release/changelog/strategist circle bots. Run: node --test tests/bots2.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import { auditPage, seo } from "../tools/bots/seo.mjs";
import { sitemap } from "../tools/bots/sitemap.mjs";
import { auditJsonLd } from "../tools/bots/schema.mjs";
import { auditHtml } from "../tools/bots/a11y.mjs";
import { perf } from "../tools/bots/perf.mjs";
import { scanText, headers, jwtRole } from "../tools/bots/secrets.mjs";
import { shingles, nearDuplicates } from "../tools/bots/duplicate.mjs";
import { syllables, grade, readability } from "../tools/bots/readability.mjs";
import { auditRep, auditReps } from "../tools/bots/reps.mjs";
import { coverage } from "../tools/bots/coverage.mjs";
import { testcov } from "../tools/bots/testcov.mjs";
import { deadcode } from "../tools/bots/deadcode.mjs";
import { changelog } from "../tools/bots/changelog.mjs";
import { release } from "../tools/bots/release.mjs";
import { rank } from "../tools/bots/strategist.mjs";
import { fromReport } from "../tools/bots/circle/sensors.mjs";

const good = `<html lang="en"><head><title>How to Break Into Investment Banking</title><meta name="description" content="A clear plan for students: recruiting calendar, technical prep, networking and interviews, with real numbers and examples."><link rel="canonical" href="https://mnaprep.com/guides/ib/"><meta property="og:title" content="x"><meta property="og:description" content="y"></head><body><h1>IB</h1></body></html>`;

test("seo: a good page is clean; missing pieces are found; duplicate titles are grouped", () => {
  assert.equal(auditPage({ slug: "ib", html: good }).items.length, 0);
  const bad = auditPage({ slug: "ib", html: "<html><title>x</title></html>" }).items.map(i => i.code);
  for (const c of ["title-length", "desc-length", "h1-count", "canonical", "og"]) assert.ok(bad.includes(c), c);
  const r = seo([{ slug: "a", html: good.replace("/ib/", "/a/") }, { slug: "b", html: good.replace("/ib/", "/b/") }]);
  assert.ok(r.findings.some(f => f.code === "dup-title" && f.count === 2));
});
test("sitemap: dead URLs are critical, unlisted guides warn, robots needs a Sitemap line", () => {
  const xml = "<urlset><loc>https://x.com/guides/a/</loc><loc>https://x.com/guides/gone/</loc><loc>https://x.com/guides/a/</loc></urlset>";
  const r = sitemap({ xml, robots: "User-agent: *\nAllow: /", pages: [{ slug: "a" }, { slug: "b" }], exists: p => p === "/guides/a/" });
  const by = Object.fromEntries(r.findings.map(f => [f.code, f]));
  assert.equal(by["dead-urls"].severity, "critical"); assert.ok(by["unlisted-guides"]); assert.ok(by["duplicate-urls"]); assert.ok(by["robots-no-sitemap"]);
  assert.equal(sitemap({ xml: "<loc>https://x.com/guides/a/</loc>", robots: "Sitemap: https://x.com/sitemap.xml", pages: [{ slug: "a" }], exists: () => true }).findings.length, 0);
  assert.ok(sitemap({ xml: "<loc>https://x.com/</loc>", robots: "User-agent: *\nDisallow: /\nSitemap: https://x.com/s.xml", pages: [], exists: () => true }).findings.some(f => f.code === "robots-blocks-all"));
});
test("schema: broken JSON-LD is critical, a valid Article and FAQ pass", () => {
  const wrap = j => `<script type="application/ld+json">${j}</script>`;
  assert.equal(auditJsonLd(wrap("{nope"), "p")[0].severity, "critical");
  assert.equal(auditJsonLd("<p>none</p>", "p")[0].code, "no-jsonld");
  assert.equal(auditJsonLd(wrap(JSON.stringify({ "@type": "Article", headline: "h", datePublished: "2026-11-01" })), "p").length, 0);
  assert.equal(auditJsonLd(wrap(JSON.stringify({ "@type": "Article" })), "p")[0].code, "article-fields");
  assert.equal(auditJsonLd(wrap(JSON.stringify({ "@type": "FAQPage", mainEntity: [{ name: "q" }] })), "p")[0].code, "faq-empty");
  assert.equal(auditJsonLd(wrap(JSON.stringify({ "@graph": [{ "@type": "WebPage" }, { "name": "x" }] })), "p")[0].code, "no-type");
});
test("a11y: finds missing alt, unnamed buttons, unlabeled fields, blocked zoom; accepts labelled markup", () => {
  const codes = h => auditHtml(h, "x").map(i => i.code);
  const bad = codes(`<html><head><meta name="viewport" content="width=device-width, user-scalable=no"></head><body><img src="a.png"><button></button><input type="text"><a href="/x"></a><h1>a</h1><h4>b</h4></body></html>`);
  for (const c of ["no-lang", "zoom-blocked", "img-alt", "button-name", "input-label", "link-name", "heading-skip"]) assert.ok(bad.includes(c), c);
  assert.deepEqual(codes(`<html lang="en"><head><meta name="viewport" content="width=device-width"></head><body><img src="a" alt=""><button aria-label="Close"></button><label for="e">Email</label><input id="e"><input type="hidden"><a href="/x">Go</a><h1>a</h1><h2>b</h2></body></html>`), []);
  assert.ok(!codes(`<html lang="en"><head><meta name="viewport" content="width=device-width"></head><body><script>var s="<img src=x>"</script></body></html>`).includes("img-alt"));
});
test("perf: flags big files, many blocking scripts, big images, and passes a light page", () => {
  const html = Array.from({ length: 15 }, (_, i) => `<script src="js/a${i}.js"></script>`).join("") + `<script src="x.js" defer></script>`;
  const r = perf({ jsFiles: [{ name: "app.js", size: 900e3 }, { name: "b.js", size: 10e3 }], indexHtml: { html, size: 500e3 }, guideSizes: [{ name: "g", size: 200e3 }], images: [{ name: "a.png", size: 900e3 }] });
  assert.deepEqual(r.findings.map(f => f.code).sort(), ["blocking-scripts", "guide-big", "image-big", "index-big", "js-file-big"]);
  assert.equal(r.stats.blockingScripts, 15);
  assert.equal(perf({ jsFiles: [{ name: "a.js", size: 1000 }], indexHtml: { html: "", size: 100 }, guideSizes: [], images: [] }).findings.length, 0);
});
test("secrets: finds live keys and service_role JWTs, never prints the value, allows the public key and placeholders", () => {
  const live = "sk_live_" + "a1B2c3D4e5F6g7H8i9J0", wh = "whsec_" + "abcdefghijklmnopqrstuvwx";
  const found = scanText(`const a = "${live}";\nconst b = "${wh}";\nconst c = "sb_publishable_abcdefghijklmnop";\nconst d = "sk_live_FAKEFAKEFAKEFAKE1234";`, "f.js");
  assert.deepEqual(found.map(f => f.where), ["f.js:1", "f.js:2"]);
  assert.ok(!JSON.stringify(found).includes(live) && !JSON.stringify(found).includes(wh));
  const b64 = o => Buffer.from(JSON.stringify(o)).toString("base64url"), jwt = r => `eyJhbGciOiJIUzI1NiJ9.${b64({ role: r, ref: "x" })}.${"s".repeat(20)}`;
  assert.equal(jwtRole(jwt("service_role")), "service_role");
  assert.equal(scanText(`k="${jwt("service_role")}"`, "g.js").length, 1);
  assert.equal(scanText(`k="${jwt("anon")}"`, "g.js").length, 0);
  assert.equal(scanText("-----BEGIN " + "PRIVATE KEY-----", "k.pem")[0].kind, "Private key block");
  assert.equal(headers("[[headers]]\nX-Content-Type-Options=1\nX-Frame-Options=1\nReferrer-Policy=1\nStrict-Transport-Security=1").length, 0);
  assert.equal(headers("").length, 4);
});
test("duplicate: finds a near-copy, ignores different pages", () => {
  const w = n => Array.from({ length: 400 }, (_, i) => `w${n}x${i % 97}y${i}`).join(" ");
  const a = w(1), b = a.replace("w1x5y5", "changed"), c = w(2);
  assert.ok(shingles(a).size > 40);
  const pairs = nearDuplicates([{ name: "a", text: a }, { name: "b", text: b }, { name: "c", text: c }], 0.8);
  assert.equal(pairs.length, 1); assert.deepEqual([pairs[0].a, pairs[0].b], ["a", "b"]); assert.ok(pairs[0].similarity > 0.9);
});
test("readability: syllables and grade move the right way; hard text is flagged", () => {
  assert.equal(syllables("cat"), 1); assert.ok(syllables("accretion") >= 3);
  const easy = "The cat sat. The dog ran. We like to play. It is fun to run. The sun is up. We go out. ".repeat(4);
  const hard = "Notwithstanding considerable macroeconomic uncertainty, institutional investors systematically reevaluated capitalization structures, notwithstanding contractual subordination provisions. ".repeat(4);
  assert.ok(grade(hard).grade > grade(easy).grade + 8); assert.equal(grade("Too short."), null);
  const r = readability({ lessons: [{ name: "l1", text: hard }, { name: "l2", text: easy }], guides: [] });
  assert.ok(r.findings[0].detail.includes("l1")); assert.equal(r.stats.lessonCards, 2);
});
test("reps: a healthy generator is clean; every failure mode is caught", () => {
  const ok = { gen: () => ({ a: 2 + Math.floor(Math.random() * 5) }), build: p => ({ given: "g", q: "q?", ans: p.a * 10, steps: [["s", "m"]] }) };
  assert.equal(auditRep("ok", ok, 50).length, 0);
  const codes = b => auditRep("k", { gen: () => ({}), build: b }, 5).map(r => r.code);
  assert.ok(codes(() => { throw new Error("boom"); }).includes("throws"));
  assert.ok(codes(() => ({ given: "g", q: "q", ans: NaN, steps: [1] })).includes("bad-answer"));
  assert.ok(codes(() => ({ given: "g", q: "", ans: 1, steps: [1] })).includes("empty-question"));
  assert.ok(codes(() => ({ given: "g", q: "q", ans: 1, steps: [] })).includes("no-steps"));
  assert.ok(codes(() => ({ given: "g", q: "q", ans: 1, steps: [["a", "NaN"]] })).includes("glitch-text"));
  assert.ok(codes(() => ({ given: "g", q: "q", ans: -5, steps: [1] })).includes("hidden-negative"));
  const r = auditReps({ bad: { gen: () => ({}), build: () => ({ ans: NaN }) } }, 5);
  assert.equal(r.findings[0].severity, "critical"); assert.equal(r.ok, false);
});
test("coverage: counts lessons, reps and models per level and lists gaps", () => {
  const tracks = [{ id: "f", name: "Foundations", levels: [{ n: "A", q: new Array(12) }, { n: "B", q: new Array(5) }, { n: "C", q: new Array(12) }] }];
  const r = coverage(tracks, { lessons: new Set(["f:0", "f:1"]), reps: new Set(["f:0"]), models: new Set() });
  assert.equal(r.stats.levels, 3); assert.equal(r.stats.withLessonPct, 67); assert.equal(r.stats.withRepsPct, 33);
  const by = Object.fromEntries(r.findings.map(f => [f.code, f]));
  assert.ok(by["levels-no-reps"].detail.includes("Foundations / B")); assert.ok(by["levels-bare"].detail.includes("Foundations / C")); assert.ok(by["levels-thin"].detail.includes("(5)"));
});
test("testcov and deadcode: name matching, content files excluded, external functions never called dead", () => {
  const t = testcov({ scripts: ["srs.js", "avatar.js", "lessons.js"], functions: ["ai.mjs", "grant.mjs"], testText: "import srs from '../js/srs.js'; ai handler" });
  assert.deepEqual(t.untested.scripts, ["avatar.js"]); assert.deepEqual(t.untested.functions, ["grant.mjs"]);
  const d = deadcode({ scripts: ["a.js", "b.js"], functions: ["x.mjs", "y-webhook.mjs", "z.mjs"], corpus: { "index.html": '<script src="js/a.js">', "js/a.js": "fetch('/.netlify/functions/z')", "js/b.js": "// b.js itself", "netlify/functions/x.mjs": "x" } });
  assert.deepEqual(d.dead.scripts, ["b.js"]); assert.deepEqual(d.dead.functions, ["x.mjs"]);
});
test("changelog: groups by what students notice and knows which batches trigger a build", () => {
  const c = changelog([{ subject: "lesson fix", files: ["js/lessons.js"] }, { subject: "bots", files: ["tools/bots/x.mjs", "tests/x.test.mjs"] }, { subject: "wire", files: ["data/wire.json"] }, { subject: "ai", files: ["netlify/functions/ai.mjs"] }]);
  assert.deepEqual(Object.keys(c.groups).sort(), ["Backend functions", "Bots and tools (not on the site)", "Learning content", "Other"]);
  assert.equal(c.buildsSite, true); assert.equal(c.buildCommits, 2); assert.equal(c.creditsIfDeployed, 15);
  const free = changelog([{ subject: "bots", files: ["tools/bots/x.mjs"] }, { subject: "notes", files: ["README.md"] }]);
  assert.equal(free.buildsSite, false); assert.equal(free.creditsIfDeployed, 0); assert.match(free.summary, /not trigger a build/);
  assert.equal(changelog([]).summary, "Nothing waiting.");
});
test("release: GO, CAUTION and NO-GO from real conditions", () => {
  const q = { commits: 2, buildsSite: true, creditsIfDeployed: 15, summary: "s" }, iss = (bot, severity, detail = "d") => ({ bot, severity, detail, status: "open" });
  assert.equal(release({ issues: [], queue: { commits: 0 }, tests: { ok: true } }).verdict, "NOTHING TO SHIP");
  assert.equal(release({ issues: [], queue: q, tests: { ok: true }, deploysLeft: 40 }).verdict, "GO");
  assert.equal(release({ issues: [], queue: q, tests: null }).verdict, "CAUTION");
  assert.equal(release({ issues: [], queue: q, tests: { ok: true }, deploysLeft: 3 }).verdict, "CAUTION");
  assert.equal(release({ issues: [iss("a11y", "warn")], queue: q, tests: { ok: true } }).verdict, "CAUTION");
  assert.equal(release({ issues: [], queue: q, tests: { ok: false, note: "2 failed" } }).verdict, "NO-GO");
  assert.equal(release({ issues: [iss("reps", "critical", "bad rep")], queue: q, tests: { ok: true } }).verdict, "NO-GO");
  assert.equal(release({ issues: [iss("secrets", "critical")], queue: q, tests: { ok: true } }).verdict, "NO-GO");
  assert.equal(release({ issues: [{ ...iss("health", "critical"), status: "resolved" }], queue: q, tests: { ok: true } }).verdict, "GO", "resolved issues do not block");
  assert.equal(release({ issues: [iss("freshness", "critical")], queue: q, tests: { ok: true } }).verdict, "GO", "only listed bots can block a release");
});
test("strategist: ranks by evidence, funnel counts double, never returns invented numbers, hides resolved issues", () => {
  const mk = (bot, cls, severity, detail, status = "open") => ({ bot, cls, severity, detail, status, fix: null });
  const r = rank({ issues: [mk("funnel", "guide-cta", "warn", "859 visitors saw a guide call-to-action"), mk("a11y", "input-label", "warn", "5 fields: form fields with no label"), mk("seo", "title-length", "info", "198 pages: title"), mk("perf", "x", "warn", "1 files", "resolved")], coverage: { stats: { withRepsPct: 51, withLessonPct: 100, levels: 49 } } });
  assert.equal(r[0].what, "Rewrite the guide call-to-action (guide readers rarely click through)"); assert.equal(r[0].score, 100);
  assert.ok(r.every(x => x.score >= 0 && x.score <= 100)); assert.ok(!r.some(x => /perf/.test(x.bot)));
  assert.ok(r.some(x => x.what.startsWith("Finish number reps")));
  assert.deepEqual(r.map(x => x.rank), r.map((_, i) => i + 1));
});
test("sensors: the generic adapter makes stable keys so the ledger can dedupe and resolve", () => {
  const a = fromReport("seo")({ findings: [{ code: "title-length", severity: "info", detail: "198 pages", where: "title-length" }] }), b = fromReport("seo")({ findings: [{ code: "title-length", severity: "info", detail: "197 pages", where: "title-length" }] });
  assert.equal(a[0].key, "seo:title-length:all"); assert.equal(a[0].key, b[0].key);
});
