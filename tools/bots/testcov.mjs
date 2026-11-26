// Test Coverage Bot: which site scripts and Netlify functions are never mentioned by any test. A rough map of where a bug could hide.
// "Mentioned" is a name match, not line coverage: say so wherever the number is quoted.
// Usage: node tools/bots/testcov.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli } from "./lib.mjs";
import { read, report } from "./scan.mjs";

const DATA = /^(companies|guideidx|more-content2?|reps-data|models-data|pitch-data|lessons2?|qfix)\.js$/; // content files: covered by the QA bot, not unit tests
export function testcov({ scripts, functions, testText }) {
  const mentioned = n => testText.includes(n) || testText.includes(n.replace(/\.m?js$/, ""));
  const un = { scripts: scripts.filter(s => !DATA.test(s) && !mentioned(s)), functions: functions.filter(fn => !mentioned(fn)) };
  const f = [];
  if (un.functions.length) f.push({ code: "functions-untested", severity: un.functions.length / Math.max(1, functions.length) > 0.5 ? "warn" : "info", where: "netlify/functions", detail: `${un.functions.length} of ${functions.length} Netlify functions are not named in any test. e.g. ${un.functions.slice(0, 5).join(", ")}` });
  if (un.scripts.length) f.push({ code: "scripts-untested", severity: "info", where: "js", detail: `${un.scripts.length} of ${scripts.length} site scripts are not named in any test. e.g. ${un.scripts.slice(0, 5).join(", ")}` });
  return { ...report("testcov", f, { scripts: scripts.length, functions: functions.length, scriptsMentioned: scripts.length - un.scripts.length, functionsMentioned: functions.length - un.functions.length }), untested: un };
}
export function scan(root = ROOT) {
  const ls = d => { try { return fs.readdirSync(path.join(root, d)); } catch (e) { return []; } };
  const testText = ls("tests").map(n => read(root, "tests/" + n)).join("\n");
  return testcov({ scripts: ls("js").filter(n => n.endsWith(".js")), functions: ls("netlify/functions").filter(n => /\.m?js$/.test(n)), testText });
}
cli(import.meta.url, () => scan());
