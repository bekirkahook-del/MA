// Invite friends: every 3 friends who make a free (email-confirmed) account earns the inviter 7 days of Pro (trial level, same as rank-up days).
// Docs (server-only, uid null): refcodes/<code> -> {uid} · refs/<inviterUid> -> {code, joined[], rewarded} · refby/<friendUid> -> {by, t}
import { json, getUser, getBilling, setBilling, rebuildProList, SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";

const NEED = 3, DAYS = 7, MAX_REWARDS = 4, MAX_AGE_MS = 3 * 864e5;
const ALPH = "abcdefghjkmnpqrstuvwxyz23456789";
const mkCode = () => [...crypto.getRandomValues(new Uint8Array(7))].map(x => ALPH[x % ALPH.length]).join("");

async function get(col, id) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.${col}&id=eq.${encodeURIComponent(id)}&select=data`, { headers: svc() });
  const rows = r.ok ? await r.json() : [];
  return rows[0] ? rows[0].data : null;
}
async function put(col, id, data) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, {
    method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col, id, uid: null, data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error("save failed " + r.status);
}
const stat = (d) => { const n = (d.joined || []).length; return { code: d.code, joined: n, rewarded: d.rewarded || 0, toNext: NEED - (n % NEED), need: NEED, days: DAYS, capped: (d.rewarded || 0) >= MAX_REWARDS }; };

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });
  let b = {}; try { b = await req.json(); } catch (e) {}

  if (b.action === "code") {
    let d = await get("refs", user.id);
    if (!d) {
      let code = "";
      for (let i = 0; i < 5 && !code; i++) { const c = mkCode(); if (!(await get("refcodes", c))) code = c; }
      if (!code) return json(503, { error: "Try again" });
      d = { code, joined: [], rewarded: 0 };
      try { await put("refcodes", code, { uid: user.id }); await put("refs", user.id, d); } catch (e) { return json(502, { error: "Couldn't save. Try again." }); }
    }
    return json(200, { ok: true, ...stat(d) });
  }

  if (b.action === "claim") {
    const code = String(b.code || "").toLowerCase();
    if (!/^[a-z0-9]{4,12}$/.test(code)) return json(400, { error: "bad code", drop: true });
    if (!(user.email_confirmed_at || user.confirmed_at)) return json(409, { error: "Confirm your email first", code: "unconfirmed" }); // keep the code and retry later
    if (Date.now() - new Date(user.created_at).getTime() > MAX_AGE_MS) return json(409, { error: "Only new accounts count", drop: true });
    if (await get("refby", user.id)) return json(409, { error: "Already counted", drop: true });
    const rc = await get("refcodes", code);
    if (!rc || !rc.uid) return json(404, { error: "Unknown invite", drop: true });
    if (rc.uid === user.id) return json(409, { error: "Can't invite yourself", drop: true });
    await put("refby", user.id, { by: rc.uid, t: Date.now() }).catch(() => { throw new Error("save failed"); });
    const d = (await get("refs", rc.uid)) || { code, joined: [], rewarded: 0 };
    if (!d.joined.includes(user.id)) d.joined.push(user.id);
    const earned = Math.min(MAX_REWARDS, Math.floor(d.joined.length / NEED));
    if (earned > (d.rewarded || 0)) {
      const add = earned - (d.rewarded || 0), bill = (await getBilling(rc.uid)) || {};
      const passUntil = Math.max(bill.passUntil || 0, Date.now()) + add * DAYS * 864e5;
      await setBilling(rc.uid, { ...bill, passUntil });
      d.rewarded = earned;
      await rebuildProList().catch(() => {});
    }
    await put("refs", rc.uid, d);
    return json(200, { ok: true, drop: true });
  }
  return json(400, { error: "Unknown action" });
};
