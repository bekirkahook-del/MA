// One year of daily closing prices for the Market search Monte Carlo, from Yahoo Finance's chart API.
// Also feeds the price card on quote/company panels. Netlify's CDN caches each symbol for 30 minutes.
const MAP = {
  "DOW": "^DJI", "S&P 500": "^GSPC", "NASDAQ": "^IXIC", "RUSSELL 2000": "^RUT", "VIX": "^VIX",
  "WTI": "CL=F", "BRENT": "BZ=F", "GOLD": "GC=F", "SILVER": "SI=F", "BITCOIN": "BTC-USD",
};
const OK = /^[A-Z][A-Z0-9.\-]{0,9}$/;

const out = (status, body, cache) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json",
    "cache-control": cache ? "public, max-age=600" : "no-store",
    ...(cache ? { "netlify-cdn-cache-control": "public, s-maxage=1800, stale-while-revalidate=21600" } : {}),
  },
});

export default async (req) => {
  const raw = (new URL(req.url).searchParams.get("s") || "").trim().toUpperCase();
  const y = MAP[raw] || (OK.test(raw) ? raw.replace(/\./g, "-") : null);
  if (!y) return out(400, { error: "bad symbol" });
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?range=2y&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!r.ok) return out(r.status === 404 ? 404 : 502, { error: "no data" });
    const res = (await r.json()).chart?.result?.[0];
    const ts = res?.timestamp || [], cl = res?.indicators?.quote?.[0]?.close || [];
    const pts = [];
    ts.forEach((t, i) => { const c = cl[i]; if (typeof c === "number" && c > 0) pts.push([t, Math.round(c * 1e4) / 1e4]); });
    if (!pts.length) return out(404, { error: "no history" }); // new listings (IPOs) may have only a few days
    /* 2 years are fetched so the 200-day moving average exists for the whole 1-year chart.
       ma[i] = [50-day MA, 200-day MA] for pts[i] (null until there are enough trading days). */
    const sma = (n, i) => { if (i + 1 < n) return null; let s = 0; for (let k = i - n + 1; k <= i; k++) s += pts[k][1]; return Math.round(s / n * 1e4) / 1e4; };
    const ma = pts.map((_, i) => [sma(50, i), sma(200, i)]);
    const cut = pts.length - 1 - pts.slice().reverse().findIndex(p => p[0] < pts[pts.length - 1][0] - 366 * 86400);
    const from = cut > pts.length - 1 ? 0 : cut + 1;
    pts.splice(0, from); ma.splice(0, from);
    const last = res.meta?.regularMarketPrice;
    const m = res.meta || {};
    return out(200, { s: raw, y, cur: m.currency || "USD", last: typeof last === "number" ? last : pts[pts.length - 1][1], pts,
      name: m.longName || m.shortName || "", ex: m.fullExchangeName || m.exchangeName || "", t: m.regularMarketTime || null,
      hi52: m.fiftyTwoWeekHigh ?? null, lo52: m.fiftyTwoWeekLow ?? null, ma }, true);
  } catch (e) {
    return out(502, { error: "fetch failed" });
  }
};
