/* Site bots. Run: node --test tests/bots.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import { auditQuestions } from "../tools/bots/qa.mjs";
import { funnel } from "../tools/bots/funnel.mjs";
import { reconcile } from "../tools/bots/billing.mjs";
import { deployBudget, aiUsage } from "../tools/bots/cost.mjs";
import { wireFreshness, pageFreshness } from "../tools/bots/freshness.mjs";
import { plan, dueCount } from "../tools/bots/retention.mjs";
import { draft } from "../tools/bots/outreach.mjs";
import { parseDate } from "../tools/bots/lib.mjs";

const NOW = new Date("2026-11-25T12:00:00Z");
const T = qs => [{ id: "t", name: "T", levels: [{ n: "L1", q: qs }] }];

test("qa: bad key and missing explanation are verified; signed answers are not duplicates", () => {
  const r = auditQuestions(T([["Q one is here?", ["a", "b", "c"], 9, "because reasons that are long"], ["Cash effect of a $20 rise?", ["+$20", "−$20", "None"], 1, ""]]));
  assert.ok(r.issues.some(i => i.type === "answer-key-out-of-range"));
  assert.ok(r.issues.some(i => i.type === "no-explanation"));
  assert.ok(!r.issues.some(i => i.type === "duplicate-options"));
  assert.equal(r.verifiedDefects, 1);
});
test("qa: glitches are checked per string; templates with different numbers are not duplicates", () => {
  const ok = ["Equity $300 and debt $100. EV?", ["$1", "$2", "$3"], 0, "Because the formula says so here."], ok2 = ["Equity $500 and debt $100. EV?", ["$1", "$2", "$3"], 0, "Because the formula says so here."];
  assert.equal(auditQuestions(T([ok, ok2])).issues.filter(i => /glitch|duplicate-question/.test(i.type)).length, 0);
  const bad = ["Why does the the price rise?", ["a1", "b2", "c3"], 0, "Because the formula says so here."];
  assert.equal(auditQuestions(T([bad])).issues.filter(i => i.type === "text-glitch").length, 1);
  assert.equal(auditQuestions(T([ok, ok])).issues.filter(i => i.type === "duplicate-question").length, 1);
});

const row = (day, v, ev) => ({ id: day + "_" + v, ev });
test("funnel: counts people per stage and finds the biggest leak", () => {
  const rows = [row("d1", "aaaaaaaa", { first_level: 1, level_clear: 1, gate_signup_open: 1, signup: 1 }), row("d1", "bbbbbbbb", { first_level: 1 }), row("d1", "cccccccc", {}), row("d2", "cccccccc", {})];
  const f = funnel(rows);
  assert.equal(f.visitors, 3);
  assert.deepEqual(f.steps.map(s => s.visitors), [3, 2, 1, 1, 1]);
  assert.equal(f.biggestLeak.lost, 1);
  assert.match(f.confidence, /too few/);
});
test("funnel: enough visitors = usable", () => {
  const rows = Array.from({ length: 120 }, (_, i) => row("d1", "v" + String(i).padStart(8, "0"), { first_level: 1 }));
  assert.equal(funnel(rows).confidence, "usable");
});

const now = Date.UTC(2026, 10, 25, 12);
test("billing: paid but no access is critical; stale list and missing doc are caught", () => {
  const r = reconcile({
    now, billing: [{ id: "u1aaaaaa", data: {} }, { id: "u2bbbbbb", data: { status: "active", paid: true, until: now + 864e5 * 10, plan: "pro" } }],
    proList: ["u1aaaaaa", "u2bbbbbb", "u9zzzzzz"], stripe: [{ uid: "u1aaaaaa", status: "active" }, { uid: "u7yyyyyy", status: "active" }],
  });
  const codes = r.findings.map(f => f.code);
  assert.ok(codes.includes("PAID_NO_ACCESS")); assert.ok(codes.includes("PAID_NO_BILLING_DOC")); assert.ok(codes.includes("STALE_PRO_LIST")); assert.ok(codes.includes("ACCESS_NO_STRIPE_SUB")); assert.ok(codes.includes("PRO_LIST_NO_DOC"));
  assert.equal(r.findings[0].severity, "critical");
  assert.ok(r.findings.every(f => f.user.length <= 6));
});
test("billing: a healthy paid user raises nothing", () => {
  const r = reconcile({ now, billing: [{ id: "u2bbbbbb", data: { status: "active", paid: true, until: now + 864e5 * 10, plan: "pro" } }], proList: ["u2bbbbbb"], stripe: [{ uid: "u2bbbbbb", status: "active" }] });
  assert.equal(r.problems, 0);
});

test("cost: 15 credits per deploy, severity rises with use", () => {
  const d = new Date("2026-11-25T12:00:00Z");
  assert.equal(deployBudget({ deploys: 13, now: d }).creditsUsed, 195);
  assert.equal(deployBudget({ deploys: 13, now: d }).severity, "info");
  assert.equal(deployBudget({ deploys: 35, now: d }).severity, "warn");
  assert.equal(deployBudget({ deploys: 60, now: d }).severity, "critical");
  assert.equal(deployBudget({ deploys: 1, creditsUsed: 900, now: d }).creditsUsed, 900);
});
test("cost: AI over limit is critical; free users at the wall are upsell leads", () => {
  const r = aiUsage([{ id: "aaaaaaaa", data: { tier: "free", count: 3 } }, { id: "bbbbbbbb", data: { tier: "free", count: 9 } }, { id: "cccccccc", data: { tier: "pro", count: 20 } }]);
  assert.equal(r.freeUsersAtLimit, 2);
  assert.ok(r.findings.some(f => f.code === "OVER_LIMIT"));
});

test("freshness: stale wire sections and past events are flagged", () => {
  const f = wireFreshness({ updated: "2026-11-20T00:00:00Z", NEWS_DATE: "Nov 24, 2026", TICKER_DATE: "Nov 20", CAL: [["Wed Nov 18", "x"]], NEWS: [{ d: "Nov 10", h: "old" }] }, NOW);
  const where = f.map(x => x.where);
  assert.ok(where.includes("wire.updated")); assert.ok(where.includes("wire.TICKER_DATE")); assert.ok(where.includes("wire.CAL")); assert.ok(where.includes("wire.NEWS")); assert.ok(!where.includes("wire.NEWS_DATE"));
});
test("freshness: old years only matter near recruiting words", () => {
  assert.equal(pageFreshness("<p>The 2024 summer analyst application deadline passed.</p>", "g", NOW).length, 1);
  assert.equal(pageFreshness("<p>Founded in 2019 by two partners.</p>", "g", NOW).length, 0);
  assert.equal(parseDate("Nov 24").getUTCDate(), 24);
});

test("retention: dry run, never sends, needs opt-in", () => {
  const today = Math.floor(now / 864e5), srs = Object.fromEntries(Array.from({ length: 4 }, (_, i) => ["q:f:0:" + i, { b: 1, d: today - 1 }]));
  assert.equal(dueCount(srs, today), 4);
  const none = plan({ now, progress: [{ id: "u1aaaaaa", data: { srs } }] });
  assert.equal(none.sends, 0); assert.equal(none.eligibleToday, 0); assert.equal(none.wouldSendIfTheyOptIn, 1); assert.ok(none.blocker);
  const yes = plan({ now, progress: [{ id: "u1aaaaaa", data: { srs } }], engage: [{ id: "u1aaaaaa", data: { review: true } }] });
  assert.equal(yes.eligibleToday, 1); assert.equal(yes.sends, 0);
  const cool = plan({ now, progress: [{ id: "u1aaaaaa", data: { srs } }], engage: [{ id: "u1aaaaaa", data: { review: true, lastReview: today - 1 } }] });
  assert.equal(cool.eligibleToday, 0);
});

test("outreach: drafts only; no invented email; dedupes; caps per org and per run", () => {
  const t = (id, org, email) => ({ id, name: "Sam Lee", org, email, kind: "club" });
  const r = draft([t("a", "OSU Club", "a@osu.edu"), t("b", "OSU Club", "b@osu.edu"), t("c", "OSU Club", "c@osu.edu"), t("d", "X", null), t("e", "Y", "e@y.edu")], { sent: { e: "2026-11-01" } });
  assert.equal(r.sends, 0); assert.equal(r.drafted, 1);
  assert.ok(r.skipped.some(s => /no valid email/.test(s.reason))); assert.ok(r.skipped.some(s => /already contacted/.test(s.reason))); assert.ok(r.skipped.some(s => /already drafting 1/.test(s.reason)));
  assert.ok(r.drafts.every(d => /won't email again/.test(d.body)));
  assert.ok(!/\d+%|\d+ students|loved/i.test(r.drafts[0].body));
});
