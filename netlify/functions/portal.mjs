// Opens Stripe's billing page so members can cancel, switch cards or get receipts.
import { json, getUser, stripe, getBilling, SITE } from "./_lib/common.mjs";
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  if (!(process.env.STRIPE_SECRET_KEY || process.env.STripeSecretKey)) return json(503, { error: "Payments aren't set up yet" });
  const user = await getUser(req);
  if (!user) return json(401, { error: "Sign in first" });
  const bill = await getBilling(user.id);
  if (!bill || !bill.customer) return json(404, { error: "No billing account yet" });
  try {
    const s = await stripe("POST", "billing_portal/sessions", { customer: bill.customer, return_url: SITE });
    return json(200, { url: s.url });
  } catch (e) { console.error(e); return json(502, { error: e.message }); }
};
