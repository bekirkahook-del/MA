// Owner only: every account with everything we know about it, newest first (stats page "Accounts" section).
// Emails and sign-up details come from Supabase Auth (server-only); progress, profile, Pro and reviews from docs.
import { json, getUser, isOwnerUser, SB_URL, tierOf, proUntil } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";

async function docs(col, q = "", select = "id,data,updated_at") {
  const out = []; let from = 0;
  for (;;) {
    const r = await fetch(`${SB_URL}/rest/v1/docs?col=${col}${q}&select=${select}&order=id`, { headers: { ...svc(), Range: `${from}-${from + 999}` } });
    if (!r.ok) throw new Error(`read ${col} ${r.status}`);
    const rows = await r.json(); out.push(...rows); if (rows.length < 1000) break; from += 1000;
  }
  return out;
}
async function users() {
  const out = [];
  for (let page = 1; page < 50; page++) {
    const r = await fetch(`${SB_URL}/auth/v1/admin/users?page=${page}&per_page=1000`, { headers: svc() });
    if (!r.ok) throw new Error("users " + r.status);
    const u = (await r.json()).users || []; out.push(...u); if (u.length < 1000) break;
  }
  return out;
}
const day = t => new Date(t).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

export default async (req) => {
  const me = await getUser(req); if (!(await isOwnerUser(me))) return json(403, { error: "Owner only" });
  try {
    const [U, players, names, bills, reviews, subs, prog, visits, off] = await Promise.all([
      users(), docs("eq.players"), docs("eq.names"), docs("eq.billing"), docs("eq.reviews"), docs("eq.subscribers"),
      docs("like.data%2Fusers%2F*", "&id=eq.progress", "col,data,updated_at"), docs("eq.visits", "", "id,data"), docs("eq.mailoff")]);
    const by = (rows) => Object.fromEntries(rows.map(r => [r.id, r.data || {}]));
    const P = by(players), N = by(names), B = by(bills), R = by(reviews), OFF = by(off);
    const subBy = {}; subs.forEach(s => { const d = s.data || {}; if (d.email) subBy[String(d.email).toLowerCase()] = d.status || ""; });
    /* first visit per visitor id (where they first came from) */
    const firstVisit = {}; visits.forEach(v => { const d = v.data || {}, vid = String(v.id).slice(11); if (!vid) return; const f = firstVisit[vid]; if (!f || (d.d || "") < f.d) firstVisit[vid] = { d: d.d, src: d.src || d.ref || "", cmp: d.cmp || "", p: d.p || "", dev: d.dev || "", city: d.city || "", region: d.region || "" }; });
    const progBy = {}; prog.forEach(r => { const uid = r.col.slice(11); let s = {}; try { s = JSON.parse((r.data || {}).s || "{}"); } catch (e) {} progBy[uid] = { s, t: Date.parse(r.updated_at) || 0 }; });
    const list = U.map(u => {
      const p = P[u.id] || {}, b = B[u.id] || {}, pr = progBy[u.id] || { s: {}, t: 0 }, S = pr.s || {}, acq = S.acq || {};
      const fv = acq.vid ? firstVisit[acq.vid] : null;
      const days = new Set(); ["daily", "grades", "xpLog", "questXP"].forEach(k => { const o = S[k]; if (o && typeof o === "object") Object.keys(o).forEach(x => { if (/^\d{4}-\d{2}-\d{2}$/.test(x)) days.add(x); }); });
      const tier = tierOf(b);
      return {
        id: u.id, email: u.email || "", name: N[u.id] && N[u.id].name || "", joined: u.created_at, confirmed: !!(u.email_confirmed_at || u.confirmed_at),
        lastSignIn: u.last_sign_in_at || null, lastActive: Math.max(pr.t || 0, Date.parse(p.updated || 0) || 0) || null,
        via: (u.app_metadata && u.app_metadata.provider) || "email",
        school: p.school || "", grad: p.grad || "", target: p.target || "", year: (S.profile || {}).year || "",
        levels: +p.levels || 0, xp: +p.xp || 0, streak: +p.streak || 0, mocks: +p.mockN || 0, daysActive: days.size,
        friends: (p.follows || []).length, club: p.clubName || "", tier, plan: b.plan || "", proUntil: proUntil(b) || null, rewards: Object.keys(b.rewards || {}),
        paid: !!(b.paid || ["active", "trialing", "past_due"].includes(b.status)),
        review: R[u.id] ? { rating: R[u.id].rating, about: R[u.id].about || "" } : null,
        sunday: subBy[String(u.email || "").toLowerCase()] || "", promoOff: !!(OFF[u.id] && OFF[u.id].promo),
        src: acq.src || (fv && fv.src) || "", cmp: acq.cmp || (fv && fv.cmp) || "", landed: (fv && fv.p) || acq.p || "", nudge: acq.nudge || "",
        firstVisit: (fv && fv.d) || acq.vfirst || "", device: (fv && fv.dev) || "", place: fv ? [fv.city, fv.region].filter(Boolean).join(", ") : "",
      };
    }).sort((a, b) => Date.parse(b.joined) - Date.parse(a.joined));
    return json(200, { at: Date.now(), list });
  } catch (e) { console.error("owner-accounts", String(e)); return json(502, { error: "Couldn't load accounts" }); }
};
