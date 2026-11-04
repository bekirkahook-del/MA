// Visitor counter: one row per visitor per day in docs (col "visits"). Only the owner can read them.
import { json, SB_URL } from "./_lib/common.mjs";

const clip = (s, n) => String(s || "").slice(0, n);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|embedly|curl|wget|python|monitor/i;

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return json(503, { error: "not set up" });
  const ua = req.headers.get("user-agent") || "";
  if (BOT.test(ua)) return json(200, { ok: true });
  let b;
  try { b = await req.json(); } catch (e) { return json(400, { error: "bad request" }); }
  const v = String(b.v || "");
  if (!/^[a-z0-9]{8,24}$/.test(v)) return json(400, { error: "bad id" });
  const now = new Date();
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(now); // YYYY-MM-DD
  let ref = "";
  try { const h = new URL(String(b.r || "")).hostname.replace(/^www\./, ""); if (h && !/mnaprep\.com$/.test(h)) ref = h; } catch (e) {}
  const geo = (context && context.geo) || {};
  const data = {
    d, t: now.toISOString(),
    p: clip(b.p, 120), ref: clip(ref, 80), src: clip(b.src, 40).toLowerCase(), cmp: clip(b.cmp, 60).toLowerCase(),
    dev: /Mobi|Android|iPhone|iPad/i.test(ua) ? "Phone" : "Computer",
    cc: clip(geo.country && geo.country.code, 4), country: clip(geo.country && geo.country.name, 40),
    region: clip(geo.subdivision && geo.subdivision.name, 40), city: clip(geo.city, 40),
    first: /^\d{4}-\d{2}-\d{2}$/.test(b.f || "") ? b.f : d, acct: !!b.a,
  };
  const r = await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal", ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}) },
    body: JSON.stringify({ col: "visits", id: `${d}_${v}`, uid: null, data, updated_at: data.t }),
  });
  if (!r.ok) { console.error("visit insert failed", r.status, await r.text()); return json(502, { error: "failed" }); }
  return json(200, { ok: true });
};
