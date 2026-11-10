// Live market tape for the site: current price and % change vs. the previous close, straight from
// Yahoo Finance's chart API. Netlify's CDN caches the response for 60s, so this costs at most one
// Yahoo round-trip per minute no matter how many people are on the site.
const MAP = [
  ["DOW", "^DJI", "idx"], ["S&P 500", "^GSPC", "idx"], ["NASDAQ", "^IXIC", "idx"], ["RUSSELL 2000", "^RUT", "idx"],
  ["VIX", "^VIX", "num"], ["10Y YIELD", "^TNX", "yld"], ["WTI", "CL=F", "usd"], ["GOLD", "GC=F", "usd0"],
  ["SILVER", "SI=F", "usd"], ["BITCOIN", "BTC-USD", "usd0"],
];
const CORE = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "GS", "MS"];
const OK = /^[A-Z][A-Z.\-]{0,6}$/;

const fmt = (n, d) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
function show(kind, p) {
  if (kind === "idx") return fmt(p, 0);
  if (kind === "num") return fmt(p, 2);
  if (kind === "yld") return fmt(p, 2) + "%";
  if (kind === "usd0") return "$" + fmt(p, 0);
  return "$" + fmt(p, 2);
}

async function one(sym) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=5m`,
    { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(sym + " " + r.status);
  const m = (await r.json()).chart.result[0].meta;
  const p = m.regularMarketPrice, prev = m.chartPreviousClose ?? m.previousClose;
  if (typeof p !== "number" || typeof prev !== "number" || !prev) throw new Error(sym + " no price");
  return { p, ch: Math.round((p / prev - 1) * 10000) / 100, t: m.regularMarketTime };
}

export default async (req) => {
  const extra = (new URL(req.url).searchParams.get("s") || "").split(",").map(s => s.trim().toUpperCase())
    .filter(s => OK.test(s)).slice(0, 20);
  const stocks = [...new Set([...CORE, ...extra])].map(s => [s, s, "usd"]);
  const all = [...MAP, ...stocks];
  const res = await Promise.allSettled(all.map(([, y]) => one(y)));
  const out = [];
  let t = 0;
  res.forEach((x, i) => {
    if (x.status !== "fulfilled") return;
    const [name, , kind] = all[i];
    const v = x.value;
    out.push([name, show(kind, v.p), kind === "yld" ? null : v.ch]);
    if (kind === "idx" && v.t > t) t = v.t; // stock indexes decide the "as of" time
  });
  return new Response(JSON.stringify({ asOf: t ? new Date(t * 1000).toISOString() : null, tape: out }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=30",
      "netlify-cdn-cache-control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
};
