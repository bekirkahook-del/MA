// Starts a Stripe Checkout for a signed-in user. Prices live here, so no Stripe dashboard setup is needed.
import { json, getUser, stripe, getBilling, SITE } from "./_lib/common.mjs";

const PLANS = {
  monthly:  { name: "M&A Pro (Monthly)",  amount: 900,  interval: "month" },
  yearly:   { name: "M&A Pro (Yearly)",   amount: 6900, interval: "year" },
  founding: { name: "M&A Pro (Founding Member)", amount: 4900, interval: "year" },
  season:   { name: "M&A Pro Season Pass (4 months)", amount: 2900 }, // one-time
};

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  if (!(process.env.STRIPE_SECRET_KEY || process.env.STripeSecretKey) || !(process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY)) return json(503, { error: "Payments aren't set up yet", code: "no_key" });
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first", code: "not_granted" });
  const { plan } = await req.json().catch(() => ({}));
  const P = PLANS[plan];
  if (!P) return json(400, { error: "Unknown plan" });

  const bill = await getBilling(user.id);
  const price_data = { currency: "usd", unit_amount: P.amount, product_data: { name: P.name } };
  if (P.interval) price_data.recurring = { interval: P.interval };
  const params = {
    mode: P.interval ? "subscription" : "payment",
    line_items: { 0: { quantity: 1, price_data } },
    client_reference_id: user.id,
    success_url: `${SITE}/?checkout=success`,
    cancel_url: `${SITE}/?checkout=cancel`,
    allow_promotion_codes: "true",
    metadata: { uid: user.id, plan },
  };
  if (bill && bill.customer) params.customer = bill.customer;
  else { params.customer_email = user.email; if (!P.interval) params.customer_creation = "always"; }
  if (P.interval) params.subscription_data = { metadata: { uid: user.id, plan } };
  try {
    const s = await stripe("POST", "checkout/sessions", params);
    return json(200, { url: s.url });
  } catch (e) { console.error(e); return json(502, { error: e.message }); }
};
