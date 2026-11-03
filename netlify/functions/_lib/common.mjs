export const SB_URL = "https://nbakxpnhcfzdosbzbupd.supabase.co";
export const SB_KEY = "sb_publishable_-2q58P2-fXrY-q1y4GQ8jw_58OrzsDu";
export const SITE = process.env.SITE_URL || "https://mnaprep.com";
export const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function getUser(req) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } });
  return r.ok ? r.json() : null;
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
