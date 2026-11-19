// Company logos for Market search, served from our own domain so visitors' browsers never contact a third party.
// Source: Financial Modeling Prep's public logo images. Netlify's CDN keeps each logo 30 days (misses for 1 day),
// so each symbol costs about one upstream request a month.
const OK = /^[A-Z][A-Z0-9.\-]{0,9}$/;

const miss = () => new Response("", {
  status: 404,
  headers: { "cache-control": "public, max-age=86400", "netlify-cdn-cache-control": "public, s-maxage=86400" },
});

export default async (req) => {
  const s = (new URL(req.url).searchParams.get("s") || "").trim().toUpperCase();
  if (!OK.test(s)) return miss();
  try {
    const r = await fetch(`https://financialmodelingprep.com/image-stock/${encodeURIComponent(s.replace(/\./g, "-"))}.png`,
      { headers: { "User-Agent": "Mozilla/5.0" } });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !type.startsWith("image/")) return miss();
    const buf = await r.arrayBuffer();
    if (buf.byteLength < 100 || buf.byteLength > 300000) return miss();
    return new Response(buf, {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=604800",
        "netlify-cdn-cache-control": "public, s-maxage=2592000, stale-while-revalidate=2592000",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (e) {
    return miss();
  }
};
