/* Which levels still need questions? Usage: node tools/qcoverage.mjs
   Target per level: 10+ questions in each of Beginner (js/easyq.js), Intermediate (core bank), Advanced (js/hardq.js),
   and every specialized track at TARGET_LEVELS levels. */
import fs from "node:fs";
const src = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
globalThis.window = {}; globalThis.document = {};
const a = src.indexOf("const TRACKS = ["), b = src.indexOf("\nconst MORE_Q=");
(0, eval)(src.slice(a, b).replace("const TRACKS", "globalThis.TRACKS"));
const grab = n => { const i = src.indexOf("const " + n + "="); return i < 0 ? {} : (0, eval)("(" + src.slice(i + n.length + 7, src.indexOf("\n", i)).replace(/;$/, "") + ")"); };
const more = [grab("MORE_Q"), grab("MORE_Q2"), grab("MORE_Q3")];
await import("../js/easyq.js"); await import("../js/hardq.js"); for (const t of ["ib", "pe", "pm", "rx", "mc"]) { await import("../js/easyq-" + t + ".js"); await import("../js/hardq-" + t + ".js"); } await import("../js/reps-data.js");
/* mini-lessons live in IIFEs that expect a browser; load them in a stubbed sandbox and read window.MA_LESSONS */
globalThis.localStorage = { getItem() { return null }, setItem() {} }; globalThis.showBrief = () => {}; globalThis.runLevel = () => {};
globalThis.document = { addEventListener() {}, createElement() { return { style: {} } }, head: { appendChild() {} }, getElementById() { return null }, querySelector() { return null } };
for (const f of ["lessons.js", "lessons2.js"]) { try { (0, eval)(fs.readFileSync(new URL("../js/" + f, import.meta.url), "utf8")) } catch (e) {} }
const LES = window.MA_LESSONS || {}, REPS = window.MA_REPS || {};
const MIN = 10, TARGET_LEVELS = 10, rows = []; let gaps = 0, levelsShort = 0, noLes = 0, noApp = 0;
for (const id of ["ib", "pe", "pm", "rx", "mc"]) {
  const tr = TRACKS.find(t => t.id === id);
  tr.levels.forEach((L, i) => {
    const core = L.q.length + more.reduce((n, m) => n + ((m[id + "-" + i] || []).length), 0);
    const e = (window.MA_EASYQ[id + "-" + i] || []).length, h = (window.MA_HARDQ[id + "-" + i] || []).length;
    const les = (LES[id + ":" + i] || []).length, app = REPS[id + ":" + i] ? 1 : 0;
    rows.push([id, i + 1, L.n, e, core, h, les, app]); gaps += (e < MIN) + (core < MIN) + (h < MIN); noLes += !les; noApp += !app;
  });
  if (tr.levels.length < TARGET_LEVELS) { levelsShort += TARGET_LEVELS - tr.levels.length; }
}
console.log("track  lvl  name".padEnd(40) + "Beg  Int  Adv  Lesson  Apply");
for (const r of rows) console.log(`${r[0].padEnd(5)}  ${String(r[1]).padStart(2)}   ${String(r[2]).slice(0, 28).padEnd(30)}${String(r[3]).padStart(3)}  ${String(r[4]).padStart(3)}  ${String(r[5]).padStart(3)}  ${String(r[6]).padStart(4)}   ${r[7] ? "  yes" : "   no"}`);
console.log(`\nTiers under ${MIN} questions: ${gaps} of ${rows.length * 3}. Levels without a mini-lesson: ${noLes}. Without an application: ${noApp}. Levels still to write to reach ${TARGET_LEVELS} per track: ${levelsShort}.`);
