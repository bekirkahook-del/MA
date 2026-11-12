// TEMPORARY: shows a fingerprint (first 12 hex chars of SHA-256) of the Stripe webhook secret, never the secret itself.
import { createHash } from "node:crypto";
export default async () => {
  const a = process.env.STRIPE_WEBHOOK_SECRET, b = process.env.STRIPESECRETWEBHOOKMNA, s = a || b || "";
  const fp = (x) => x ? createHash("sha256").update(x.trim()).digest("hex").slice(0, 12) : null;
  return new Response(JSON.stringify({ using: a ? "STRIPE_WEBHOOK_SECRET" : b ? "STRIPESECRETWEBHOOKMNA" : "none", fp: fp(s), trimmedDiffers: s !== s.trim(), prefixOk: s.trim().startsWith("whsec_"), other: a && b ? fp(b) : null }), { headers: { "content-type": "application/json" } });
};
