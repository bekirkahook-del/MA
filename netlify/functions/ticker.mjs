// Live market tape for the site: current price and % change vs. the previous close, straight from
// Yahoo Finance's chart API. Netlify's CDN caches the response for 60s, so this costs at most one
// Yahoo round-trip per minute no matter how many people are on the site.
const MAP = [
  ["DOW", "^DJI", "idx"], ["S&P 500", "^GSPC", "idx"], ["NASDAQ", "^IXIC", "idx"], ["RUSSELL 2000", "^RUT", "idx"],
  ["VIX", "^VIX", "num"], ["10Y YIELD", "^TNX", "yld"], ["WTI", "CL=F", "usd"], ["GOLD", "GC=F", "usd0"],
  ["SILVER", "SI=F", "usd"], ["BITCOIN", "BTC-USD", "usd0"],
];
const CORE = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "GS", "MS", "ANT"]; // ANT = Anthropic (Nasdaq IPO, Nov 2026)
const OK = /^[A-Z][A-Z.\-]{0,6}$/;

const fmt = (n, d) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
function show(kind, p) {
  if (kind === "idx") return fmt(p, 0);
  if (kind === "num") return fmt(p, 2);
  if (kind === "yld") return fmt(p, 2) + "%";
  if (kind === "usd0") return "$" + fmt(p, 0);
  return "$" + fmt(p, 2);
}

// Yahoo has two public hosts. Try query1, then query2, each with a short timeout, so one slow or failing
// host never leaves the tape on old prices.
const HOSTS = ["https://query1.finance.yahoo.com", "https://query2.finance.yahoo.com"];
async function one(sym) {
  let err;
  for (const h of HOSTS) {
    try {
      const r = await fetch(`${h}/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=5m`,
        { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(4000) });
      if (!r.ok) throw new Error(sym + " " + r.status);
      const m = (await r.json()).chart.result[0].meta;
      const p = m.regularMarketPrice, prev = m.chartPreviousClose ?? m.previousClose;
      if (typeof p !== "number" || typeof prev !== "number" || !(p > 0) || !(prev > 0)) throw new Error(sym + " no price");
      // Sanity check: a move over 60% in a day on an index, commodity or mega-cap is almost always a bad tick.
      if (Math.abs(p / prev - 1) > 0.6) throw new Error(sym + " bad tick");
      return { p, ch: Math.round((p / prev - 1) * 10000) / 100, t: m.regularMarketTime };
    } catch (e) { err = e; }
  }
  throw err;
}

/* Last good prices, kept server-side (Supabase docs, col "views", id "_tape"; only the server writes it).
   If Yahoo fails for a symbol, the tape uses that symbol's last good live price instead of dropping it,
   so the site never falls back to the weeks-old prices baked into wire.json. */
const SB = "https://nbakxpnhcfzdosbzbupd.supabase.co";
const svcH = () => { const k = process.env.SUPABASE_SERVICE_ROLE_KEY_good || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return { apikey: k, "Content-Type": "application/json", ...(k.startsWith("eyJ") ? { Authorization: `Bearer ${k}` } : {}) }; };
async function loadLast() {
  try { const r = await fetch(`${SB}/rest/v1/docs?col=eq.views&id=eq._tape&select=data`, { headers: svcH(), signal: AbortSignal.timeout(3000) });
    const rows = r.ok ? await r.json() : []; return (rows[0] && rows[0].data) || null; } catch (e) { return null; }
}
async function saveLast(data) {
  try { await fetch(`${SB}/rest/v1/docs?on_conflict=col,id`, { method: "POST", signal: AbortSignal.timeout(3000),
    headers: { ...svcH(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ col: "views", id: "_tape", uid: null, data, updated_at: new Date().toISOString() }) }); } catch (e) {}
}

export default async (req) => {
  const extra = (new URL(req.url).searchParams.get("s") || "").split(",").map(s => s.trim().toUpperCase())
    .filter(s => OK.test(s)).sort().slice(0, 12);
  const stocks = [...new Set([...CORE, ...extra])].map(s => [s, s, "usd"]);
  const all = [...MAP, ...stocks];
  const res = await Promise.allSettled(all.map(([, y]) => one(y)));
  const out = [], fresh = {};
  let t = 0, missing = 0;
  res.forEach((x, i) => {
    const [name, , kind] = all[i];
    if (x.status !== "fulfilled") { missing++; out.push(null); return; }
    const v = x.value, row = [name, show(kind, v.p), kind === "yld" ? null : v.ch];
    out.push(row); fresh[name] = { row, t: v.t };
    if (kind === "idx" && v.t > t) t = v.t; // stock indexes decide the "as of" time
  });
  // Fill any symbol Yahoo didn't return from the last good copy (if it's under 4 days old), and remember this run.
  const last = await loadLast();
  const keep = (last && last.syms) || {};
  const stale = [];
  out.forEach((row, i) => {
    if (row) return;
    const name = all[i][0], k = keep[name];
    if (k && Date.now() / 1000 - k.t < 4 * 86400) { out[i] = k.row; stale.push(name); }
  });
  if (Object.keys(fresh).length) saveLast({ syms: { ...keep, ...fresh }, at: Date.now() });
  return new Response(JSON.stringify({ asOf: t ? new Date(t * 1000).toISOString() : null, tape: out.filter(Boolean), stale }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=30",
      "netlify-cdn-cache-control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
};
