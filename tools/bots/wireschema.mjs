// Wire Schema Bot: data/wire.json feeds the live ticker, calendar, earnings, news and deals. A malformed row can blank a whole panel.
// Usage: node tools/bots/wireschema.mjs
import path from "node:path";
import { ROOT, cli, readJson, parseDate } from "./lib.mjs";
import { report } from "./scan.mjs";

const isStr = x => typeof x === "string" && x.trim() !== "", isNum = x => typeof x === "number" && Number.isFinite(x);
export const RULES = {
  TICKER: r => Array.isArray(r) && r.length >= 3 && isStr(r[0]) && isStr(String(r[1])) && (isNum(r[2]) || r[2] === null),
  CAL: r => Array.isArray(r) && r.length >= 3 && isStr(r[0]) && isStr(r[1]) && isStr(r[2]),
  EARN: r => Array.isArray(r) && r.length >= 4 && !!parseDate(r[0]) && isStr(r[1]) && isStr(r[2]),
  NEWS: r => r && isStr(r.k) && isStr(r.d) && isStr(r.h),
  DEALS: r => r && isStr(r.id) && isStr(r.buyer) && isStr(r.target) && isNum(r.usd) && !!parseDate(r.date),
  APP_OPEN: r => Array.isArray(r) && r.length >= 5 && isStr(r[0]) && isStr(r[1]) && isStr(r[3]),
  NEWS_QUIZ: r => Array.isArray(r) && isStr(r[0]) && Array.isArray(r[1]) && r[1].length >= 3 && Number.isInteger(r[2]) && r[2] >= 0 && r[2] < r[1].length,
};
export function wireSchema(w) {
  const f = [], add = (code, severity, detail, where) => f.push({ code, severity, detail, where });
  if (!w || typeof w !== "object") return report("wireschema", [{ code: "wire-unreadable", severity: "critical", detail: "data/wire.json is missing or not valid JSON.", where: "data/wire.json" }]);
  for (const [k, rule] of Object.entries(RULES)) {
    if (!(k in w)) { add("wire-missing-key", "critical", `data/wire.json has no ${k} section.`, k); continue; }
    if (!Array.isArray(w[k])) { add("wire-bad-section", "critical", `${k} is not a list.`, k); continue; }
    const bad = w[k].map((r, i) => (rule(r) ? null : i)).filter(i => i !== null);
    if (bad.length) add("wire-bad-rows", "warn", `${k}: ${bad.length} of ${w[k].length} rows are malformed (row numbers ${bad.slice(0, 5).join(", ")}).`, k);
  }
  const ids = (w.DEALS || []).map(d => d && d.id).filter(Boolean), dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) add("wire-duplicate-deals", "warn", `DEALS has repeated ids: ${[...new Set(dup)].slice(0, 4).join(", ")}`, "DEALS");
  return report("wireschema", f, { sections: Object.keys(RULES).length });
}
export const scan = (root = ROOT) => wireSchema(readJson(path.join(root, "data/wire.json"), null));
cli(import.meta.url, () => scan());
