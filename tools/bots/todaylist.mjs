// Today List Bot: turns every open warning from the 73 flywheel and operator bots into one ranked "do today" list, so you read one page instead of 73.
// Rank = severity x how much the item blocks the content flywheel (rule gates first, then the plan, then outreach and site chores). No invented urgency.
import { ROOT, cli, readJson } from "./lib.mjs";
import path from "node:path";
import { PACK3 } from "./circle/pack3.mjs";

const GEAR = { gate: 3, plan: 2.6, reach: 2.2, site: 2, measure: 1.8, learn: 1.6, pages: 1 }, SEV = { critical: 3, warn: 2, info: 0.4 };
const gearOf = Object.fromEntries(PACK3.map(b => [b.id, b.gear]));
export function todayList(issues, { max = 10, perBot = 2 } = {}) {
  const open = issues.filter(i => !["resolved", "ignored", "fixed"].includes(i.status) && i.severity !== "info" && gearOf[i.bot] && !/^quora/.test(i.bot));
  const scored = open.map(i => ({ bot: i.bot, gear: gearOf[i.bot], severity: i.severity, do: i.detail, score: (SEV[i.severity] || 1) * (GEAR[gearOf[i.bot]] || 1) })).sort((a, b) => b.score - a.score || a.bot.localeCompare(b.bot));
  const seen = {}, out = [];
  for (const s of scored) { seen[s.bot] = (seen[s.bot] || 0) + 1; if (seen[s.bot] <= perBot && out.length < max) out.push({ rank: out.length + 1, ...s }); }
  return out;
}
export const scan = (root = ROOT) => ({ list: todayList(Object.values(readJson(path.join(root, "tools/bots/state/circle-ledger.json"), { issues: {} }).issues)) });
cli(import.meta.url, () => scan());
