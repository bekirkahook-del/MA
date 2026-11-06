// Server-side Pro check: a paid Stripe plan (billing doc) or an active 7-day trial on the account's progress.
import { SB_URL } from "./common.mjs";
import { svc } from "./mail.mjs";
export async function isProUser(uid) {
  const get = async (col, id) => { const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.${encodeURIComponent(col)}&id=eq.${id}&select=data`, { headers: svc() }); const rows = r.ok ? await r.json() : []; return rows[0] ? rows[0].data : null; };
  const b = await get("billing", uid).catch(() => null);
  if (b && b.paid && (!b.until || Date.parse(b.until) > Date.now())) return true;
  const p = await get(`data/users/${uid}`, "progress").catch(() => null);
  let s = p; if (p && typeof p.s === "string") { try { s = JSON.parse(p.s); } catch (e) { s = null; } }
  const pro = s && s.pro; if (!pro || !pro.plan) return false;
  return pro.plan === "trial" ? Date.now() - (pro.start || 0) < 7 * 864e5 : true;
}
