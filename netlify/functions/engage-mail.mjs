// Daily, early evening ET: (1) "your streak ends tonight" and (2) "<friend> passed you this week" emails,
// only to members who opted in (docs col "engage", written by engage-prefs). At most one email per person per day.
// Reads the public leaderboard docs (col "players") for streak, weekly XP and friends; emails come from the auth admin API.
import { SB_URL, SITE } from "./_lib/common.mjs";
import { svc, FROM } from "./_lib/mail.mjs";

const esc = s => String(s ?? "").replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
const etDay = t => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
async function rows(q) { const r = await fetch(`${SB_URL}/rest/v1/docs?${q}`, { headers: svc() }); return r.ok ? r.json() : []; }
async function put(col, id, data) { await fetch(`${SB_URL}/rest/v1/docs?on_conflict=col,id`, { method: "POST", headers: { ...svc(), Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify({ col, id, uid: null, data, updated_at: new Date().toISOString() }) }); }
async function emailOf(uid) { const r = await fetch(`${SB_URL}/auth/v1/admin/users/${uid}`, { headers: svc() }); if (!r.ok) return null; const u = await r.json(); return u && u.email && (u.email_confirmed_at || u.confirmed_at) ? u.email : null; }
const wrap = body => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:20px;color:#13203B"><div style="font-weight:900;font-size:20px;margin-bottom:12px">M<span style="color:#2448D8">&amp;</span>A Prep</div>${body}
<p style="font-size:12px;color:#4A5672;line-height:1.5;margin-top:18px">You're getting this because you turned on streak and friend emails on mnaprep.com. Turn them off anytime from the Today card on the Home page, or reply to this email.</p></div>`;
const btn = (t, u) => `<p><a href="${u}" style="display:inline-block;background:#2448D8;color:#fff;text-decoration:none;font-weight:bold;border-radius:10px;padding:11px 18px">${t}</a></p>`;

export default async () => {
  if (!process.env.RESEND_API_KEY) return new Response("no key");
  const today = etDay(Date.now()); let sent = 0;
  const opted = (await rows("col=eq.engage&select=id,data")).filter(x => x.data && (x.data.streak || x.data.nudge));
  for (const o of opted) {
    const d = o.data; if (d.last === today) continue;
    const pr = await rows(`col=eq.players&id=eq.${o.id}&select=data`); const me = pr[0] && pr[0].data; if (!me) continue;
    let subject = "", body = "";
    // friends = people I follow who follow me back
    let above = [];
    if (d.nudge && (me.follows || []).length) {
      const ids = (me.follows || []).slice(0, 60).filter(i => /^[0-9a-f-]{36}$/i.test(i));
      const fr = ids.length ? await rows(`col=eq.players&id=in.(${ids.join(",")})&select=id,data`) : [];
      const mine = me.wkXP || 0;
      above = fr.filter(f => (f.data.follows || []).includes(o.id) && f.data.wk === me.wk && (f.data.wkXP || 0) > mine).map(f => f.id);
      const fresh = above.filter(i => d.above && !d.above.includes(i));
      if (fresh.length) {
        const f = fr.find(x => x.id === fresh[0]).data;
        subject = "A friend just passed you this week"; body = `<p style="font-size:18px"><b>🏁 A friend passed you on this week's leaderboard</b></p><p style="font-size:15px;line-height:1.5">They're on ${f.wkXP || 0} XP and you're on ${mine}. One quick level can take it back.</p>${btn("Take it back →", SITE + "/?utm_source=nudge#compete")}`;
      }
    }
    // streak about to break: streak ≥ 2 and no activity yet today
    const active = me.updated && etDay(me.updated) === today;
    if (!subject && d.streak && (me.streak || 0) >= 2 && !active) {
      subject = `Your ${me.streak}-day streak ends tonight`;
      body = `<p style="font-size:18px"><b>🔥 Your ${me.streak}-day streak ends tonight</b></p><p style="font-size:15px;line-height:1.5">One 2-minute question keeps it alive. Your streak freezes (if you have one) can cover a missed day, but don't count on it.</p>${btn("Keep my streak →", SITE + "/?utm_source=streak")}`;
    }
    await put("engage", o.id, { ...d, above, ...(subject ? { last: today } : {}) });
    if (!subject) continue;
    const to = await emailOf(o.id); if (!to) continue;
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM(), to: [to], subject, html: wrap(body) }) }).catch(() => null);
    if (r && r.ok) sent++;
  }
  console.log("engage-mail sent", sent);
  return new Response("ok " + sent);
};
export const config = { schedule: "0 23 * * *" }; // 6pm ET (7pm in summer)
