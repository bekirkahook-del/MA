// Pro: turn instant application alerts on or off for the signed-in user.
import { json, getUser, SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";
import { isProUser } from "./_lib/pro.mjs";
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const u = await getUser(req); if (!u || !u.id) return json(401, { error: "Sign in first" });
  let b = {}; try { b = await req.json(); } catch (e) {}
  const on = !!b.on;
  const pro = await isProUser(u.id);
  const firm = pro ? "" : String(b.firm || "").replace(/[<>&"]/g, "").trim().slice(0, 60);
  if (on && !pro && firm.length < 2) return json(402, { error: "Free alerts need a firm name. Pro covers every firm.", code: "pro" });
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "alerts", id: u.id, uid: null, data: { email: u.email, on, ...(firm ? { firm } : {}), t: new Date().toISOString() }, updated_at: new Date().toISOString() }) });
  if (!r.ok) return json(502, { error: "Couldn't save. Try again." });
  return json(200, { ok: true, on, firm });
};
