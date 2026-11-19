// Club plan seats. POST { action }
//   quote  { members }  -> price for N members (no sign-in needed)
//   claim  { code }     -> an approved member of a paid club takes a seat
//   seats  { code }     -> an officer sees who holds a seat
//   seat   { code, uid, on } -> an officer gives or takes back one member's seat
//   status              -> the club's owner (and whoever pays) sees seats used, renewal date and billing access
// Who counts as a member comes from the club record kept by club-admin.mjs (col "clubs"), never from a player's own doc.
import { json, getUser, UUID, getClub, setClub, clubsOfUser, clubActive, setMemberAccess, clubCodeOk, rebuildProList, getClubRec, clubMemberOk } from "./_lib/common.mjs";
import { clubQuote } from "./_lib/clubprice.mjs";

// Drops seat holders who are no longer approved members (left, removed, disbanded) and frees their seats.
// The payer keeps a seat on a disbanded club until the period they paid for ends.
async function prune(code, club, rec) {
  if (!rec) return club; // club not registered with club-admin: nothing to compare against, change nothing
  const keep = (club.members || []).filter((u) => (rec.gone ? u === club.officer : clubMemberOk(rec, u)));
  const gone = (club.members || []).filter((u) => !keep.includes(u));
  if (gone.length) { club.members = keep; await setClub(code, club); await setMemberAccess(gone, 0); }
  return club;
}

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const body = await req.json().catch(() => ({}));
  if (body.action === "quote") return json(200, clubQuote(body.members));

  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });

  if (body.action === "claim") {
    const code = String(body.code || "").toLowerCase();
    if (!clubCodeOk(code)) return json(200, { ok: false, reason: "no_club" });
    let rec, club;
    try { rec = await getClubRec(code); club = await getClub(code); } catch (e) { console.error("club claim read", String(e)); return json(503, { error: "Try again in a minute" }); }
    if (!rec) return json(200, { ok: false, reason: "not_registered" });
    if (!clubActive(club)) return json(200, { ok: false, reason: "no_plan" });
    if (!clubMemberOk(rec, user.id)) { // waiting for approval, removed, left, or the club is gone: no seat, and any seat they held is freed
      await prune(code, club, rec).catch((e) => console.error("club prune", String(e)));
      await rebuildProList().catch(() => {});
      return json(200, { ok: false, reason: rec.gone ? "gone" : (rec.pending || []).includes(user.id) ? "pending" : "not_member" });
    }
    if ((club.held || []).includes(user.id)) return json(200, { ok: false, reason: "held" }); // an officer took this seat back: they must hand it out again
    // Take a seat. The plan doc has no version check, so write, read back, and retry if a simultaneous claim overwrote ours.
    for (let attempt = 0; attempt < 3; attempt++) {
      club = attempt ? await getClub(code) : club;
      if (!clubActive(club)) return json(200, { ok: false, reason: "no_plan" });
      club.members = club.members || [];
      if (club.members.includes(user.id)) break;
      club = await prune(code, club, rec);
      if (club.members.length >= club.seats) return json(200, { ok: false, reason: "full", seats: club.seats });
      club.members.push(user.id);
      await setClub(code, club);
      const check = await getClub(code);
      if (check && (check.members || []).includes(user.id)) { club = check; break; }
      if (attempt === 2) return json(503, { error: "Busy, try again" });
    }
    await setMemberAccess([user.id], club.until);
    await rebuildProList().catch(() => {});
    return json(200, { ok: true, until: club.until });
  }

  if (body.action === "seats" || body.action === "seat") { // officers choose who holds the paid seats
    const code = String(body.code || "").toLowerCase();
    if (!clubCodeOk(code)) return json(200, { ok: false, reason: "no_club" });
    let rec, club;
    try { rec = await getClubRec(code); club = await getClub(code); } catch (e) { console.error("club seats read", String(e)); return json(503, { error: "Try again in a minute" }); }
    if (!rec || !(rec.owner === user.id || (rec.co || []).includes(user.id))) return json(403, { error: "Only club officers can do that" });
    if (!clubActive(club)) return json(200, { ok: false, reason: "no_plan" });
    club = await prune(code, club, rec);
    club.members = club.members || [];
    if (body.action === "seat") {
      const t = String(body.uid || "");
      if (!UUID.test(t)) return json(400, { error: "Bad member" });
      if (body.on) {
        if (!clubMemberOk(rec, t)) return json(200, { ok: false, reason: "not_member" });
        if (!club.members.includes(t)) {
          if (club.members.length >= club.seats) return json(200, { ok: false, reason: "full", seats: club.seats });
          club.members.push(t);
        }
        club.held = (club.held || []).filter((u) => u !== t);
        await setClub(code, club);
        await setMemberAccess([t], club.until);
      } else {
        if (t === club.officer || t === club.owner) return json(200, { ok: false, reason: "payer" }); // the person paying always keeps a seat
        club.members = club.members.filter((u) => u !== t);
        club.held = [...new Set([...(club.held || []), t])].slice(-500);
        await setClub(code, club);
        await setMemberAccess([t], 0);
      }
      const check = await getClub(code);
      if (!check || (check.members || []).includes(t) !== !!body.on) return json(503, { error: "Busy, try again" });
      club = check;
      await rebuildProList().catch(() => {});
    }
    return json(200, { ok: true, seats: club.seats, holders: club.members, held: club.held || [] });
  }

  if (body.action === "status") {
    const mine = await clubsOfUser(user.id);
    if (!mine.length) return json(200, { ok: true, clubs: [] });
    const out = [];
    for (const c of mine) {
      const { code, ...data } = c;
      let fresh = data;
      try { fresh = await prune(code, data, await getClubRec(code)); } catch (e) { console.error("club status", String(e)); }
      out.push({ code, name: fresh.name, seats: fresh.seats, used: (fresh.members || []).length, status: fresh.status, until: fresh.until,
        cancelAtEnd: !!fresh.cancelAtEnd, canBill: fresh.officer === user.id, owner: (fresh.owner || fresh.officer) === user.id });
    }
    return json(200, { ok: true, clubs: out });
  }
  return json(400, { error: "Unknown action" });
};
