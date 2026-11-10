// Shared voiceover helpers for rankvid.js / teaservid.js (calls vo.py / Piper TTS).
const { execFileSync } = require("child_process"); const path = require("path");
const U = { K: "thousand", M: "million", B: "billion", T: "trillion" };
function spoken(s) {
  return String(s).replace(/<[^>]+>/g, "").replace(/&amp;/g, " and ").replace(/&/g, " and ")
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
    .replace(/\$([\d,.]+)\s?([KMBT])\b/g, (m, n, u) => `${n} ${U[u]} dollars`).replace(/([\d.]+)\s?([KMBT])\b/g, (m, n, u) => `${n} ${U[u]}`)
    .replace(/×/g, " times ").replace(/[−–]\s?(\d)/g, "minus $1").replace(/→/g, ", then ").replace(/#(\d+)/g, "number $1")
    .replace(/%/g, " percent").replace(/\s+/g, " ").replace(/\s([,.?!])/g, "$1").trim();
}
function synth(dir, lines) { return JSON.parse(execFileSync("python3", [path.join(__dirname, "vo.py"), "synth", dir, JSON.stringify(lines.map(spoken))]).toString()); }
function mix(music, out, events) { execFileSync("python3", [path.join(__dirname, "vo.py"), "mix", music, out, JSON.stringify(events)]); }
module.exports = { spoken, synth, mix };
