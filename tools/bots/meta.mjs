// Meta Bot: audits the circle itself. Issues that have sat open for weeks, sensors that did not run, fix types the Historian stopped trusting, bot files that vanished.
// It does not file issues into the ledger (that would be the circle arguing with itself); it adds a "Circle health" section to the digest.
// Usage: node tools/bots/meta.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli, readJson } from "./lib.mjs";

const OPEN = i => !["resolved", "ignored", "fixed"].includes(i.status);
export function selfAudit({ issues = [], ran = [], nodes = [], history = {}, exists = () => true, now = new Date(), optional = [] }) {
  const f = [], add = (code, severity, detail) => f.push({ code, severity, detail });
  const open = issues.filter(OPEN), old = open.filter(i => (now - new Date(i.firstSeen)) / 864e5 >= 14), frozen = open.filter(i => i.status === "frozen" || (i.reopened || 0) >= 3);
  if (old.length) add("stale-issues", "warn", `${old.length} issue(s) have been open 14+ days with nobody acting. Oldest: ${old.sort((a, b) => new Date(a.firstSeen) - new Date(b.firstSeen)).slice(0, 2).map(i => i.key).join(", ")}. Close, snooze or fix them, or the ledger becomes noise.`);
  if (frozen.length) add("frozen-issues", "info", `${frozen.length} issue(s) keep coming back after being fixed: ${frozen.slice(0, 3).map(i => i.key).join(", ")}.`);
  const sensors = nodes.filter(n => n.role === "sensor").map(n => n.id), idle = sensors.filter(s => !ran.includes(s) && !optional.includes(s));
  if (idle.length) add("sensors-idle", "warn", `${idle.length} sensor(s) did not run: ${idle.slice(0, 6).join(", ")}.`);
  const skippedOpt = sensors.filter(s => optional.includes(s) && !ran.includes(s));
  if (skippedOpt.length) add("optional-skipped", "info", `${skippedOpt.length} optional sensor(s) were not run (they need live data or a browser): ${skippedOpt.slice(0, 8).join(", ")}.`);
  const gone = nodes.filter(n => !exists(n.file)); if (gone.length) add("bot-file-missing", "critical", `${gone.length} bot file(s) are in the graph but missing on disk: ${gone.map(n => n.file).join(", ")}`);
  const demoted = Object.entries(history.fixTypes || {}).filter(([, v]) => (v.reverted || 0) >= 2 && v.reverted > (v.ok || 0)).map(([k]) => k); if (demoted.length) add("fixers-demoted", "info", `The Historian stopped auto-applying: ${demoted.join(", ")}.`);
  if (issues.length > 500) add("ledger-big", "info", `The ledger holds ${issues.length} issues. Archive the resolved ones.`);
  return { bot: "meta", findings: f, stats: { bots: nodes.length, sensors: sensors.length, ran: ran.length, openIssues: open.length }, ok: !f.some(x => x.severity === "critical") };
}
export async function scan(root = ROOT) {
  const { NODES } = await import("./circle/graph.mjs"), led = readJson(path.join(root, "tools/bots/state/circle-ledger.json"), { issues: {} });
  return selfAudit({ issues: Object.values(led.issues), ran: [], nodes: NODES, history: readJson(path.join(root, "tools/bots/state/circle-history.json"), {}), exists: f => fs.existsSync(path.join(root, f)), optional: NODES.map(n => n.id) });
}
cli(import.meta.url, () => scan());
