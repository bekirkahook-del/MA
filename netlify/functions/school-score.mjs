// Superday test school board. Self-reported, unverified: one row per visitor (first attempt only) in docs (col "testscore").
// POST {school, score, v}  -> saves the visitor's first score. GET -> top schools (needs at least MIN results each).
import { json, SB_URL, hitLimit, tooMany, clientIp } from "./_lib/common.mjs";

const MIN = 5, TOTAL = 12, TOP = 10;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY;
const hdr = (k) => ({ apikey: k, "Content-Type": "application/json", ...(k.startsWith("eyJ") ? { Authorization: `Bearer ${k}` } : {}) });
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|curl|wget|python|monitor/i;

async function board(k) {
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.testscore&select=data&limit=20000`, { headers: hdr(k) });
  const rows = r.ok ? await r.json() : [];
  const by = {};
  for (const x of rows) {
    const d = x.data || {};
    if (!/^[a-z0-9-]{2,60}$/.test(d.s || "") || !(d.n >= 0 && d.n <= TOTAL)) continue;
    const o = by[d.s] || (by[d.s] = { n: 0, sum: 0 });
    o.n++; o.sum += d.n;
  }
  const all = Object.entries(by).map(([school, o]) => ({ school, n: o.n, avg: Math.round((o.sum / o.n) * 10) / 10 }));
  const ranked = all.filter((o) => o.n >= MIN).sort((a, b) => b.avg - a.avg || b.n - a.n);
  return { top: ranked.slice(0, TOP), ranked: ranked.map((o) => o.school), counts: Object.fromEntries(all.map((o) => [o.school, o.n])), total: TOTAL, min: MIN, takers: rows.length };
}

export default async (req, context) => {
  const k = key();
  if (!k) return json(503, { error: "not set up" });
  if (req.method === "GET") {
    const b = await board(k);
    return new Response(JSON.stringify(b), { status: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" } });
  }
  if (req.method !== "POST") return json(405, { error: "GET or POST only" });
  if (BOT.test(req.headers.get("user-agent") || "")) return json(200, { ok: true });
  if (!(await hitLimit("score", clientIp(req, context), 60, 3600))) return tooMany(); // one visitor can't flood the school board
  let b;
  try { b = await req.json(); } catch (e) { return json(400, { error: "bad request" }); }
  const v = String(b.v || ""), s = String(b.school || ""), n = Math.round(+b.score);
  if (!/^[a-z0-9]{8,24}$/.test(v) || !/^[a-z0-9-]{2,60}$/.test(s) || !(n >= 0 && n <= TOTAL)) return json(400, { error: "bad input" });
  const now = new Date().toISOString();
  const r = await fetch(`${SB_URL}/rest/v1/docs`, {
    method: "POST",
    headers: { ...hdr(k), Prefer: "resolution=ignore-duplicates,return=minimal" }, // first attempt only: same visitor can't add a second row
    body: JSON.stringify({ col: "testscore", id: v, uid: null, data: { s, n, t: now }, updated_at: now }),
  });
  if (!r.ok) { console.error("testscore insert failed", r.status, await r.text()); return json(502, { error: "failed" }); }
  return json(200, { ok: true });
};
