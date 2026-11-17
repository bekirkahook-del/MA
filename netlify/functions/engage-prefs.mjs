// Opt in/out of streak-reminder and friend-nudge emails. POST {streak?:bool, nudge?:bool}. Doc (server-only): engage/<uid>.
import { json, getUser, SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const u = await getUser(req); if (!u || !u.id) return json(401, { error: "Sign in first" });
  let b = {}; try { b = await req.json(); } catch (e) {}
  const g = await fetch(`${SB_URL}/rest/v1/docs?col=eq.engage&id=eq.${u.id}&select=data`, { headers: svc() });
  const rows = g.ok ? await g.json() : [];
  const prev = rows[0] ? rows[0].data : {};
  const data = { ...prev, streak: b.streak === undefined ? !!prev.streak : !!b.streak, nudge: b.nudge === undefined ? !!prev.nudge : !!b.nudge, t: new Date().toISOString() };
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "engage", id: u.id, uid: null, data, updated_at: new Date().toISOString() }) });
  if (!r.ok) return json(502, { error: "Couldn't save. Try again." });
  return json(200, { ok: true, streak: data.streak, nudge: data.nudge });
};
