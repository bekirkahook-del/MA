// Console Error Bot: opens the real site in a headless browser and records every JavaScript error and failed file. A silent error is a broken button for someone.
// Opt-in (needs a browser): node tools/bots/consoleerrors.mjs
import { ROOT, cli, serve, loadPlaywright } from "./lib.mjs";
import { guidePages, report } from "./scan.mjs";

const IGNORE = /(\/\.netlify\/|\/api\/|favicon|net::ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|CONNECTION|BLOCKED|FAILED)|Failed to load resource.*(404|403|401|5\d\d)|fonts\.g|googletagmanager|google-analytics|stripe|supabase|sentry|ERR_ABORTED|cloudflareinsights|cdn-cgi|Access to XMLHttpRequest|CORS policy)/i;
export function judge(pages) {
  const f = [], bad = pages.map(p => ({ url: p.url, errors: [...new Set(p.errors.filter(e => !IGNORE.test(e)))] })).filter(p => p.errors.length);
  if (bad.length) f.push({ code: "js-errors", severity: bad.some(p => p.url.endsWith("index.html") || p.url === "/") ? "critical" : "warn", where: bad[0].url, detail: `${bad.length} of ${pages.length} pages threw errors. ${bad.slice(0, 3).map(p => `${p.url}: ${p.errors[0].slice(0, 110)}`).join(" | ")}` });
  return report("consoleerrors", f, { pagesLoaded: pages.length, withErrors: bad.length });
}
export async function scan(root = ROOT, o = {}) {
  const gs = guidePages(root), pick = o.pages || ["index.html", ...[0, 0.25, 0.5, 0.75, 0.99].map(x => gs[Math.floor(x * gs.length)]).filter(Boolean).map(g => `guides/${g.slug}/`)], s = await serve(root), { chromium } = loadPlaywright(), b = await chromium.launch(), out = [];
  try { for (const u of pick) { const pg = await b.newPage(), errors = []; pg.on("pageerror", e => errors.push(String(e.message || e))); pg.on("console", m => { if (m.type() === "error") errors.push(m.text()); }); pg.on("requestfailed", r => errors.push(`${r.url()} ${r.failure() && r.failure().errorText}`)); await pg.goto(s.url + "/" + u, { waitUntil: "load" }).catch(e => errors.push("goto: " + e.message)); await pg.waitForTimeout(1200); out.push({ url: u, errors }); await pg.close(); } } finally { await b.close(); s.close(); }
  return judge(out);
}
cli(import.meta.url, () => scan());
