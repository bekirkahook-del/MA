// Verifier Bot: after any fix, re-run the sensor that found the issue AND the tests. If either says no, the patch is reverted.
import { execFileSync } from "node:child_process";
import { git } from "../lib.mjs";

export async function verify({ issue, rerun, runTests }) {
  const after = await rerun(), still = after.some(i => i.key === issue.key), t = await runTests();
  return { ok: !still && t.ok, issueGone: !still, testsPass: t.ok, testNote: t.note || "" };
}
export function revert(root, files) { files.forEach(f => git(["checkout", "--", f], root)); return files; }
export function realTests(root) {
  try { execFileSync("node", ["--test", "tests/"], { cwd: root, stdio: "pipe" }); return { ok: true }; }
  catch (e) { const m = String(e.stdout || "").match(/^# fail (\d+)/m); return { ok: false, note: m ? m[1] + " tests failed" : "tests did not run" }; }
}
