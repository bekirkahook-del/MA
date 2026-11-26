// Invite friends: every 3 friends who join and clear Level 1 earns the inviter 7 days of Pro (trial level, same as rank-up days), up to 4 weeks.
// A friend names who invited them at sign-up by typing that person's invite code OR their account email.
//
// Two steps, so a fake account can't pay out on its own:
//   claim  (at sign-up)  - records a PENDING referral. Nothing is credited yet.
//   settle (after Level 1) - the friend has a confirmed email and has cleared Level 1 -> the referral counts.
//
// Docs (all server-only, uid null):
//   refcodes/<code>        -> {uid}
//   refs/<inviterUid>      -> {code, joined[], rewarded, k[]}   k = salted hashes of the inviter's own devices
//   refby/<friendUid>      -> {by, t, st: "pending" | "done", done?}   the source of truth for the count
//   refown/<hashed key>    -> {uid}   one account per device / inbox can ever be a referred friend
//   refreward/<uid>:<tier> -> {uid}   first writer per reward tier wins, so two requests can never both pay
//   refguard/<...>         -> {n}     per-inviter and site-wide brakes
//
// Anti-scam rules (all server-side):
//  1. Every outcome of a claim returns the SAME answer, so the box can't be used to find out whose email has an account.
//  2. Counts only after a confirmed email + Level 1 cleared + account at least 10 minutes old.
//  3. Self-referral is refused: same account, same inbox (Gmail dots/+tags folded), or same device/network as the inviter.
//  4. One account per device, browser fingerprint+network, GPU fingerprint+network, or inbox can ever count as a referred friend.
//  5. Temp/disposable email domains never count. Circular referrals (A invites B, B invites A) never count.
//  6. Per inviter: max 6 claims a day and max 2 friends from the same network. Site-wide: max 100 settles a day.
//  7. The inviter must have a confirmed email. Only accounts under 3 days old can claim. One inviter per account, locked forever.
//  8. Rewards are capped at 4 x 7 days. Each tier is claimed atomically (refreward) so a double request can't pay twice.
import { json, getUser, getBilling, setBilling, getDoc, rebuildProList, SB_URL, hitLimit, tooMany, bump, clientIp, claimOwner, isConfirmed } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";
import { H, canon, tempDomain, range } from "./_lib/identity.mjs";

const NEED = 3, DAYS = 7, MAX_REWARDS = 4, MAX_AGE_MS = 3 * 864e5, MIN_AGE_MS = 10 * 60e3, DAY = 864e5;
const ALPH = "abcdefghjkmnpqrstuvwxyz23456789";
const mkCode = () => [...crypto.getRandomValues(new Uint8Array(7))].map(x => ALPH[x % ALPH.length]).join("");
const okMail = (e) => e.length <= 120 && /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e);
const UUIDRE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Same answer for every claim outcome (rule 1).
const SAME = () => json(200, { ok: true, drop: true, pending: true });

const get = getDoc;
async function put(col, id, data) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, {
    method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col, id, uid: null, data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error("save failed " + r.status);
}
const stat = (d) => { const n = (d.joined || []).length; return { code: d.code, joined: n, rewarded: d.rewarded || 0, toNext: NEED - (n % NEED), need: NEED, days: DAYS, capped: (d.rewarded || 0) >= MAX_REWARDS }; };

async function adminUser(uid) {
  if (!UUIDRE.test(uid)) return null;
  const r = await fetch(`${SB_URL}/auth/v1/admin/users/${uid}`, { headers: svc(), signal: AbortSignal.timeout(8000) }).catch(() => null);
  return r && r.ok ? await r.json() : null;
}
// Find a confirmed account by email (Gmail dots/+tags folded). Looks through the first 5,000 accounts; fine at this size.
async function findByEmail(email) {
  const want = canon(email);
  for (let page = 1; page <= 5; page++) {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers: svc(), signal: AbortSignal.timeout(10000) }).catch(() => null);
    if (!r || !r.ok) return null;
    const list = (await r.json()).users || [];
    const hit = list.find(u => isConfirmed(u) && canon(u.email) === want);
    if (hit) return hit;
    if (list.length < 1000) break;
  }
  return null;
}
async function ensureRefs(uid) {
  let d = await get("refs", uid);
  if (!d) {
    let code = "";
    for (let i = 0; i < 5 && !code; i++) { const c = mkCode(); if (!(await get("refcodes", c))) code = c; }
    if (!code) throw new Error("no code");
    d = { code, joined: [], rewarded: 0 };
    await put("refcodes", code, { uid }); await put("refs", uid, d);
  }
  return d;
}
const devKeys = (b, ip) => {
  const dev = String(b.device || "").slice(0, 80), f = String(b.fp || "").slice(0, 300), f2 = String(b.fp2 || "").slice(0, 120);
  if (dev.length < 16 || f.length < 10) return null;
  const keys = ["dev:" + H(dev), "ipfp:" + H(ip + "|" + f)];
  if (f2) keys.push("gpu:" + H(range(ip) + "|" + f2));
  return keys;
};
// Friends who finished (confirmed + Level 1). Counted from the per-friend docs, so a lost write can't lose a friend.
async function doneFriends(uid) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.refby&data-%3E%3Eby=eq.${uid}&data-%3E%3Est=eq.done&select=id&limit=1000`, { headers: svc(), signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error("count failed " + r.status);
  return (await r.json()).map(x => x.id);
}
// Pay any reward tiers the inviter has earned and not yet been paid. Safe to call any time, as often as you like.
async function credit(uid, who) {
  const ids = await doneFriends(uid);
  const d = (await get("refs", uid)) || { code: "", joined: [], rewarded: 0 };
  const earned = Math.min(MAX_REWARDS, Math.floor(ids.length / NEED));
  let granted = 0;
  for (let t = (d.rewarded || 0) + 1; t <= earned; t++) if (await claimOwner("refreward", `${uid}:${t}`, who)) granted++;
  if (granted) {
    const bill = (await getBilling(uid)) || {};
    await setBilling(uid, { ...bill, passUntil: Math.max(bill.passUntil || 0, Date.now()) + granted * DAYS * DAY });
    await rebuildProList().catch(() => {});
  }
  d.joined = ids; d.rewarded = Math.max(d.rewarded || 0, earned);
  await put("refs", uid, d);
  return d;
}

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const ip = clientIp(req, context);
  if (!(await hitLimit("refer-ip", ip, 30, 3600, false))) return tooMany();
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });
  if (!(await hitLimit("refer", user.id, 40, 3600))) return tooMany();
  let b = {}; try { b = await req.json(); } catch (e) {}
  const now = Date.now(), day = Math.floor(now / DAY);

  if (b.action === "code") {
    let d;
    try {
      d = await ensureRefs(user.id);
      const keys = devKeys(b, ip);
      if (keys) { d.k = [...new Set([...(d.k || []), ...keys])].slice(-8); await put("refs", user.id, d); } // remember the inviter's own devices (rule 3)
      if (isConfirmed(user)) d = await credit(user.id, user.id); // pays anything earned that an interrupted request missed
    } catch (e) { return json(502, { error: "Couldn't save. Try again." }); }
    return json(200, { ok: true, ...stat(d) });
  }

  if (b.action === "claim") {
    if (!isConfirmed(user)) return json(409, { error: "Confirm your email first", code: "unconfirmed" }); // keep it and retry later
    if (!(await hitLimit("refer-claim", user.id, 5, 86400, false))) return tooMany();
    const code = String(b.code || "").trim().toLowerCase(), email = String(b.email || "").trim().toLowerCase();
    const byCode = /^[a-z0-9]{4,12}$/.test(code), byMail = !byCode && okMail(email);
    if (!byCode && !byMail) return SAME();
    if (now - Date.parse(user.created_at || 0) > MAX_AGE_MS) return SAME();       // only brand-new accounts
    if (tempDomain(user.email)) return SAME();                                       // no throwaway inboxes
    if (await get("refby", user.id)) return SAME();                                  // one inviter per account, locked
    const keys = devKeys(b, ip);
    if (!keys) return SAME();

    // who invited them? (never revealed to the caller)
    let inviter = null;
    if (byCode) { const rc = await get("refcodes", code); inviter = rc && rc.uid ? await adminUser(rc.uid) : null; }
    else inviter = await findByEmail(email);
    if (!inviter || !isConfirmed(inviter)) return SAME();
    const uid = inviter.id;
    if (uid === user.id || canon(inviter.email) === canon(user.email)) return SAME(); // not yourself, not your own alias
    const back = await get("refby", uid);
    if (back && back.by === user.id) return SAME();                                  // no A->B + B->A loops
    const d = await get("refs", uid);
    if (d && (d.rewarded || 0) >= MAX_REWARDS) return SAME();

    // not the inviter's own device or network
    const mine = new Set((d && d.k) || []);
    if (keys.some(k => mine.has(k))) return SAME();
    for (const k of keys) { const ro = await get("rewardowner", k); if (ro && ro.uid === uid) return SAME(); }

    try {
      // one account per device / inbox can ever be a referred friend
      for (const k of [...keys, "mail:" + H(canon(user.email))]) if (!(await claimOwner("refown", k, user.id))) return SAME();
      // per-inviter brakes
      if ((await bump("refguard", `day:${uid}:${day}`, null, 6)) === null) return SAME();
      if ((await bump("refguard", `ip:${H(ip)}:${uid}`, null, 2)) === null) return SAME();
      await put("refby", user.id, { by: uid, t: now, st: "pending" });
    } catch (e) { console.error("refer claim", String(e)); return json(502, { error: "Couldn't save. Try again." }); }
    return SAME();
  }

  if (b.action === "settle") {
    if (!isConfirmed(user)) return json(409, { error: "Confirm your email first", code: "unconfirmed" });
    const rb = await get("refby", user.id);
    if (!rb || !rb.by) return json(200, { ok: true, drop: true });                    // nothing waiting: stop asking
    if (rb.st === "done") return json(200, { ok: true, drop: true, done: true });
    if (now - Date.parse(user.created_at || 0) < MIN_AGE_MS) return json(409, { error: "Not yet", code: "not_yet" });
    const p = await get("players", user.id).catch(() => null);
    if (!(p && +p.levels >= 1)) return json(409, { error: "Clear Level 1 first", code: "not_yet" });
    try {
      if ((await bump("refguard", `global:${day}`, null, 100)) === null) return json(409, { error: "Try again tomorrow", code: "paused" });
      await put("refby", user.id, { ...rb, st: "done", done: now });
      await credit(rb.by, user.id);
    } catch (e) { console.error("refer settle", String(e)); return json(502, { error: "Try again in a minute" }); }
    return json(200, { ok: true, drop: true, done: true });
  }
  return json(400, { error: "Unknown action" });
};
