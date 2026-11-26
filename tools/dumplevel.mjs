/* Print one level so a question writer can see what it already teaches.
   Usage: node tools/dumplevel.mjs pe 2   (track id, 0-based level index) */
import fs from "node:fs";
const [tid, idx] = process.argv.slice(2), i = +idx;
const src = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
globalThis.window = {}; globalThis.document = {};
(0, eval)(src.slice(src.indexOf("const TRACKS = ["), src.indexOf("\nconst MORE_Q=")).replace("const TRACKS", "globalThis.TRACKS"));
const grab = n => { const k = src.indexOf("const " + n + "="); return k < 0 ? {} : (0, eval)("(" + src.slice(k + n.length + 7, src.indexOf("\n", k)).replace(/;$/, "") + ")"); };
const tr = TRACKS.find(t => t.id === tid), L = tr.levels[i];
const core = L.q.concat(...["MORE_Q", "MORE_Q2", "MORE_Q3"].map(n => grab(n)[tid + "-" + i] || []));
console.log(`# ${tr.name} · level ${i + 1} (index ${i}, key "${tid}-${i}"): ${L.n}\n${L.sub || ""}\n\nBRIEF:\n- ${L.brief.join("\n- ")}\n`);
if (L.ex) console.log("EXAMPLE: " + L.ex + "\n");
console.log(`CORE QUESTIONS (${core.length}), format [question, options, correctIndex, why]:`);
core.forEach(q => console.log(JSON.stringify(q)));
