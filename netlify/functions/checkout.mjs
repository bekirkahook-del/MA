// Starts a Stripe Checkout for a signed-in user. Prices live here, so no Stripe dashboard setup is needed.
import { json, getUser, stripe, getBilling, SITE, foundingCount, FOUNDING_CAP, hitLimit, tooMany, getClub, clubActive, getClubRec, clubCodeOk } from "./_lib/common.mjs";
import { clubQuote } from "./_lib/clubprice.mjs";

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
  if (!(await hitLimit("checkout", user.id, 12, 3600))) return tooMany(); // 12 checkout starts per account per hour
  const reqBody = await req.json().catch(() => ({}));
  const { plan } = reqBody;
  let P = typeof plan === "string" && Object.hasOwn(PLANS, plan) ? PLANS[plan] : null, clubMeta = null;
  if (plan === "club") {
    // Club plan: the price is computed here from the member count, never trusted from the browser.
    const q = clubQuote(reqBody.members);
    if (!q.ok) return json(400, { error: q.error, contact: !!q.contact });
    const code = String(reqBody.code || "").toLowerCase();
    if (!clubCodeOk(code)) return json(400, { error: "Create your club in the app first, then come back to subscribe." });
    // The buyer must be the club's owner on the server's club record (not a flag in their own profile), and nobody else may already hold a plan on it.
    let rec; try { rec = await getClubRec(code); } catch (e) { console.error("checkout club read", String(e)); return json(503, { error: "Couldn't check your club. Try again in a minute." }); }
    if (!rec) return json(400, { error: "We can't find that club yet. Open your club in the app once, then try again." });
    if (rec.gone) return json(400, { error: "That club was disbanded." });
    if (rec.owner !== user.id) return json(403, { error: "Only the club's owner can subscribe. Open your club in the app and try again." });
    const existing = await getClub(code);
    if (existing && existing.officer !== user.id && clubActive(existing) && !existing.cancelAtEnd) return json(409, { error: "This club already has a plan, paid by a previous owner. You can start your own once it ends." });
    if (existing && existing.officer === user.id && clubActive(existing) && !existing.cancelAtEnd) return json(409, { error: "Your club already has an active plan. Use Manage billing to change it." });
    const name = String(rec.name || "Club").slice(0, 40);
    P = { name: `M&A Pro Club Plan (${q.seats} seats)${name ? " · " + name : ""}`, amount: q.totalCents, interval: "month" };
    clubMeta = { club: code, seats: String(q.seats) };
  }
  if (!P) return json(400, { error: "Unknown plan" });

  const bill = await getBilling(user.id);
  if (plan === "founding" && (!bill || bill.plan !== "founding") && (await foundingCount()) >= FOUNDING_CAP)
    return json(409, { error: "Founding Member spots are sold out. The yearly plan is $69.", code: "sold_out" });
  const price_data = { currency: "usd", unit_amount: P.amount, product_data: { name: P.name } };
  if (P.interval) price_data.recurring = { interval: P.interval };
  const params = {
    mode: P.interval ? "subscription" : "payment",
    line_items: { 0: { quantity: 1, price_data } },
    client_reference_id: user.id,
    success_url: `${SITE}/?checkout=success`,
    cancel_url: `${SITE}/?checkout=cancel`,
    allow_promotion_codes: "true",
    billing_address_collection: "auto",
    custom_text: { submit: { message: P.interval
      ? `Renews automatically every ${P.interval} at the same price until you cancel. Cancel anytime in Settings. By subscribing you agree to the Terms (${SITE}/terms/) and Refund Policy (${SITE}/refund/).`
      : `One-time payment, no renewal. By paying you agree to the Terms (${SITE}/terms/) and Refund Policy (${SITE}/refund/).` } },
    metadata: { uid: user.id, plan, ...(clubMeta || {}) },
  };
  if (bill && bill.customer) params.customer = bill.customer;
  else { params.customer_email = user.email; if (!P.interval) params.customer_creation = "always"; }
  if (P.interval) params.subscription_data = { metadata: { uid: user.id, plan, ...(clubMeta || {}) } };
  try {
    const s = await stripe("POST", "checkout/sessions", params);
    return json(200, { url: s.url });
  } catch (e) { console.error("checkout", String(e)); return json(502, { error: "Couldn't start checkout. Try again in a minute." }); }
};
