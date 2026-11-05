// Weekly market brief for the Sunday email: last week's moves (Yahoo Finance prices), top stories and
// the week ahead (from The Wire's data/wire.json), plus a short plain-English recap written by Claude.
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

async function recap(moves, stories) {
  const key = process.env.ANTHROPIC_API_KEY; if (!key || !moves.length) return "";
  const facts = moves.map(m => `${m.name}: ${m.kind === "yld" ? `${fmt(m.last, 2)}%, ${m.ch >= 0 ? "+" : ""}${fmt(m.ch)} basis points` : `${m.ch >= 0 ? "+" : ""}${fmt(m.ch, 1)}%`} this week`).join("\n");
  const prompt = `Write a 2-3 sentence recap of last week in the markets for high school and college students interested in finance. Plain words, friendly but not slangy, no hype, no advice to buy or sell. Use ONLY the facts below; do not add any numbers, causes or events that are not listed. If you mention a cause, it must come from the headlines.\n\nWeekly moves:\n${facts}\n\nHeadlines:\n${stories.map(s => "- " + s).join("\n") || "(none)"}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.AI_MODEL_QUICK || "claude-haiku-5-5", max_tokens: 220, messages: [{ role: "user", content: prompt }] }) });
    if (!r.ok) return "";
    const j = await r.json(); return ((j.content || []).map(c => c.text || "").join("").trim()).replace(/[<>]/g, "");
  } catch (e) { return ""; }
}

export async function marketBrief(now = new Date()) {
  const moves = (await Promise.allSettled(SYMS.map(quote))).filter(x => x.status === "fulfilled").map(x => x.value);
  let w = null; try { const r = await fetch(WIRE + "?t=" + Date.now()); if (r.ok) w = await r.json(); } catch (e) {}
  const fresh = w && Date.parse(w.updated) > now - 5 * 864e5;
  const stories = fresh ? (w.NEWS || []).slice(0, 3).map(n => n.h).filter(Boolean) : [];
  const end = new Date(now.getTime() + 7 * 864e5), todayStr = now.toISOString().slice(0, 10), endStr = end.toISOString().slice(0, 10);
  const earn = w ? (w.EARN || []).filter(e => e[0] > todayStr && e[0] <= endStr) : [];
  const cal = w ? (w.CAL || []).map(c => [parseCal(c[0], now), c]).filter(([d]) => d && d > now && d <= end) : [];
  const text = await recap(moves, stories);
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
  const sp = sum ? ` · S&P 500 ${sum.ch >= 0 ? "+" : ""}${fmt(sum.ch, 1)}%` : "";
  return { html, subjectBit: sp };
}
