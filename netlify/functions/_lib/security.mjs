// Pure security helpers (no network, no secrets) so they can be unit-tested. See tests/security.test.mjs.
import crypto from "node:crypto";

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Stripe webhook signature check. FAILS CLOSED: an empty/missing secret never verifies
// (HMAC with an empty key is trivially forgeable, so we refuse before computing anything).
export function verifyStripeSignature(raw, header, secret, nowMs = Date.now(), toleranceSec = 300) {
  if (!secret || typeof secret !== "string" || secret.length < 8) return false;
  if (typeof raw !== "string" || !header) return false;
  let t = null; const sigs = [];
  for (const part of String(header).split(",")) {
    const i = part.indexOf("="); if (i < 1) continue;
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === "t") t = v; else if (k === "v1") sigs.push(v);
  }
  if (!t || !/^\d{9,12}$/.test(t) || !sigs.length) return false;
  if (Math.abs(nowMs / 1000 - Number(t)) > toleranceSec) return false;
  const want = crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest();
  return sigs.some((s) => {
    if (!/^[0-9a-f]{64}$/i.test(s)) return false;
    return crypto.timingSafeEqual(Buffer.from(s, "hex"), want);
  });
}

// Constant-time string compare (for tokens).
export function safeEqual(a, b) {
  const x = Buffer.from(String(a ?? "")), y = Buffer.from(String(b ?? ""));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// A Supabase user whose email address has been confirmed (or an OAuth identity, which arrives confirmed).
export const isConfirmed = (u) => !!(u && (u.email_confirmed_at || u.confirmed_at));

// Best-effort client IP behind Netlify's proxy.
export function clientIp(req, context) {
  const h = (n) => (req.headers.get(n) || "").trim();
  return (context && context.ip) || h("x-nf-client-connection-ip") || h("x-forwarded-for").split(",")[0].trim() || "unknown";
}

// Strip control characters and cap length. Use for any user text that is stored or put into an email subject.
export const cleanText = (s, n) => String(s ?? "").replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ").trim().slice(0, n);

export const isEmail = (s) => typeof s === "string" && s.length <= 200 && /^[^\s@<>",;]+@[^\s@<>",;]+\.[a-z]{2,}$/i.test(s);

// Per-instance best-effort limiter for very hot endpoints (page-view counter). Not shared across instances,
// but it caps what one client can push through a warm function without spending a database call.
const mem = new Map();
export function memLimit(key, max, windowMs, now = Date.now()) {
  const e = mem.get(key);
  if (!e || now - e.t > windowMs) {
    if (mem.size > 5000) for (const [k, v] of mem) if (now - v.t > windowMs) mem.delete(k);
    mem.set(key, { t: now, n: 1 }); return true;
  }
  return ++e.n <= max;
}
export const _memReset = () => mem.clear();
