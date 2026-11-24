// One-click unsubscribe from promo emails sent to account holders (review email etc.). GET shows a page, POST is RFC 8058 one-click.
import { SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";
import { unsubToken } from "./_lib/reviewmail.mjs";
import { timingSafeEqual } from "node:crypto";
const page = (msg) => new Response(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><title>M&A Prep</title><body style="font-family:Arial,sans-serif;max-width:480px;margin:60px auto;padding:0 16px;color:#13203B"><h2>M&amp;A Prep</h2><p style="font-size:17px">${msg}</p><p><a href="https://mnaprep.com">Back to mnaprep.com</a></p>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
export default async (req) => {
  const q = new URL(req.url).searchParams, uid = q.get("u") || "", t = q.get("t") || "";
  const good = /^[0-9a-f-]{36}$/i.test(uid) && t.length === 32 && timingSafeEqual(Buffer.from(t), Buffer.from(unsubToken(uid)));
  if (!good) return page("That unsubscribe link isn't valid. Reply to any of our emails and we'll take you off.");
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "mailoff", id: uid, uid: null, data: { promo: true, t: new Date().toISOString() }, updated_at: new Date().toISOString() }) });
  if (!r.ok) return page("Something went wrong. Please try again, or reply to the email and we'll take you off.");
  return page("You're unsubscribed. You won't get emails like that again. (Sign-in links and receipts still come when you ask for them.)");
};
