// One-click unsubscribe (link in every email, plus the List-Unsubscribe header).
import { getSub, putSub } from "./_lib/mail.mjs";

const page = (msg) => new Response(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>M&amp;A Prep</title>
<body style="font-family:Arial,sans-serif;background:#EEF1F5;color:#13203B;display:grid;place-items:center;min-height:90vh;margin:0">
<div style="background:#fff;border:1px solid #D3D9E4;border-radius:14px;padding:28px;max-width:420px;text-align:center"><h2 style="margin-top:0">${msg}</h2>
<p><a href="https://mnaprep.com/" style="color:#2448D8">Back to M&amp;A Prep</a></p></div></body>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });

export default async (req) => {
  const u = new URL(req.url), id = u.searchParams.get("id") || "", t = u.searchParams.get("t") || "";
  if (!/^[a-f0-9]{32}$/.test(id) || !/^[a-f0-9]{32}$/.test(t)) return page("That link doesn't look right.");
  const s = await getSub(id).catch(() => null);
  if (!s || s.token !== t) return page("That link doesn't look right.");
  if (s.status !== "unsubscribed") await putSub(id, { ...s, status: "unsubscribed", unsubAt: new Date().toISOString() });
  return page("You're unsubscribed. No more emails.");
};
