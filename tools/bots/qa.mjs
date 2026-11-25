// Bot 1: Question QA. Runs the feedbot detective on EVERY question (not just flagged ones).
// Input: a dump of TRACKS ({tracks:[{id,name,levels:[{n,q:[[text,options,keyIndex,why]]}]}]}); make one with `node tools/bots/dump.mjs out.json`.
import fs from "node:fs";
import { flaws, makeSupport } from "../feedbot/triage.mjs";
import { cli } from "./lib.mjs";

export function auditQuestions(tracks, { support = null } = {}) {
  const issues = [], seen = new Map(); let total = 0;
  const add = (t, l, q, o) => issues.push({ track: t.id, level: l.n, question: String(q[0]).slice(0, 110), qFull: String(q[0]), ...o });
  for (const t of tracks) {
    
    for (const l of t.levels) for (const q of l.q || []) {
      total++;
      if (!Array.isArray(q) || typeof q[0] !== "string" || !Array.isArray(q[1])) { issues.push({ track: t.id, level: l.n, question: "(malformed)", type: "malformed", weight: 40, objective: true, note: "question is not [text, options, key, why]" }); continue; }
      for (const f of flaws(q, support)) add(t, l, q, f);
      if (!q[3] || String(q[3]).replace(/<[^>]+>/g, "").trim().length < 12) add(t, l, q, { type: "no-explanation", weight: 10, objective: true, note: "explanation is missing or under 12 characters, so a wrong answer teaches nothing" });
      if (q[1].length < 3) add(t, l, q, { type: "too-few-options", weight: 10, objective: true, note: q[1].length + " options: a guess is right " + Math.round(100 / Math.max(1, q[1].length)) + "% of the time" });
      const GL = /\s{2,}| ,|\.\.(?!\.)|\b([A-Za-z]{2,}) \1\b/; // checked per string: joining question and options invents fake repeats
      if ([q[0], ...q[1].map(String)].some(x => GL.test(x))) add(t, l, q, { type: "text-glitch", weight: 5, objective: false, note: "double space, space before comma, or repeated word" });
      const key = String(q[0]).toLowerCase().replace(/\s+/g, " ").trim(); // exact repeat only: number-varied templates ("$200 vs $400") are different questions
      if (seen.has(key)) add(t, l, q, { type: "duplicate-question", weight: 15, objective: false, note: "identical question text already in " + seen.get(key) }); else seen.set(key, t.id + " / " + l.n);
    }
  }
  const byType = {}; issues.forEach(i => (byType[i.type] = (byType[i.type] || 0) + 1));
  const verified = issues.filter(i => i.objective && i.weight >= 30);
  return { total, issues: issues.sort((a, b) => b.weight - a.weight), byType, verifiedDefects: verified.length, worstFirst: issues.slice(0, 15).map(i => `${i.type} | ${i.track} / ${i.level} | ${i.question} | ${i.note}`) };
}
cli(import.meta.url, a => { const d = JSON.parse(fs.readFileSync(a[0], "utf8")); const r = auditQuestions(d.tracks); delete r.issues; return r; });
