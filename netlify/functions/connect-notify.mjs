// Emails someone when another member sends them a connection request (or accepts theirs).
// POST {to: <uid>, accepted?: bool} with the sender's sign-in token. Server-side checks: real account, confirmed email,
// one email per pair per 7 days, max 25 per sender per day. Docs (server-only): connmail/<from>_<to>, connmail/day_<from>.
import { json, getUser, SB_URL, SITE, isConfirmed, hitLimit, tooMany } from "./_lib/common.mjs";
import { svc, FROM } from "./_lib/mail.mjs";

const esc = s => String(s ?? "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function get(id) { const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.connmail&id=eq.${encodeURIComponent(id)}&select=data`, { headers: svc() }); const rows = r.ok ? await r.json() : []; return rows[0] ? rows[0].data : null; }
async function put(id, data) { await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ col: "connmail", id, uid: null, data, updated_at: new Date().toISOString() }) }); }

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const me = await getUser(req);
  if (!me || !me.id) return json(401, { error: "Sign in first" });
  if (!isConfirmed(me)) return json(200, { ok: true, sent: false }); // unconfirmed accounts can't make us email other people
  if (!(await hitLimit("connect", me.id, 60, 3600))) return tooMany();
  let b = {}; try { b = await req.json(); } catch (e) {}
  const to = String(b.to || ""), accepted = !!b.accepted;
  if (!UUID.test(to) || to === me.id) return json(400, { error: "Bad request" });
  if (!process.env.RESEND_API_KEY) return json(200, { ok: true, sent: false });

  const pairId = `${me.id}_${to}_${accepted ? "a" : "r"}`, now = Date.now();
  const prev = await get(pairId);
  if (prev && now - (prev.t || 0) < 7 * 864e5) return json(200, { ok: true, sent: false });
  const day = new Date().toISOString().slice(0, 10), dayId = `day_${me.id}`;
  const dc = await get(dayId), n = dc && dc.d === day ? dc.n || 0 : 0;
  if (n >= 25) return json(429, { error: "Slow down" });

  const ur = await fetch(`${SB_URL}/auth/v1/admin/users/${to}`, { headers: svc() });
  const u = ur.ok ? await ur.json() : null;
  if (!u || !u.email || !(u.email_confirmed_at || u.confirmed_at)) return json(200, { ok: true, sent: false });

  const md = me.user_metadata || {};
  const who = String(md.name || md.full_name || b.name || "").replace(/[\r\n]+/g, " ").trim().slice(0, 40) || "A student";
  const first = who.split(" ")[0];
  const link = `${SITE}/?utm_source=connect#compete`;
  const head = accepted ? `${esc(who)} accepted your connection` : `${esc(who)} wants to connect with you`;
  const msg = accepted ? "You're connected now. You can see each other's progress, a weekly friends leaderboard and what everyone's working on." : "Connect back to see their progress, compete on a weekly friends leaderboard and keep each other on streak.";
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#13203B"><div style="font-weight:900;font-size:20px;margin-bottom:12px">M<span style="color:#2448D8">&amp;</span>A Prep</div>
<p style="font-size:18px"><b>👋 ${head}</b></p><p style="font-size:15px;line-height:1.5">${msg}</p>
<p><a href="${link}" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;border-radius:10px;padding:11px 18px">${accepted ? "See your friends" : "View the invitation"} →</a></p>
<p style="font-size:12px;color:#4A5672;line-height:1.5">You're getting this because ${esc(first)} used mnaprep.com. We only email you when someone connects with you. Not interested? Just ignore it, nothing happens until you connect back.</p></div>`;
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM(), to: [u.email], subject: accepted ? `${who} accepted your connection on M&A Prep` : `${who} wants to connect on M&A Prep`, html }) }).catch(() => null);
  if (!r || !r.ok) return json(502, { error: "Email failed" });
  await put(pairId, { t: now }); await put(dayId, { d: day, n: n + 1 });
  return json(200, { ok: true, sent: true });
};
