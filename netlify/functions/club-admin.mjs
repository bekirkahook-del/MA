// Server-side clubs. The browser can no longer decide who is a member, officer or banned: this function does,
// using the caller's verified sign-in. Club docs (col "clubs") have uid null, so only this service-role code writes them.
// POST {action, code?, id?, name?, on?} + Authorization: Bearer <token>
//   create (name [, code to register an older club]) | join | leave | get | list | approve | decline | remove | unban | rename | lock | co | transfer | disband
import { json, getUser, SB_URL, reconcileClubBilling } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";
import { ClubErr, CODE_RE, MAX, apply, cleanName, eduDomain, emailConfirmed, make, newCode, view } from "./_lib/clubs.mjs";

const H = () => svc();
async function getClub(code) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.clubs&id=eq.${code}&select=data`, { headers: H() });
  const rows = r.ok ? await r.json() : null;
  if (rows === null) throw new ClubErr(502, "Database unavailable");
  return rows[0] ? rows[0].data : null;
}
async function insertClub(club) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...H(), Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({ col: "clubs", id: club.code, uid: null, data: club, updated_at: new Date().toISOString() }) });
  if (!r.ok) throw new ClubErr(502, "Couldn't save the club");
  return (await r.json()).length > 0;
}
// Compare-and-swap on the version so two officers acting at once can't overwrite each other.
async function saveClub(prev, next) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.clubs&id=eq.${prev.code}&data->>v=eq.${prev.v}`, { method: "PATCH", headers: { ...H(), Prefer: "return=representation" },
    body: JSON.stringify({ data: next, updated_at: new Date().toISOString() }) });
  if (!r.ok) throw new ClubErr(502, "Couldn't save the club");
  return (await r.json()).length > 0;
}
async function rows(q) { const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.clubs&${q}`, { headers: H() }); return r.ok ? r.json() : []; }

async function ownsLegacy(uid, code) { // an older, browser-only club: the caller's own player doc must say they run it
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.players&id=eq.${uid}&select=data`, { headers: H() });
  const d = r.ok ? ((await r.json())[0] || {}).data : null;
  return !!(d && d.club === code && d.clubOfficer);
}

// An email counts as proven once the person has signed in through a link sent to it (sign-up auto-confirms, so a typed
// address alone proves nothing). Remembered per account in docs col "verified_email".
async function verifiedEmail(me, req) {
  const em = String(me.email || "").toLowerCase();
  const got = await fetch(`${SB_URL}/rest/v1/docs?col=eq.verified_email&id=eq.${me.id}&select=data`, { headers: H() }).then(r => r.ok ? r.json() : []).catch(() => []);
  if (got[0] && got[0].data && got[0].data.email === em) return em;
  let amr = [];
  try { const t = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").split(".")[1]; amr = (JSON.parse(Buffer.from(t, "base64url").toString()).amr || []).map(x => x.method); } catch (e) {}
  if (!amr.some(m => ["otp", "magiclink", "recovery", "email/signup", "invite"].includes(m))) return "";
  await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...H(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "verified_email", id: me.id, uid: null, data: { email: em, at: new Date().toISOString() }, updated_at: new Date().toISOString() }) }).catch(() => {});
  return em;
}
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const me = await getUser(req);
  if (!me || !me.id) return json(401, { error: "Sign in first" });
  let b = {}; try { b = await req.json(); } catch (e) {}
  const action = String(b.action || ""), code = String(b.code || "").toLowerCase(), now = Date.now();
  try {
    if ((action === "join" || action === "create") && !emailConfirmed(me)) throw new ClubErr(403, "Confirm your email first. Check your inbox for the link, then try again.", { needEmail: true });
    if (action === "list") { // clubs at the caller's verified school
      const sd = eduDomain(me);
      if (!sd) return json(200, { clubs: [], sd: "" });
      const rs = await rows(`data->>sd=eq.${encodeURIComponent(sd)}&data->>gone=is.null&select=data&limit=100`);
      return json(200, { sd, clubs: rs.map(x => x.data).map(c => ({ code: c.code, name: c.name, members: Object.keys(c.members || {}).length, lock: !!c.lock })) });
    }
    if (action === "create") {
      const mine = await rows(`data->>owner=eq.${me.id}&data->>gone=is.null&select=id&limit=10`);
      if (mine.length >= MAX.clubsPerUser) throw new ClubErr(429, "You already run " + MAX.clubsPerUser + " clubs");
      const legacy = CODE_RE.test(code);
      if (legacy && !(await ownsLegacy(me.id, code))) throw new ClubErr(403, "Only the club's officer can register it");
      for (let i = 0; i < 5; i++) {
        const club = make(cleanName(b.name), legacy ? code : newCode(), me.id, eduDomain(me), now);
        if (await insertClub(club)) return json(200, { club: view(club, me.id) });
        if (legacy) { const ex = await getClub(code); return json(409, { error: "That club is already registered", club: view(ex, me.id) }); }
      }
      throw new ClubErr(503, "Try again");
    }
    if (!CODE_RE.test(code)) throw new ClubErr(400, "Bad club code");
    for (let i = 0; i < 4; i++) {
      const club = await getClub(code);
      if (!club) throw new ClubErr(404, "Club not found. Ask the officer to open M&A Prep once so it shows up.", { unregistered: true });
      if (action === "get") return json(200, { club: view(club, me.id) });
      if (action === "join") { delete b._verifiedEmail; b._email = me.email; if (club.req) b._verifiedEmail = await verifiedEmail(me, req); }
      const next = apply(club, action, me.id, b, now);
      if (await saveClub(club, next)) {
        // These actions can change who holds a paid seat or who owns/pays for the club plan: keep the plan in step (never throws).
        if (["remove", "leave", "transfer", "disband"].includes(action)) {
          const billing = await reconcileClubBilling(next);
          if (billing.canceled || billing.error || billing.dropped) return json(200, { club: view(next, me.id), billing });
        }
        return json(200, { club: view(next, me.id) });
      }
    }
    throw new ClubErr(409, "Busy, try again");
  } catch (e) {
    if (e instanceof ClubErr) return json(e.status, { error: e.message, ...e.extra });
    return json(500, { error: "Something went wrong" });
  }
};
