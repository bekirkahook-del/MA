// Explanation Quality Bot: the explanation is what teaches after a miss. Flags explanations that are too short, only repeat the answer, or never say why.
// Usage: node tools/bots/explain.mjs [tracks.json]
import fs from "node:fs";
import { cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { flatten, where } from "./qdata.mjs";

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
export function explain(qs) {
  const f = [], short = qs.filter(q => q.why.trim().length < 25), echo = qs.filter(q => { const a = norm(q.opts[q.ans] || ""), w = norm(q.why); return a.length >= 8 && !/^[0-9 ]+$/.test(a) && w.length < a.length + 25 && w.includes(a); });
  if (short.length) f.push({ code: "explain-short", severity: short.length / qs.length > 0.1 ? "warn" : "info", where: "questions", detail: `${short.length} of ${qs.length} explanations are under 25 characters. e.g. ${short.slice(0, 3).map(q => `${where(q)}: "${q.why.slice(0, 40)}"`).join("; ")}` });
  if (echo.length) f.push({ code: "explain-echo", severity: "info", where: "questions", detail: `${echo.length} explanations only repeat the correct answer without a reason. e.g. ${echo.slice(0, 3).map(where).join("; ")}` });
  return report("explain", f, { questions: qs.length });
}
export const scan = tracksFile => explain(flatten(JSON.parse(fs.readFileSync(tracksFile, "utf8")).tracks));
cli(import.meta.url, a => scan(a[0]));
