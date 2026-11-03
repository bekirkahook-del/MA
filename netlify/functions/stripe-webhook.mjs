// Stripe tells us when someone pays, renews or cancels. We record it in Supabase (col "billing", id = user id).
import crypto from "node:crypto";
import { json, stripe, setBilling, getBilling } from "./_lib/common.mjs";

function verify(raw, header, secret) {
  const parts = Object.fromEntries((header || "").split(",").map((p) => p.split("=")));
  if (!parts.t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > 600) return false;
  const sig = crypto.createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
  const sigs = header.split(",").filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  return sigs.some((s) => s.length === sig.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(sig)));
}

export default async (req) => {
  const raw = await req.text();
  if (!verify(raw, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET || "")) return json(400, { error: "bad signature" });
  const ev = JSON.parse(raw);
  const o = ev.data.object;
  try {
    if (ev.type === "checkout.session.completed") {
      const uid = o.client_reference_id || (o.metadata && o.metadata.uid);
      const plan = (o.metadata && o.metadata.plan) || "monthly";
      if (!uid) return json(200, { ok: true });
      const prev = (await getBilling(uid)) || {};
      if (o.mode === "subscription") {
        const sub = await stripe("GET", `subscriptions/${o.subscription}`);
        await setBilling(uid, { ...prev, plan, status: sub.status, customer: o.customer, sub: o.subscription,
          until: (sub.current_period_end || (sub.items && sub.items.data[0] && sub.items.data[0].current_period_end) || 0) * 1000, start: Date.now() });
      } else {
        await setBilling(uid, { ...prev, plan, status: "active", customer: o.customer || prev.customer, until: Date.now() + 122 * 864e5, start: Date.now() });
      }
    } else if (ev.type.startsWith("customer.subscription.")) {
      const uid = o.metadata && o.metadata.uid;
      if (uid) {
        const prev = (await getBilling(uid)) || {};
        const end = o.current_period_end || (o.items && o.items.data[0] && o.items.data[0].current_period_end) || 0;
        await setBilling(uid, { ...prev, plan: (o.metadata && o.metadata.plan) || prev.plan, status: ev.type.endsWith("deleted") ? "canceled" : o.status,
          customer: o.customer, sub: o.id, until: end * 1000, cancelAtEnd: !!o.cancel_at_period_end });
      }
    }
  } catch (e) { console.error(e); return json(500, { error: "handler failed" }); }
  return json(200, { ok: true });
};
