// The circle as data. circle.mjs runs it, obsidian/build.mjs draws it, tests check it. One source of truth for "who depends on whom".
// edge types: feed = passes findings, gate = can block, act = changes something, recheck = verifies, learn = changes future behavior
export const NODES = [
  { id: "qa", name: "Question QA Bot", role: "sensor", file: "tools/bots/qa.mjs", does: "Audits all 1,248 questions for wrong keys, duplicate options, giveaways." },
  { id: "health", name: "Site Health Bot", role: "sensor", file: "tools/bots/health.mjs", does: "Links, function syntax, every level opens, JS errors." },
  { id: "freshness", name: "Content Freshness Bot", role: "sensor", file: "tools/bots/freshness.mjs", does: "Stale wire data and guides that mention past years." },
  { id: "cost", name: "Cost Guard Bot", role: "sensor", file: "tools/bots/cost.mjs", does: "Netlify credits (15 per deploy) and AI usage vs limits." },
  { id: "funnel", name: "Funnel Bot", role: "sensor", file: "tools/bots/funnel.mjs", does: "Where visitors drop between landing and sign-up." },
  { id: "billing", name: "Billing Audit Bot", role: "sensor", file: "tools/bots/billing.mjs", does: "Paid vs access mismatches between Stripe and the site." },
  { id: "feedbot", name: "Superfeedbackbot", role: "sensor", file: "tools/feedbot/triage.mjs", does: "Judges user feedback with a rubric and a consensus gate." },
  { id: "retention", name: "Retention Bot", role: "actor-draft", file: "tools/bots/retention.mjs", does: "Plans review-due reminders (dry run, never sends)." },
  { id: "outreach", name: "Outreach Bot", role: "actor-draft", file: "tools/bots/outreach.mjs", does: "Drafts club and career-center emails (never sends)." },
  { id: "dispatcher", name: "Dispatcher Bot", role: "circle", file: "tools/bots/circle/dispatcher.mjs", does: "Dedupes issues, scores priority, routes each to the fixer, a human, or watch." },
  { id: "guard", name: "Guard Bot", role: "circle", file: "tools/bots/circle/guard.mjs", does: "Allows or blocks every action: kill switch, protected files, caps, loop breaker, marketing gates." },
  { id: "fixer", name: "Fixer Bot", role: "circle", file: "tools/bots/circle/fixer.mjs", does: "Applies the few fixes that are safe to automate. Everything else becomes a packet for a human." },
  { id: "verifier", name: "Verifier Bot", role: "circle", file: "tools/bots/circle/verifier.mjs", does: "Re-runs the sensor and the tests after a fix. Reverts the patch if either fails." },
  { id: "historian", name: "Historian Bot", role: "circle", file: "tools/bots/circle/historian.mjs", does: "Remembers which fix types worked or got reverted and demotes the ones that fail." },
  { id: "reporter", name: "Reporter Bot", role: "circle", file: "tools/bots/circle/reporter.mjs", does: "Writes the daily digest for Bekir and says when a deploy question is due." },
];
export const EDGES = [
  ...["qa", "health", "freshness", "cost", "funnel", "billing", "feedbot"].map(s => ({ from: s, to: "dispatcher", type: "feed", label: "issues found" })),
  { from: "qa", to: "feedbot", type: "feed", label: "verified defects count as hard evidence" },
  { from: "dispatcher", to: "fixer", type: "act", label: "safe, fixable issues" },
  { from: "dispatcher", to: "reporter", type: "feed", label: "issues that need a human" },
  { from: "guard", to: "fixer", type: "gate", label: "allow or block every patch" },
  { from: "health", to: "guard", type: "gate", label: "site broken = freeze all fixes" },
  { from: "billing", to: "guard", type: "gate", label: "money problem = pause marketing" },
  { from: "guard", to: "retention", type: "gate", label: "runs only when health and billing are clean" },
  { from: "guard", to: "outreach", type: "gate", label: "runs only when health and billing are clean" },
  { from: "fixer", to: "verifier", type: "feed", label: "patch to check" },
  { from: "verifier", to: "qa", type: "recheck", label: "re-run after a question fix" },
  { from: "verifier", to: "freshness", type: "recheck", label: "re-run after a data fix" },
  { from: "verifier", to: "historian", type: "feed", label: "worked or reverted" },
  { from: "historian", to: "guard", type: "learn", label: "demote fix types that keep failing" },
  { from: "guard", to: "dispatcher", type: "gate", label: "frozen issues go straight to a human" },
  { from: "cost", to: "reporter", type: "feed", label: "deploy budget advice" },
  { from: "retention", to: "reporter", type: "feed", label: "dry-run counts" },
  { from: "outreach", to: "reporter", type: "feed", label: "drafts waiting for approval" },
  { from: "verifier", to: "reporter", type: "feed", label: "what changed and what was reverted" },
];
export const byId = Object.fromEntries(NODES.map(n => [n.id, n]));
export const edgesOf = id => ({ out: EDGES.filter(e => e.from === id), in: EDGES.filter(e => e.to === id) });
export function mermaid() {
  const grp = r => NODES.filter(n => n.role === r).map(n => `    ${n.id}["${n.name}"]`).join("\n");
  const arrow = { feed: "-->", act: "==>", gate: "-.->", recheck: "-->", learn: "-.->" };
  const lines = ["flowchart LR", "  subgraph SENSE[Sensors]", grp("sensor"), "  end", "  subgraph CIRCLE[The Circle]", grp("circle"), "  end", "  subgraph DRAFT[Drafters - never send]", grp("actor-draft"), "  end", "  H((Bekir))"];
  EDGES.forEach(e => lines.push(`  ${e.from} ${arrow[e.type]}|${e.label.replace(/[|"]/g, "")}| ${e.to}`));
  lines.push("  reporter ==>|digest and deploy question| H");
  return lines.join("\n");
}
