// Trend Bot: one line per day in state/trend.json, so the digest can say "better or worse than yesterday" instead of just "20 open".
// Usage: node tools/bots/trend.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli, readJson } from "./lib.mjs";

const OPEN = i => !["resolved", "ignored", "fixed"].includes(i.status);
export function snapshot(issues, now = new Date()) {
  const open = issues.filter(OPEN), by = { critical: 0, warn: 0, info: 0 }, bot = {};
  for (const i of open) { by[i.severity] = (by[i.severity] || 0) + 1; bot[i.bot] = (bot[i.bot] || 0) + 1; }
  return { date: now.toISOString().slice(0, 10), open: open.length, ...by, byBot: bot };
}
export function append(history, snap, keep = 90) { const h = history.filter(x => x.date !== snap.date); h.push(snap); return h.sort((a, b) => a.date.localeCompare(b.date)).slice(-keep); }
export function delta(history) {
  if (history.length < 2) return { direction: "first-run", note: "First snapshot saved. Trends start tomorrow.", days: history.length };
  const a = history[history.length - 2], b = history[history.length - 1], d = b.open - a.open, crit = b.critical - a.critical;
  const direction = crit > 0 || d > 2 ? "worse" : crit < 0 || d < -2 ? "better" : "flat";
  const grew = Object.entries(b.byBot).filter(([k, n]) => n > (a.byBot[k] || 0)).map(([k]) => k);
  return { direction, openDelta: d, criticalDelta: crit, since: a.date, grew, note: `${b.open} open (${d >= 0 ? "+" : ""}${d} since ${a.date}), ${b.critical} critical` + (grew.length ? `; grew in ${grew.slice(0, 4).join(", ")}` : "") };
}
export function record(root, issues, now = new Date(), write = true) {
  const p = path.join(root, "tools/bots/state/trend.json"), h = append(readJson(p, []), snapshot(issues, now)); if (write) { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(h, null, 1)); } return { history: h, ...delta(h) };
}
export const scan = (root = ROOT) => { const h = readJson(path.join(root, "tools/bots/state/trend.json"), []); return { history: h.length, ...delta(h) }; };
cli(import.meta.url, () => scan());
