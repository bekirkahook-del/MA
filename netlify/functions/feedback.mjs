// Stores feedback and question reports in Supabase (col "feedback"). Works for signed-in and signed-out visitors.
import { json, getUser, SB_URL } from "./_lib/common.mjs";

const KINDS = new Set(["feedback", "question"]);
const clip = (s, n) => String(s || "").slice(0, n);

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return json(503, { error: "Feedback isn't set up yet" });
  let b;
  try { b = await req.json(); } catch (e) { return json(400, { error: "Bad request" }); }
  const kind = KINDS.has(b.kind) ? b.kind : "feedback";
  const text = clip(b.text, 2000).trim();
  if (!text && kind === "feedback") return json(400, { error: "Write something first" });
  if (b.website) return json(200, { ok: true }); // honeypot for bots
  const user = await getUser(req).catch(() => null);
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const data = {
    kind,
    text,
    reason: clip(b.reason, 40),
    question: clip(b.question, 400),
    answer: clip(b.answer, 300),
    where: clip(b.where, 120),
    page: clip(b.page, 200),
    email: user && user.email ? user.email : clip(b.email, 120),
    signedIn: !!(user && user.id),
    at: new Date().toISOString(),
    ua: clip(req.headers.get("user-agent"), 160),
  };
  const h = { apikey: key, "Content-Type": "application/json", Prefer: "return=minimal", ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}) };
  const r = await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: h,
    body: JSON.stringify({ col: "feedback", id, uid: user && user.id ? user.id : null, data, updated_at: data.at }),
  });
  if (!r.ok) { console.error("feedback insert failed", r.status, await r.text()); return json(502, { error: "Couldn't save. Try again." }); }
  return json(200, { ok: true });
};
