// Test Runner Bot: runs the whole test suite and reports pass/fail. Its answer is what the Release Bot uses, so "tests not run" stops being a caveat.
// Usage: node tools/bots/testrunner.mjs     (takes about a minute)
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";

export function parseTap(out) { const g = k => { const m = out.match(new RegExp(`^# ${k} (\\d+)`, "m")); return m ? +m[1] : 0; }; return { tests: g("tests"), pass: g("pass"), fail: g("fail") }; }
export function judge(r) {
  const f = [];
  if (r.crashed) f.push({ code: "tests-crashed", severity: "critical", where: "tests", detail: `The test run itself crashed: ${r.note}` });
  else if (r.fail > 0) f.push({ code: "tests-failing", severity: "critical", where: "tests", detail: `${r.fail} of ${r.tests} tests fail${r.failing && r.failing.length ? ": " + r.failing.slice(0, 3).join("; ") : ""}.` });
  if (!r.crashed && r.tests === 0) f.push({ code: "tests-none", severity: "warn", where: "tests", detail: "No tests ran." });
  if (r.ms > 180000) f.push({ code: "tests-slow", severity: "info", where: "tests", detail: `The suite took ${Math.round(r.ms / 1000)}s. Slow suites get skipped.` });
  return { ...report("testrunner", f, { tests: r.tests, pass: r.pass, fail: r.fail, seconds: Math.round((r.ms || 0) / 1000) }), result: { ok: !r.crashed && r.fail === 0 && r.tests > 0, note: r.fail ? `${r.fail} failing` : r.crashed ? "crashed" : "" } };
}
export function runSuite(root = ROOT) {
  const t0 = Date.now(), dir = path.join(root, "tests"), files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => /\.test\.mjs$/.test(n)).map(n => path.join("tests", n)) : [];
  const a = spawnSync("node", ["--test", ...files], { cwd: root, encoding: "utf8", timeout: 400000, maxBuffer: 50e6 }), t = parseTap(a.stdout || "");
  const failing = [...(a.stdout || "").matchAll(/^not ok \d+ - (.+)$/gm)].map(m => m[1]);
  let extra = { ok: true }; if (fs.existsSync(path.join(dir, "sync-merge.test.js"))) { const b = spawnSync("node", ["tests/sync-merge.test.js"], { cwd: root, encoding: "utf8", timeout: 60000 }); extra.ok = b.status === 0; }
  if (!extra.ok) { t.fail++; t.tests++; failing.push("sync-merge.test.js"); }
  return { ...t, failing, ms: Date.now() - t0, crashed: a.error ? true : false, note: a.error ? String(a.error.message) : "" };
}
export const scan = (root = ROOT, run = runSuite) => judge(run(root));
cli(import.meta.url, () => scan());
