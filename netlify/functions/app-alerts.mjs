// Daily: emails Pro users who turned on alerts when a new internship application opens (from The Wire's openings list).
import { SB_URL } from "./_lib/common.mjs";
import { svc, FROM } from "./_lib/mail.mjs";
import { isProUser } from "./_lib/pro.mjs";
const WIRE = "https://raw.githubusercontent.com/bekirkahook-del/MA/main/data/wire.json";
const esc = s => String(s ?? "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
async function doc(col, id) { const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.${col}&id=eq.${id}&select=data`, { headers: svc() }); const rows = r.ok ? await r.json() : []; return rows[0] ? rows[0].data : null; }
async function put(col, id, data) { await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ col, id, uid: null, data, updated_at: new Date().toISOString() }) }); }
export default async () => {
  const w = await fetch(WIRE + "?t=" + Date.now()).then(r => r.json()).catch(() => null);
  const open = ((w && w.APP_OPEN) || []).filter(a => a[3] === "open"), key = a => `${a[0]}|${a[1]}`;
  const meta = await doc("alerts_meta", "sent");
  const sent = new Set((meta && meta.keys) || []);
  if (!meta) { await put("alerts_meta", "sent", { keys: open.map(key) }); console.log("alerts: seeded", open.length); return new Response("seeded"); }
  const fresh = open.filter(a => !sent.has(key(a)));
  if (!fresh.length) return new Response("nothing new");
  if (process.env.RESEND_API_KEY) {
    const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.alerts&select=id,data`, { headers: svc() });
    const subs = (r.ok ? await r.json() : []).filter(x => x.data && x.data.on && x.data.email);
    const rows = fresh.map(a => `<tr><td style="padding:8px 0;border-bottom:1px solid #E3E7EE"><b>${esc(a[0])}</b><br><span style="color:#4A5672">${esc(a[1])}${a[6] ? ` · closes ${esc(a[6])}` : ""}</span></td></tr>`).join("");
    for (const s of subs) {
      if (!(await isProUser(s.id))) continue;
      const html = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#13203B"><div style="font-weight:900;font-size:20px;margin-bottom:12px">M<span style="color:#2448D8">&amp;</span>A Prep</div>
<p style="font-size:17px"><b>🔔 ${fresh.length === 1 ? "A new application just opened" : `${fresh.length} new applications just opened`}</b></p><table style="width:100%;border-collapse:collapse;font-size:15px">${rows}</table>
<p><a href="https://mnaprep.com/?utm_source=alert#recruit" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;border-radius:10px;padding:11px 18px">See all openings →</a></p>
<p style="font-size:12px;color:#4A5672">You're getting this because you turned on application alerts (M&amp;A Prep Pro). Turn them off anytime in Career → Openings on mnaprep.com.</p></div>`;
      await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: FROM(), to: [s.data.email], subject: fresh.length === 1 ? `Now open: ${fresh[0][0]} ${fresh[0][1]}` : `${fresh.length} new applications just opened`, html }) }).catch(() => {});
    }
  }
  fresh.forEach(a => sent.add(key(a)));
  await put("alerts_meta", "sent", { keys: [...sent].slice(-2000) });
  console.log("alerts sent for", fresh.length);
  return new Response("ok");
};
export const config = { schedule: "0 13 * * *" }; // daily, 8am ET (9am in summer)
