// Weekly market brief for the Sunday email: last week's moves (Yahoo Finance prices), top stories and
// the week ahead (from The Wire's data/wire.json), plus a short plain-English recap built from the numbers (template, no AI).
// Every part is optional: if a source fails, that section is simply left out.
const SYMS = [["^GSPC", "S&P 500", "idx"], ["^IXIC", "Nasdaq", "idx"], ["^DJI", "Dow", "idx"], ["^TNX", "10-year Treasury yield", "yld"], ["CL=F", "Oil (WTI)", "usd"], ["BTC-USD", "Bitcoin", "usd"]];
const WIRE = "https://raw.githubusercontent.com/bekirkahook-del/MA/main/data/wire.json";
const fmt = (n, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

async function quote([sym, name, kind]) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1mo&interval=1d`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(sym + " " + r.status);
  const d = (await r.json()).chart.result[0], ts = d.timestamp || [], cl = d.indicators.quote[0].close || [];
  const pts = ts.map((t, i) => [t, cl[i]]).filter(p => p[1] != null);
  if (pts.length < 3) throw new Error(sym + " no data");
  const [lt, last] = pts[pts.length - 1];
  const prev = pts.filter(p => p[0] <= lt - 6.5 * 86400).pop() || pts[0];
  const ch = kind === "yld" ? (last - prev[1]) * 100 : (last / prev[1] - 1) * 100; // yield: change in basis points
  return { name, kind, last, ch };
}

const parseCal = (s, now) => { // "Wed Nov 4" -> Date
  const m = String(s).match(/([A-Z][a-z]{2})\s+(\d{1,2})/); if (!m) return null;
  const mo = "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(m[1]) / 3; if (mo < 0) return null;
  let d = new Date(Date.UTC(now.getUTCFullYear(), mo, +m[2], 12));
  if (d - now < -200 * 864e5) d = new Date(Date.UTC(now.getUTCFullYear() + 1, mo, +m[2], 12));
  return d;
};

// Plain-English recap built from the numbers (no AI): it can only say what the data says.
function recap(moves) {
  const by = n => moves.find(m => m.name === n);
  const pct = m => `${fmt(Math.abs(m.ch), 1)}%`;
  const verb = m => (m.ch >= 0 ? "rose" : "fell");
  const idx = ["S&P 500", "Nasdaq", "Dow"].map(by).filter(Boolean);
  const out = [];
  if (idx.length) {
    const up = idx.filter(m => m.ch >= 0), dn = idx.filter(m => m.ch < 0);
    const list = ms => ms.map((m, i) => `${i ? "the " : ""}${m.name} ${i ? "" : (m.ch >= 0 ? "gained" : "lost") + " "}${pct(m)}`).reduce((acc, x, i, a) => acc + (i === 0 ? "" : i === a.length - 1 ? " and " : ", ") + x, "");
    if (!dn.length) out.push(`Stocks rose last week: the ${list(up)}.`);
    else if (!up.length) out.push(`Stocks fell last week: the ${list(dn)}.`);
    else out.push(`Stocks were mixed last week: the ${up.map(m => `${m.name} rose ${pct(m)}`).join(" and the ")}, while the ${dn.map(m => `${m.name} fell ${pct(m)}`).join(" and the ")}.`);
  }
  const y = by("10-year Treasury yield");
  if (y) out.push(Math.abs(y.ch) < 1 ? `The 10-year Treasury yield barely moved, ending at ${fmt(y.last, 2)}%.`
    : `The 10-year Treasury yield ${y.ch > 0 ? "rose" : "fell"} ${fmt(Math.abs(y.ch))} basis points to ${fmt(y.last, 2)}% (${y.ch > 0 ? "higher yields mean borrowing costs more" : "lower yields mean borrowing gets cheaper"}).`);
  const o = by("Oil (WTI)"), c = by("Bitcoin");
  const rest = [o && `oil ${verb(o)} ${pct(o)}`, c && `Bitcoin ${verb(c)} ${pct(c)}`].filter(Boolean);
  if (rest.length) out.push(rest.join(" and ").replace(/^./, x => x.toUpperCase()) + ".");
  return out.join(" ");
}

export async function marketBrief(now = new Date()) {
  const moves = (await Promise.allSettled(SYMS.map(quote))).filter(x => x.status === "fulfilled").map(x => x.value);
  let w = null; try { const r = await fetch(WIRE + "?t=" + Date.now()); if (r.ok) w = await r.json(); } catch (e) {}
  const fresh = w && Date.parse(w.updated) > now - 5 * 864e5;
  const stories = fresh ? (w.NEWS || []).slice(0, 3).map(n => n.h).filter(Boolean) : [];
  const end = new Date(now.getTime() + 7 * 864e5), todayStr = now.toISOString().slice(0, 10), endStr = end.toISOString().slice(0, 10);
  const earn = w ? (w.EARN || []).filter(e => e[0] > todayStr && e[0] <= endStr) : [];
  const cal = w ? (w.CAL || []).map(c => [parseCal(c[0], now), c]).filter(([d]) => d && d > now && d <= end) : [];
  const text = recap(moves);
  const sum = moves.find(m => m.name === "S&P 500");
  const H = (t, c) => `<p style="font-size:12px;letter-spacing:.1em;color:${c};font-weight:bold;margin:0 0 8px">${t}</p>`;
  let html = "";
  if (moves.length) {
    html += H("LAST WEEK IN THE MARKETS", "#2448D8");
    if (text) html += `<p style="margin:0 0 12px">${text}</p>`;
    html += `<table role="presentation" style="width:100%;border-collapse:collapse;font-size:15px">${moves.map(m => {
      const up = m.ch >= 0, col = m.kind === "yld" ? "#13203B" : up ? "#1E7F4F" : "#C33";
      const val = m.kind === "yld" ? fmt(m.last, 2) + "%" : m.kind === "usd" ? "$" + fmt(m.last, m.last < 1000 ? 2 : 0) : fmt(m.last);
      const chg = m.kind === "yld" ? `${up ? "+" : ""}${fmt(m.ch)} bps` : `${up ? "▲" : "▼"} ${fmt(Math.abs(m.ch), 1)}%`;
      return `<tr><td style="padding:7px 0;border-bottom:1px solid #E3E7EE">${m.name}</td><td style="padding:7px 0;border-bottom:1px solid #E3E7EE;text-align:right">${val}</td><td style="padding:7px 0 7px 12px;border-bottom:1px solid #E3E7EE;text-align:right;color:${col};font-weight:bold;white-space:nowrap">${chg}</td></tr>`;
    }).join("")}</table><p style="font-size:12px;color:#4A5672;margin:6px 0 0">Weekly change, Friday close. Data: Yahoo Finance.</p>`;
  }
  if (stories.length) html += `<div style="margin-top:18px">${H("TOP STORIES", "#4A5672")}<ul style="padding-left:20px;margin:0">${stories.map(s => `<li style="margin:4px 0">${s.replace(/[<>]/g, "")}</li>`).join("")}</ul></div>`;
  if (earn.length || cal.length) {
    const days = {};
    earn.slice(0, 12).forEach(e => { const d = new Date(e[0] + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }); (days[d] = days[d] || []).push(e[2] || e[1]); });
    html += `<div style="margin-top:18px">${H("THE WEEK AHEAD", "#A97A1E")}<ul style="padding-left:20px;margin:0">${
      cal.slice(0, 5).map(([d, c]) => `<li style="margin:4px 0"><b>${c[0]}</b>: ${String(c[1]).replace(/[<>]/g, "")}</li>`).join("")}${
      Object.entries(days).map(([d, cos]) => `<li style="margin:4px 0"><b>${d}</b> earnings: ${cos.slice(0, 5).join(", ").replace(/[<>]/g, "")}</li>`).join("")}</ul>
      <p style="font-size:13px;margin:8px 0 0"><a href="https://mnaprep.com/?utm_source=email#wire" style="color:#2448D8">Full calendar on The Wire →</a></p></div>`;
  }
  /* applications that opened in the last 7 days (for everyone); Pro gets them instantly */
  const weekAgo = new Date(now.getTime() - 7 * 864e5).toISOString().slice(0, 10);
  const opened = w ? (w.APP_OPEN || []).filter(x => x[3] === "open" && x[4] && x[4] >= weekAgo && x[4] <= todayStr).slice(0, 8) : [];
  const closing = w ? (w.APP_OPEN || []).filter(x => x[3] === "open" && x[6] && x[6] > todayStr && x[6] <= endStr).slice(0, 5) : [];
  if (opened.length || closing.length) {
    html += `<div style="margin-top:18px">${H("INTERNSHIP APPLICATIONS", "#1E7F4F")}<ul style="padding-left:20px;margin:0">${
      opened.map(x => `<li style="margin:4px 0"><b>Now open:</b> ${String(x[0]).replace(/[<>]/g, "")} · ${String(x[1]).replace(/[<>]/g, "")}${x[6] ? ` (closes ${x[6]})` : ""}</li>`).join("")}${
      closing.map(x => `<li style="margin:4px 0"><b>Closing soon:</b> ${String(x[0]).replace(/[<>]/g, "")} · ${String(x[1]).replace(/[<>]/g, "")} (closes ${x[6]})</li>`).join("")}</ul>
      <p style="font-size:13px;margin:8px 0 0"><a href="https://mnaprep.com/?utm_source=email#recruit" style="color:#2448D8">All openings →</a> · Want these the day they open? Turn on instant alerts with Pro.</p></div>`;
  }
  /* deal of the week: the newest deal from The Wire (last 14 days), else the biggest recent one */
  const deals = w ? (w.DEALS || []).filter(d => d && d.buyer && d.target && d.what) : [];
  const dts = d => Date.parse(d.date) || 0;
  const recent = deals.filter(d => now - dts(d) < 14 * 864e5).sort((a, b) => dts(b) - dts(a));
  const deal = recent[0] || deals.slice().sort((a, b) => (b.usd || 0) - (a.usd || 0))[0];
  if (deal) {
    const c = x => String(x || "").replace(/[<>]/g, "");
    html += `<div style="margin-top:18px;background:#F4F6FB;border:1px solid #E3E7EE;border-radius:12px;padding:14px 16px">${H("DEAL OF THE WEEK", "#2448D8")}
      <p style="font-size:17px;font-weight:bold;margin:0 0 4px">${c(deal.buyer)} → ${c(deal.target)}${deal.value ? ` · ${c(deal.value)}` : ""}</p>
      <p style="font-size:12px;color:#4A5672;margin:0 0 10px">${c(deal.date)}</p>
      <p style="margin:0 0 8px"><b>What happened:</b> ${c(deal.what)}</p>
      ${deal.why ? `<p style="margin:0 0 8px"><b>Why it matters:</b> ${c(deal.why)}</p>` : ""}
      ${deal.say ? `<p style="margin:0 0 8px"><b>Say this in an interview:</b> ${c(deal.say)}</p>` : ""}
      <p style="font-size:13px;margin:8px 0 0"><a href="https://mnaprep.com/?utm_source=email&utm_campaign=deal#deals" style="color:#2448D8">Quiz yourself on this deal →</a></p></div>`;
  }
  const sp = sum ? ` · S&P 500 ${sum.ch >= 0 ? "+" : ""}${fmt(sum.ch, 1)}%` : "";
  return { html, subjectBit: sp };
}
