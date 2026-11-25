// Stale Year Bot (questions): questions that name a year that is already over, near words that suggest a rule, price or deadline. Leads for a human, not proof.
// Usage: node tools/bots/qyears.mjs [tracks.json]
import fs from "node:fs";
import { cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { flatten, where } from "./qdata.mjs";

const CONTEXT = /(recruit|class of|summer|season|rate|yield|price|deadline|opens?|tax|rule|law|index|ranking|currently|today|this year|latest)/i;
export function qyears(qs, now = new Date()) {
  const y = now.getUTCFullYear(), hits = qs.filter(x => { const t = x.text + " " + x.opts.join(" "); return [...t.matchAll(/\b(20[12]\d)\b/g)].some(m => +m[1] < y - 1 && CONTEXT.test(t)); }), f = [];
  if (hits.length) f.push({ code: "question-old-years", severity: "info", where: "questions", detail: `${hits.length} questions mention a year before ${y - 1} next to words like "rate", "rule" or "recruiting". e.g. ${hits.slice(0, 3).map(h => `${where(h)}: ${h.text.slice(0, 70)}`).join("; ")}` });
  return report("qyears", f, { questions: qs.length, flagged: hits.length });
}
export const scan = (tracksFile, now) => qyears(flatten(JSON.parse(fs.readFileSync(tracksFile, "utf8")).tracks), now);
cli(import.meta.url, a => scan(a[0]));
