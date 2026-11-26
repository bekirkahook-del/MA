// Referral program: a friend names who invited them at sign-up (invite code or account email); the inviter earns 7 Pro days per 3 friends
// who confirm their email AND clear Level 1. These tests are mostly the ways someone could cheat it.
import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { installBackend, user, post, setEnv, UID } from "./helpers.mjs";

setEnv();
const refer = await import("../netlify/functions/refer.mjs").then((m) => m.default);
const DAY = 864e5, OLD = "2026-10-01T00:00:00Z", MINS = (n) => new Date(Date.now() - n * 60e3).toISOString();
let users, be;
const mk = (n, over = {}) => { users["tok" + n] = user(n, { email: `friend${n}@school.edu`, created_at: MINS(20), ...over }); return "tok" + n; };
beforeEach(() => {
  users = {}; mk(1, { email: "alice@gmail.com", created_at: OLD }); // the inviter
  be = installBackend({ users }); setEnv();
});
const dev = (n) => ({ device: `device-number-${n}-aaaaaaaa`, fp: `fingerprint-${n}-xxxx`, fp2: `gpu-${n}-yyyyyyyy` });
const call = (tok, body, ip = "9.9.9.9") => refer(post("refer", body, tok, { "x-nf-client-connection-ip": ip }));
const claim = (n, who, ip) => call("tok" + n, { action: "claim", ...who, ...dev(n) }, ip || `10.0.${n}.1`);
const settle = (n, ip) => call("tok" + n, { action: "settle", ...dev(n) }, ip || `10.0.${n}.1`);
const levels = (n, l = 1) => be.put("players", UID(n), UID(n), { levels: l });
const codeOf = async () => (await (await call("tok1", { action: "code" })).json()).code;
const pass = () => (be.get("billing", UID(1)) || {}).passUntil || 0;
const by = (n) => be.get("refby", UID(n));
// a friend who signs up with the code, clears Level 1 and settles
const finish = async (n, ip) => { mk(n); levels(n); const code = await codeOf(); await claim(n, { code }, ip); return settle(n, ip); };

test("claim by code records a PENDING referral and pays nothing", async () => {
  mk(2); const r = await claim(2, { code: await codeOf() });
  assert.equal(r.status, 200);
  assert.equal(by(2).by, UID(1)); assert.equal(by(2).st, "pending");
  assert.equal(pass(), 0);
});
test("claim by email works, folding Gmail dots and +tags", async () => {
  mk(2); await claim(2, { email: "A.lice+study@gmail.com" });
  assert.equal(by(2).by, UID(1));
});
test("every outcome returns the same answer, so the box can't reveal who has an account", async () => {
  mk(2); mk(3); mk(4);
  const ok = await (await claim(2, { email: "alice@gmail.com" })).text();
  const unknown = await (await claim(3, { email: "nobody@nowhere.com" })).text();
  const badCode = await (await claim(4, { code: "zzzzzzz" })).text();
  assert.equal(ok, unknown); assert.equal(ok, badCode);
  assert.equal(by(3), undefined); assert.equal(by(4), undefined);
});
test("settle needs Level 1: not yet before, counts after", async () => {
  mk(2); await claim(2, { code: await codeOf() });
  let r = await settle(2); assert.equal(r.status, 409); assert.equal((await r.json()).code, "not_yet");
  levels(2); r = await settle(2); assert.equal(r.status, 200);
  assert.equal(by(2).st, "done");
});
test("settle needs an account at least 10 minutes old", async () => {
  mk(2, { created_at: MINS(2) }); levels(2); await claim(2, { code: await codeOf() });
  const r = await settle(2); assert.equal(r.status, 409); assert.equal(by(2).st, "pending");
});
test("3 finished friends = 7 Pro days; 2 = nothing", async () => {
  await finish(2); await finish(3);
  assert.equal(pass(), 0);
  await finish(4);
  const gained = pass() - Date.now();
  assert.ok(gained > 6.99 * DAY && gained < 7.01 * DAY, "about 7 days, got " + gained / DAY);
});
test("a request that lost the race for a reward tier can't pay it again", async () => {
  // another request already paid tier 1 (billing +7 days, tier claimed) but the inviter's counter still says 0 paid
  const paid = Date.now() + 7 * DAY;
  be.put("billing", UID(1), UID(1), { passUntil: paid });
  be.put("refreward", `${UID(1)}:1`, null, { uid: UID(99), t: 1 });
  await finish(2); await finish(3); await finish(4);
  assert.equal(pass(), paid, "no second payout for the same tier");
});
test("settling the same friend again, even in parallel, pays once", async () => {
  await finish(2); await finish(3);
  mk(4); levels(4); await claim(4, { code: await codeOf() });
  await Promise.all([settle(4), settle(4), settle(4)]); await settle(4);
  const gained = pass() - Date.now();
  assert.ok(gained > 6.99 * DAY && gained < 7.01 * DAY, "one tier only, got " + gained / DAY);
});
test("reward is capped at 4 weeks", async () => {
  for (let i = 100; i < 115; i++) be.put("refby", UID(i), null, { by: UID(1), st: "done", t: 1 }); // 15 friends done: uncapped that is 5 weeks
  await codeOf(); // opening the invite card pays whatever is earned
  const gained = pass() - Date.now();
  assert.ok(gained > 27.99 * DAY && gained < 28.01 * DAY, "28 days max, got " + gained / DAY);
});
test("an unconfirmed account can't settle, even with a pending referral and Level 1", async () => {
  mk(5, { email_confirmed_at: null }); levels(5);
  be.put("refby", UID(5), null, { by: UID(1), st: "pending", t: 1 });
  const r = await settle(5);
  assert.equal(r.status, 409); assert.equal((await r.json()).code, "unconfirmed");
  assert.equal(by(5).st, "pending"); assert.equal(pass(), 0);
});
test("can't invite yourself, or your own alias", async () => {
  mk(2, { email: "me@gmail.com" });
  await claim(2, { code: "" , email: "m.e+1@gmail.com" });
  assert.equal(by(2), undefined);
  await call("tok2", { action: "code" }); const own = (await be.get("refs", UID(2))).code;
  await claim(2, { code: own });
  assert.equal(by(2), undefined);
});
test("a second account on the same real inbox can't refer the first", async () => {
  users.tok1.email = "pat@gmail.com";
  mk(2, { email: "p.at+study@gmail.com" }); await claim(2, { code: await codeOf() });
  assert.equal(by(2), undefined);
});
test("one device can only ever be one referred friend", async () => {
  mk(2); mk(3); const code = await codeOf();
  await claim(2, { code });
  await call("tok3", { action: "claim", code, ...dev(2) }, "10.0.3.1"); // same device as friend 2
  assert.equal(by(3), undefined);
});
test("the same inbox under another alias can't be referred twice", async () => {
  mk(2, { email: "pat@gmail.com" }); mk(3, { email: "p.at+2@gmail.com" }); const code = await codeOf();
  await claim(2, { code }); await claim(3, { code });
  assert.ok(by(2)); assert.equal(by(3), undefined);
});
test("max 2 friends from one network per inviter", async () => {
  const code = await codeOf();
  for (const n of [2, 3, 4]) { mk(n); await claim(n, { code }, "5.5.5.5"); }
  assert.ok(by(2) && by(3)); assert.equal(by(4), undefined);
});
test("friend on the inviter's own device is refused", async () => {
  await call("tok1", { action: "code", ...dev(2) }); // inviter's browser = "device 2"
  mk(2); await claim(2, { code: await codeOf() });
  assert.equal(by(2), undefined);
});
test("friend on a device that already got a free-Pro-day for the inviter's account is refused", async () => {
  const k = "dev:" + (await import("../netlify/functions/_lib/identity.mjs")).H(dev(2).device);
  be.put("rewardowner", k, null, { uid: UID(1) });
  mk(2); await claim(2, { code: await codeOf() });
  assert.equal(by(2), undefined);
});
test("disposable email domains never count", async () => {
  mk(2, { email: "x@mailinator.com" }); await claim(2, { code: await codeOf() });
  assert.equal(by(2), undefined);
});
test("circular referrals (A invites B, B invites A) are refused", async () => {
  users.tok1.created_at = MINS(20); // inviter is also a brand-new account here
  const codeA = await codeOf();
  mk(2); await claim(2, { code: codeA }); assert.equal(by(2).by, UID(1));
  await call("tok2", { action: "code" }); const codeB = be.get("refs", UID(2)).code;
  await claim(1, { code: codeB }); // A tries to name B
  assert.equal(by(1), undefined);
});
test("accounts older than 3 days can't claim; unconfirmed accounts are told to retry", async () => {
  mk(2, { created_at: "2026-11-01T00:00:00Z" }); await claim(2, { code: await codeOf() });
  assert.equal(by(2), undefined);
  mk(3, { email_confirmed_at: null }); const r = await claim(3, { code: await codeOf() });
  assert.equal(r.status, 409); assert.equal((await r.json()).code, "unconfirmed");
});
test("an unconfirmed inviter can't be credited", async () => {
  users.tok1.email_confirmed_at = null; users.tok1.confirmed_at = null;
  be.put("refs", UID(1), null, { code: "abcdefg", joined: [], rewarded: 0 }); be.put("refcodes", "abcdefg", null, { uid: UID(1) });
  mk(2); await claim(2, { code: "abcdefg" });
  assert.equal(by(2), undefined);
});
test("one inviter per account, locked after the first", async () => {
  mk(2); mk(3, { email: "alice2@gmail.com", created_at: OLD }); // a second possible inviter
  await claim(2, { code: await codeOf() });
  const first = by(2).by;
  await call("tok3", { action: "code" }); await claim(2, { code: be.get("refs", UID(3)).code });
  assert.equal(by(2).by, first);
});
test("must sign in; bad action and wrong method are rejected", async () => {
  assert.equal((await refer(post("refer", { action: "claim" }, null))).status, 401);
  assert.equal((await call("tok1", { action: "nope" })).status, 400);
  assert.equal((await refer(new Request("https://mnaprep.com/.netlify/functions/refer"))).status, 405);
});
test("claiming is rate limited per account", async () => {
  mk(2); let last;
  for (let i = 0; i < 7; i++) last = await claim(2, { code: "zzzzzzz" });
  assert.equal(last.status, 429);
});
