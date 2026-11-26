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
import { release } from "../release.mjs";
import { rank } from "../strategist.mjs";
import { changelog as mkChangelog, readQueue } from "../changelog.mjs";
import { PACK3 } from "./pack3.mjs";
import { PACK4 } from "./pack4.mjs";
import { PACK5 } from "./pack5.mjs";
import { PACK6 } from "./pack6.mjs";
import { PACK7 } from "./pack7.mjs";
import { brief } from "../flywheel/brief.mjs";
import { todayList } from "../todaylist.mjs";

const STATIC = ["seo", "sitemap", "schema", "a11y", "perf", "secrets", "duplicate", "readability", "reps", "coverage", "testcov", "deadcode",
  "linkgraph", "thin", "cannibal", "typos", "mojibake", "images", "redirects", "feed", "dupids", "consolelog", "localhost", "extlinks", "pwa", "timeouts", "envvars", "deps", "wireschema", "companies", "privacy", "pricing", "drift",
  "claims", "qlength", "qyears", "explain", "testrunner", "consoleerrors", "mobile", "authdiag"];
const FLY = [...PACK3, ...PACK4, ...PACK5, ...PACK6, ...PACK7].map(b => b.id);
const OPTIONAL = ["feedbot", "funnel", "billing", "retention", "outreach", "testrunner", "consoleerrors", "mobile"]; // need live data, a browser, or a long run
const ADAPT = { ...Object.fromEntries(FLY.map(b => [b, S.fromReport(b)])), qa: S.fromQa, health: S.fromHealth, freshness: S.fromFreshness, cost: S.fromCost, ...Object.fromEntries(STATIC.map(b => [b, S.fromReport(b)])) };

export async function defaultSensors(root, o = {}) {
  const now0 = o.now || new Date(), f = o.files || {}, rd = p => JSON.parse(fs.readFileSync(p, "utf8")), out = {};
  const { brokenLinks, functionSyntax, smoke, summarize } = await import("../health.mjs");
  out.health = async () => summarize({ links: brokenLinks(root), funcs: functionSyntax(root), sm: o.smoke ? await smoke(root) : null });
  
  out.qa = async () => { const { auditQuestions } = await import("../qa.mjs"); return auditQuestions((await tracks()).tracks); };
  const { scanFreshness } = await import("../freshness.mjs"); out.freshness = async () => scanFreshness(root, o.now);
  const { costReport, deploysThisMonth } = await import("../cost.mjs"); out.cost = async () => costReport({ deploys: deploysThisMonth(root, o.now), aiRows: f.ai ? rd(f.ai) : [], now: o.now });
  let tp; const tracks = () => (tp ||= f.tracks ? Promise.resolve(rd(f.tracks)) : import("../dump.mjs").then(m => m.dumpTracks()));
  const PLAIN = STATIC.filter(b => !["coverage", "claims", "qlength", "qyears", "explain", "testrunner", "consoleerrors", "mobile", "authdiag", "deps"].includes(b));
  for (const b of PLAIN) out[b] = async () => (await import("../" + b + ".mjs")).scan(root);
  out.deps = async () => (await import("../deps.mjs")).scan(root, { audit: o.network });
  out.coverage = async () => (await import("../coverage.mjs")).scan(root, (await tracks()).tracks);
  out.claims = async () => (await import("../claims.mjs")).scan(root, (await tracks()).tracks);
  for (const b of ["qlength", "qyears", "explain"]) out[b] = async () => (await import("../" + b + ".mjs"))[b](( await import("../qdata.mjs")).flatten((await tracks()).tracks));
  let oc; const opsCtx = async () => (oc ||= (async () => { const O = await import("../ops.mjs"), COST = await import("../cost.mjs"), { flatten } = await import("../qdata.mjs"); return O.loadOps(root, now0, { cost: COST, qs: flatten((await tracks()).tracks) }); })());
  for (const b of FLY) out[b] = async () => (await import("../" + b + ".mjs")).scan(root, { ctx: await opsCtx() });
  out.authdiag = async () => (await import("../authdiag.mjs")).scan(root, { rows: f.visits ? rd(f.visits) : null, smoke: o.smoke, network: o.network });
  if (o.tests) out.testrunner = async () => (await import("../testrunner.mjs")).scan(root);
  if (o.smoke) for (const b of ["consoleerrors", "mobile"]) out[b] = async () => (await import("../" + b + ".mjs")).scan(root);
  out.changelog = async () => mkChangelog(readQueue(root));
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
  for (const b of [...STATIC, ...FLY]) await sense(b, ADAPT[b], sensors[b]);
  await sense("funnel", S.fromFunnel, sensors.funnel);
  const qaDefects = new Set(found.filter(i => i.bot === "qa" && i.verified).map(i => i.question));
  await sense("feedbot", S.fromFeedbot, sensors.feedbot && (() => sensors.feedbot({ qaDefects })));

  L.upsert(led, found, { ran, now });
  const gates = gateMarketing(led, now), drafts = {};
  for (const [name, fn] of [["retention", sensors.retention], ["outreach", sensors.outreach]]) {
    if (!fn) continue;
    if (!gates[name]) { drafts[name] = { skipped: gates.why.join("; ") }; continue; }
    try { drafts[name] = await fn(); ran.push(name); } catch (e) { failed.push({ bot: name, error: e.message }); }
  }

  const autoAllowed = t => H.autoAllowed(hist, t);
  const healthCritical = Object.values(led.issues).some(i => ["health", "secrets"].includes(i.bot) && i.severity === "critical" && !["resolved", "ignored"].includes(i.status));
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
  const queue = sensors.changelog ? await sensors.changelog() : null, killed = fs.existsSync(path.join(root, "tools/bots/STOP"));
  const rel = queue ? release({ issues: Object.values(led.issues), queue, tests: o.testsResult || (reports.testrunner ? { ok: reports.testrunner.ok, note: reports.testrunner.note } : undefined), deploysLeft: reports.cost && reports.cost.deploy && reports.cost.deploy.deploysLeft }) : null;
  if (rel && killed) { rel.verdict = "NO-GO"; rel.reasons.push("Kill switch (tools/bots/STOP) is on."); }
  let trend = null, metaRep = null;
  try { const T = await import("../trend.mjs"); trend = T.record(root, Object.values(led.issues), now, o.write !== false); } catch (e) { failed.push({ bot: "trend", error: e.message }); }
  try { const M = await import("../meta.mjs"), { NODES } = await import("./graph.mjs"); metaRep = M.selfAudit({ issues: Object.values(led.issues), ran, nodes: NODES, history: hist, exists: p => fs.existsSync(path.join(root, p)), now, optional: OPTIONAL }); } catch (e) { failed.push({ bot: "meta", error: e.message }); }
  const today = todayList(Object.values(led.issues)), contentBrief = reports.slotplan ? brief(reports, { date: reports.slotplan.stats.date }) : null;
  const ideas = rank({ issues: Object.values(led.issues), coverage: reports.coverage }, 5), extras = { release: rel, changelog: queue, ideas, trend, meta: metaRep, today, contentBrief };
  const md = digest({ now, summary: L.counts(led), plan, actions, gates, failed, cost, ran, mode, queuedSiteChanges: o.queuedSiteChanges || (queue ? queue.commits : 0), extras });
  if (o.write !== false && contentBrief) fs.writeFileSync(path.join(sd, "content-brief.md"), contentBrief);
  if (o.write !== false) {
    fs.writeFileSync(path.join(sd, "circle-ledger.json"), JSON.stringify(led, null, 1)); fs.writeFileSync(path.join(sd, "circle-history.json"), JSON.stringify(hist, null, 1)); fs.writeFileSync(path.join(sd, "digest.md"), md);
  }
  return { mode, ran, failed, extras, gates, counts: L.counts(led), plan: plan.map(p => ({ to: p.to, why: p.why, priority: p.priority, severity: p.issue.severity, key: p.issue.key, detail: p.issue.detail })), actions, packets: plan.filter(p => p.to === "human").map(p => packet(p.issue)), drafts: Object.fromEntries(Object.entries(drafts).map(([k, v]) => [k, v.skipped ? v : { dryRun: true, sends: 0, ...(v.drafted != null ? { drafted: v.drafted } : { eligibleToday: v.eligibleToday, wouldSendIfTheyOptIn: v.wouldSendIfTheyOptIn }) }])), digestPath: "tools/bots/state/digest.md" };
}
cli(import.meta.url, async a => {
  const files = { visits: arg(a, "visits"), billing: arg(a, "billing"), feedback: arg(a, "feedback"), targets: arg(a, "targets"), engage: arg(a, "engage"), ai: arg(a, "ai"), tracks: arg(a, "tracks") };
  return runCircle({ mode: a.includes("--act") ? "act" : "plan", smoke: a.includes("--smoke"), tests: a.includes("--tests"), network: a.includes("--live"), files });
});
