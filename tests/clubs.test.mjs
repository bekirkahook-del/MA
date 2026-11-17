import assert from "node:assert";
import { make, apply, view, eduDomain, ClubErr, cleanName } from "../netlify/functions/_lib/clubs.mjs";
const id = n => "00000000-0000-0000-0000-" + String(n).padStart(12, "0");
const [OWN, CO, A, B, X] = [1, 2, 3, 4, 5].map(id);
const throws = (fn, status) => { try { fn(); } catch (e) { assert(e instanceof ClubErr, "ClubErr expected"); assert.equal(e.status, status, e.message); return e; } assert.fail("should throw " + status); };
let t = 1000, c = make("Buckeye Capital", "abc123", OWN, "osu.edu", t);

// school domain only comes from a CONFIRMED .edu email
assert.equal(eduDomain({ email: "kahook.3@osu.edu", email_confirmed_at: "x" }), "osu.edu");
assert.equal(eduDomain({ email: "a@business.osu.edu", email_confirmed_at: "x" }), "osu.edu");
assert.equal(eduDomain({ email: "kahook.3@osu.edu" }), "");
assert.equal(eduDomain({ email: "me@gmail.com", email_confirmed_at: "x" }), "");
assert.equal(cleanName("  <b>Hi</b>\n club "), "b Hi /b club");
throws(() => make("ab", "abc123", OWN, "", t), 400);

// open club: anyone joins; non-officers can't moderate
c = apply(c, "join", A, {}, ++t); assert(c.members[A]);
throws(() => apply(c, "remove", A, { id: id(9) }, ++t), 403);
throws(() => apply(c, "lock", A, { on: true }, ++t), 403);
throws(() => apply(c, "co", A, { id: A }, ++t), 403);

// approval mode: joiners wait, officers approve, others can't
c = apply(c, "lock", OWN, { on: true }, ++t);
c = apply(c, "join", B, {}, ++t); assert(!c.members[B]); assert(c.pending.includes(B));
assert.equal(view(c, A).pending, undefined); // members never see the pending list
assert.deepEqual(view(c, OWN).pending, [B]);
throws(() => apply(c, "approve", A, { id: B }, ++t), 403);
c = apply(c, "approve", OWN, { id: B }, ++t); assert(c.members[B]);

// co-officer can approve and remove members, but not the owner, not another co-officer, not settings
c = apply(c, "join", CO, {}, ++t); c = apply(c, "approve", OWN, { id: CO }, ++t);
c = apply(c, "co", OWN, { id: CO, on: true }, ++t); assert(c.co.includes(CO));
c = apply(c, "join", X, {}, ++t); c = apply(c, "approve", CO, { id: X }, ++t); assert(c.members[X]);
throws(() => apply(c, "remove", CO, { id: OWN }, ++t), 403);
throws(() => apply(c, "rename", CO, { name: "Mine now" }, ++t), 403);
throws(() => apply(c, "lock", CO, { on: false }, ++t), 403);
throws(() => apply(c, "transfer", CO, { id: CO }, ++t), 403);

// removing = ban: gone from members, can't rejoin even with the code, can be allowed back
c = apply(c, "remove", CO, { id: X }, ++t); assert(!c.members[X]); assert(c.ban.includes(X));
const e = throws(() => apply(c, "join", X, {}, ++t), 403); assert.equal(e.extra.banned, true);
c = apply(c, "unban", OWN, { id: X }, ++t); c = apply(c, "join", X, {}, ++t); assert(c.pending.includes(X)); // approval still on
assert.equal(view(c, X).me.pending, true);

// co-officer can't be removed by another co-officer, owner can
c = apply(c, "approve", OWN, { id: X }, ++t); c = apply(c, "co", OWN, { id: X, on: true }, ++t);
throws(() => apply(c, "remove", CO, { id: X }, ++t), 403);
c = apply(c, "remove", OWN, { id: X }, ++t); assert(!c.co.includes(X));

// turning approval off lets the waiting people in
c = apply(c, "unban", OWN, { id: X }, ++t); c = apply(c, "join", X, {}, ++t);
c = apply(c, "lock", OWN, { on: false }, ++t); assert(c.members[X]); assert.equal(c.pending.length, 0);

// rename; only members can be co-officers
c = apply(c, "rename", OWN, { name: "Buckeye Capital Investors" }, ++t); assert.equal(c.name, "Buckeye Capital Investors");
throws(() => apply(c, "co", OWN, { id: id(99), on: true }, ++t), 404);

// owner leaving: with a co-officer ownership passes on; with members and no co-officer it's refused
const c2 = apply(c, "leave", OWN, {}, ++t); assert.equal(c2.owner, CO); assert(!c2.members[OWN]);
let noCo = apply(c, "co", OWN, { id: CO, on: false }, ++t);
throws(() => apply(noCo, "leave", OWN, {}, ++t), 409);
// transfer
c = apply(c, "transfer", OWN, { id: A }, ++t); assert.equal(c.owner, A); assert(c.co.includes(OWN));
throws(() => apply(c, "lock", OWN, { on: true }, ++t), 403);
// last person leaving disbands; disbanded clubs can't be joined (code stays reserved)
let solo = make("Solo Club", "solo11", OWN, "", t); solo = apply(solo, "leave", OWN, {}, ++t); assert(solo.gone);
throws(() => apply(solo, "join", A, {}, ++t), 410);
assert.deepEqual(view(solo, A), { code: "solo11", gone: true });
c = apply(c, "disband", A, {}, ++t); assert(c.gone); throws(() => apply(c, "join", B, {}, ++t), 410);

// every change bumps the version (used for compare-and-swap)
const v0 = make("Version Club", "vers11", OWN, "", t); assert.equal(apply(v0, "join", A, {}, ++t).v, v0.v + 1);
console.log("clubs tests ok");
