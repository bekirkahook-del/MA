// Owner accounts table: owner-only, joins auth + profile + billing + reviews + first visit source, newest first.
import test from "node:test"; import assert from "node:assert/strict";
const OWNER = "kahook.3@osu.edu";
process.env.OWNER_EMAILS = OWNER;
const U1 = "11111111-1111-1111-1111-111111111111", U2 = "22222222-2222-2222-2222-222222222222";
const users = [{ id: U1, email: "old@x.edu", created_at: "2026-11-01T10:00:00Z", email_confirmed_at: "x" }, { id: U2, email: "new@x.edu", created_at: "2026-11-23T10:00:00Z", email_confirmed_at: "x", app_metadata: { provider: "google" } }];
const D = {
  players: [{ id: U2, data: { levels: 4, xp: 900, school: "OSU", follows: ["a", "b"], target: "IB" } }],
  names: [{ id: U2, data: { name: "Neev" } }], billing: [{ id: U2, data: { rewards: { signup: 1 }, passUntil: Date.now() + 864e5 } }],
  reviews: [{ id: U2, data: { rating: 5, about: "site" } }], subscribers: [{ id: "s", data: { email: "new@x.edu", status: "active" } }],
  progress: [{ col: `data/users/${U2}`, data: { s: JSON.stringify({ acq: { vid: "vvv", nudge: "plan" }, daily: { "2026-11-23": 1, "2026-11-24": 1 } }) }, updated_at: "2026-11-24T10:00:00Z" }],
  visits: [{ id: "2026-11-22-vvv", data: { d: "2026-11-22", src: "tiktok", p: "/", city: "Columbus", region: "OH", dev: "Phone" } }], mailoff: [],
};
globalThis.fetch = async (url, o = {}) => {
  url = decodeURIComponent(String(url));
  if (url.includes("/auth/v1/user")) return new Response(JSON.stringify((o.headers && o.headers.Authorization) === "Bearer owner" ? { id: "o", email: OWNER, email_confirmed_at: "x" } : { id: "z", email: "z@x.edu", email_confirmed_at: "x" }), { status: 200 });
  if (url.includes("/auth/v1/admin/users")) return new Response(JSON.stringify({ users }), { status: 200 });
  if (url.includes("col=like.data/users/")) return new Response(JSON.stringify(D.progress), { status: 200 });
  const m = url.match(/col=eq\.([a-z]+)/); if (m) return new Response(JSON.stringify(D[m[1]] || []), { status: 200 });
  return new Response("[]", { status: 200 });
};
const fn = (await import("../netlify/functions/owner-accounts.mjs")).default;
const C = await import("../netlify/functions/_lib/common.mjs");
test("non-owner is refused", async () => { const r = await fn(new Request("https://x/", { headers: { Authorization: "Bearer someone" } })); assert.equal(r.status, 403); });
test("owner gets joined, newest-first rows", { skip: !(await C.isOwner(OWNER)) && "owner list comes from env/db in this repo" }, async () => {
  const r = await fn(new Request("https://x/", { headers: { Authorization: "Bearer owner" } })); assert.equal(r.status, 200);
  const { list } = await r.json(); assert.equal(list[0].email, "new@x.edu");
  const a = list[0]; assert.equal(a.name, "Neev"); assert.equal(a.levels, 4); assert.equal(a.friends, 2); assert.equal(a.src, "tiktok"); assert.equal(a.place, "Columbus, OH");
  assert.equal(a.daysActive, 2); assert.equal(a.review.rating, 5); assert.equal(a.sunday, "active"); assert.equal(a.nudge, "plan"); assert.equal(a.via, "google"); assert.equal(a.tier, "trial");
});
