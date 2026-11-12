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

// ---------- pay tiers (decided on the server from the billing record) ----------
// free → trial (7 days, once per account) → season ($29 / 4 months) → pro (monthly, yearly, founding)
export const AI_LIMITS = {
  free: Number(process.env.AI_LIMIT_FREE || 8),
  trial: Number(process.env.AI_LIMIT_TRIAL || 20),
  season: Number(process.env.AI_LIMIT_SEASON || 40),
  pro: Number(process.env.AI_LIMIT_PRO || 100),
  owner: 1e9,
};
const OWNER_HASHES = ["13d8e795a85caa1b6668d51dd5c74b25aa7ed1c1a508336292a3078fcbe47fc6", "00ad2d945215513b412199ba5c23dc5ecb8decd47866582041d1eccd0bb12d93"];
export async function isOwner(email) {
  const { createHash } = await import("node:crypto");
  return OWNER_HASHES.includes(createHash("sha256").update(String(email || "").toLowerCase()).digest("hex"));
}
export function tierOf(b, now = Date.now()) {
  b = b || {};
  const paid = (b.paid || ["active", "trialing", "past_due"].includes(b.status)) && (b.until || 0) > now;
  if (paid) return b.plan === "season" ? "season" : "pro";
  if ((b.grantUntil || 0) > now) return "pro";            // free Pro you gave (requests, clubs)
  if ((b.trialUntil || 0) > now || (b.passUntil || 0) > now) return "trial"; // 3-day trial or Pro days earned by ranking up
  return "free";
}
export const proUntil = (b) => Math.max((b && b.until) || 0, (b && b.grantUntil) || 0, (b && b.trialUntil) || 0, (b && b.passUntil) || 0);

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
