// Bot 5: Content freshness. Flags stale Market Wire sections and guides that still talk about past years or old "updated" dates.
// Reads data/wire.json and guides/*/index.html. Read-only: it reports, a human decides what to refresh.
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli, parseDate, daysBetween, readJson, sortBySev } from "./lib.mjs";

const WINDOW = { updated: [1.5, "Market Wire feed"], TICKER_DATE: [4, "ticker prices"], NEWS_DATE: [3, "news"], DEALS_DATE: [10, "deals"], APP_OPEN_DATE: [14, "application openings"] };
export function wireFreshness(wire, now = new Date()) {
  const f = [];
  for (const [k, [maxDays, label]] of Object.entries(WINDOW)) {
    const d = parseDate(wire[k], now); if (!d) { f.push({ severity: "warn", where: "wire." + k, detail: "no readable date for " + label }); continue; }
    const age = (now - d) / 864e5; if (age > maxDays) f.push({ severity: age > maxDays * 3 ? "critical" : "warn", where: "wire." + k, detail: `${label} are ${Math.floor(age)} days old (limit ${maxDays}).` });
  }
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12));
  const pastEarn = (wire.EARN || []).filter(e => { const d = parseDate(e[0], now); return d && d < today - 864e5; }).length;
  if (pastEarn) f.push({ severity: "info", where: "wire.EARN", detail: pastEarn + " earnings rows are for past dates." });
  const pastCal = (wire.CAL || []).filter(c => { const d = parseDate(c[0], now); return d && d < today - 864e5; }).length;
  if (pastCal) f.push({ severity: "warn", where: "wire.CAL", detail: pastCal + " calendar events are in the past." });
  const oldNews = (wire.NEWS || []).filter(n => { const d = parseDate(n.d, now); return d && daysBetween(d, now) > 7; }).length;
  if (oldNews) f.push({ severity: "warn", where: "wire.NEWS", detail: oldNews + " news items are over 7 days old." });
  return f;
}
const CYCLE = /(recruit|apply|application|deadline|opens?|summer analyst|full[- ]time|class of|internship|cycle|superday)/i;
export function pageFreshness(html, name, now = new Date()) {
  const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " "), cy = now.getUTCFullYear(), out = [];
  const hits = new Set();
  for (const m of text.matchAll(/\b(20[12]\d)\b/g)) {
    const y = +m[1]; if (y >= cy) continue;
    const ctx = text.slice(Math.max(0, m.index - 70), m.index + 70); if (CYCLE.test(ctx)) hits.add(y);
  }
  if (hits.size) out.push({ severity: [...hits].some(y => y <= cy - 2) ? "warn" : "info", where: "guides/" + name, detail: "mentions recruiting-cycle context with past year(s) " + [...hits].sort().join(", ") + ". Check it is still true." });
  const u = text.match(/(?:updated|last reviewed)[: ]+([A-Z][a-z]+ \d{1,2},? \d{4}|\d{4}-\d{2}-\d{2})/i), d = u && parseDate(u[1], now);
  if (d && daysBetween(d, now) > 180) out.push({ severity: "warn", where: "guides/" + name, detail: "says updated " + u[1] + " (" + daysBetween(d, now) + " days ago)." });
  return out;
}
export function freshness({ wire, pages = [], now = new Date() }) {
  const f = [...wireFreshness(wire || {}, now)];
  pages.forEach(p => f.push(...pageFreshness(p.html, p.name, now)));
  const g = sortBySev(f), by = {}; g.forEach(x => (by[x.severity] = (by[x.severity] || 0) + 1));
  return { pagesChecked: pages.length, counts: by, findings: g.slice(0, 60), truncated: Math.max(0, g.length - 60) };
}
cli(import.meta.url, () => {
  const wire = readJson(path.join(ROOT, "data/wire.json"), {}), gd = path.join(ROOT, "guides"), pages = [];
  for (const n of fs.existsSync(gd) ? fs.readdirSync(gd) : []) { const p = path.join(gd, n, "index.html"); if (fs.existsSync(p)) pages.push({ name: n, html: fs.readFileSync(p, "utf8") }); }
  return freshness({ wire, pages });
});
