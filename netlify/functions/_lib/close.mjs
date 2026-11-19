// Today's US market close, straight from Yahoo Finance (no AI, no hand-typed numbers).
// Returns null when today isn't a trading day (weekend/holiday) or the data isn't in yet.
const IDX = [["^GSPC", "S&P 500"], ["^DJI", "Dow"], ["^IXIC", "Nasdaq"]];
const fmt = (n, d) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const etDay = (ms) => new Date(ms).toLocaleDateString("en-CA", { timeZone: "America/New_York" });

async function closes(sym) {
  const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=5d&interval=1d`, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!r.ok) throw new Error(sym + " " + r.status);
  const d = (await r.json()).chart.result[0];
  const pts = (d.timestamp || []).map((t, i) => [t * 1000, d.indicators.quote[0].close[i]]).filter(p => p[1] != null);
  if (pts.length < 2) throw new Error(sym + " no data");
  const [t, last] = pts[pts.length - 1], prev = pts[pts.length - 2][1];
  return { t, last, prev, ch: (last / prev - 1) * 100 };
}

export async function marketClose(now = new Date()) {
  const today = etDay(now.getTime());
  const res = await Promise.allSettled(IDX.map(([s]) => closes(s)));
  const idx = res.map((r, i) => r.status === "fulfilled" ? { name: IDX[i][1], ...r.value } : null).filter(Boolean);
  if (!idx.length || etDay(idx[0].t) !== today) return null;
  let y = null; try { y = await closes("^TNX"); } catch (e) {}
  const label = now.toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric" });
  const part = m => `the ${m.name} ${m.ch >= 0 ? "rose" : "fell"} ${fmt(Math.abs(m.ch), 2)}%${m.name === "Dow" ? ` (${fmt(Math.abs(m.last - m.prev), 0)} points)` : ""} to ${fmt(m.last, 2)}`;
  let text = `${label} close: ` + (a => a.length > 1 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a[0])(idx.map(part)) + ".";
  if (y && etDay(y.t) === today) {
    const bps = Math.round((y.last - y.prev) * 100);
    text += ` The 10-year Treasury yield ended at ${fmt(y.last, 2)}%${bps ? ` (${bps > 0 ? "+" : ""}${bps} bps)` : ", unchanged"}.`;
  }
  return { label, text };
}
