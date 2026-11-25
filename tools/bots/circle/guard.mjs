// Guard Bot: says yes or no to every action. Nothing in the circle changes a file without passing through here.
export const PROTECTED = [/^index\.html$/, /^netlify\.toml$/, /^netlify\/functions\//, /^supabase\//, /^js\/(auth|backend|rewards|gate|pro-plus|checklist|grow)\.js$/, /^CLAUDE\.md$/, /^tools\/deploy\.sh$/, /^\.github\//];
export const LIMITS = { maxFixesPerRun: 5, maxAttempts: 2, maxReopen: 3 };
export function checkRun({ killSwitch = false, branch = "", healthCritical = false, fixesDone = 0 }) {
  const why = [];
  if (killSwitch) why.push("kill switch file tools/bots/STOP exists");
  if (/^(main|master)$/.test(branch)) why.push("on main: the circle never acts on main, only on staging or a working branch");
  if (healthCritical) why.push("site health is critical: fixes are frozen until the site is healthy");
  if (fixesDone >= LIMITS.maxFixesPerRun) why.push(`already made ${LIMITS.maxFixesPerRun} fixes this run`);
  return { ok: !why.length, why };
}
export function checkPatch({ files = [], attempts = 0, reopened = 0 }) {
  const why = [];
  files.filter(f => PROTECTED.some(r => r.test(f))).forEach(f => why.push("protected file: " + f));
  if (attempts >= LIMITS.maxAttempts) why.push("already tried " + attempts + " times");
  if (reopened >= LIMITS.maxReopen) why.push("issue keeps coming back");
  return { ok: !why.length, why };
}
import { outreachWindow, deployCap } from "../ops.mjs";
export function gateMarketing(ledger, now = new Date()) {
  const open = Object.values(ledger.issues).filter(i => !["resolved", "ignored"].includes(i.status));
  const bill = open.some(i => i.bot === "billing" && i.severity === "critical"), health = open.some(i => i.bot === "health" && i.severity === "critical");
  const why = [bill && "a critical billing problem is open", health && "site health is critical"].filter(Boolean);
  const w = outreachWindow(now), outWhy = w.open ? [] : [`outside the outreach window (${w.label}); next opens ${w.next}`];
  return { retention: !why.length, outreach: !why.length && w.open, why: [...why, ...outWhy] };
}
export function gateDeploy(log, now = new Date()) {
  const d = deployCap(log, now);
  return { deploy: d.allowed, ...d, why: d.allowed ? [] : [`deploy cap hit: ${d.used}/${d.cap} today; stay queued on staging`] };
}
