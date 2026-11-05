// Owner-only: sends this week's email to the owner's own inbox, so it can be checked before Sunday.
import { json, getUser } from "./_lib/common.mjs";
import { send, shell, activeSubs } from "./_lib/mail.mjs";
import { weekly } from "./_lib/weekly.mjs";
const OWNERS = ["bekirkahook@gmail.com", "kahook.3@osu.edu"];

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const u = await getUser(req);
  if (!u || !OWNERS.includes(String(u.email || "").toLowerCase())) return json(403, { error: "owner only" });
  if (!process.env.RESEND_API_KEY) return json(503, { error: "Email isn't set up yet (RESEND_API_KEY missing in Netlify)." });
  const { subject, body } = weekly(), subs = await activeSubs().catch(() => []);
  const s = { id: "0".repeat(32), token: "0".repeat(32) };
  try { await send([{ to: u.email, subject: "[TEST] " + subject, html: shell(body, s), s }]); } catch (e) { return json(502, { error: e.message }); }
  return json(200, { ok: true, to: u.email, subscribers: subs.length });
};
