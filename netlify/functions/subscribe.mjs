// Newsletter signup: saves the email (server-only table) and sends a welcome email.
import { json } from "./_lib/common.mjs";
import { sha, rand, getSub, putSub, shell, send } from "./_lib/mail.mjs";

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  let b; try { b = await req.json(); } catch (e) { return json(400, { error: "bad request" }); }
  if (b.hp) return json(200, { ok: true }); // honeypot: bots fill hidden fields
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(email)) return json(400, { error: "Please enter a valid email." });
  const id = await sha(email);
  const old = await getSub(id).catch(() => null);
  if (old && old.status === "active") return json(200, { ok: true, already: true });
  const s = { id, email, src: String(b.src || "").slice(0, 40), t: new Date().toISOString(), token: (old && old.token) || rand(), status: "active" };
  try { await putSub(id, s); } catch (e) { console.error(e); return json(502, { error: "Couldn't save right now. Try again." }); }
  if (process.env.RESEND_API_KEY) {
    const html = shell(`<p style="margin-top:0"><b>You're in.</b> Every Sunday you'll get one short email:</p>
<ul style="padding-left:20px"><li>A curveball interview question (answer at the bottom)</li><li>One quick tip for breaking into finance</li><li>A free guide worth reading</li></ul>
<p>Start now with today's curveball:</p>
<p><a href="https://mnaprep.com/?utm_source=email&utm_campaign=welcome#curve" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;border-radius:10px;padding:12px 20px">Try today's curveball →</a></p>`, s);
    try { await send([{ to: email, subject: "You're in: one finance curveball every Sunday", html, s }]); } catch (e) { console.error(e); }
  }
  return json(200, { ok: true });
};
