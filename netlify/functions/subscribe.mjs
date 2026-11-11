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
  const cs = String(b.src || "") === "cheatsheet";
  const PDF = "https://mnaprep.com/cheat-sheet/50-investment-banking-interview-questions.pdf";
  const csHtml = (s) => shell(`<p style="margin-top:0"><b>Here's your cheat sheet:</b> 50 investment banking interview questions, each with a short answer you can say out loud.</p>
<p><a href="${PDF}" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;border-radius:10px;padding:12px 20px">Download the PDF →</a></p>
<p>Reading isn't enough, so say them out loud. Then test yourself with the free <a href="https://mnaprep.com/tools/superday-readiness-test/?utm_source=email&utm_campaign=cheatsheet">Superday readiness test</a>.</p>
<p>Every Sunday you'll also get one curveball interview question and one tip for breaking in.</p>`, s);
  if (old && old.status === "active") {
    if (cs && process.env.RESEND_API_KEY) { try { await send([{ to: email, subject: "Your free cheat sheet: 50 IB interview questions", html: csHtml(old), s: old }]); } catch (e) { console.error(e); } }
    return json(200, { ok: true, already: true });
  }
  const s = { id, email, src: String(b.src || "").slice(0, 40), t: new Date().toISOString(), token: (old && old.token) || rand(), status: "active" };
  try { await putSub(id, s); } catch (e) { console.error(e); return json(502, { error: "Couldn't save right now. Try again." }); }
  if (cs && process.env.RESEND_API_KEY) {
    try { await send([{ to: email, subject: "Your free cheat sheet: 50 IB interview questions", html: csHtml(s), s }]); } catch (e) { console.error(e); }
  } else if (process.env.RESEND_API_KEY) {
    const html = shell(`<p style="margin-top:0"><b>You're in.</b> Every Sunday you'll get one short email:</p>
<ul style="padding-left:20px"><li>A curveball interview question (answer at the bottom)</li><li>One quick tip for breaking into finance</li><li>A free guide worth reading</li></ul>
<p>Start now with today's curveball:</p>
<p><a href="https://mnaprep.com/?utm_source=email&utm_campaign=welcome#curve" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;border-radius:10px;padding:12px 20px">Try today's curveball →</a></p>`, s);
    try { await send([{ to: email, subject: "You're in: one finance curveball every Sunday", html, s }]); } catch (e) { console.error(e); }
  }
  return json(200, { ok: true });
};
