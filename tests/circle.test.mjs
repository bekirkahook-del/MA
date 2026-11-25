/* The bot circle. Run: node --test tests/circle.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { NODES, EDGES, byId, mermaid } from "../tools/bots/circle/graph.mjs";
import * as L from "../tools/bots/circle/ledger.mjs";
import * as S from "../tools/bots/circle/sensors.mjs";
import { route, plan, priority } from "../tools/bots/circle/dispatcher.mjs";
import { checkRun, checkPatch, gateMarketing } from "../tools/bots/circle/guard.mjs";
import { pruneWire, cleanGlitch, patchQuestion } from "../tools/bots/circle/fixer.mjs";
import * as H from "../tools/bots/circle/historian.mjs";
import { runCircle } from "../tools/bots/circle/circle.mjs";
import { scanFreshness } from "../tools/bots/freshness.mjs";
import * as T from "../tools/feedbot/triage.mjs";

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), "..");
const NOW = new Date("2026-11-25T12:00:00Z");
const issue = (o = {}) => ({ key: "qa:x:1", bot: "qa", cls: "x", severity: "warn", detail: "d", where: "w", fix: null, status: "open", attempts: 0, reopened: 0, firstSeen: NOW.toISOString(), history: [], ...o });

test("graph: every edge points at real nodes and every node file exists", () => {
  for (const e of EDGES) { assert.ok(byId[e.from], e.from); assert.ok(byId[e.to], e.to); }
  for (const n of NODES) assert.ok(fs.existsSync(path.join(ROOT, n.file)), n.file);
  const m = mermaid(); NODES.forEach(n => assert.ok(m.includes(n.id + '["')));
});
test("graph: the circle is actually connected (no orphan bots)", () => {
  for (const n of NODES) assert.ok(EDGES.some(e => e.from === n.id || e.to === n.id), n.id + " has no connections");
  for (const n of NODES.filter(n => n.role === "circle")) { assert.ok(EDGES.some(e => e.to === n.id), n.id + " has no input"); }
});

test("ledger: dedupes, resolves when a sensor stops reporting, reopens, freezes at 3 reopenings", () => {
  const led = L.empty(), f = [S.fromHealth({ findings: [{ severity: "warn", what: "broken links", detail: "3 missing" }] })[0]];
  L.upsert(led, f, { ran: ["health"], now: NOW }); L.upsert(led, f, { ran: ["health"], now: NOW });
  assert.equal(Object.keys(led.issues).length, 1);
  const key = f[0].key;
  for (let i = 0; i < 3; i++) { L.upsert(led, [], { ran: ["health"], now: NOW }); assert.equal(led.issues[key].status, "resolved"); L.upsert(led, f, { ran: ["health"], now: NOW }); }
  assert.equal(led.issues[key].reopened, 3); assert.equal(led.issues[key].status, "frozen");
});
test("ledger: a sensor that did not run cannot resolve its issues", () => {
  const led = L.empty(), f = [S.fromHealth({ findings: [{ severity: "warn", what: "x", detail: "y" }] })[0]];
  L.upsert(led, f, { ran: ["health"], now: NOW }); L.upsert(led, [], { ran: ["qa"], now: NOW });
  assert.equal(led.issues[f[0].key].status, "open");
});

test("dispatcher: routes by fixability, attempts, demotion and freezing", () => {
  assert.equal(route(issue({ fix: { type: "wire-past-rows" } })).to, "fixer");
  assert.equal(route(issue({ fix: { type: "wire-past-rows" }, attempts: 2 })).to, "human");
  assert.equal(route(issue({ fix: { type: "text-glitch" } }), { autoAllowed: () => false }).to, "human");
  assert.equal(route(issue({ status: "frozen", fix: { type: "x" } })).to, "human");
  assert.equal(route(issue({ severity: "info" })).to, "watch");
  assert.equal(route(issue({ severity: "critical" })).to, "human");
  assert.ok(priority(issue({ severity: "critical" }), NOW) > priority(issue({ severity: "warn", verified: true }), NOW));
});
test("dispatcher: plan skips resolved issues and sorts critical first", () => {
  const led = L.empty(); led.issues.a = issue({ key: "a", severity: "info" }); led.issues.b = issue({ key: "b", severity: "critical" }); led.issues.c = issue({ key: "c", status: "resolved" });
  assert.deepEqual(plan(led, { now: NOW }).map(p => p.issue.key), ["b", "a"]);
});

test("guard: kill switch, main branch, critical health and the per-run cap all stop actions", () => {
  assert.equal(checkRun({ branch: "staging" }).ok, true);
  assert.equal(checkRun({ killSwitch: true, branch: "staging" }).ok, false);
  assert.equal(checkRun({ branch: "main" }).ok, false);
  assert.equal(checkRun({ branch: "staging", healthCritical: true }).ok, false);
  assert.equal(checkRun({ branch: "staging", fixesDone: 5 }).ok, false);
});
test("guard: protects Home, config, functions and auth; stops after 2 attempts or 3 reopenings", () => {
  for (const f of ["index.html", "netlify.toml", "netlify/functions/ai.mjs", "js/auth.js", "supabase/x.sql", "CLAUDE.md"]) assert.equal(checkPatch({ files: [f] }).ok, false, f);
  assert.equal(checkPatch({ files: ["js/app.js", "data/wire.json"] }).ok, true);
  assert.equal(checkPatch({ files: [], attempts: 2 }).ok, false); assert.equal(checkPatch({ files: [], reopened: 3 }).ok, false);
});
test("guard: a critical billing or health issue pauses marketing bots", () => {
  const led = L.empty(); assert.equal(gateMarketing(led).outreach, true);
  led.issues.b = issue({ key: "b", bot: "billing", severity: "critical" }); const g = gateMarketing(led);
  assert.equal(g.outreach, false); assert.equal(g.retention, false); assert.match(g.why[0], /billing/);
});

test("fixer: prunes only past calendar rows; cleans glitches without touching anything else", () => {
  const w = { CAL: [["Mon Nov 16", "old"], ["Wed Nov 25", "today"], ["Fri Nov 27", "later"]], EARN: [["2026-11-20", "X"], ["2026-11-26", "Y"]], NEWS: [1] };
  const r = pruneWire(w, NOW); assert.equal(r.removed, 2); assert.deepEqual(r.wire.CAL.map(x => x[1]), ["today", "later"]); assert.deepEqual(r.wire.NEWS, [1]);
  assert.equal(cleanGlitch("Why  does the the price , rise.."), "Why does the price, rise.");
  assert.equal(cleanGlitch("A clean sentence."), "A clean sentence.");
});
test("fixer: patchQuestion edits one question's strings and leaves every other byte alone", () => {
  const src = 'const A=[["Keep this  one",["a","b"],0,"ok"],\n ["Why  is the the sky blue?",["Rayleigh  scattering","Paint"],0,"light"]];\nconst B=1;';
  const r = patchQuestion(src, "Why  is the the sky blue?");
  assert.ok(r && r.changes === 2);
  assert.ok(r.src.includes('"Why is the sky blue?"') && r.src.includes('"Rayleigh scattering"') && r.src.includes('"Keep this  one"') && r.src.endsWith("const B=1;"));
  assert.equal(patchQuestion("const q=['x  y'];", "x  y"), null);
});

test("historian: a fix type that keeps getting reverted loses auto-run rights", () => {
  const h = H.empty(); assert.equal(H.autoAllowed(h, "t"), true);
  H.record(h, "t", "reverted"); assert.equal(H.autoAllowed(h, "t"), true);
  H.record(h, "t", "reverted"); assert.equal(H.autoAllowed(h, "t"), false);
  H.record(h, "u", "ok"); H.record(h, "u", "ok"); H.record(h, "u", "reverted"); H.record(h, "u", "reverted"); assert.equal(H.autoAllowed(h, "u"), true);
});

test("sensors: QA verified defects are critical; giveaways aggregate; glitches are fixable; funnel guide leak is flagged", () => {
  const qa = { total: 100, issues: [{ type: "answer-key-out-of-range", weight: 40, objective: true, track: "f", level: "L", question: "Q1?", qFull: "Q1?", note: "bad key" }, ...Array.from({ length: 20 }, (_, i) => ({ type: "length-giveaway", weight: 20, objective: false, track: "f", level: "L", question: "q" + i, note: "longest" })), { type: "text-glitch", weight: 5, objective: false, track: "f", level: "L", question: "Why  so?", qFull: "Why  so?", note: "glitch" }] };
  const is = S.fromQa(qa);
  assert.equal(is.filter(i => i.severity === "critical" && i.verified).length, 1);
  assert.equal(is.filter(i => i.cls === "length-giveaway").length, 1);
  assert.equal(is.find(i => i.cls === "text-glitch").fix.type, "text-glitch");
  const fn = S.fromFunnel({ confidence: "usable", visitors: 1864, biggestLeak: { from: "Visited", to: "Started a level", lostPct: 98 }, guide: { visitorsWhoSawAGuideCta: 859, ofAll: 46, clickedCta: 2 } });
  assert.equal(fn.length, 2); assert.ok(fn.some(i => i.cls === "guide-cta"));
  assert.equal(S.fromFunnel({ confidence: "too few" }).length, 0);
});

test("feedbot + QA are linked: a QA-verified defect makes ONE user report enough for a fix", () => {
  const Q = "Which is best?", src = { "js/x.js": 'const A=[["' + Q + '",["Alpha option here","Beta option here","Gamma option here"],1,"why"]];' };
  const row = { id: "r1", uid: "u1", kind: "question", reason: "Wrong answer", text: "wrong", question: Q, page: "/#learn", signedIn: "true", at: "2026-11-24T10:00:00Z" };
  const ctx = (extra = {}) => ({ now: NOW, locate: q => T.locateIn(src, q), support: null, changedSince: () => null, deploysSince: () => [], ...extra });
  assert.equal(T.run([row], ctx()).items[0].verdict, "watch");
  assert.equal(T.run([row], ctx({ qaDefects: new Set([Q]) })).items[0].verdict, "fix");
});

const sensorsOf = (o = {}) => ({ health: async () => ({ findings: [] }), qa: async () => ({ total: 1, issues: [] }), freshness: async () => ({ findings: [] }), cost: async () => ({ findings: [], deploy: { creditsUsed: 195, ofBudget: 20, advice: "Fine." } }), ...o });
const tmpRoot = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "circle-")); fs.mkdirSync(path.join(d, "tools/bots/state"), { recursive: true }); return d; };

test("circle plan: feeds QA defects to the feedbot, closes marketing when billing is critical, survives a crashed sensor", async () => {
  let got = null; const root = tmpRoot();
  const r = await runCircle({
    root, now: NOW, mode: "plan", sensors: sensorsOf({
      qa: async () => ({ total: 1, issues: [{ type: "duplicate-options", weight: 40, objective: true, track: "f", level: "L", question: "Q?", qFull: "Q?", note: "same" }] }),
      billing: async () => ({ findings: [{ severity: "critical", code: "PAID_NO_ACCESS", user: "abc123", detail: "paying, no access" }] }),
      feedbot: async ({ qaDefects }) => { got = qaDefects; return { items: [], polls: { tally: [] } }; },
      funnel: async () => { throw new Error("boom"); }, retention: async () => ({ eligibleToday: 1 }), outreach: async () => ({ drafted: 1 }),
    }),
  });
  assert.ok(got && got.has("Q?"));
  assert.equal(r.gates.outreach, false); assert.ok(r.drafts.retention.skipped && r.drafts.outreach.skipped);
  assert.ok(r.failed.some(f => f.bot === "funnel")); assert.ok(r.plan.some(p => p.key.startsWith("circle:bot-failure")));
  assert.ok(r.plan.every(p => p.to !== "fixer")); assert.equal(r.actions.length, 0);
  assert.match(fs.readFileSync(path.join(root, "tools/bots/state/digest.md"), "utf8"), /Needs you/);
});

function gitRepo(branch) {
  const d = tmpRoot(), g = (...a) => execFileSync("git", a, { cwd: d, stdio: "pipe" });
  g("init", "-q", "-b", branch); g("config", "user.email", "t@t"); g("config", "user.name", "t");
  fs.mkdirSync(path.join(d, "data"), { recursive: true });
  fs.writeFileSync(path.join(d, "data/wire.json"), JSON.stringify({ updated: "2026-11-25T08:00:00Z", TICKER_DATE: "Nov 25", NEWS_DATE: "Nov 25, 2026", DEALS_DATE: "Nov 25, 2026", APP_OPEN_DATE: "Nov 25, 2026", CAL: [["Mon Nov 16", "old", "x"], ["Fri Nov 27", "later", "y"]], EARN: [], NEWS: [] }, null, 2) + "\n");
  g("add", "-A"); g("commit", "-q", "-m", "init"); return { d, g };
}
const wireSensors = d => sensorsOf({ freshness: async () => scanFreshness(d, NOW) });

test("circle act: fixes stale calendar rows, verifies, commits, marks fixed, records success", async () => {
  const { d, g } = gitRepo("staging-test");
  const r = await runCircle({ root: d, now: NOW, mode: "act", sensors: wireSensors(d), tests: () => ({ ok: true }) });
  assert.equal(r.actions.length, 1); assert.equal(r.actions[0].ok, true, JSON.stringify(r.actions));
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(d, "data/wire.json"))).CAL.map(x => x[1]), ["later"]);
  assert.match(String(g("log", "--format=%s", "-1")), /^bot\(circle\)/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(d, "tools/bots/state/circle-history.json"))).classes["wire-past-rows"].ok, 1);
  assert.ok(Object.values(JSON.parse(fs.readFileSync(path.join(d, "tools/bots/state/circle-ledger.json"))).issues).some(i => i.status === "fixed"));
});
test("circle act: if tests fail the patch is reverted and the Historian records it", async () => {
  const { d } = gitRepo("staging-test"), before = fs.readFileSync(path.join(d, "data/wire.json"), "utf8");
  const r = await runCircle({ root: d, now: NOW, mode: "act", sensors: wireSensors(d), tests: () => ({ ok: false, note: "1 tests failed" }) });
  assert.equal(r.actions[0].ok, false); assert.match(r.actions[0].note, /reverted/);
  assert.equal(fs.readFileSync(path.join(d, "data/wire.json"), "utf8"), before);
  assert.equal(JSON.parse(fs.readFileSync(path.join(d, "tools/bots/state/circle-history.json"))).classes["wire-past-rows"].reverted, 1);
});
test("circle act: refuses on main, with a dirty tree, with the kill switch, and when site health is critical", async () => {
  const bad = async (setup, sensorsFn) => { const { d } = gitRepo(setup.branch || "staging-test"); setup.prep && setup.prep(d); return runCircle({ root: d, now: NOW, mode: "act", sensors: (sensorsFn || wireSensors)(d), tests: () => ({ ok: true }) }); };
  assert.match((await bad({ branch: "main" })).actions[0].note, /main/);
  assert.match((await bad({ prep: d => fs.writeFileSync(path.join(d, "stray.txt"), "x") })).actions[0].note, /uncommitted/);
  assert.match((await bad({ prep: d => fs.writeFileSync(path.join(d, "tools/bots/STOP"), "") })).actions[0].note, /kill switch/);
  assert.match((await bad({}, d => ({ ...wireSensors(d), health: async () => ({ findings: [{ severity: "critical", what: "levels fail to open", detail: "f:1 empty" }] }) }))).actions[0].note, /health/);
});

test("obsidian: every bot has a note whose links match the graph", () => {
  const dir = path.join(ROOT, "tools/bots/obsidian");
  for (const n of NODES) {
    const t = fs.readFileSync(path.join(dir, n.name + ".md"), "utf8");
    assert.ok(t.includes("<!-- circle:start -->"), n.name + " has no connections block");
    for (const e of EDGES.filter(e => e.from === n.id || e.to === n.id)) assert.ok(t.includes("[[" + byId[e.from === n.id ? e.to : e.from].name + "]]"), n.name + " is missing a link for " + e.label);
  }
  for (const f of ["Site Bots", "The Circle", "Guardrails"]) assert.ok(fs.existsSync(path.join(dir, f + ".md")), f);
});
