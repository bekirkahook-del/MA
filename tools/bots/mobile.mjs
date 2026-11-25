// Mobile Layout Bot: loads pages at iPhone SE width (375px) and measures what breaks: sideways scrolling, tiny tap targets, tiny text. Most students arrive on a phone.
// Opt-in (needs a browser): node tools/bots/mobile.mjs
import { ROOT, cli, serve, loadPlaywright } from "./lib.mjs";
import { guidePages, report } from "./scan.mjs";

export function judge(rows, { minTarget = 24, minFont = 11 } = {}) {
  const f = [], over = rows.filter(r => r.scrollW > r.innerW + 2), tiny = rows.filter(r => r.smallTargets > 5), text = rows.filter(r => r.tinyText > 20);
  if (over.length) f.push({ code: "sideways-scroll", severity: over.some(r => /index\.html$/.test(r.url)) ? "critical" : "warn", where: over[0].url, detail: `${over.length} of ${rows.length} pages scroll sideways on a 375px phone: ${over.slice(0, 3).map(r => `${r.url} (${r.scrollW}px wide)`).join(", ")}` });
  if (tiny.length) f.push({ code: "small-tap-targets", severity: "info", where: tiny[0].url, detail: `${tiny.length} pages have more than 5 buttons or links under ${minTarget}px. e.g. ${tiny.slice(0, 2).map(r => `${r.url} (${r.smallTargets})`).join(", ")}` });
  if (text.length) f.push({ code: "tiny-text", severity: "info", where: text[0].url, detail: `${text.length} pages have 20+ text elements under ${minFont}px. e.g. ${text.slice(0, 2).map(r => `${r.url} (${r.tinyText})`).join(", ")}` });
  return report("mobile", f, { pages: rows.length, width: 375 });
}
export async function scan(root = ROOT, o = {}) {
  const gs = guidePages(root), pick = o.pages || ["index.html", ...[0.1, 0.5, 0.9].map(x => gs[Math.floor(x * gs.length)]).filter(Boolean).map(g => `guides/${g.slug}/`)], s = await serve(root), { chromium } = loadPlaywright(), b = await chromium.launch(), rows = [];
  try { for (const u of pick) { const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true }), pg = await ctx.newPage(); await pg.goto(s.url + "/" + u, { waitUntil: "load" }).catch(() => {}); await pg.waitForTimeout(1200);
    rows.push({ url: u, ...(await pg.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden"; }; let small = 0, tiny = 0; for (const e of document.querySelectorAll("button,a[href],input,select")) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.width < 24 || r.height < 24) small++; } for (const e of document.querySelectorAll("p,li,span,td,label,div")) { if (!vis(e) || !e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue; if (parseFloat(getComputedStyle(e).fontSize) < 11) tiny++; } return { scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth, smallTargets: small, tinyText: tiny }; })) }); await ctx.close(); } } finally { await b.close(); s.close(); }
  return judge(rows);
}
cli(import.meta.url, () => scan());
