// Public, real numbers for the home page proof line: how many students have an account.
// Counts only (no personal data). Cached 1 hour at Netlify's edge.
import { SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";

export default async () => {
  let students = null;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/docs?id=eq.progress&col=like.data/users/*&select=id`, {
      headers: { ...svc(), Prefer: "count=exact", Range: "0-0" } });
    const m = (r.headers.get("content-range") || "").match(/\/(\d+)$/);
    if (m) students = +m[1];
  } catch (e) {}
  return new Response(JSON.stringify({ students }), { headers: {
    "content-type": "application/json", "cache-control": "public, max-age=600",
    "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=7200" } });
};
