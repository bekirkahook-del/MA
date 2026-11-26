// "Finish Level 1" email for new accounts that signed up but never cleared a level (Nov 26, 2026).
// Same safety rules as the review email: confirmed email only, skips anyone who opted out of promo emails or
// unsubscribed from the Sunday email, one per account ever (promolog), real postal address + one-click unsubscribe.
// Only accounts 1 to 7 days old (younger = still on their first session, older = past the useful window).
// NOTHING here sends to students. activation-email.mjs is owner-only: preview, or a test copy to the owner.
import { SITE } from "./common.mjs";
import { ADDRESS } from "./mail.mjs";
import { isEmail } from "./security.mjs";
import { docs, authUsers, unsubUrl } from "./reviewmail.mjs";

export const KIND = "activation-day-1";
const esc = s => String(s ?? "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));

export async function recipients(now = Date.now()) {
  const [users, off, subs, sent, players, names] = await Promise.all([authUsers(), docs("mailoff"), docs("subscribers"), docs("promolog", "id"), docs("players"), docs("names")]);
  const optedOut = new Set(off.filter(o => o.data && o.data.promo).map(o => o.id));
  const unsubEmails = new Set(subs.filter(s => s.data && s.data.status && s.data.status !== "active" && s.data.email).map(s => String(s.data.email).toLowerCase()));
  const already = new Set(sent.map(s => s.id));
  const levels = Object.fromEntries(players.map(p => [p.id, +(p.data && p.data.levels) || 0]));
  const nm = Object.fromEntries(names.map(n => [n.id, (n.data && n.data.name) || ""]));
  const skip = { tooNew: 0, tooOld: 0, unconfirmed: 0, clearedLevel: 0, optedOut: 0, alreadySent: 0, banned: 0 };
  const list = [];
  for (const u of users) {
    const age = (now - Date.parse(u.created_at || 0)) / 864e5, email = String(u.email || "").toLowerCase();
    if (age < 1) { skip.tooNew++; continue; }
    if (age > 7) { skip.tooOld++; continue; }
    if (!isEmail(email) || !(u.email_confirmed_at || u.confirmed_at)) { skip.unconfirmed++; continue; }
    if (u.banned_until && Date.parse(u.banned_until) > now || u.deleted_at) { skip.banned++; continue; }
    if ((levels[u.id] || 0) >= 1) { skip.clearedLevel++; continue; }
    if (optedOut.has(u.id) || unsubEmails.has(email)) { skip.optedOut++; continue; }
    if (already.has(`${KIND}:${u.id}`)) { skip.alreadySent++; continue; }
    list.push({ uid: u.id, email, first: String(nm[u.id] || "").trim().split(/\s+/)[0] || "" });
  }
  return { list, total: users.length, skip };
}

export function build(r) {
  const addr = ADDRESS(), link = `${SITE}/?utm_source=email&utm_campaign=activation&cta=finish_level_1`;
  const subject = "Your first level takes 5 minutes";
  const html = `<!doctype html><html><body style="margin:0;background:#EEF1F5;font-family:Arial,Helvetica,sans-serif;color:#13203B">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<div style="font-weight:900;letter-spacing:.06em;font-size:22px;margin-bottom:14px">M<span style="color:#2448D8">&amp;</span>A Prep</div>
<div style="background:#fff;border:1px solid #D3D9E4;border-radius:14px;padding:22px 20px;font-size:16px;line-height:1.55">
<h1 style="font-size:22px;margin:0 0 10px">${r.first ? esc(r.first) + ", y" : "Y"}our plan is ready. Next: Level 1.</h1>
<p>You made an account but haven't cleared a level yet. Level 1 is 5 minutes, free, and it's where your streak and score start.</p>
<p style="text-align:center;margin:18px 0"><a href="${link}" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;padding:13px 22px;border-radius:10px">Start Level 1 →</a></p>
<p style="font-size:13px;color:#4A5672;margin:0">One email like this, then we leave you alone.</p>
</div>
<p style="font-size:12px;color:#4A5672;line-height:1.5;margin-top:16px;text-align:center">You're getting this because you have an account at mnaprep.com.
<a href="${unsubUrl(r.uid)}" style="color:#4A5672">Unsubscribe from emails like this</a>${addr ? `<br>${esc(addr)}` : ""}</p>
</div></body></html>`;
  return { subject, html };
}
