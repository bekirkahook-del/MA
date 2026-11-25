// Reporter Bot: one plain digest for Bekir (Obsidian-ready). It also decides whether the deploy question is due.
const L = n => "[[" + n + "]]";
export function digest({ now = new Date(), summary, plan, actions, gates, failed, cost, ran, queuedSiteChanges = 0, mode, extras = {} }) {
  const human = plan.filter(p => p.to === "human"), watch = plan.filter(p => p.to === "watch"), fixer = plan.filter(p => p.to === "fixer");
  const sev = i => ({ critical: "🔴", warn: "🟡", info: "⚪" }[i.severity] || "");
  const out = [`---\ntitle: Circle digest ${now.toISOString().slice(0, 10)}\ntags: [ma-prep, bots, digest]\ncreated: ${now.toISOString().slice(0, 10)}\n---\n`, `# Circle digest, ${now.toISOString().slice(0, 10)}`, "", `Mode: **${mode}**. Sensors ran: ${ran.length}${failed.length ? ", failed: " + failed.map(f => f.bot).join(", ") : ""}. Open issues: ${plan.length} (${human.length} need you, ${fixer.length} fixable, ${watch.length} watching).`, ""];
  if (human.length) { out.push("## Needs you", ""); human.slice(0, 12).forEach(p => out.push(`- ${sev(p.issue)} ${p.issue.detail} _(${L(botNote(p.issue.bot))}: ${p.why})_`)); out.push(""); }
  if (actions.length) { out.push("## What the bots did", ""); actions.forEach(a => out.push(`- ${a.ok ? "✅" : "↩️"} ${a.issue}: ${a.note}`)); out.push(""); }
  else out.push("## What the bots did", "", mode === "act" ? "- Nothing needed fixing automatically." : "- Plan mode: nothing was changed.", "");
  if (watch.length) { out.push("## Watching", ""); watch.slice(0, 6).forEach(p => out.push(`- ${p.issue.detail}`)); out.push(""); }
  if (gates && gates.why.length) out.push("## Gates closed", "", ...gates.why.map(w => `- ${L("Guard Bot")}: ${w}. Retention and outreach did not run.`), "");
  if (cost) out.push("## Money", "", `- Netlify credits: ${cost.creditsUsed} of 1,000 (${cost.ofBudget}%). ${cost.advice}`, "");
  if (extras.release) { const r = extras.release; out.push("## Release check", "", `**${r.verdict}**. ${r.summary || ""}`, ...r.reasons.map(x => "- 🔴 " + x), ...r.notes.map(x => "- " + x), ""); }
  if (extras.changelog && extras.changelog.commits) { out.push("## Waiting on staging", ""); for (const [g, list] of Object.entries(extras.changelog.groups)) out.push(`- **${g}:** ${list.length} (${list.slice(0, 2).join("; ")})`); out.push(""); }
  if (extras.ideas && extras.ideas.length) { out.push("## Build next (ranked by the bots' evidence)", "", ...extras.ideas.map(i => `${i.rank}. ${i.what} _(score ${i.score}, ${L(botNote(i.bot))})_: ${i.evidence}`), ""); }
  if (queuedSiteChanges > 0) out.push("## Deploy", "", `${queuedSiteChanges} change(s) are queued on staging. **Want me to deploy? (~15 credits)**`, "");
  out.push("---", `Circle: ${L("The Circle")}`);
  return out.join("\n");
}
const NAMES = { qa: "Question QA Bot", health: "Site Health Bot", freshness: "Content Freshness Bot", cost: "Cost Guard Bot", funnel: "Funnel Bot", billing: "Billing Audit Bot", feedbot: "Superfeedbackbot", circle: "Guard Bot", seo: "SEO Meta Bot", sitemap: "Sitemap Bot", schema: "Structured Data Bot", a11y: "Accessibility Bot", perf: "Performance Budget Bot", secrets: "Secrets and Headers Bot", duplicate: "Duplicate Content Bot", readability: "Readability Bot", reps: "Rep Auditor Bot", coverage: "Coverage Gap Bot", testcov: "Test Coverage Bot", deadcode: "Dead Code Bot", coverage2: "Coverage Gap Bot" };
const botNote = b => NAMES[b] || b;
