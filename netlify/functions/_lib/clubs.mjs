// Club rules, kept pure (no network) so they can be tested: node tests/clubs.test.mjs
// A club doc lives in Supabase docs (col "clubs", id = join code, uid null so only this server can write it):
// { code, name, owner, sd, co:[uid], lock, ban:[uid], pending:[uid], members:{uid:joinedAt}, t, v, gone? }
export const CODE_RE = /^[a-z0-9]{4,8}$/;
const ALPHA = "abcdefghjkmnpqrstuvwxyz23456789";
export const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), b => ALPHA[b % 31]).join("");
export const MAX = { members: 1000, ban: 300, pending: 100, co: 5, clubsPerUser: 3 };

export class ClubErr extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra || {}; } }
const E = (s, m, x) => { throw new ClubErr(s, m, x); };

// Verified school domain, same rule the browser uses (last two labels), only for a CONFIRMED .edu email.
export function eduDomain(user) {
  const em = String((user && user.email) || "").toLowerCase();
  if (!(user && (user.email_confirmed_at || user.confirmed_at)) || !/@[^@]+\.edu$/.test(em)) return "";
  return em.split("@")[1].split(".").slice(-2).join(".");
}
export const cleanName = n => String(n || "").replace(/[\r\n\t<>]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 40);

export const isOwner = (c, id) => c.owner === id;
export const isCo = (c, id) => (c.co || []).includes(id);
export const isOfficer = (c, id) => isOwner(c, id) || isCo(c, id);

export function make(name, code, owner, sd, now) {
  const n = cleanName(name);
  if (n.length < 3) E(400, "Name your club (3+ characters)");
  if (!CODE_RE.test(code)) E(400, "Bad club code");
  return { code, name: n, owner, sd: sd || "", co: [], lock: false, ban: [], pending: [], members: { [owner]: now }, t: now, v: 1 };
}

// What a given person is allowed to see. Officers get the full lists; members get the basics.
export function view(c, uid) {
  if (!c) return null;
  if (c.gone) return { code: c.code, gone: true };
  const off = isOfficer(c, uid);
  const out = { code: c.code, name: c.name, sd: c.sd, owner: c.owner, co: c.co || [], lock: !!c.lock,
    members: Object.keys(c.members || {}), me: { member: !!(c.members || {})[uid], pending: (c.pending || []).includes(uid), banned: (c.ban || []).includes(uid), owner: isOwner(c, uid), co: isCo(c, uid) } };
  if (off) { out.pending = c.pending || []; out.ban = c.ban || []; }
  return out;
}

const need = (c, uid, owner) => { if (!(owner ? isOwner(c, uid) : isOfficer(c, uid))) E(403, owner ? "Only the club owner can do that" : "Only club officers can do that"); };
const drop = (a, id) => (a || []).filter(x => x !== id);
const push = (a, id, cap) => [...new Set([...(a || []), id])].slice(-cap);

// Apply one action to an existing club. Returns the new club doc (or throws ClubErr). Caller persists it.
export function apply(club, action, uid, b, now) {
  const c = JSON.parse(JSON.stringify(club));
  if (c.gone) E(410, "This club was disbanded", { gone: true });
  const id = String(b.id || "");
  const target = () => { if (!/^[0-9a-f-]{36}$/i.test(id)) E(400, "Bad member"); return id; };
  switch (action) {
    case "join": {
      if ((c.ban || []).includes(uid)) E(403, "An officer removed you from this club", { banned: true });
      if ((c.members || {})[uid]) break;
      if (Object.keys(c.members).length >= MAX.members) E(409, "This club is full");
      if (c.lock) { c.pending = push(c.pending, uid, MAX.pending); break; }
      c.members[uid] = now; c.pending = drop(c.pending, uid); break;
    }
    case "leave": {
      if (isOwner(c, uid)) {
        const others = Object.keys(c.members).filter(x => x !== uid);
        if (c.co && c.co.length) { c.owner = c.co[0]; c.co = c.co.slice(1); }
        else if (others.length) E(409, "Name a co-officer or transfer ownership before you leave");
        else { c.gone = true; c.members = {}; c.pending = []; c.co = []; break; }
      }
      delete c.members[uid]; c.pending = drop(c.pending, uid); c.co = drop(c.co, uid); break;
    }
    case "approve": { need(c, uid); const t = target(); if (!(c.pending || []).includes(t)) E(404, "Not waiting for approval"); c.pending = drop(c.pending, t); c.members[t] = now; break; }
    case "decline": { need(c, uid); c.pending = drop(c.pending, target()); break; }
    case "remove": {
      need(c, uid); const t = target();
      if (isOwner(c, t)) E(403, "The owner can't be removed");
      if (isCo(c, t) && !isOwner(c, uid)) E(403, "Only the owner can remove a co-officer");
      if (t === uid) E(400, "Use Leave club instead");
      delete c.members[t]; c.pending = drop(c.pending, t); c.co = drop(c.co, t); c.ban = push(c.ban, t, MAX.ban); break;
    }
    case "unban": { need(c, uid); c.ban = drop(c.ban, target()); break; }
    case "rename": { need(c, uid, true); const n = cleanName(b.name); if (n.length < 3) E(400, "Name needs 3+ characters"); c.name = n; break; }
    case "lock": { need(c, uid, true); c.lock = !!b.on; if (!c.lock) { /* turning approval off lets everyone waiting in */ for (const p of c.pending || []) c.members[p] = now; c.pending = []; } break; }
    case "co": {
      need(c, uid, true); const t = target();
      if (!c.members[t]) E(404, "They aren't a member");
      if (isOwner(c, t)) E(400, "That's you");
      if (b.on === false) c.co = drop(c.co, t);
      else { if ((c.co || []).length >= MAX.co && !isCo(c, t)) E(409, "Max " + MAX.co + " co-officers"); c.co = push(c.co, t, MAX.co); }
      break;
    }
    case "transfer": {
      need(c, uid, true); const t = target();
      if (!c.members[t]) E(404, "They aren't a member");
      c.co = push(drop(c.co, t), uid, MAX.co + 1); c.owner = t; break;
    }
    case "disband": { need(c, uid, true); c.gone = true; c.members = {}; c.pending = []; c.co = []; break; }
    default: E(400, "Unknown action");
  }
  c.v = (c.v || 0) + 1; c.t = now;
  return c;
}
