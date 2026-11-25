// The Circle: runs every bot in dependency order, files every finding in one ledger, and lets the circle bots act on what is safe.
//   plan mode (default): sense, file, route, report. Changes nothing in the repo.
//   act mode (--act):    also applies safe fixes on a NON-main branch, re-verifies, commits or reverts. Never pushes, never deploys.
// Usage: node tools/bots/circle/circle.mjs [--act] [--smoke] [--visits f] [--billing f] [--feedback f] [--targets f] [--engage f] [--out digest.md]
import fs from "node:fs";
import path from "node:path";
import { ROOT, cli, arg, git, readJson } from "../lib.mjs";
import * as L from "./ledger.mjs";
import * as S from "./sensors.mjs";
import { plan as makePlan } from "./dispatcher.mjs";
import { checkRun, checkPatch, gateMarketing } from "./guard.mjs";
import { FIXERS, packet } from "./fixer.mjs";
import { verify, revert, realTests } from "./verifier.mjs";
import * as H from "./historian.mjs";
import { digest } from "./reporter.mjs";

const ADAPT = { qa: S.fromQa, health: S.fromHealth, freshness: S.fromFreshness, cost: S.fromCost };

export async function defaultSensors(root, o = {}) {
  const f = o.files || {}, rd = p => JSON.parse(fs.readFileSync(p, "utf8")), out = {};
  const { brokenLinks, functionSyntax, smoke, summarize } = await import("../health.mjs");
  out.health = async () => summarize({ links: brokenLinks(root), funcs: functionSyntax(root), sm: o.smoke ? await smoke(root) : null });
  out.qa = async () => { const { dumpTracks } = await import("../dump.mjs"); const { auditQuestions } = await import("../qa.mjs"); return auditQuestions((await dumpTracks()).tracks); };
  const { scanFreshness } = await import("../freshness.mjs"); out.freshness = async () => scanFreshness(root, o.now);
  const { costReport, deploysThisMonth } = await import("../cost.mjs"); out.cost = async () => costReport({ deploys: deploysThisMonth(root, o.now), aiRows: f.ai ? rd(f.ai) : [], now: o.now });
  if (f.visits) { const { funnel } = await import("../funnel.mjs"); out.funnel = async () => funnel(rd(f.visits)); }
  if (f.billing) { const { reconcile } = await import("../billing.mjs"); out.billing = async () => reconcile(rd(f.billing)); }
  if (f.feedback) { const T = await import("../../feedbot/triage.mjs"); out.feedbot = async ({ qaDefects }) => T.run(rd(f.feedback), { ...T.repoContext(root), qaDefects }, { state: readJson(path.join(root, "tools/feedbot/state.json"), {}) }); }
  if (f.engage) { const { plan } = await import("../retention.mjs"); out.retention = async () => plan(rd(f.engage)); }
  if (f.targets) { const { draft } = await import("../outreach.mjs"); out.outreach = async () => draft(rd(f.targets), { sent: readJson(path.join(root, "tools/bots/state/outreach-sent.json"), {}) }); }
  return out;
}

export async function runCircle(o = {}) {
  const root = o.root || ROOT, now = o.now || new Date(), mode = o.mode || "plan", sd = path.join(root, "tools/bots/state");
  fs.mkdirSync(sd, { recursive: true });
  const led = readJson(path.join(sd, "circle-ledger.json"), L.empty()), hist = readJson(path.join(sd, "circle-history.json"), H.empty());
  const sensors = o.sensors || (await defaultSensors(root, { ...o, now })), found = [], ran = ["circle"], failed = [], reports = {};
  const sense = async (name, adapter, fn) => { if (!fn) return null; try { const r = await fn(); reports[name] = r; found.push(...adapter(r)); ran.push(name); return r; } catch (e) { failed.push({ bot: name, error: e.message }); found.push(S.botFailure(name, e)); return null; } };

  await sense("health", S.fromHealth, sensors.health);
  await sense("billing", S.fromBilling, sensors.billing);
  await sense("qa", S.fromQa, sensors.qa);
  await sense("freshness", S.fromFreshness, sensors.freshness);
  await sense("cost", S.fromCost, sensors.cost);
  await sense("funnel", S.fromFunnel, sensors.funnel);
  const qaDefects = new Set(found.filter(i => i.bot === "qa" && i.verified).map(i => i.question));
  await sense("feedbot", S.fromFeedbot, sensors.feedbot && (() => sensors.feedbot({ qaDefects })));

  L.upsert(led, found, { ran, now });
  const gates = gateMarketing(led), drafts = {};
  for (const [name, fn] of [["retention", sensors.retention], ["outreach", sensors.outreach]]) {
    if (!fn) continue;
    if (!gates[name]) { drafts[name] = { skipped: gates.why.join("; ") }; continue; }
    try { drafts[name] = await fn(); ran.push(name); } catch (e) { failed.push({ bot: name, error: e.message }); }
  }

  const autoAllowed = t => H.autoAllowed(hist, t);
  const healthCritical = Object.values(led.issues).some(i => i.bot === "health" && i.severity === "critical" && !["resolved", "ignored"].includes(i.status));
  const actions = [];
  if (mode === "act") {
    const branch = git(["rev-parse", "--abbrev-ref", "HEAD"], root), dirty = git(["status", "--porcelain"], root).split("\n").filter(l => l && !l.includes("tools/bots/state/"));
    let done = 0;
    for (const p of makePlan(led, { now, autoAllowed }).filter(x => x.to === "fixer")) {
      const it = led.issues[p.issue.key], gate = checkRun({ killSwitch: fs.existsSync(path.join(root, "tools/bots/STOP")), branch, healthCritical, fixesDone: done });
      const why = gate.ok && dirty.length ? ["working tree has uncommitted changes: refusing to mix a bot fix into someone's work"] : gate.why;
      if (why.length) { actions.push({ issue: it.key, ok: false, note: "blocked by Guard: " + why.join("; ") }); H.record(hist, it.fix.type, "blocked", now); break; }
      const pre = checkPatch({ files: [], attempts: it.attempts, reopened: it.reopened });
      if (!pre.ok) { actions.push({ issue: it.key, ok: false, note: "blocked by Guard: " + pre.why.join("; ") }); continue; }
      it.attempts++;
      const res = FIXERS[it.fix.type].apply(root, it.fix.args, now);
      if (!res.changed.length) { actions.push({ issue: it.key, ok: false, note: res.note }); continue; }
      const post = checkPatch({ files: res.changed, attempts: 0, reopened: 0 });
      if (!post.ok) { revert(root, res.changed); actions.push({ issue: it.key, ok: false, note: "reverted, Guard: " + post.why.join("; ") }); H.record(hist, it.fix.type, "blocked", now); continue; }
      const v = await verify({ issue: it, rerun: async () => ADAPT[it.bot](await sensors[it.bot]()), runTests: async () => (o.tests ? o.tests() : realTests(root)) });
      if (v.ok) {
        git(["add", ...res.changed], root); git(["commit", "-q", "-m", `bot(circle): ${res.note}\n\nIssue: ${it.key}\nVerified: sensor no longer reports it, tests pass.`], root);
        L.setStatus(led, it.key, "fixed", "fixed by Fixer, verified", now); H.record(hist, it.fix.type, "ok", now); done++; actions.push({ issue: it.key, ok: true, note: res.note });
      } else {
        revert(root, res.changed); L.setStatus(led, it.key, "open", "fix reverted", now, { issueGone: v.issueGone, testsPass: v.testsPass }); H.record(hist, it.fix.type, "reverted", now);
        actions.push({ issue: it.key, ok: false, note: `reverted: ${!v.issueGone ? "issue still reported" : ""}${!v.testsPass ? " tests failed " + v.testNote : ""}`.trim() });
      }
    }
  }
  const plan = makePlan(led, { now, autoAllowed }), cost = reports.cost && reports.cost.deploy;
  const md = digest({ now, summary: L.counts(led), plan, actions, gates, failed, cost, ran, mode, queuedSiteChanges: o.queuedSiteChanges || 0 });
  if (o.write !== false) {
    fs.writeFileSync(path.join(sd, "circle-ledger.json"), JSON.stringify(led, null, 1)); fs.writeFileSync(path.join(sd, "circle-history.json"), JSON.stringify(hist, null, 1)); fs.writeFileSync(path.join(sd, "digest.md"), md);
  }
  return { mode, ran, failed, gates, counts: L.counts(led), plan: plan.map(p => ({ to: p.to, why: p.why, priority: p.priority, severity: p.issue.severity, key: p.issue.key, detail: p.issue.detail })), actions, packets: plan.filter(p => p.to === "human").map(p => packet(p.issue)), drafts: Object.fromEntries(Object.entries(drafts).map(([k, v]) => [k, v.skipped ? v : { dryRun: true, sends: 0, ...(v.drafted != null ? { drafted: v.drafted } : { eligibleToday: v.eligibleToday, wouldSendIfTheyOptIn: v.wouldSendIfTheyOptIn }) }])), digestPath: "tools/bots/state/digest.md" };
}
cli(import.meta.url, async a => {
  const files = { visits: arg(a, "visits"), billing: arg(a, "billing"), feedback: arg(a, "feedback"), targets: arg(a, "targets"), engage: arg(a, "engage"), ai: arg(a, "ai") };
  return runCircle({ mode: a.includes("--act") ? "act" : "plan", smoke: a.includes("--smoke"), files });
});
