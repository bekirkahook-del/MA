// Stripe tells us when someone pays, renews or cancels. We record it in Supabase (col "billing", id = user id).
import { json, stripe, setBilling, getBilling, rebuildProList, UUID, getClub, setClub, setMemberAccess, clubCodeOk, clubActive, getClubRec, clubMemberOk, SITE } from "./_lib/common.mjs";
import { verifyStripeSignature } from "./_lib/security.mjs";
import { confirmedEmail, sendOne } from "./_lib/mail.mjs";

const secret = () => (process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPESECRETWEBHOOKMNA || "").trim();
const PLANS = new Set(["monthly", "yearly", "founding", "season"]);
const plan = (v, fallback) => (PLANS.has(v) ? v : fallback);
const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Tells the officer their club plan is live and how members get in. Once per subscription (club.emailedSub), after payment is confirmed.
async function welcomeOfficer(code, club) {
  if (!club || !club.sub || club.emailedSub === club.sub || !clubActive(club) || !["active", "trialing"].includes(club.status)) return;
  const to = await confirmedEmail(club.officer);
  if (!to) return;
  const until = club.until ? new Date(club.until).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : "";
  const name = esc(club.name || "Your club");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#13203B;line-height:1.55">
<h2 style="margin:0 0 10px">${name} is on the M&amp;A Prep club plan</h2>
<p>Your payment went through. The plan covers <b>${esc(club.seats)} seats</b>${until ? ` and renews on <b>${until}</b>` : ""} until you cancel.</p>
<p><b>Next step: send members your club code</b></p>
<p style="font-size:24px;letter-spacing:.12em;font-weight:900;margin:6px 0">${esc(code.toUpperCase())}</p>
<ol style="padding-left:20px"><li>They create a free account at <a href="${SITE}">mnaprep.com</a> and sign in.</li><li>They open Compete, then Club, and enter the code.</li><li>Once they're in (or you approve them, if approval is on), they get Pro with 15 AI uses a day. Seats are first come, first served, and a seat frees up if someone leaves.</li></ol>
<p>Manage billing or cancel anytime from the Club plan panel on the Pro page. See the <a href="${SITE}/terms/">Terms</a> and <a href="${SITE}/refund/">Refund Policy</a>.</p>
<p style="color:#4A5672;font-size:13px">Questions? Reply to this email.</p></div>`;
  await sendOne({ to, subject: `${club.name || "Your club"} is live on M&A Prep: share your club code`, html });
  club.emailedSub = club.sub;
  await setClub(code, club);
}

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
      if (o.metadata && o.metadata.plan === "club") {
        // Club plan: the entitlement lives on the club (col clubbilling), and each seat holder's billing doc gets clubUntil.
        const code = o.metadata && o.metadata.club;
        if (!clubCodeOk(code)) return json(200, { ok: true });
        const sub = await stripe("GET", `subscriptions/${o.subscription}`);
        const until = (sub.current_period_end || (sub.items && sub.items.data[0] && sub.items.data[0].current_period_end) || 0) * 1000;
        const prev = (await getClub(code)) || {};
        const rec = await getClubRec(code); // throws if the database can't be read, so Stripe retries instead of us guessing
        const seats = Number(o.metadata.seats) || prev.seats || 10;
        // Seat holders = the buyer plus earlier members who are still approved members of this club, capped at the seats bought.
        const cand = [...new Set([uid, ...(prev.members || [])])];
        const live = rec && !rec.gone ? cand.filter((u) => u === uid || clubMemberOk(rec, u)) : [uid];
        const members = live.slice(0, seats);
        const club = { ...prev, officer: uid, owner: uid, name: (rec && rec.name) || prev.name, seats, members,
          status: sub.status, customer: o.customer, sub: o.subscription, until, start: Date.now(), cancelAtEnd: false };
        if (prev.sub !== o.subscription) delete club.emailedSub;
        await setClub(code, club);
        await setMemberAccess(cand.filter((u) => !members.includes(u)), 0); // earlier members who no longer qualify or don't fit the seats
        // Access starts only once the subscription is really active; a delayed payment method grants it later via subscription.updated.
        if (clubActive(club)) await setMemberAccess(members, until);
        await rebuildProList().catch((e) => console.error("pro list", e));
        await welcomeOfficer(code, club).catch((e) => console.error("club welcome email", String(e)));
        return json(200, { ok: true });
      }
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
    } else if (ev.type.startsWith("customer.subscription.") && o.metadata && o.metadata.plan === "club") {
      const code = o.metadata.club, club = clubCodeOk(code) && (await getClub(code));
      if (club && club.sub === o.id) {
        const end = (o.current_period_end || (o.items && o.items.data[0] && o.items.data[0].current_period_end) || 0) * 1000;
        const gone = ev.type.endsWith("deleted");
        club.status = gone ? "canceled" : o.status; club.until = end || club.until; club.cancelAtEnd = !!o.cancel_at_period_end;
        await setClub(code, club);
        if (gone) await setMemberAccess(club.members || [], 0);
        else if (["active", "trialing", "past_due"].includes(o.status)) await setMemberAccess(club.members || [], club.until);
        else if (["unpaid", "canceled", "incomplete_expired"].includes(o.status)) await setMemberAccess(club.members || [], 0);
        if (!gone) await welcomeOfficer(code, club).catch((e) => console.error("club welcome email", String(e)));
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
