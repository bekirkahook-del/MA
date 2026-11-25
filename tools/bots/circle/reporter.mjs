// Reporter Bot: one plain digest for Bekir (Obsidian-ready). It also decides whether the deploy question is due.
const L = n => "[[" + n + "]]";
export function digest({ now = new Date(), summary, plan, actions, gates, failed, cost, ran, queuedSiteChanges = 0, mode }) {
  const human = plan.filter(p => p.to === "human"), watch = plan.filter(p => p.to === "watch"), fixer = plan.filter(p => p.to === "fixer");
  const sev = i => ({ critical: "🔴", warn: "🟡", info: "⚪" }[i.severity] || "");
  const out = [`---\ntitle: Circle digest ${now.toISOString().slice(0, 10)}\ntags: [ma-prep, bots, digest]\ncreated: ${now.toISOString().slice(0, 10)}\n---\n`, `# Circle digest, ${now.toISOString().slice(0, 10)}`, "", `Mode: **${mode}**. Sensors ran: ${ran.length}${failed.length ? ", failed: " + failed.map(f => f.bot).join(", ") : ""}. Open issues: ${plan.length} (${human.length} need you, ${fixer.length} fixable, ${watch.length} watching).`, ""];
  if (human.length) { out.push("## Needs you", ""); human.slice(0, 12).forEach(p => out.push(`- ${sev(p.issue)} ${p.issue.detail} _(${L(botNote(p.issue.bot))}: ${p.why})_`)); out.push(""); }
  if (actions.length) { out.push("## What the bots did", ""); actions.forEach(a => out.push(`- ${a.ok ? "✅" : "↩️"} ${a.issue}: ${a.note}`)); out.push(""); }
  else out.push("## What the bots did", "", mode === "act" ? "- Nothing needed fixing automatically." : "- Plan mode: nothing was changed.", "");
  if (watch.length) { out.push("## Watching", ""); watch.slice(0, 6).forEach(p => out.push(`- ${p.issue.detail}`)); out.push(""); }
  if (gates && gates.why.length) out.push("## Gates closed", "", ...gates.why.map(w => `- ${L("Guard Bot")}: ${w}. Retention and outreach did not run.`), "");
  if (cost) out.push("## Money", "", `- Netlify credits: ${cost.creditsUsed} of 1,000 (${cost.ofBudget}%). ${cost.advice}`, "");
  if (queuedSiteChanges > 0) out.push("## Deploy", "", `${queuedSiteChanges} change(s) are queued on staging. **Want me to deploy? (~15 credits)**`, "");
  out.push("---", `Circle: ${L("The Circle")}`);
  return out.join("\n");
}
const NAMES = { qa: "Question QA Bot", health: "Site Health Bot", freshness: "Content Freshness Bot", cost: "Cost Guard Bot", funnel: "Funnel Bot", billing: "Billing Audit Bot", feedbot: "Superfeedbackbot", circle: "Guard Bot" };
const botNote = b => NAMES[b] || b;
