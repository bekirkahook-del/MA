// Strategist Bot: ranks what to build or fix next, using only evidence the other bots produced. It cites the evidence on every line and never invents an impact number.
// Score = evidence weight (how many users, pages or levels it touches) x severity weight, normalised to 0-100.
// Usage: node tools/bots/strategist.mjs
import path from "node:path";
import { ROOT, cli, readJson } from "./lib.mjs";

const SEV = { critical: 3, warn: 2, info: 1 };
const IDEAS = { // issue class -> what a human would actually do about it
  "funnel:leak": "Fix the biggest funnel drop-off (visitors who never start a level)", "funnel:guide-cta": "Rewrite the guide call-to-action (guide readers rarely click through)",
  "coverage:levels-no-reps": "Add number reps to the levels that have none", "coverage:levels-no-lesson": "Write lessons for the levels that have none",
  "a11y:input-label": "Label the unlabeled form fields (screen-reader users cannot use them)", "perf:blocking-scripts": "Defer the render-blocking scripts so the first screen paints sooner",
  "perf:js-file-big": "Split app.js (the biggest script) so phones download less", "seo:title-length": "Shorten the guide titles that search results will cut off",
  "qa:longest-answer-giveaway": "Rebalance answer lengths so the longest option is not always right", "readability:lessons-hard": "Simplify the hardest-reading lesson cards",
  "testcov:functions-untested": "Write tests for the Netlify functions no test names",
};
export function rank({ issues = [], coverage }, top = 7) {
  const rows = issues.filter(i => !["resolved", "ignored", "fixed"].includes(i.status)).map(i => {
    const nums = (i.detail.match(/\d[\d,]*/g) || []).map(s => +s.replace(/,/g, "")), touched = Math.max(1, nums[0] || 1), key = `${i.bot}:${i.cls}`;
    return { key, bot: i.bot, severity: i.severity, what: IDEAS[key] || (i.fix ? "Auto-fixable: " : "Look at: ") + i.detail.slice(0, 90), evidence: i.detail.slice(0, 200), touched, raw: Math.log10(touched + 1) * (SEV[i.severity] || 1) * (i.bot === "funnel" ? 2 : 1) };
  });
  if (coverage && coverage.stats && coverage.stats.withRepsPct < 70 && !rows.some(r => r.key === "coverage:levels-no-reps")) rows.push({ key: "coverage:strategy", bot: "coverage", severity: "info", what: "Finish number reps for the remaining levels", evidence: `Only ${coverage.stats.withRepsPct}% of levels have reps, ${coverage.stats.withLessonPct}% have lessons.`, touched: coverage.stats.levels, raw: Math.log10(coverage.stats.levels + 1) * 2 });
  const max = Math.max(1, ...rows.map(r => r.raw));
  return rows.sort((a, b) => b.raw - a.raw).slice(0, top).map((r, i) => ({ rank: i + 1, score: Math.round(r.raw / max * 100), what: r.what, bot: r.bot, severity: r.severity, evidence: r.evidence, cost: "Any site change queues on staging; deploying costs ~15 credits." }));
}
export function scan(root = ROOT, coverage) { const led = readJson(path.join(root, "tools/bots/state/circle-ledger.json"), { issues: {} }); return { ranked: rank({ issues: Object.values(led.issues), coverage }) }; }
cli(import.meta.url, () => scan());
