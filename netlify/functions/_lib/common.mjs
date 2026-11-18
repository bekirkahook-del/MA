export const SB_URL = "https://nbakxpnhcfzdosbzbupd.supabase.co";
export const SB_KEY = "sb_publishable_-2q58P2-fXrY-q1y4GQ8jw_58OrzsDu";
export const SITE = process.env.SITE_URL || "https://mnaprep.com";
import { isConfirmed, clientIp, UUID } from "./security.mjs";
export { isConfirmed, clientIp, UUID };
// API responses are never cached or sniffed.
export const json = (status, body, extra) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", ...(extra || {}) } });

export async function getUser(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token.length > 4096) return null;
  try {
    const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(8000) });
    return r.ok ? await r.json() : null;
  } catch (e) { return null; }
}

// Stripe REST call without the SDK (form-encoded, nested keys like line_items[0][price_data][currency])
function enc(obj, prefix, out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === "object") enc(v, key, out);
    else out.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return out;
}
export async function stripe(method, path, params) {
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { Authorization: `Bearer ${(process.env.STRIPE_SECRET_KEY || process.env.STripeSecretKey)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params ? enc(params).join("&") : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || "Stripe error");
  return j;
}

// Service-role writes to the docs table (only the server can write billing)
// Works with both the new secret key (sb_secret_...) and the legacy service_role JWT (eyJ...)
const svcH = () => { const k = (process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY) || ""; return { apikey: k, "Content-Type": "application/json", ...(k.startsWith("eyJ") ? { Authorization: `Bearer ${k}` } : {}) }; };
export async function getBilling(uid) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.billing&id=eq.${uid}&select=data`, { headers: svcH() });
  const rows = r.ok ? await r.json() : [];
  return (rows[0] && rows[0].data) || null;
}
export async function setBilling(uid, data) {
  const r = await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { ...svcH(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ col: "billing", id: uid, uid, data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error("Supabase write failed: " + (await r.text()));
}

// ---------- pay tiers (decided on the server from the billing record) ----------
// free → trial (7 days, once per account) → season ($29 / 4 months) → pro (monthly, yearly, founding)
export const AI_LIMITS = {
  free: Number(process.env.AI_LIMIT_FREE || 3),
  trial: Number(process.env.AI_LIMIT_TRIAL || 20),
  season: Number(process.env.AI_LIMIT_SEASON || 40),
  pro: Number(process.env.AI_LIMIT_PRO || 100),
  club: Number(process.env.AI_LIMIT_CLUB || 15), // a seat on a club plan ($6/seat/month): Pro access, smaller daily AI allowance
  owner: 1e9,
};
const OWNER_HASHES = ["13d8e795a85caa1b6668d51dd5c74b25aa7ed1c1a508336292a3078fcbe47fc6", "00ad2d945215513b412199ba5c23dc5ecb8decd47866582041d1eccd0bb12d93"];
export async function isOwner(email) {
  const { createHash } = await import("node:crypto");
  return OWNER_HASHES.includes(createHash("sha256").update(String(email || "").toLowerCase()).digest("hex"));
}
// Owner powers also require a CONFIRMED email, so nobody can become owner by signing up with an owner address
// on a project where email confirmation is off.
export const isOwnerUser = async (u) => !!u && isConfirmed(u) && (await isOwner(u.email));

// Atomic counter in the docs table. Returns the new count, or null when `limit` was already reached.
// Uses the bump_counter() SQL function (supabase/security-hardening.sql). If that function isn't installed yet it
// falls back to read-then-write (approximate under heavy concurrency, still a real cap). Throws on infrastructure errors.
export async function bump(col, id, uid, limit) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/bump_counter`, { method: "POST", headers: svcH(), body: JSON.stringify({ p_col: col, p_id: id, p_uid: uid || null, p_limit: limit }), signal: AbortSignal.timeout(6000) });
  if (r.ok) { const n = await r.json(); return typeof n === "number" ? n : null; }
  if (r.status !== 404) throw new Error("counter rpc " + r.status);
  const g = await fetch(`${SB_URL}/rest/v1/docs?col=eq.${encodeURIComponent(col)}&id=eq.${encodeURIComponent(id)}&select=data`, { headers: svcH(), signal: AbortSignal.timeout(6000) });
  if (!g.ok) throw new Error("counter read " + g.status);
  const rows = await g.json(), n = (rows[0] && rows[0].data && rows[0].data.n) || 0;
  if (n >= limit) return null;
  const w = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svcH(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col, id, uid: uid || null, data: { n: n + 1 }, updated_at: new Date().toISOString() }), signal: AbortSignal.timeout(6000) });
  if (!w.ok) throw new Error("counter write " + w.status);
  return n + 1;
}

// Shared rate limiter across all function instances: at most `max` hits per `windowSec` for (name, who).
// `who` is hashed before storage (no raw IPs in the database). Fails OPEN on infrastructure errors so an outage
// never takes the site down; pass failOpen=false for endpoints that spend money.
export async function hitLimit(name, who, max, windowSec, failOpen = true) {
  const { createHash } = await import("node:crypto");
  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const id = `${name}:${createHash("sha256").update(String(who) + (process.env.RATE_LIMIT_SALT || "ma")).digest("hex").slice(0, 20)}:${bucket}`;
  try { return (await bump("ratelimit", id, null, max)) !== null; }
  catch (e) { console.error("rate limiter", String(e)); return failOpen; }
}
export const tooMany = () => json(429, { error: "Too many requests. Please slow down and try again in a bit.", code: "rate_limited" }, { "Retry-After": "60" });
export function tierOf(b, now = Date.now()) {
  b = b || {};
  const paid = (b.paid || ["active", "trialing", "past_due"].includes(b.status)) && (b.until || 0) > now;
  if (paid) return b.plan === "season" ? "season" : "pro";
  if ((b.grantUntil || 0) > now) return "pro";            // free Pro you gave (requests, clubs)
  if ((b.trialUntil || 0) > now || (b.passUntil || 0) > now) return "trial"; // 3-day trial or Pro days earned by ranking up
  if ((b.clubUntil || 0) > now) return "club";            // seat on a paid club plan (set by club.mjs / stripe-webhook.mjs): Pro access, 15 AI uses/day
  return "free";
}
export const proUntil = (b) => Math.max((b && b.until) || 0, (b && b.grantUntil) || 0, (b && b.clubUntil) || 0, (b && b.trialUntil) || 0, (b && b.passUntil) || 0);

// ---------- club plans (col "clubbilling", id = club code, written only by the server) ----------
// data: { officer: uid, name, seats, members: [uid...], status, until, customer, sub, start }
export const clubCodeOk = (c) => /^[a-z0-9]{4,8}$/.test(c || "");
export async function getClub(code) {
  if (!clubCodeOk(code)) return null;
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.clubbilling&id=eq.${code}&select=data`, { headers: svcH() });
  const rows = r.ok ? await r.json() : [];
  return (rows[0] && rows[0].data) || null;
}
export async function setClub(code, data) {
  const r = await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { ...svcH(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ col: "clubbilling", id: code, uid: data.officer, data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error("Supabase write failed: " + (await r.text()));
}
export async function clubByOfficer(uid) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.clubbilling&uid=eq.${uid}&select=id,data&limit=5`, { headers: svcH() });
  const rows = r.ok ? await r.json() : [];
  return rows.map((x) => ({ code: x.id, ...x.data }));
}
// Everyone whose public player doc says they are in this club (the join code is the shared secret).
export async function clubPlayers(code) {
  if (!clubCodeOk(code)) return [];
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.players&data->>club=eq.${code}&select=id,data&limit=1000`, { headers: svcH() });
  return r.ok ? await r.json() : [];
}
// The real club record kept by club-admin.mjs (col "clubs"): the only trusted answer to "who is a member / the owner".
// Throws if the database can't be read, so callers fail closed instead of treating "can't tell" as "no club".
export async function getClubRec(code) {
  if (!clubCodeOk(code)) return null;
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.clubs&id=eq.${code}&select=data`, { headers: svcH() });
  if (!r.ok) throw new Error("clubs read failed " + r.status);
  const rows = await r.json();
  return (rows[0] && rows[0].data) || null;
}
// Approved, current member: not waiting for approval, not removed, club not disbanded.
export const clubMemberOk = (rec, uid) => !!rec && !rec.gone && !!(rec.members || {})[uid] && !(rec.ban || []).includes(uid) && !(rec.pending || []).includes(uid);
// Clubs a person pays for (uid column) or currently owns (data.owner). Both can manage seats; only the payer has a Stripe customer.
export async function clubsOfUser(uid) {
  if (!UUID.test(String(uid))) return [];
  const get = async (q) => { const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.clubbilling&${q}&select=id,data&limit=10`, { headers: svcH() }); return r.ok ? r.json() : []; };
  const [a, b] = await Promise.all([get(`uid=eq.${uid}`), get(`data->>owner=eq.${uid}`)]);
  const seen = new Set(), out = [];
  for (const x of [...a, ...b]) if (!seen.has(x.id)) { seen.add(x.id); out.push({ code: x.id, ...x.data }); }
  return out;
}
export const clubActive = (c, now = Date.now()) => !!c && ["active", "trialing", "past_due"].includes(c.status) && (c.until || 0) > now;
// Writes clubUntil onto each member's own billing doc, so tierOf() and the Pro list just work. until = 0 removes it.
export async function setMemberAccess(uids, until) {
  for (let i = 0; i < uids.length; i += 20) {
    await Promise.all(uids.slice(i, i + 20).map(async (u) => {
      const b = (await getBilling(u)) || {};
      if ((b.clubUntil || 0) === until) return;
      await setBilling(u, { ...b, clubUntil: until });
    }));
  }
}

// Keeps a club's paid plan in step with the club record after an officer action (remove, leave, transfer, disband).
// - anyone no longer an approved member loses their seat and club Pro right away
// - ownership moves with the club (the person who pays stays the payer)
// - a disbanded club's subscription is set to stop at the end of the period already paid for (the payer keeps access until then)
// Returns { dropped, canceled, error? }. Never throws: the club change itself has already been saved.
export async function reconcileClubBilling(rec) {
  const out = { dropped: 0, canceled: false };
  try {
    const club = rec && (await getClub(rec.code));
    if (!club) return out;
    let changed = false;
    if (!rec.gone && rec.owner && club.owner !== rec.owner) { club.owner = rec.owner; changed = true; }
    const keep = (club.members || []).filter((u) => (rec.gone ? u === club.officer : clubMemberOk(rec, u)));
    const dropped = (club.members || []).filter((u) => !keep.includes(u));
    if (dropped.length) { club.members = keep; changed = true; }
    const cancel = rec.gone && club.sub && clubActive(club) && !club.cancelAtEnd;
    if (cancel) { club.cancelAtEnd = true; changed = true; }
    if (changed) await setClub(rec.code, club); // saved before Stripe is told, so the webhook that follows reads the trimmed list
    if (dropped.length) await setMemberAccess(dropped, 0);
    out.dropped = dropped.length;
    if (cancel) {
      try { await stripe("POST", `subscriptions/${encodeURIComponent(club.sub)}`, { cancel_at_period_end: "true" }); out.canceled = true; }
      catch (e) { console.error("club cancel failed", rec.code, String(e)); club.cancelAtEnd = false; await setClub(rec.code, club).catch(() => {}); out.error = "cancel_failed"; }
    }
    if (dropped.length || cancel) await rebuildProList().catch((e) => console.error("pro list", e));
  } catch (e) { console.error("reconcileClubBilling", String(e)); out.error = "sync_failed"; }
  return out;
}

// Public list of verified Pro members (views/_pro). Written only by the server, so leaderboard badges can't be faked.
export async function rebuildProList() {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.billing&select=id,data&limit=20000`, { headers: svcH() });
  const rows = r.ok ? await r.json() : [];
  const list = {};
  for (const { id, data } of rows) {
    const t = tierOf(data);
    if (t !== "free") list[id] = { until: proUntil(data), f: data.plan === "founding" && (data.until || 0) > Date.now() ? 1 : 0 };
  }
  await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { ...svcH(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ col: "views", id: "_pro", uid: null, data: { list, at: Date.now() }, updated_at: new Date().toISOString() }),
  });
  return Object.keys(list).length;
}
export async function foundingCount() {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.billing&data->>plan=eq.founding&select=id&limit=2000`, { headers: svcH() });
  return r.ok ? (await r.json()).length : 0;
}
export const FOUNDING_CAP = Number(process.env.FOUNDING_CAP || 500);
