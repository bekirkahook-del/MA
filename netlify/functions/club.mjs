// Club plan seats. POST { action }
//   quote  { members }  -> price for N members (no sign-in needed)
//   claim               -> a member (who joined with the club code) takes a seat on a paid club plan
//   status              -> the officer sees seats used, renewal date and who holds a seat
import { json, getUser, getClub, setClub, clubPlayers, clubActive, clubByOfficer, setMemberAccess, clubCodeOk, rebuildProList } from "./_lib/common.mjs";
import { clubQuote } from "./_lib/clubprice.mjs";

// Drops seat holders who left the club (their player doc no longer has this code) and frees the seat.
async function prune(code, club) {
  const here = new Set((await clubPlayers(code)).map((p) => p.id));
  const keep = (club.members || []).filter((u) => here.has(u) || u === club.officer);
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
    // Which club does this person say they are in? Read from their own player doc, not from the request.
    const mine = (await clubPlayers(String(body.code || "").toLowerCase())).find((p) => p.id === user.id);
    const code = mine && mine.data && mine.data.club;
    if (!clubCodeOk(code)) return json(200, { ok: false, reason: "no_club" });
    let club = await getClub(code);
    if (!clubActive(club)) return json(200, { ok: false, reason: "no_plan" });
    club.members = club.members || [];
    if (!club.members.includes(user.id)) {
      club = await prune(code, club);
      if (club.members.length >= club.seats) return json(200, { ok: false, reason: "full", seats: club.seats });
      club.members.push(user.id);
      await setClub(code, club);
    }
    await setMemberAccess([user.id], club.until);
    await rebuildProList().catch(() => {});
    return json(200, { ok: true, until: club.until });
  }

  if (body.action === "status") {
    const mine = await clubByOfficer(user.id);
    if (!mine.length) return json(200, { ok: true, clubs: [] });
    const out = [];
    for (const c of mine) {
      const fresh = await prune(c.code, { ...c, code: undefined });
      out.push({ code: c.code, name: fresh.name, seats: fresh.seats, used: (fresh.members || []).length, status: fresh.status, until: fresh.until, cancelAtEnd: !!fresh.cancelAtEnd });
    }
    return json(200, { ok: true, clubs: out });
  }
  return json(400, { error: "Unknown action" });
};
