// Welcome email, sent once per account right after sign-up. Called by js/auth.js with the new user's access token.
import { json, getUser, SB_URL } from "./_lib/common.mjs";
import { svc, sendOne, confirmedEmail } from "./_lib/mail.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const u = await getUser(req); if (!u || !u.id) return json(401, { error: "sign in first" });
  // Only brand-new accounts (created in the last 30 minutes), and only once per account.
  if (Date.now() - Date.parse(u.created_at || 0) > 30 * 60 * 1000) return json(200, { ok: true, skipped: "not new" });
  const email = await confirmedEmail(u.id); if (!email) return json(200, { ok: true, skipped: "no confirmed email" });
  const once = await fetch(`${SB_URL}/rest/v1/docs`, { method: "POST", headers: { ...svc(), Prefer: "return=minimal" },
    body: JSON.stringify({ col: "welcome_sent", id: u.id, uid: null, data: { at: new Date().toISOString() }, updated_at: new Date().toISOString() }) });
  if (!once.ok) return json(200, { ok: true, skipped: "already sent" }); // unique (col,id) -> second call fails here
  const go = (h, t) => `<a href="https://mnaprep.com/?utm_source=email&utm_campaign=welcome${h}" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:10px">${t}</a>`;
  const html = `<!doctype html><html><body style="margin:0;background:#EEF1F5;font-family:Arial,Helvetica,sans-serif;color:#13203B">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<div style="font-weight:900;letter-spacing:.06em;font-size:22px;margin-bottom:14px">M<span style="color:#2448D8">&amp;</span>A Prep</div>
<div style="background:#fff;border:1px solid #D3D9E4;border-radius:14px;padding:22px 20px;font-size:16px;line-height:1.55">
<h1 style="font-size:22px;margin:0 0 10px">You're in. Welcome to M&amp;A Prep 👋</h1>
<p style="margin:0 0 12px">Your account is set up and your progress now saves across devices. Here's the fastest way to start:</p>
<ol style="margin:0 0 16px;padding-left:20px">
<li><b>Clear Level 1</b> (5 minutes): the three statements, the base of every technical interview.</li>
<li><b>Try a Rapid Fire round</b>: quick questions against the clock.</li>
<li><b>Do one mock interview question</b>: answer out loud or type it, then get graded.</li>
</ol>
<p style="margin:0 0 18px">${go("#learn", "Start Level 1 →")}</p>
<p style="margin:0;font-size:14px;color:#4A5672">Sign in any time with your email and password at mnaprep.com. Forgot it? Tap "Forgot password?" on the sign-in screen.</p>
</div>
<p style="font-size:12px;color:#4A5672;line-height:1.5;margin-top:16px;text-align:center">You're getting this one-time email because you just created an M&amp;A Prep account.</p>
</div></body></html>`;
  try { await sendOne({ to: email, subject: "You're in. Welcome to M&A Prep 👋", html }); }
  catch (e) { console.error("welcome email", String(e)); return json(200, { ok: false }); }
  return json(200, { ok: true });
};
