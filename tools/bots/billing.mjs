// Bot 7: Billing audit. Checks that what people PAID matches what the site GIVES them. Read-only; never grants, refunds or edits.
// Inputs: billing docs (col "billing"), the Pro list (views/_pro), Stripe subscriptions. Uids are shortened in the report; no emails.
import fs from "node:fs";
import { tierOf, proUntil } from "../../netlify/functions/_lib/common.mjs";
import { cli, short, sortBySev } from "./lib.mjs";

const PAID = ["active", "trialing", "past_due"];
export function reconcile({ billing = [], proList = [], stripe = [], now = Date.now() }) {
  const pro = new Set(proList), sub = new Map(stripe.map(s => [s.uid, s])), f = [], seen = new Set();
  const push = (severity, code, uid, detail) => f.push({ severity, code, user: short(uid), detail });
  for (const b of billing) {
    const uid = b.id, d = b.data || {}, tier = tierOf(d, now), s = sub.get(uid), hasAccess = tier !== "free", inList = pro.has(uid);
    seen.add(uid);
    if (s && PAID.includes(s.status) && !hasAccess) push("critical", "PAID_NO_ACCESS", uid, `Stripe says ${s.status}${s.plan ? " (" + s.plan + ")" : ""} but the site tier is free. They are paying for nothing.`);
    if (!s && d.status && PAID.includes(d.status) && (d.until || 0) > now && !(d.grantUntil > now)) push("warn", "ACCESS_NO_STRIPE_SUB", uid, `Billing doc says ${d.status} until ${new Date(d.until).toISOString().slice(0, 10)} but Stripe has no matching subscription (stale doc or a missed cancel webhook).`);
    if (d.status === "active" && (d.until || 0) && d.until < now - 3 * 864e5) push("warn", "STALE_ACTIVE", uid, `Marked active but the paid period ended ${Math.floor((now - d.until) / 864e5)} days ago: a renewal webhook was probably missed.`);
    if (hasAccess && proUntil(d) > now && !inList && ["pro", "season"].includes(tier)) push("warn", "MISSING_FROM_PRO_LIST", uid, `Tier ${tier} but not in views/_pro, so server-side Pro checks that read the list may deny them.`);
    if (!hasAccess && inList) push("warn", "STALE_PRO_LIST", uid, "In views/_pro but tier is free: someone keeps Pro features after expiry.");
  }
  for (const s of stripe) if (!seen.has(s.uid) && PAID.includes(s.status)) push("critical", "PAID_NO_BILLING_DOC", s.uid, `Active Stripe subscription (${s.status}) with no billing doc on the site.`);
  for (const u of proList) if (!seen.has(u)) push("info", "PRO_LIST_NO_DOC", u, "In the Pro list with no billing doc (owner/grant rows are normal).");
  const byCode = {}; f.forEach(x => (byCode[x.code] = (byCode[x.code] || 0) + 1));
  return { checked: billing.length, stripeSubs: stripe.length, problems: f.length, byCode, findings: sortBySev(f) };
}
cli(import.meta.url, a => reconcile(JSON.parse(fs.readFileSync(a[0], "utf8"))));
