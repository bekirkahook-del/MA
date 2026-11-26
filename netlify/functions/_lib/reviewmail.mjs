// "Review M&A Prep, get 1 free Pro day" email (Bekir, Nov 24, 2026). Shared by review-email.mjs (owner preview / test)
// and review-email-background.mjs (the real send). Promise in the email = what reward.mjs actually does:
// any rating, 3+ levels cleared, a sentence or more, one review day per student (separate from the sign-up/email day).
import { SB_URL, SITE } from "./common.mjs";
import { svc, FROM, ADDRESS } from "./mail.mjs";
import { isEmail } from "./security.mjs";
import { createHmac } from "node:crypto";

export const KIND = "review-day-1";
const secret = () => process.env.RATE_LIMIT_SALT || "";
export const unsubToken = uid => createHmac("sha256", secret() + "|promo").update(String(uid)).digest("hex").slice(0, 32);
export const unsubUrl = uid => `${SITE}/.netlify/functions/promo-unsub?u=${encodeURIComponent(uid)}&t=${unsubToken(uid)}`;
const esc = s => String(s ?? "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

export async function docs(col, select = "id,data") {
  const out = []; let from = 0;
  for (;;) {
    const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.${encodeURIComponent(col)}&select=${select}&order=id`, { headers: { ...svc(), Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error(`read ${col} failed ${r.status}`);
    const rows = await r.json(); out.push(...rows); if (rows.length < 1000) break; from += 1000;
  }
  return out;
}
export async function authUsers() {
  const out = [];
  for (let page = 1; page < 200; page++) {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers: svc() });
    if (!r.ok) throw new Error("list users failed " + r.status);
    const j = await r.json(), u = j.users || [];
    out.push(...u); if (u.length < 1000) break;
  }
  return out;
}

/* Everyone with a confirmed email, minus: already reviewed, opted out of these emails, unsubscribed from the
   Sunday email (an opt-out from our marketing counts everywhere), banned/deleted, or already sent this email. */
export async function recipients() {
  const [users, reviews, off, subs, sent, players] = await Promise.all([authUsers(), docs("reviews", "id"), docs("mailoff"), docs("subscribers"), docs("promolog", "id"), docs("players")]);
  const reviewed = new Set(reviews.map(r => r.id));
  const optedOut = new Set(off.filter(o => o.data && o.data.promo).map(o => o.id));
  const unsubEmails = new Set(subs.filter(s => s.data && s.data.status && s.data.status !== "active" && s.data.email).map(s => String(s.data.email).toLowerCase()));
  const already = new Set(sent.map(s => s.id));
  const levels = Object.fromEntries(players.map(p => [p.id, +(p.data && p.data.levels) || 0]));
  const skip = { unconfirmed: 0, reviewed: 0, optedOut: 0, alreadySent: 0, banned: 0 };
  const list = [];
  for (const u of users) {
    const email = String(u.email || "").toLowerCase();
    if (!isEmail(email) || !(u.email_confirmed_at || u.confirmed_at)) { skip.unconfirmed++; continue; }
    if (u.banned_until && Date.parse(u.banned_until) > Date.now() || u.deleted_at) { skip.banned++; continue; }
    if (reviewed.has(u.id)) { skip.reviewed++; continue; }
    if (optedOut.has(u.id) || unsubEmails.has(email)) { skip.optedOut++; continue; }
    if (already.has(`${KIND}:${u.id}`)) { skip.alreadySent++; continue; }
    list.push({ uid: u.id, email, levels: levels[u.id] || 0 });
  }
  return { list, total: users.length, skip };
}

export function build(r) {
  const addr = ADDRESS(), link = `${SITE}/#review`;
  const need = Math.max(0, 3 - (r.levels || 0));
  const subject = "Review M&A Prep, get 1 free day of Pro";
  const html = `<!doctype html><html><body style="margin:0;background:#EEF1F5;font-family:Arial,Helvetica,sans-serif;color:#13203B">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<div style="font-weight:900;letter-spacing:.06em;font-size:22px;margin-bottom:14px">M<span style="color:#2448D8">&amp;</span>A Prep</div>
<div style="background:#fff;border:1px solid #D3D9E4;border-radius:14px;padding:22px 20px;font-size:16px;line-height:1.55">
<h1 style="font-size:22px;margin:0 0 10px">How's M&amp;A Prep working for you?</h1>
<p>Leave an honest review of the site or of Pro, and we'll add <b>1 free day of Pro</b> to your account. Good or bad, any rating counts.</p>
<p style="margin:0 0 6px"><b>How it works</b></p>
<ol style="margin:0 0 14px;padding-left:20px">
<li>${need ? `Clear 3 levels (you've cleared ${r.levels || 0}, so ${need} to go)` : "You've already cleared 3 levels ✓"}</li>
<li>Tap the button, pick a rating and write a sentence or two</li>
<li>Your Pro day is added right away</li></ol>
<p style="text-align:center;margin:18px 0"><a href="${link}" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;padding:13px 22px;border-radius:10px">Leave my review →</a></p>
<p style="font-size:13px;color:#4A5672;margin:0">One review day per student. Reviews show on the site with your name. Your rating never changes whether you get the day.</p>
</div>
<p style="font-size:12px;color:#4A5672;line-height:1.5;margin-top:16px;text-align:center">You're getting this because you have an account at mnaprep.com.
<a href="${unsubUrl(r.uid)}" style="color:#4A5672">Unsubscribe from emails like this</a>${addr ? `<br>${esc(addr)}` : ""}</p>
</div></body></html>`;
  return { subject, html };
}

export async function markSent(uid) {
  await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "promolog", id: `${KIND}:${uid}`, uid: null, data: { at: new Date().toISOString() }, updated_at: new Date().toISOString() }) });
}

/* Resend batch: 100 per call, with one-click unsubscribe headers */
export async function sendBatch(rs) {
  const k = process.env.RESEND_API_KEY; if (!k) throw new Error("RESEND_API_KEY not set");
  const batch = rs.map(r => { const m = build(r); return { from: FROM(), to: [r.email], subject: m.subject, html: m.html,
    headers: { "List-Unsubscribe": `<${unsubUrl(r.uid)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }; });
  const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" }, body: JSON.stringify(batch) });
  if (!r.ok) throw new Error("send failed " + r.status + " " + (await r.text()));
}
export const ready = () => { const miss = []; if (!process.env.RESEND_API_KEY) miss.push("RESEND_API_KEY"); if (!ADDRESS()) miss.push("MAIL_ADDRESS (postal address, required by law)"); if (!secret()) miss.push("RATE_LIMIT_SALT"); return miss; };
