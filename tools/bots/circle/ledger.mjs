// The shared issue ledger. Every sensor's finding lands here once (deduped by key); every circle bot reads and writes the same record.
export const empty = () => ({ runs: 0, updated: null, issues: {} });
const log = (it, at, ev, extra) => { it.history.push({ at, ev, ...(extra || {}) }); if (it.history.length > 20) it.history.shift(); };
export function upsert(led, found, { ran = [], now = new Date() } = {}) {
  const ts = now.toISOString(), seen = new Set(), ranSet = new Set(ran);
  for (const s of found) {
    seen.add(s.key); let it = led.issues[s.key];
    if (!it) { led.issues[s.key] = { ...s, status: "open", attempts: 0, reopened: 0, firstSeen: ts, lastSeen: ts, history: [{ at: ts, ev: "opened" }] }; continue; }
    it.lastSeen = ts; it.detail = s.detail; it.severity = s.severity; it.fix = s.fix || null; it.where = s.where;
    if (it.status === "resolved") { it.status = "open"; it.reopened = (it.reopened || 0) + 1; log(it, ts, "reopened"); }
    if ((it.reopened || 0) >= 3 && it.status !== "frozen") { it.status = "frozen"; log(it, ts, "frozen", { why: "came back 3 times" }); }
  }
  for (const it of Object.values(led.issues)) if (!seen.has(it.key) && ranSet.has(it.bot) && !["resolved", "ignored"].includes(it.status)) { it.status = "resolved"; log(it, ts, "resolved", { why: "sensor no longer reports it" }); }
  led.runs++; led.updated = ts; return led;
}
export const setStatus = (led, key, status, ev, now = new Date(), extra) => { const it = led.issues[key]; if (!it) return; it.status = status; log(it, now.toISOString(), ev || status, extra); };
export const counts = led => { const c = {}; Object.values(led.issues).forEach(i => (c[i.status] = (c[i.status] || 0) + 1)); return c; };
export const active = led => Object.values(led.issues).filter(i => !["resolved", "ignored"].includes(i.status));
