// One year of daily closing prices for the Market search Monte Carlo, from Yahoo Finance's chart API.
// Netlify's CDN caches each symbol for 6 hours, so a popular symbol costs about 4 Yahoo calls a day.
const MAP = {
  "DOW": "^DJI", "S&P 500": "^GSPC", "NASDAQ": "^IXIC", "RUSSELL 2000": "^RUT", "VIX": "^VIX",
  "WTI": "CL=F", "BRENT": "BZ=F", "GOLD": "GC=F", "SILVER": "SI=F", "BITCOIN": "BTC-USD",
};
const OK = /^[A-Z][A-Z0-9.\-]{0,9}$/;

const out = (status, body, cache) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json",
    "cache-control": cache ? "public, max-age=3600" : "no-store",
    ...(cache ? { "netlify-cdn-cache-control": "public, s-maxage=21600, stale-while-revalidate=86400" } : {}),
  },
});

export default async (req) => {
  const raw = (new URL(req.url).searchParams.get("s") || "").trim().toUpperCase();
  const y = MAP[raw] || (OK.test(raw) ? raw.replace(/\./g, "-") : null);
  if (!y) return out(400, { error: "bad symbol" });
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?range=1y&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return out(r.status === 404 ? 404 : 502, { error: "no data" });
    const res = (await r.json()).chart?.result?.[0];
    const ts = res?.timestamp || [], cl = res?.indicators?.quote?.[0]?.close || [];
    const pts = [];
    ts.forEach((t, i) => { const c = cl[i]; if (typeof c === "number" && c > 0) pts.push([t, Math.round(c * 1e4) / 1e4]); });
    if (pts.length < 60) return out(404, { error: "not enough history" });
    const last = res.meta?.regularMarketPrice;
    return out(200, { s: raw, y, cur: res.meta?.currency || "USD", last: typeof last === "number" ? last : pts[pts.length - 1][1], pts }, true);
  } catch (e) {
    return out(502, { error: "fetch failed" });
  }
};
