// Release Bot: a GO / CAUTION / NO-GO check before Bekir says "deploy". It only advises. It never deploys.
// Inputs are the circle's own findings, so it always agrees with the digest.
// Usage: node tools/bots/release.mjs
import path from "node:path";
import { ROOT, cli, readJson } from "./lib.mjs";

export const OPEN = i => !["resolved", "ignored", "fixed"].includes(i.status);
export function release({ issues = [], queue, tests, deploysLeft, bots = [] }) {
  const open = issues.filter(OPEN), reasons = [], notes = [];
  let verdict = "GO";
  const stop = r => { verdict = "NO-GO"; reasons.push(r); }, warn = r => { if (verdict === "GO") verdict = "CAUTION"; notes.push(r); };
  if (!queue || !queue.commits) return { verdict: "NOTHING TO SHIP", reasons: ["Staging has nothing that main does not."], notes, credits: 0 };
  if (tests && tests.ok === false) stop(`Tests are failing${tests.note ? ": " + tests.note : ""}.`);
  if (tests == null) warn("Tests were not run for this check. Run them before deploying.");
  for (const i of open.filter(i => i.severity === "critical" && ["health", "reps", "secrets", "sitemap", "schema", "billing", "circle"].includes(i.bot))) stop(`${i.bot}: ${i.detail.slice(0, 140)}`);
  for (const i of open.filter(i => i.severity === "critical" && i.bot === "qa")) stop(`qa: verified wrong answer: ${i.detail.slice(0, 120)}`);
  const w = open.filter(i => i.severity === "warn" && ["a11y", "seo", "perf"].includes(i.bot));
  if (w.length) warn(`${w.length} warning(s) in ${[...new Set(w.map(i => i.bot))].join(", ")} that this batch may or may not touch.`);
  if (deploysLeft != null && deploysLeft < 5) warn(`Only ${deploysLeft} deploys left in this month's credit budget.`);
  if (!queue.buildsSite) notes.push("This batch does not trigger a build, so it is free to merge.");
  return { verdict, reasons, notes, credits: queue.creditsIfDeployed, summary: queue.summary };
}
export async function scan(root = ROOT, o = {}) {
  const led = readJson(path.join(root, "tools/bots/state/circle-ledger.json"), { issues: {} });
  const { scan: q } = await import("./changelog.mjs"), { costReport, deploysThisMonth } = await import("./cost.mjs");
  const cost = costReport({ deploys: deploysThisMonth(root, o.now), aiRows: [], now: o.now });
  return release({ issues: Object.values(led.issues), queue: q(root), tests: o.tests, deploysLeft: cost.deploy && cost.deploy.deploysLeft });
}
cli(import.meta.url, () => scan());
