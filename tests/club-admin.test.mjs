// End-to-end check of club-admin.mjs against an in-memory fake of Supabase (auth + docs REST).
import assert from "node:assert";
const users = { tokA: { id: "00000000-0000-0000-0000-00000000000a", email: "a@osu.edu", email_confirmed_at: "x" },
  tokB: { id: "00000000-0000-0000-0000-00000000000b", email: "b@osu.edu", email_confirmed_at: "x" },
  tokC: { id: "00000000-0000-0000-0000-00000000000c", email: "c@gmail.com", email_confirmed_at: "x" },
  tokD: { id: "00000000-0000-0000-0000-00000000000d", email: "d@osu.edu" } }; // signed up, email NOT confirmed
const docs = new Map(); // "col/id" -> {col,id,uid,data}
docs.set("players/" + users.tokA.id, { col: "players", id: users.tokA.id, data: { club: "oldone", clubOfficer: true } });
const R = (b, s = 200) => ({ ok: s < 300, status: s, json: async () => b, text: async () => JSON.stringify(b) });
globalThis.fetch = async (url, o = {}) => {
  const u = new URL(url), m = o.method || "GET";
  if (u.pathname === "/auth/v1/user") { const t = (o.headers.Authorization || "").replace("Bearer ", ""); return users[t] ? R(users[t]) : R({}, 401); }
  const q = {}; for (const [k, v] of u.searchParams) q[k] = v;
  const col = (q.col || "").replace("eq.", ""), idq = (q.id || "").replace("eq.", "");
  const match = d => { for (const [k, v] of Object.entries(q)) { if (k.startsWith("data->>")) { const f = k.slice(7), want = v.replace("eq.", ""), val = d.data[f];
      if (v === "is.null" ? val != null : (v.startsWith("eq.") && String(val) !== want)) return false; } } return d.col === col && (!idq || d.id === idq); };
  if (m === "GET") { const out = [...docs.values()].filter(match).map(d => ({ id: d.id, data: d.data })); return R(out); }
  if (m === "POST") { const b = JSON.parse(o.body), k = b.col + "/" + b.id; if (docs.has(k)) return R([]); docs.set(k, b); return R([b]); }
  if (m === "PATCH") { const b = JSON.parse(o.body), hit = [...docs.values()].filter(match); hit.forEach(d => d.data = b.data); return R(hit); }
  return R({}, 404);
};
const { default: h } = await import("../netlify/functions/club-admin.mjs");
const call = async (tok, body) => { const r = await h(new Request("http://x/", { method: "POST", headers: { authorization: "Bearer " + tok }, body: JSON.stringify(body) })); return { s: r.status, j: await r.json() }; };

let r = await call("bad", { action: "get", code: "abc123" }); assert.equal(r.s, 401);
r = await call("tokA", { action: "create", name: "Buckeye Capital" }); assert.equal(r.s, 200); const code = r.j.club.code;
assert.equal(r.j.club.sd, "osu.edu"); assert(r.j.club.me.owner);
// legacy club: only the officer in the caller's player doc can register it
r = await call("tokB", { action: "create", name: "Stolen", code: "oldone" }); assert.equal(r.s, 403);
r = await call("tokA", { action: "create", name: "Old Club", code: "oldone" }); assert.equal(r.s, 200); assert.equal(r.j.club.code, "oldone");
r = await call("tokA", { action: "create", name: "Again", code: "oldone" }); assert.equal(r.s, 409);
// join / list / approval / remove / banned rejoin
r = await call("tokB", { action: "join", code }); assert.equal(r.s, 200); assert(r.j.club.me.member);
r = await call("tokD", { action: "join", code }); assert.equal(r.s, 403); assert.equal(r.j.needEmail, true); // unconfirmed email can't join
r = await call("tokD", { action: "create", name: "Nope Club" }); assert.equal(r.s, 403);
r = await call("tokC", { action: "join", code }); assert.equal(r.s, 200); assert(r.j.club.me.member); // any confirmed email can join (non-.edu too)
r = await call("tokC", { action: "leave", code }); assert.equal(r.s, 200);
r = await call("tokB", { action: "list" }); assert.equal(r.j.sd, "osu.edu"); assert(r.j.clubs.some(c => c.code === code));
r = await call("tokC", { action: "list" }); assert.deepEqual(r.j.clubs, []); // non-.edu: no school clubs
r = await call("tokB", { action: "remove", code, id: users.tokA.id }); assert.equal(r.s, 403);
r = await call("tokB", { action: "lock", code, on: true }); assert.equal(r.s, 403);
r = await call("tokA", { action: "remove", code, id: users.tokB.id }); assert.equal(r.s, 200);
r = await call("tokB", { action: "join", code }); assert.equal(r.s, 403); assert.equal(r.j.banned, true);
r = await call("tokA", { action: "get", code }); assert.deepEqual(r.j.club.ban, [users.tokB.id]);
r = await call("tokC", { action: "get", code }); assert.equal(r.j.club.ban, undefined); // outsiders don't see officer lists
r = await call("tokA", { action: "get", code: "nope22" }); assert.equal(r.s, 404); assert.equal(r.j.unregistered, true);
r = await call("tokA", { action: "disband", code }); assert.equal(r.j.club.gone, true);
console.log("club-admin tests ok");
