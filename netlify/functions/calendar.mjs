// Subscribable calendar (mnaprep.com/calendar.ics): earnings dates, economic events and internship
// application deadlines from The Wire (data/wire.json). Students add it once to Google/Apple Calendar and it
// keeps updating. Cached 1 hour at Netlify's edge.
const WIRE = "https://raw.githubusercontent.com/bekirkahook-del/MA/main/data/wire.json";
const esc = s => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = d => d.toISOString().slice(0, 10).replace(/-/g, "");
const next = s => { const d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d; };
const MON = "JanFebMarAprMayJunJulAugSepOctNovDec";
function parseCal(label, now) {
  const m = String(label).match(/([A-Z][a-z]{2})\s+(\d{1,2})/); if (!m) return null;
  const mo = MON.indexOf(m[1]) / 3; if (mo < 0 || mo % 1) return null;
  let d = new Date(Date.UTC(now.getUTCFullYear(), mo, +m[2], 12));
  if (d - now < -200 * 864e5) d = new Date(Date.UTC(now.getUTCFullYear() + 1, mo, +m[2], 12));
  return d;
}
// fold long lines at 74 chars as the iCalendar spec requires
const fold = l => l.length <= 74 ? l : l.match(/.{1,74}/g).join("\r\n ");

export default async () => {
  let w = {};
  try { w = await (await fetch(WIRE + "?t=" + Math.floor(Date.now() / 3600000))).json(); } catch (e) {}
  const now = new Date(), stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ev = [];
  const add = (uid, date, title, desc, url) => {
    const d = new Date(date + "T12:00:00Z"); if (isNaN(d)) return;
    ev.push(["BEGIN:VEVENT", `UID:${uid}@mnaprep.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(d)}`, `DTEND;VALUE=DATE:${ymd(next(date))}`,
      `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(desc + "\n\nFrom M&A Prep: https://mnaprep.com/#wire")}`, url ? `URL:${url}` : "", "TRANSP:TRANSPARENT", "END:VEVENT"].filter(Boolean));
  };
  for (const e of (w.EARN || [])) if (Array.isArray(e) && /^\d{4}-\d{2}-\d{2}$/.test(e[0]))
    add(`earn-${e[1]}-${e[0]}`, e[0], `📊 ${e[2] || e[1]} (${e[1]}) earnings${e[3] ? " · " + (e[3] === "BMO" ? "before open" : e[3] === "AMC" ? "after close" : e[3]) : ""}`,
      [e[4] ? `EPS estimate: ${e[4]}` : "", e[5] || ""].filter(Boolean).join("\n"));
  for (const c of (w.CAL || [])) { const d = parseCal(c[0], now); if (d)
    add(`cal-${ymd(d)}-${String(c[1]).replace(/\W+/g, "").slice(0, 30)}`, d.toISOString().slice(0, 10), `📅 ${c[1]}`, c[2] || "", Array.isArray(c[3]) ? c[3][1] : ""); }
  for (const a of (w.APP_OPEN || [])) if (Array.isArray(a) && /^\d{4}-\d{2}-\d{2}$/.test(a[6] || ""))
    add(`app-${String(a[0] + a[1]).replace(/\W+/g, "").slice(0, 40)}`, a[6], `⏰ Deadline: ${a[0]} ${a[1]}`, a[7] || "Internship application deadline. Apply before this date.", "https://mnaprep.com/#recruit");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//M&A Prep//The Wire//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:M&A Prep: earnings + internship deadlines", "X-WR-CALDESC:Earnings dates\\, market events and finance internship deadlines from mnaprep.com",
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H", "X-PUBLISHED-TTL:PT6H", ...ev.flat(), "END:VCALENDAR"];
  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: { "content-type": "text/calendar; charset=utf-8", "cache-control": "public, max-age=1800",
      "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=7200" },
  });
};
