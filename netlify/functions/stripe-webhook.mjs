// Stripe tells us when someone pays, renews or cancels. We record it in Supabase (col "billing", id = user id).
import { json, stripe, setBilling, getBilling, rebuildProList, UUID } from "./_lib/common.mjs";
import { verifyStripeSignature } from "./_lib/security.mjs";

const secret = () => (process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPESECRETWEBHOOKMNA || "").trim();
const PLANS = new Set(["monthly", "yearly", "founding", "season"]);
const plan = (v, fallback) => (PLANS.has(v) ? v : fallback);

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  // Fail closed: with no secret configured nothing can be verified, so nothing is accepted.
  if (!secret()) { console.error("stripe-webhook: webhook secret is not configured"); return json(503, { error: "not configured" }); }
  const raw = await req.text();
  if (raw.length > 1_000_000) return json(413, { error: "too large" });
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), secret())) return json(400, { error: "bad signature" });
  let ev;
  try { ev = JSON.parse(raw); } catch (e) { return json(400, { error: "bad json" }); }
  const o = ev && ev.data && ev.data.object;
  if (!o || typeof ev.type !== "string") return json(400, { error: "bad event" });
  try {
    if (ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") {
      const uid = o.client_reference_id || (o.metadata && o.metadata.uid);
      if (!uid || !UUID.test(uid)) return json(200, { ok: true });
      const p = plan(o.metadata && o.metadata.plan, o.mode === "subscription" ? "monthly" : null);
      if (!p) return json(200, { ok: true, ignored: "unknown plan" });
      // A one-time payment only counts once it is actually paid (delayed methods report "unpaid" first).
      if (o.mode !== "subscription" && o.payment_status !== "paid") return json(200, { ok: true, pending: true });
      const prev = (await getBilling(uid)) || {};
      if (o.mode === "subscription") {
        const sub = await stripe("GET", `subscriptions/${encodeURIComponent(o.subscription)}`);
        await setBilling(uid, { ...prev, plan: p, status: sub.status, customer: o.customer, sub: o.subscription,
          until: (sub.current_period_end || (sub.items && sub.items.data[0] && sub.items.data[0].current_period_end) || 0) * 1000, start: Date.now() });
      } else {
        await setBilling(uid, { ...prev, plan: p, status: "active", customer: o.customer || prev.customer, until: Date.now() + 122 * 864e5, start: Date.now() });
      }
    } else if (ev.type.startsWith("customer.subscription.")) {
      const uid = o.metadata && o.metadata.uid;
      if (uid && UUID.test(uid)) {
        const prev = (await getBilling(uid)) || {};
        const end = o.current_period_end || (o.items && o.items.data[0] && o.items.data[0].current_period_end) || 0;
        await setBilling(uid, { ...prev, plan: plan(o.metadata && o.metadata.plan, prev.plan), status: ev.type.endsWith("deleted") ? "canceled" : o.status,
          customer: o.customer, sub: o.id, until: end * 1000, cancelAtEnd: !!o.cancel_at_period_end });
      }
    }
    await rebuildProList().catch((e) => console.error("pro list", e));
  } catch (e) { console.error("stripe-webhook handler", String(e)); return json(500, { error: "handler failed" }); } // 5xx makes Stripe retry
  return json(200, { ok: true });
};
