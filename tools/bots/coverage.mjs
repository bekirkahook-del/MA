// Coverage Gap Bot: for every level in every track, which learning tools exist (lesson, number reps, model lab)? Lists the gaps so the next build is chosen by data.
// Usage: node tools/bots/coverage.mjs [tracks.json]   (without a file it loads the real site in a headless browser)
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";

export function loadKeys(root = ROOT) {
  const w = {}, stub = { window: w, console, Math, Object, Number, String, Array, localStorage: { getItem() { return null }, setItem() {} }, document: { createElement: () => ({}), head: { appendChild() {} }, getElementById() {}, querySelector() {} }, requestAnimationFrame() {}, setTimeout() {}, showBrief() {}, quiz() {}, runLevel() {}, openPanel() {} };
  const ctx = vm.createContext(stub);
  for (const f of ["lessons.js", "lessons2.js", "reps-data.js", "models-data.js"]) try { vm.runInContext(fs.readFileSync(path.join(root, "js", f), "utf8"), ctx); } catch (e) { /* partial is fine */ }
  const models = new Set(Object.values(w.MA_MODELS || {}).flatMap(m => m.keys || []));
  return { lessons: new Set(Object.keys(w.MA_LESSONS || {})), reps: new Set(Object.keys(w.MA_REPS || {})), models };
}
export function coverage(tracks, keys) {
  const rows = [];
  for (const t of tracks) t.levels.forEach((l, i) => { const k = `${t.id}:${i}`; rows.push({ key: k, track: t.name, level: l.n, lesson: keys.lessons.has(k), reps: keys.reps.has(k), model: keys.models.has(k), questions: (l.q || []).length }); });
  const n = rows.length, pct = c => Math.round(rows.filter(r => r[c]).length / n * 100), bare = rows.filter(r => !r.lesson && !r.reps && !r.model), f = [];
  const noReps = rows.filter(r => !r.reps), noLesson = rows.filter(r => !r.lesson);
  if (noLesson.length) f.push({ code: "levels-no-lesson", severity: noLesson.length / n > 0.25 ? "warn" : "info", where: "lessons", detail: `${noLesson.length} of ${n} levels have no lesson. e.g. ${noLesson.slice(0, 4).map(r => `${r.track} / ${r.level}`).join("; ")}` });
  if (noReps.length) f.push({ code: "levels-no-reps", severity: noReps.length / n > 0.25 ? "warn" : "info", where: "reps", detail: `${noReps.length} of ${n} levels have no number reps. e.g. ${noReps.slice(0, 4).map(r => `${r.track} / ${r.level}`).join("; ")}` });
  if (bare.length) f.push({ code: "levels-bare", severity: "warn", where: "levels", detail: `${bare.length} levels have only questions (no lesson, reps or model): ${bare.slice(0, 4).map(r => `${r.track} / ${r.level}`).join("; ")}` });
  const thin = rows.filter(r => r.questions < 10);
  if (thin.length) f.push({ code: "levels-thin", severity: "info", where: "questions", detail: `${thin.length} levels have under 10 questions. e.g. ${thin.slice(0, 4).map(r => `${r.track} / ${r.level} (${r.questions})`).join("; ")}` });
  return { ...report("coverage", f, { levels: n, withLessonPct: pct("lesson"), withRepsPct: pct("reps"), withModelPct: pct("model") }), rows };
}
export async function scan(root = ROOT, tracksFile) {
  const tracks = Array.isArray(tracksFile) ? tracksFile : tracksFile ? JSON.parse(fs.readFileSync(tracksFile, "utf8")).tracks : (await (await import("./dump.mjs")).dumpTracks()).tracks;
  return coverage(tracks, loadKeys(root));
}
cli(import.meta.url, a => scan(ROOT, a[0]));
