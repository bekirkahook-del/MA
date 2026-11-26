// Company List Bot: the 5,800-row directory behind Market search. Repeated tickers or rows with no name make search return the wrong company.
// Usage: node tools/bots/companies.mjs
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { read, report } from "./scan.mjs";

export function parseCompanies(js) { const m = js.match(/window\.CO_RAW\s*=\s*"((?:[^"\\]|\\.)*)"/); return m ? JSON.parse('"' + m[1] + '"').split("\n").filter(Boolean).map(l => l.split("|")) : null; }
export function companies(rows) {
  if (!rows) return report("companies", [{ code: "co-unreadable", severity: "critical", detail: "js/companies.js has no readable CO_RAW list, so Market search breaks.", where: "js/companies.js" }]);
  const f = [], add = (code, severity, detail, where) => f.push({ code, severity, detail, where });
  const seen = {}, dup = []; for (const r of rows) { if (seen[r[0]]) dup.push(r[0]); seen[r[0]] = 1; }
  const noName = rows.filter(r => !r[1] || r[1].trim().length < 2), badTicker = rows.filter(r => !/^[A-Z0-9][A-Z0-9.\-^]{0,9}$/.test(r[0]));
  if (dup.length) add("co-duplicate-tickers", "warn", `${dup.length} tickers appear more than once: ${[...new Set(dup)].slice(0, 5).join(", ")}`, "js/companies.js");
  if (noName.length) add("co-no-name", "warn", `${noName.length} rows have no company name: ${noName.slice(0, 4).map(r => r[0]).join(", ")}`, "js/companies.js");
  if (badTicker.length) add("co-bad-ticker", "info", `${badTicker.length} rows have an odd ticker format: ${badTicker.slice(0, 4).map(r => r[0]).join(", ")}`, "js/companies.js");
  if (rows.length < 5000) add("co-shrunk", "warn", `Only ${rows.length} companies (expected 5,800+): the list may have been truncated.`, "js/companies.js");
  return report("companies", f, { rows: rows.length });
}
export const scan = (root = ROOT) => companies(parseCompanies(read(root, "js/companies.js")));
cli(import.meta.url, () => scan());
