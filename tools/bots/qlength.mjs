// Phone Readability Bot (questions): questions or answer options too long to read on a phone screen without scrolling.
// Usage: node tools/bots/qlength.mjs [tracks.json]
import fs from "node:fs";
import { cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { flatten, where } from "./qdata.mjs";

export function qlength(qs, { q = 240, opt = 120 } = {}) {
  const longQ = qs.filter(x => x.text.length > q), longO = qs.filter(x => x.opts.some(o => String(o).length > opt)), f = [];
  if (longQ.length) f.push({ code: "long-questions", severity: longQ.length / qs.length > 0.1 ? "warn" : "info", where: "questions", detail: `${longQ.length} of ${qs.length} questions are over ${q} characters. Longest: ${where(longQ.sort((a, b) => b.text.length - a.text.length)[0])} (${longQ[0].text.length})` });
  if (longO.length) f.push({ code: "long-options", severity: "info", where: "questions", detail: `${longO.length} questions have an answer option over ${opt} characters. e.g. ${longO.slice(0, 3).map(where).join("; ")}` });
  return report("qlength", f, { questions: qs.length });
}
export const scan = tracksFile => qlength(flatten(JSON.parse(fs.readFileSync(tracksFile, "utf8")).tracks));
cli(import.meta.url, a => scan(a[0]));
