// Email helpers: subscriber storage (Supabase docs, col "subscribers", server-only) and sending via Resend.
import { SB_URL, SITE } from "./common.mjs";

const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const svc = () => { const k = key(); return { apikey: k, "Content-Type": "application/json", ...(k.startsWith("eyJ") ? { Authorization: `Bearer ${k}` } : {}) }; };
export const FROM = () => process.env.MAIL_FROM || "M&A Prep <hello@mnaprep.com>";
export const ADDRESS = () => (process.env.MAIL_ADDRESS || "").trim(); // postal address, required by US law (CAN-SPAM) on marketing email

export async function sha(s) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
export const rand = () => [...crypto.getRandomValues(new Uint8Array(16))].map(x => x.toString(16).padStart(2, "0")).join("");

export async function getSub(id) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.subscribers&id=eq.${id}&select=data`, { headers: svc() });
  const rows = r.ok ? await r.json() : [];
  return rows[0] ? rows[0].data : null;
}
export async function putSub(id, data) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, {
    method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "subscribers", id, uid: null, data, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error("save failed " + r.status + " " + (await r.text()));
}
export async function activeSubs() {
  const out = []; let from = 0;
  for (;;) {
    const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.subscribers&select=id,data&order=id`, { headers: { ...svc(), Range: `${from}-${from + 999}` } });
    const rows = r.ok ? await r.json() : [];
    rows.forEach(x => { if (x.data && x.data.status === "active" && x.data.email) out.push({ id: x.id, ...x.data }); });
    if (rows.length < 1000) break; from += 1000;
  }
  return out;
}

export const unsubUrl = s => `${SITE}/.netlify/functions/unsubscribe?id=${s.id}&t=${s.token}`;

// Simple, mobile-friendly email shell. body = inner HTML.
export function shell(body, s) {
  const addr = ADDRESS();
  return `<!doctype html><html><body style="margin:0;background:#EEF1F5;font-family:Arial,Helvetica,sans-serif;color:#13203B">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<div style="font-weight:900;letter-spacing:.06em;font-size:22px;margin-bottom:14px">M<span style="color:#2448D8">&amp;</span>A Prep</div>
<div style="background:#fff;border:1px solid #D3D9E4;border-radius:14px;padding:22px 20px;font-size:16px;line-height:1.55">${body}</div>
<p style="font-size:14px;margin:14px 0 0;text-align:center"><a href="${SITE}/discord" style="color:#2448D8;font-weight:bold">💬 Join the M&amp;A Prep Discord</a>: daily questions, deal alerts and application alerts</p>
<p style="font-size:12px;color:#4A5672;line-height:1.5;margin-top:16px">You're getting this because you signed up at mnaprep.com.
<a href="${unsubUrl(s)}" style="color:#4A5672">Unsubscribe</a>${addr ? `<br>${addr.replace(/[<>&]/g, "")}` : ""}</p>
</div></body></html>`;
}

export async function send(list) { // list of {to, subject, html, s}
  const k = process.env.RESEND_API_KEY; if (!k) throw new Error("RESEND_API_KEY not set");
  for (let i = 0; i < list.length; i += 100) {
    const batch = list.slice(i, i + 100).map(m => ({
      from: FROM(), to: [m.to], subject: m.subject, html: m.html,
      headers: { "List-Unsubscribe": `<${unsubUrl(m.s)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    }));
    const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" }, body: JSON.stringify(batch) });
    if (!r.ok) throw new Error("send failed " + r.status + " " + (await r.text()));
  }
}
