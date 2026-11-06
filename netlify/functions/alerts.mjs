// Pro: turn instant application alerts on or off for the signed-in user.
import { json, getUser, SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";
import { isProUser } from "./_lib/pro.mjs";
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const u = await getUser(req); if (!u || !u.id) return json(401, { error: "Sign in first" });
  let b = {}; try { b = await req.json(); } catch (e) {}
  const on = !!b.on;
  if (on && !(await isProUser(u.id))) return json(402, { error: "Application alerts are part of Pro", code: "pro" });
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "alerts", id: u.id, uid: null, data: { email: u.email, on, t: new Date().toISOString() }, updated_at: new Date().toISOString() }) });
  if (!r.ok) return json(502, { error: "Couldn't save. Try again." });
  return json(200, { ok: true, on });
};
