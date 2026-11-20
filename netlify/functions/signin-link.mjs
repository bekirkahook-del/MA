// Emails a one-tap sign-in link (type "magic") or a set-password link (type "reset") through Resend.
import { json, hitLimit, tooMany, SITE } from "./_lib/common.mjs";
import { isEmail, clientIp } from "./_lib/security.mjs";
import { actionLink, sendOne, plainMail, btn } from "./_lib/mail.mjs";

export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  let b; try { b = await req.json(); } catch (e) { return json(400, { error: "bad request" }); }
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  if (!isEmail(email)) return json(400, { error: "Enter a valid email." });
  const reset = b.type === "reset";
  if (await hitLimit("signlink-ip", clientIp(req, context), 8, 3600)) return tooMany();
  if (await hitLimit("signlink-em", email, 3, 3600)) return tooMany();
  const link = await actionLink(reset ? "recovery" : "magiclink", email, SITE + "/");
  if (!link) return json(200, { ok: false, fallback: true }); // no account yet: client falls back to Supabase
  const html = plainMail(reset ? "Set your new password" : "Your sign-in link",
    `<p style="margin:0 0 18px">${reset ? "Tap below. You'll be signed in and asked to pick a new password." : "Tap below and you're signed in. The link works once."}</p><p style="margin:0">${btn(link, reset ? "Set my password →" : "Sign me in →")}</p>`);
  try { await sendOne({ to: email, subject: reset ? "Reset your M&A Prep password" : "Your M&A Prep sign-in link", html }); }
  catch (e) { console.error("signin-link", String(e)); return json(200, { ok: false, fallback: true }); }
  return json(200, { ok: true });
};
