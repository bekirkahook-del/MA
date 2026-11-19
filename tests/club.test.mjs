// Run: node tests/club.test.mjs   (no network: Supabase + Stripe are faked in memory)
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
process.env.STRIPE_SECRET_KEY = "sk_test_x"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sbsecret"; process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret"; process.env.RESEND_API_KEY = "re_test";
const { clubQuote } = await import("../netlify/functions/_lib/clubprice.mjs");

// 1. price table: flat $6 per member per month, 10-seat minimum, 500 max
const cents = (n) => clubQuote(n).totalCents;
assert.equal(cents(1), 6000); assert.equal(cents(10), 6000);
assert.equal(cents(25), 15000); assert.equal(cents(40), 24000); assert.equal(cents(500), 300000);
assert.equal(clubQuote(501).contact, true); assert.equal(clubQuote(0).ok, false); assert.equal(clubQuote("abc").ok, false);
for (let n = 1; n < 500; n++) assert.ok(cents(n + 1) >= cents(n), "price never drops when a member is added: " + n);

// 2. browser copy of the formula matches the server's
const src = fs.readFileSync(new URL("../js/rewards.js", import.meta.url), "utf8");
const a = src.indexOf("const CLUB_CENTS"), b = src.indexOf("window.maClubQuote_calc");
const clientQuote = new Function(src.slice(a, b) + "; return clubQuote;")();
for (const n of [-1, 0, 1, 9, 10, 11, 25, 26, 40, 75, 76, 200, 201, 499, 500, 501, 1000]) {
  const s = clubQuote(n), c = clientQuote(n);
  assert.equal(c.ok, s.ok, "ok " + n); if (s.ok) { assert.equal(c.totalCents, s.totalCents, "total " + n); assert.equal(c.seats, s.seats); }
}

const { AI_LIMITS } = await import("../netlify/functions/_lib/common.mjs");
assert.equal(AI_LIMITS.club, 15); assert.ok(AI_LIMITS.club < AI_LIMITS.pro && AI_LIMITS.club > AI_LIMITS.free);

// 3. fake Supabase + Stripe + Resend
const docs = new Map(); const key = (c, i) => c + "|" + i;
const OFFICER = "11111111-1111-1111-1111-111111111111", M1 = "22222222-2222-2222-2222-222222222222", M2 = "33333333-3333-3333-3333-333333333333", M3 = "44444444-4444-4444-4444-444444444444", M4 = "55555555-5555-5555-5555-555555555555";
const tokens = { tokO: OFFICER, tok1: M1, tok2: M2, tok3: M3, tok4: M4 };
const put = (col, id, data, uid) => docs.set(key(col, id), { col, id, uid: uid === undefined ? id : uid, data });
let stripeCalls = [], mails = [], subStatus = "active";
globalThis.fetch = async (url, opt = {}) => {
  url = String(url); const method = opt.method || "GET";
  const R = (o, st = 200) => new Response(JSON.stringify(o), { status: st });
  if (url.includes("/auth/v1/user")) { const t = (opt.headers.Authorization || "").replace("Bearer ", ""); return tokens[t] ? R({ id: tokens[t], email: t + "@school.edu" }) : R({}, 401); }
  if (url.includes("/auth/v1/admin/users/")) { const id = url.split("/").pop(); return R({ id, email: id.slice(0, 4) + "@school.edu", email_confirmed_at: "x" }); }
  if (url.startsWith("https://api.resend.com/emails")) { mails.push(JSON.parse(opt.body)); return R({ id: "m" }); }
  if (url.includes("/rest/v1/docs")) {
    if (method === "POST") { const j = JSON.parse(opt.body); docs.set(key(j.col, j.id), { col: j.col, id: j.id, uid: j.uid, data: j.data }); return R({}); }
    const q = new URL(url).searchParams; let rows = [...docs.values()];
    const eq = (p) => (q.get(p) || "").replace(/^eq\./, "");
    if (q.get("col")) rows = rows.filter((r) => r.col === eq("col"));
    if (q.get("id")) rows = rows.filter((r) => r.id === eq("id"));
    if (q.get("uid")) rows = rows.filter((r) => r.uid === eq("uid"));
    if (q.get("data->>club")) rows = rows.filter((r) => r.data.club === eq("data->>club"));
    if (q.get("data->>owner")) rows = rows.filter((r) => r.data.owner === eq("data->>owner"));
    return R(rows.map((r) => ({ id: r.id, data: r.data })));
  }
  if (url.startsWith("https://api.stripe.com")) {
    stripeCalls.push({ url, method, body: opt.body });
    if (url.endsWith("checkout/sessions")) return R({ url: "https://checkout.stripe.com/x" });
    if (url.includes("/subscriptions/")) return method === "GET" ? R({ status: subStatus, current_period_end: Math.floor(Date.now() / 1000) + 365 * 86400 }) : R({});
  }
  return R({}, 404);
};
const call = async (mod, body, tok) => (await import(mod)).default(new Request("http://x", { method: "POST", headers: tok ? { authorization: "Bearer " + tok } : {}, body: JSON.stringify(body) }));
const j = async (r) => ({ status: r.status, ...(await r.json()) });
const hook = async (ev) => { const raw = JSON.stringify(ev), t = Math.floor(Date.now() / 1000), sig = crypto.createHmac("sha256", "whsec_test_secret").update(`${t}.${raw}`).digest("hex");
  return (await import("../netlify/functions/stripe-webhook.mjs")).default(new Request("http://x", { method: "POST", headers: { "stripe-signature": `t=${t},v1=${sig}` }, body: raw })); };
const { tierOf, getBilling, reconcileClubBilling } = await import("../netlify/functions/_lib/common.mjs");
const CLUBS = "../netlify/functions/club.mjs", CHECKOUT = "../netlify/functions/checkout.mjs";
const claim = async (tok, code = "abc123") => j(await call(CLUBS, { action: "claim", code }, tok));
const rec = () => docs.get(key("clubs", "abc123")).data;
const billingClub = () => docs.get(key("clubbilling", "abc123")).data;

// The real club record (kept by club-admin.mjs): owner + 3 approved members. A player's own doc claiming the club proves nothing.
put("clubs", "abc123", { code: "abc123", name: "Fisher Finance", owner: OFFICER, sd: "school.edu", co: [], lock: false, ban: [], pending: [],
  members: { [OFFICER]: 1, [M1]: 1, [M2]: 1, [M3]: 1 }, t: 1, v: 1 }, null);
put("players", OFFICER, { club: "abc123", clubOfficer: true, clubName: "Fisher Finance" });
put("players", M4, { club: "abc123", clubOfficer: true }); // someone faking the officer flag in their own profile

// ---- checkout rules ----
const co1 = (b, tok) => j(call(CHECKOUT, { plan: "club", code: "abc123", ...b }, tok).then((r) => r));
assert.equal((await j(await call(CHECKOUT, { plan: "club", members: 40, code: "abc123" }, "tok1"))).status, 403, "non-owner blocked");
assert.equal((await j(await call(CHECKOUT, { plan: "club", members: 40, code: "abc123" }, "tok4"))).status, 403, "faked clubOfficer flag in own profile does not make you the owner (#5)");
assert.equal((await j(await call(CHECKOUT, { plan: "club", members: 40, code: "zzz999" }, "tokO"))).status, 400, "club not registered with the server");
assert.equal((await j(await call(CHECKOUT, { plan: "club", members: 600, code: "abc123" }, "tokO"))).status, 400, "over 500 = custom quote");
const co = await j(await call(CHECKOUT, { plan: "club", members: 40, code: "abc123" }, "tokO"));
assert.equal(co.status, 200); const body = new URLSearchParams(stripeCalls.at(-1).body);
assert.equal(body.get("line_items[0][price_data][unit_amount]"), "24000", "server prices 40 members at $240/month");
assert.equal(body.get("metadata[club]"), "abc123"); assert.equal(body.get("metadata[seats]"), "40");
assert.equal(body.get("mode"), "subscription"); assert.equal(body.get("line_items[0][price_data][recurring][interval]"), "month");
assert.ok(body.get("line_items[0][price_data][product_data][name]").includes("Fisher Finance"), "club name comes from the server record");
await call(CHECKOUT, { plan: "club", members: 40, amount: 1, code: "abc123" }, "tokO");
assert.equal(new URLSearchParams(stripeCalls.at(-1).body).get("line_items[0][price_data][unit_amount]"), "24000", "price can't be forced from the browser");

// ---- payment: officer gets Pro, one confirmation email, members still need a seat ----
const subMeta = { uid: OFFICER, plan: "club", club: "abc123", seats: "10" };
const paid = { type: "checkout.session.completed", data: { object: { client_reference_id: OFFICER, customer: "cus_1", subscription: "sub_1", mode: "subscription", metadata: subMeta } } };
assert.equal((await hook(paid)).status, 200);
assert.equal(tierOf(await getBilling(OFFICER)), "club"); assert.equal(billingClub().seats, 10); assert.equal(billingClub().owner, OFFICER); assert.equal(billingClub().name, "Fisher Finance");
assert.equal(tierOf(await getBilling(M1)), "free", "members need to claim");
assert.equal(mails.length, 1, "officer gets one email (#4)"); assert.equal(mails[0].to[0], "1111@school.edu");
assert.ok(mails[0].html.includes("ABC123") && mails[0].html.includes("Fisher Finance") && mails[0].html.includes("10 seats"), "email carries the club code, name and seats");
assert.ok(!("List-Unsubscribe" in (mails[0].headers || {})), "account email, not marketing");
await hook(paid); assert.equal(mails.length, 1, "a repeated webhook delivery does not send a second email");

// ---- claims come from the server's club record (#2) ----
assert.equal((await claim("tok1")).ok, true); assert.equal(tierOf(await getBilling(M1)), "club");
assert.equal((await claim("tok2", "zzz999")).reason, "not_registered", "unknown club");
assert.equal((await claim("tok4")).reason, "not_member", "a profile saying club=abc123 is not membership");
rec().pending = [M3]; delete rec().members[M3];
assert.equal((await claim("tok3")).reason, "pending", "waiting for approval: no seat"); assert.equal(tierOf(await getBilling(M3)), "free");
rec().pending = []; rec().members[M3] = 1;
// seats full
billingClub().seats = 2; // officer + M1
assert.equal((await claim("tok2")).reason, "full"); assert.equal(tierOf(await getBilling(M2)), "free");
// removed member: seat frees immediately when the officer acts (reconcile) and they cannot claim back
delete rec().members[M1]; rec().ban = [M1];
assert.deepEqual(await reconcileClubBilling(rec()), { dropped: 1, canceled: false });
assert.equal(tierOf(await getBilling(M1)), "free", "removed member loses Pro right away (#7)");
assert.equal((await claim("tok1")).reason, "not_member");
assert.equal((await claim("tok2")).ok, true, "freed seat can be taken"); assert.equal(tierOf(await getBilling(M2)), "club");
// a stale seat (list never got pruned) is revoked when they claim again
billingClub().members.push(M1); await (async () => { const b = (await getBilling(M1)) || {}; docs.set(key("billing", M1), { col: "billing", id: M1, uid: M1, data: { ...b, clubUntil: Date.now() + 1e9 } }); })();
billingClub().seats = 10;
assert.equal((await claim("tok1")).ok, false); assert.equal(tierOf(await getBilling(M1)), "free", "stale seat is cut off on claim");
// racing claims for the last seat both end up seated or cleanly refused, never silently over the limit
billingClub().seats = 3; // officer + M2 + one more
const [c3, c4] = await Promise.all([claim("tok3"), claim("tok4")]); // M4 isn't a member, so only M3 may win
assert.equal(c3.ok, true); assert.equal(c4.ok, false); assert.ok(billingClub().members.length <= 3);
assert.deepEqual([...billingClub().members].sort(), [OFFICER, M2, M3].sort());
billingClub().seats = 10;

// ---- officers choose who holds the seats ----
const seatCall = async (tok, uid, on) => j(await call(CLUBS, { action: "seat", code: "abc123", uid, on }, tok));
assert.equal((await j(await call(CLUBS, { action: "seats", code: "abc123" }, "tok2"))).status, 403, "a plain member can't see or change seats");
assert.equal((await seatCall("tok2", M3, false)).status, 403);
let sv = await j(await call(CLUBS, { action: "seats", code: "abc123" }, "tokO"));
assert.deepEqual([...sv.holders].sort(), [OFFICER, M2, M3].sort());
assert.equal((await seatCall("tokO", M3, false)).ok, true); assert.equal(tierOf(await getBilling(M3)), "free", "seat taken back");
assert.equal((await claim("tok3")).reason, "held", "a taken-back seat is not re-claimed automatically");
assert.equal((await seatCall("tokO", OFFICER, false)).reason, "payer", "the payer always keeps a seat");
billingClub().seats = 2;
assert.equal((await seatCall("tokO", M3, true)).reason, "full");
billingClub().seats = 10;
assert.equal((await seatCall("tokO", M3, true)).ok, true); assert.equal(tierOf(await getBilling(M3)), "club"); assert.deepEqual(billingClub().held, []);
assert.equal((await seatCall("tokO", M4, true)).reason, "not_member", "only approved members can be given a seat");

// ---- status ----
let st = await j(await call(CLUBS, { action: "status" }, "tokO"));
assert.equal(st.clubs[0].used, 3); assert.equal(st.clubs[0].canBill, true); assert.equal(st.clubs[0].owner, true); assert.equal(st.clubs[0].name, "Fisher Finance");

// ---- ownership transfer: new owner manages seats, payer keeps billing (#3) ----
rec().owner = M2; rec().co = [OFFICER];
assert.deepEqual(await reconcileClubBilling(rec()), { dropped: 0, canceled: false }); assert.equal(billingClub().owner, M2); assert.equal(billingClub().officer, OFFICER);
st = await j(await call(CLUBS, { action: "status" }, "tok2"));
assert.equal(st.clubs.length, 1); assert.equal(st.clubs[0].owner, true); assert.equal(st.clubs[0].canBill, false, "new owner cannot open the previous payer's Stripe account");
st = await j(await call(CLUBS, { action: "status" }, "tokO")); assert.equal(st.clubs[0].canBill, true); assert.equal(st.clubs[0].owner, false);
const portal = await (await import("../netlify/functions/portal.mjs")).default(new Request("http://x", { method: "POST", headers: { authorization: "Bearer tok2" }, body: "{}" }));
assert.equal(portal.status, 404, "portal is only for the person who pays");
assert.equal((await j(await call(CHECKOUT, { plan: "club", members: 20, code: "abc123" }, "tok2"))).status, 409, "new owner can't double-buy while the old plan runs");

// ---- disband: plan stops renewing, members lose seats, payer keeps the period they paid for (#3) ----
const before = stripeCalls.length;
rec().gone = true; rec().members = {}; rec().co = []; rec().pending = [];
const dis = await reconcileClubBilling(rec());
assert.deepEqual(dis, { dropped: 2, canceled: true }, "M2 and M3 dropped");
const cancelCall = stripeCalls.slice(before).find((c) => c.method === "POST" && c.url.endsWith("/subscriptions/sub_1"));
assert.ok(cancelCall && new URLSearchParams(cancelCall.body).get("cancel_at_period_end") === "true", "Stripe told to stop at period end");
assert.equal(billingClub().cancelAtEnd, true); assert.deepEqual(billingClub().members, [OFFICER]);
assert.equal(tierOf(await getBilling(M2)), "free"); assert.equal(tierOf(await getBilling(M3)), "free");
assert.equal(tierOf(await getBilling(OFFICER)), "club", "payer keeps access until the paid period ends");
assert.equal((await claim("tok2")).reason, "gone");
// Stripe's follow-up event must not hand seats back
await hook({ type: "customer.subscription.updated", data: { object: { id: "sub_1", status: "active", cancel_at_period_end: true, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400, metadata: subMeta } } });
assert.equal(tierOf(await getBilling(M2)), "free"); assert.equal(tierOf(await getBilling(OFFICER)), "club");
assert.deepEqual(await reconcileClubBilling(rec()), { dropped: 0, canceled: false }, "second run is a no-op (no repeat cancel)");
assert.equal((await j(await call(CHECKOUT, { plan: "club", members: 20, code: "abc123" }, "tokO"))).status, 400, "disbanded club can't be bought");
// cancellation removes the rest
await hook({ type: "customer.subscription.deleted", data: { object: { id: "sub_1", status: "canceled", metadata: subMeta } } });
assert.equal(tierOf(await getBilling(OFFICER)), "free");

// ---- failed Stripe cancel is reported, never silent ----
put("clubs", "fail01", { code: "fail01", name: "Fail Club", owner: OFFICER, co: [], ban: [], pending: [], members: { [OFFICER]: 1 }, t: 1, v: 1, gone: true }, null);
put("clubbilling", "fail01", { officer: OFFICER, owner: OFFICER, seats: 10, members: [OFFICER], status: "active", sub: "sub_f", until: Date.now() + 1e9 }, OFFICER);
const realFetch = globalThis.fetch; globalThis.fetch = async (u, o) => (String(u).includes("/subscriptions/sub_f") && o && o.method === "POST" ? new Response(JSON.stringify({ error: { message: "boom" } }), { status: 500 }) : realFetch(u, o));
const bad = await reconcileClubBilling(docs.get(key("clubs", "fail01")).data);
globalThis.fetch = realFetch;
assert.equal(bad.error, "cancel_failed"); assert.equal(docs.get(key("clubbilling", "fail01")).data.cancelAtEnd, false, "flag rolled back so a retry can cancel");

// ---- re-subscribing with fewer seats than old members (#6) + only real members come back ----
put("clubs", "def456", { code: "def456", name: "Small Club", owner: OFFICER, co: [], ban: [M4], pending: [], members: { [OFFICER]: 1, [M1]: 1, [M2]: 1, [M3]: 1 }, t: 1, v: 1 }, null);
put("clubbilling", "def456", { officer: OFFICER, owner: OFFICER, seats: 10, members: [OFFICER, M1, M2, M3, M4], status: "canceled", sub: "sub_old", until: 1 }, OFFICER);
await hook({ type: "checkout.session.completed", data: { object: { client_reference_id: OFFICER, customer: "cus_1", subscription: "sub_2", mode: "subscription", metadata: { uid: OFFICER, plan: "club", club: "def456", seats: "2" } } } });
const d = docs.get(key("clubbilling", "def456")).data;
assert.deepEqual(d.members, [OFFICER, M1], "capped at the 2 seats bought, banned M4 never comes back"); assert.equal(d.sub, "sub_2");
assert.equal(tierOf(await getBilling(M1)), "club"); assert.equal(tierOf(await getBilling(M2)), "free"); assert.equal(tierOf(await getBilling(M4)), "free");

// ---- delayed payment: no access until Stripe says active, then access + email ----
put("clubs", "late99", { code: "late99", name: "Late Club", owner: M4, co: [], ban: [], pending: [], members: { [M4]: 1 }, t: 1, v: 1 }, null);
const mailsBefore = mails.length; subStatus = "incomplete";
const lateMeta = { uid: M4, plan: "club", club: "late99", seats: "10" };
await hook({ type: "checkout.session.completed", data: { object: { client_reference_id: M4, customer: "cus_9", subscription: "sub_9", mode: "subscription", metadata: lateMeta } } });
assert.equal(docs.get(key("clubbilling", "late99")).data.status, "incomplete"); assert.equal(mails.length, mailsBefore, "no email before payment is confirmed");
assert.equal(tierOf(await getBilling(M4)), "free", "unpaid delayed payment grants nothing yet");
subStatus = "active";
await hook({ type: "customer.subscription.updated", data: { object: { id: "sub_9", status: "active", current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400, metadata: lateMeta } } });
assert.equal(tierOf(await getBilling(M4)), "club"); assert.equal(mails.length, mailsBefore + 1, "email goes out once it activates");
await hook({ type: "customer.subscription.updated", data: { object: { id: "sub_9", status: "active", current_period_end: Math.floor(Date.now() / 1000) + 31 * 86400, metadata: lateMeta } } });
assert.equal(mails.length, mailsBefore + 1, "renewals don't re-send it");
console.log("club tests passed");
