// Rep Auditor Bot: runs every "Your turn" practice generator many times with random numbers and checks each problem is sane.
// A bad rep (NaN answer, empty question, answer the checker rejects) is a wrong grade for a student, so this is a correctness bot.
// Usage: node tools/bots/reps.mjs [--runs 300]
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { ROOT, cli, arg } from "./lib.mjs";
import { report } from "./scan.mjs";

const closeEnough = (u, p) => Math.abs(u - p.ans) <= (p.tol != null ? p.tol : Math.max(0.01, Math.abs(p.ans) * 0.005)); // same rule as js/practice.js
export function loadReps(root = ROOT) {
  const w = {}, ctx = vm.createContext({ window: w, console, Math, Object, Number, String, Array });
  vm.runInContext(fs.readFileSync(path.join(root, "js", "reps-data.js"), "utf8"), ctx);
  return w.MA_REPS || {};
}
export function auditRep(key, rep, runs = 300) {
  const bad = {}, note = (c, d) => { (bad[c] ||= { n: 0, d }).n++; };
  for (let i = 0; i < runs; i++) {
    let p; try { p = rep.build(rep.gen()); } catch (e) { note("throws", String(e.message).slice(0, 80)); continue; }
    if (!p || typeof p !== "object") { note("no-problem", "build() returned nothing"); continue; }
    if (typeof p.ans !== "number" || !Number.isFinite(p.ans)) { note("bad-answer", `answer is ${p.ans}`); continue; }
    if (!p.q || !String(p.q).trim()) note("empty-question", "question text is empty");
    if (!p.given || !String(p.given).trim()) note("empty-given", "the given numbers text is empty");
    if (!Array.isArray(p.steps) || !p.steps.length) note("no-steps", "no worked steps");
    if (p.tol != null && !(p.tol >= 0)) note("bad-tolerance", `tolerance ${p.tol}`);
    if (!closeEnough(p.ans, p)) note("self-reject", "the checker rejects its own answer");
    const all = [p.given, p.q, p.tip, ...(p.steps || []).flat()].join(" ");
    if (/\bNaN\b|undefined|Infinity|\[object/.test(all)) note("glitch-text", "NaN/undefined/Infinity shows in the text");
    if (p.ans < 0 && !/[−-]|negative|loss|decrease|shortfall/i.test(all)) note("hidden-negative", "answer is negative and nothing tells the student the sign matters");
  }
  return Object.entries(bad).map(([code, v]) => ({ key, code, count: v.n, runs, detail: v.d }));
}
export function auditReps(reps, runs = 300) {
  const rows = Object.entries(reps).flatMap(([k, r]) => auditRep(k, r, runs)), f = [];
  const hard = rows.filter(r => ["throws", "no-problem", "bad-answer", "self-reject", "glitch-text"].includes(r.code));
  if (hard.length) f.push({ code: "broken-reps", severity: "critical", where: hard[0].key, detail: `${hard.length} problem(s) break in ${runs} random runs: ${hard.slice(0, 4).map(r => `${r.key} ${r.code} (${r.count}/${r.runs}: ${r.detail})`).join("; ")}` });
  const soft = rows.filter(r => !hard.includes(r));
  if (soft.length) f.push({ code: "weak-reps", severity: "info", where: soft[0].key, detail: `${soft.length} softer problems: ${soft.slice(0, 4).map(r => `${r.key} ${r.code} (${r.count}/${r.runs})`).join("; ")}` });
  return { ...report("reps", f, { reps: Object.keys(reps).length, runsEach: runs }), rows };
}
export const scan = (root = ROOT, runs = 300) => auditReps(loadReps(root), runs);
cli(import.meta.url, a => scan(ROOT, +(arg(a, "runs") || 300)));
