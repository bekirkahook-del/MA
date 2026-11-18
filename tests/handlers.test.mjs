import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { installBackend, user, post, setEnv, UID } from "./helpers.mjs";

setEnv();
const F = (n) => import(`../netlify/functions/${n}.mjs`).then((m) => m.default);
const WH = "whsec_handler_tests";
process.env.STRIPE_WEBHOOK_SECRET = WH;
const sign = (raw, secret = WH) => { const t = Math.floor(Date.now() / 1000); return `t=${t},v1=${crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex")}`; };
const whReq = (body, sig) => new Request("https://mnaprep.com/.netlify/functions/stripe-webhook", { method: "POST", headers: sig ? { "stripe-signature": sig } : {}, body: typeof body === "string" ? body : JSON.stringify(body) });
const T = { tok1: user(1), tok2: user(2, { email_confirmed_at: null }), old: user(3, { created_at: "2026-09-01T00:00:00Z" }), fresh: user(4, { created_at: new Date().toISOString() }) };
let be;
beforeEach(() => { be = installBackend({ users: T }); setEnv(); process.env.STRIPE_WEBHOOK_SECRET = WH; });

// ---- stripe webhook ----
test("webhook: no secret configured -> 503 (fails closed)", async () => {
  delete process.env.STRIPE_WEBHOOK_SECRET; delete process.env.STRIPESECRETWEBHOOKMNA;
  const h = await F("stripe-webhook"); const r = await h(whReq("{}", sign("{}", "")));
  assert.equal(r.status, 503);
});
test("webhook: missing / bad signature -> 400, nothing written", async () => {
  const h = await F("stripe-webhook"), ev = { type: "checkout.session.completed", data: { object: { client_reference_id: UID(1), mode: "payment", payment_status: "paid", metadata: { plan: "season" } } } };
  assert.equal((await h(whReq(ev))).status, 400);
  assert.equal((await h(whReq(ev, sign(JSON.stringify(ev), "whsec_wrong_secret")))).status, 400);
  assert.equal(be.get("billing", UID(1)), undefined);
});
test("webhook: GET -> 405", async () => { const h = await F("stripe-webhook"); assert.equal((await h(new Request("https://x.test/", { method: "GET" }))).status, 405); });
test("webhook: unpaid one-time checkout does NOT grant access", async () => {
  const h = await F("stripe-webhook"), ev = { type: "checkout.session.completed", data: { object: { client_reference_id: UID(1), mode: "payment", payment_status: "unpaid", metadata: { plan: "season", uid: UID(1) } } } }, raw = JSON.stringify(ev);
  const r = await h(whReq(raw, sign(raw))); assert.equal(r.status, 200);
  assert.equal(be.get("billing", UID(1)), undefined);
});
test("webhook: paid one-time checkout writes billing", async () => {
  const h = await F("stripe-webhook"), ev = { type: "checkout.session.completed", data: { object: { client_reference_id: UID(1), mode: "payment", payment_status: "paid", metadata: { plan: "season", uid: UID(1) } } } }, raw = JSON.stringify(ev);
  const r = await h(whReq(raw, sign(raw))); assert.equal(r.status, 200);
  assert.ok(be.get("billing", UID(1)), "billing doc written");
});
test("webhook: non-UUID uid and unknown plan are ignored", async () => {
  const h = await F("stripe-webhook");
  for (const o of [{ client_reference_id: "../../etc", mode: "payment", payment_status: "paid", metadata: { plan: "season" } }, { client_reference_id: UID(1), mode: "payment", payment_status: "paid", metadata: { plan: "__proto__" } }]) {
    const raw = JSON.stringify({ type: "checkout.session.completed", data: { object: o } });
    await h(whReq(raw, sign(raw)));
  }
  assert.equal(be.get("billing", UID(1)), undefined);
});

// ---- trial ----
test("trial: no token -> 401; unconfirmed email -> 409", async () => {
  const h = await F("trial");
  assert.equal((await h(post("trial", {}))).status, 401);
  assert.equal((await h(post("trial", {}, "tok2"))).status, 409);
});
test("trial: new account's backdated legacyStart is ignored (3 days from now)", async () => {
  const h = await F("trial"), r = await h(post("trial", { legacyStart: Date.now() - 864e5 }, "fresh")), j = await r.json();
  assert.equal(r.status, 200);
  assert.ok(Math.abs(j.trialUntil - (Date.now() + 3 * 864e5)) < 10_000);
});
test("trial: OLD account's real legacy trial (before cutoff) is honored", async () => {
  // The legacy path only lives for 7 days after the Nov 12 cutoff, so pin the clock to Nov 14.
  const realNow = Date.now; Date.now = () => Date.UTC(2026, 10, 14);
  try {
    const h = await F("trial"), ls = Date.UTC(2026, 10, 11), r = await h(post("trial", { legacyStart: ls }, "old")), j = await r.json();
    assert.equal(r.status, 200); assert.equal(j.trialStart, ls);
  } finally { Date.now = realNow; }
});
test("trial: only once per account", async () => {
  const h = await F("trial");
  assert.equal((await h(post("trial", {}, "tok1"))).status, 200);
  assert.equal((await h(post("trial", {}, "tok1"))).status, 409);
});

// ---- rank pass ----
test("pass: prototype keys and junk ranks rejected", async () => {
  const h = await F("pass");
  for (const rank of ["__proto__", "constructor", "toString", 0, 1, 2, 4, 5, 9, null]) assert.equal((await h(post("pass", { rank }, "tok1"))).status, 400, String(rank));
});
test("pass: valid claim works once, second claim 409, unconfirmed 409", async () => {
  const h = await F("pass");
  assert.equal((await h(post("pass", { rank: 6 }, "tok1"))).status, 200);
  assert.equal((await h(post("pass", { rank: 6 }, "tok1"))).status, 409);
  assert.equal((await h(post("pass", { rank: 6 }, "tok2"))).status, 409);
});

// ---- grant (owner only) ----
test("grant: non-owner cannot grant Pro", async () => {
  const h = await F("grant"), r = await h(post("grant", { email: "x@y.com", plan: "pro" }, "tok1"));
  assert.ok([401, 403].includes(r.status), "got " + r.status);
});
test("grant: unconfirmed owner email is rejected", async () => {
  be = installBackend({ users: { own: user(9, { email: "bekirkahook@gmail.com", email_confirmed_at: null }) } }); setEnv();
  const h = await F("grant"); assert.equal((await h(post("grant", { email: "x@y.com" }, "own"))).status, 403);
});

// ---- AI proxy ----
test("ai: no service key -> 503 (no unmetered access)", async () => {
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const h = await F("ai"); assert.equal((await h(post("ai", { tier: "quick", prompt: "hi" }, "tok1"))).status, 503);
});
test("ai: unauthenticated 401, unconfirmed 409", async () => {
  const h = await F("ai"), b = { tier: "quick", prompt: "hi" };
  assert.equal((await h(post("ai", b))).status, 401);
  assert.equal((await h(post("ai", b, "tok2"))).status, 409);
});
test("ai: free tier stops at its daily limit (429), earlier calls succeed", async () => {
  const h = await F("ai"), b = { tier: "quick", prompt: "hi" }; let ok = 0, last;
  for (let i = 0; i < 12; i++) { last = await h(post("ai", b, "tok1")); if (last.status === 200) ok++; else break; }
  assert.equal(ok, 3); assert.equal(last.status, 429);
});
test("ai: also enforced when the atomic RPC is missing (fallback path)", async () => {
  be = installBackend({ users: T, rpc: false }); setEnv();
  const h = await F("ai"), b = { tier: "quick", prompt: "hi" }; let ok = 0;
  for (let i = 0; i < 12; i++) { const r = await h(post("ai", b, "tok1")); if (r.status === 200) ok++; else break; }
  assert.equal(ok, 3);
});
test("ai: unknown tier key like __proto__ never reaches upstream", async () => {
  const h = await F("ai"), before = be.calls.filter((c) => c.host === "api.anthropic.com").length;
  const r = await h(post("ai", { tier: "__proto__", messages: [{ role: "user", content: "hi" }] }, "tok1"));
  assert.ok([200, 400].includes(r.status));
  if (r.status === 400) assert.equal(be.calls.filter((c) => c.host === "api.anthropic.com").length, before);
});

// ---- subscribe ----
test("subscribe: invalid emails rejected", async () => {
  const h = await F("subscribe");
  for (const email of ["", "nope", "a@b", "a@b.com,c@d.com"]) assert.equal((await h(post("subscribe", { email }), {})).status, 400, email);
});
test("subscribe: valid email accepted; 4th request for the same email in a day is silently dropped (no extra row)", async () => {
  const h = await F("subscribe");
  for (let i = 0; i < 5; i++) { const r = await h(post("subscribe", { email: "new@school.edu" }, null, { "x-nf-client-connection-ip": "7.7.7.7" }), {}); assert.equal(r.status, 200); }
  const rows = [...be.docs.values()].filter((d) => d.col === "subscribers");
  assert.ok(rows.length <= 3, "rows=" + rows.length);
});

// ---- mail.activeSubs ----
test("mail.activeSubs only returns well-formed active rows", async () => {
  const mod = await import("../netlify/functions/_lib/mail.mjs"), id = "a".repeat(32), tok = "b".repeat(32);
  be.put("subscribers", id, null, { email: "ok@x.com", token: tok, status: "active" });
  be.put("subscribers", "short", null, { email: "bad@x.com", token: tok, status: "active" });
  be.put("subscribers", "c".repeat(32), null, { email: "not-an-email", token: tok, status: "active" });
  be.put("subscribers", "d".repeat(32), null, { email: "unsub@x.com", token: tok, status: "unsubscribed" });
  const out = await mod.activeSubs(); assert.deepEqual(out.map((s) => s.email), ["ok@x.com"]);
});
