// Review email: recipients are filtered correctly, the email matches the real reward rules, unsubscribe works.
import test from "node:test"; import assert from "node:assert/strict";
process.env.RATE_LIMIT_SALT = "t"; process.env.MAIL_ADDRESS = "123 Test St, Columbus OH"; process.env.RESEND_API_KEY = "re_x";
const U = i => `00000000-0000-0000-0000-00000000000${i}`;
const users = [
  { id: U(1), email: "a@osu.edu", email_confirmed_at: "x" },          // gets it, 0 levels
  { id: U(2), email: "b@osu.edu", email_confirmed_at: "x" },          // already reviewed
  { id: U(3), email: "c@osu.edu" },                                   // unconfirmed
  { id: U(4), email: "d@osu.edu", email_confirmed_at: "x" },          // opted out via promo-unsub
  { id: U(5), email: "E@osu.edu", email_confirmed_at: "x" },          // unsubscribed from Sunday email
  { id: U(6), email: "f@osu.edu", email_confirmed_at: "x" },          // already sent
  { id: U(7), email: "g@osu.edu", email_confirmed_at: "x" },          // gets it, 5 levels
];
const DOCS = { reviews: [{ id: U(2) }], mailoff: [{ id: U(4), data: { promo: true } }], subscribers: [{ id: "x", data: { status: "unsub", email: "e@osu.edu" } }],
  promolog: [{ id: `review-day-1:${U(6)}` }], players: [{ id: U(7), data: { levels: 5 } }] };
const writes = [], sends = [];
globalThis.fetch = async (url, o = {}) => {
  url = String(url);
  if (url.includes("/auth/v1/admin/users")) return new Response(JSON.stringify({ users }), { status: 200 });
  if (url.includes("/rest/v1/docs") && (!o.method || o.method === "GET")) { const col = decodeURIComponent(url.match(/col=eq\.([^&]+)/)[1]); return new Response(JSON.stringify(DOCS[col] || []), { status: 200 }); }
  if (url.includes("/rest/v1/docs")) { writes.push(JSON.parse(o.body)); return new Response("", { status: 201 }); }
  if (url.includes("resend.com")) { sends.push(JSON.parse(o.body)); return new Response("{}", { status: 200 }); }
  throw new Error("unexpected " + url);
};
const M = await import("../netlify/functions/_lib/reviewmail.mjs");
test("recipients skip reviewed, unconfirmed, opted-out, unsubscribed and already-sent", async () => {
  const { list, skip } = await M.recipients();
  assert.deepEqual(list.map(r => r.uid).sort(), [U(1), U(7)]);
  assert.deepEqual(skip, { unconfirmed: 1, reviewed: 1, optedOut: 2, alreadySent: 1, banned: 0 });
});
test("email states the real rules and has unsubscribe + postal address", () => {
  const a = M.build({ uid: U(1), email: "a@osu.edu", levels: 0 }).html, b = M.build({ uid: U(7), email: "g@osu.edu", levels: 5 }).html;
  assert.match(a, /any rating counts/i); assert.match(a, /3 to go/); assert.match(b, /already cleared 3 levels/);
  assert.match(a, /#review/); assert.match(a, /promo-unsub\?u=/); assert.match(a, /123 Test St/);
});
test("sends with one-click unsubscribe headers and logs each send", async () => {
  await M.sendBatch([{ uid: U(1), email: "a@osu.edu", levels: 0 }]); await M.markSent(U(1));
  assert.equal(sends.length, 1); assert.equal(sends[0][0].headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  assert.ok(writes.some(w => w.col === "promolog" && w.id === `review-day-1:${U(1)}`));
});
test("unsubscribe link: valid token works, forged token doesn't", async () => {
  const un = (await import("../netlify/functions/promo-unsub.mjs")).default;
  const ok = await (await un(new Request(M.unsubUrl(U(1))))).text();
  assert.match(ok, /You're unsubscribed/); assert.ok(writes.some(w => w.col === "mailoff" && w.id === U(1)));
  const bad = await (await un(new Request(`https://x/?u=${U(1)}&t=${"0".repeat(32)}`))).text();
  assert.match(bad, /isn't valid/);
});
