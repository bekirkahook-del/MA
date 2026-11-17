// Run: node tests/club.test.mjs   (no network: Supabase + Stripe are faked in memory)
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
process.env.STRIPE_SECRET_KEY = "sk_test_x"; process.env.SUPABASE_SERVICE_ROLE_KEY = "sbsecret"; process.env.STRIPE_WEBHOOK_SECRET = "whsec_t";
const { clubQuote } = await import("../netlify/functions/_lib/clubprice.mjs");

// 1. price table
const cents = (n) => clubQuote(n).totalCents;
assert.equal(cents(1), 11000); assert.equal(cents(10), 11000);           // minimum 10 seats
assert.equal(cents(25), 27500); assert.equal(cents(40), 27500 + 15 * 900); // $410
assert.equal(cents(75), 27500 + 50 * 900); assert.equal(cents(200), 27500 + 45000 + 125 * 700);
assert.equal(cents(500), 27500 + 45000 + 87500 + 300 * 500);
assert.equal(clubQuote(501).contact, true); assert.equal(clubQuote(0).ok, false); assert.equal(clubQuote("abc").ok, false);
for (let n = 1; n < 500; n++) assert.ok(cents(n + 1) >= cents(n), "price never drops when a member is added: " + n);

// 2. browser copy of the formula matches the server's
const src = fs.readFileSync(new URL("../js/rewards.js", import.meta.url), "utf8");
const a = src.indexOf("const CLUB_TIERS"), b = src.indexOf("window.maClubQuote_calc");
const clientQuote = new Function(src.slice(a, b) + "; return clubQuote;")();
for (const n of [-1, 0, 1, 9, 10, 11, 25, 26, 40, 75, 76, 200, 201, 499, 500, 501, 1000]) {
  const s = clubQuote(n), c = clientQuote(n);
  assert.equal(c.ok, s.ok, "ok " + n); if (s.ok) { assert.equal(c.totalCents, s.totalCents, "total " + n); assert.equal(c.seats, s.seats); }
}

// 3. fake Supabase + Stripe
const docs = new Map(); const key = (c, i) => c + "|" + i;
const OFFICER = "11111111-1111-1111-1111-111111111111", M1 = "22222222-2222-2222-2222-222222222222", M2 = "33333333-3333-3333-3333-333333333333", M3 = "44444444-4444-4444-4444-444444444444";
const tokens = { tokO: OFFICER, tok1: M1, tok2: M2, tok3: M3 };
const put = (col, id, data, uid) => docs.set(key(col, id), { col, id, uid: uid || id, data });
let stripeCalls = [];
globalThis.fetch = async (url, opt = {}) => {
  url = String(url); const method = opt.method || "GET";
  const R = (o, st = 200) => new Response(JSON.stringify(o), { status: st });
  if (url.includes("/auth/v1/user")) { const t = (opt.headers.Authorization || "").replace("Bearer ", ""); return tokens[t] ? R({ id: tokens[t], email: t + "@school.edu" }) : R({}, 401); }
  if (url.includes("/rest/v1/docs")) {
    if (method === "POST") { const j = JSON.parse(opt.body); docs.set(key(j.col, j.id), { col: j.col, id: j.id, uid: j.uid, data: j.data }); return R({}); }
    const q = new URL(url).searchParams; let rows = [...docs.values()];
    const eq = (p) => (q.get(p) || "").replace(/^eq\./, "");
    if (q.get("col")) rows = rows.filter((r) => r.col === eq("col"));
    if (q.get("id")) rows = rows.filter((r) => r.id === eq("id"));
    if (q.get("uid")) rows = rows.filter((r) => r.uid === eq("uid"));
    if (q.get("data->>club")) rows = rows.filter((r) => r.data.club === eq("data->>club"));
    return R(rows.map((r) => ({ id: r.id, data: r.data })));
  }
  if (url.startsWith("https://api.stripe.com")) {
    stripeCalls.push({ url, method, body: opt.body });
    if (url.endsWith("checkout/sessions")) return R({ url: "https://checkout.stripe.com/x" });
    if (url.includes("/subscriptions/")) return R({ status: "active", current_period_end: Math.floor(Date.now() / 1000) + 365 * 86400 });
  }
  return R({}, 404);
};
const call = async (mod, body, tok) => (await import(mod)).default(new Request("http://x", { method: "POST", headers: tok ? { authorization: "Bearer " + tok } : {}, body: JSON.stringify(body) }));
const j = async (r) => ({ status: r.status, ...(await r.json()) });
const hook = async (ev) => { const raw = JSON.stringify(ev), t = Math.floor(Date.now() / 1000), sig = crypto.createHmac("sha256", "whsec_t").update(`${t}.${raw}`).digest("hex");
  return (await import("../netlify/functions/stripe-webhook.mjs")).default(new Request("http://x", { method: "POST", headers: { "stripe-signature": `t=${t},v1=${sig}` }, body: raw })); };

put("players", OFFICER, { club: "abc123", clubOfficer: true, clubName: "Fisher Finance" });
put("players", M1, { club: "abc123" }); put("players", M2, { club: "abc123" }); put("players", M3, { club: "abc123" });

// checkout rules
assert.equal((await j(await call("../netlify/functions/checkout.mjs", { plan: "club", members: 40, code: "abc123" }, "tok1"))).status, 403, "non-officer blocked");
assert.equal((await j(await call("../netlify/functions/checkout.mjs", { plan: "club", members: 600, code: "abc123" }, "tokO"))).status, 400, "over 500 = custom quote");
const co = await j(await call("../netlify/functions/checkout.mjs", { plan: "club", members: 40, code: "abc123" }, "tokO"));
assert.equal(co.status, 200); const body = new URLSearchParams(stripeCalls.at(-1).body);
assert.equal(body.get("line_items[0][price_data][unit_amount]"), "41000", "server prices 40 members at $410");
assert.equal(body.get("metadata[club]"), "abc123"); assert.equal(body.get("metadata[seats]"), "40");
assert.equal(body.get("mode"), "subscription"); assert.equal(body.get("line_items[0][price_data][recurring][interval]"), "year");
// price can't be forced from the browser
await call("../netlify/functions/checkout.mjs", { plan: "club", members: 40, amount: 1, code: "abc123" }, "tokO");
assert.equal(new URLSearchParams(stripeCalls.at(-1).body).get("line_items[0][price_data][unit_amount]"), "41000");

// payment -> officer gets a seat + Pro
const subMeta = { uid: OFFICER, plan: "club", club: "abc123", seats: "10" };
await hook({ type: "checkout.session.completed", data: { object: { client_reference_id: OFFICER, customer: "cus_1", subscription: "sub_1", mode: "subscription", metadata: subMeta } } });
const { tierOf, getBilling } = await import("../netlify/functions/_lib/common.mjs");
assert.equal(tierOf(await getBilling(OFFICER)), "pro"); assert.equal(docs.get(key("clubbilling", "abc123")).data.seats, 10);
assert.equal(tierOf(await getBilling(M1)), "free", "members need to claim");

// members claim: 10 seats, officer + 9 more
assert.equal((await j(await call("../netlify/functions/club.mjs", { action: "claim", code: "abc123" }, "tok1"))).ok, true);
assert.equal(tierOf(await getBilling(M1)), "pro");
assert.equal((await j(await call("../netlify/functions/club.mjs", { action: "claim", code: "zzz999" }, "tok2"))).ok, false, "wrong code");
// seats full
const c = docs.get(key("clubbilling", "abc123")).data; c.seats = 2; // officer + M1 = 2
assert.equal((await j(await call("../netlify/functions/club.mjs", { action: "claim", code: "abc123" }, "tok2"))).reason, "full");
assert.equal(tierOf(await getBilling(M2)), "free");
// M1 leaves the club -> seat frees -> M2 can claim
put("players", M1, {});
assert.equal((await j(await call("../netlify/functions/club.mjs", { action: "claim", code: "abc123" }, "tok2"))).ok, true);
assert.equal(tierOf(await getBilling(M1)), "free", "left member loses Pro"); assert.equal(tierOf(await getBilling(M2)), "pro");
// status
const st = await j(await call("../netlify/functions/club.mjs", { action: "status" }, "tokO"));
assert.equal(st.clubs[0].used, 2); assert.equal(st.clubs[0].seats, 2);
// squatting: a different user can't buy an active club's code
put("players", M3, { club: "abc123", clubOfficer: true });
assert.equal((await j(await call("../netlify/functions/checkout.mjs", { plan: "club", members: 20, code: "abc123" }, "tok3"))).status, 409);
// cancellation removes everyone
await hook({ type: "customer.subscription.deleted", data: { object: { id: "sub_1", status: "canceled", metadata: subMeta } } });
assert.equal(tierOf(await getBilling(OFFICER)), "free"); assert.equal(tierOf(await getBilling(M2)), "free");
console.log("club tests passed");
