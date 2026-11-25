// Adapters: turn each sensor bot's report into issues the whole circle understands.
// issue = { key, bot, cls, severity: critical|warn|info, detail, where, fix: {type,args}|null, verified?: bool }
import { hash } from "../../feedbot/triage.mjs";

const mk = (bot, cls, id, severity, detail, where = "", fix = null, extra = {}) => ({ key: `${bot}:${cls}:${id}`, bot, cls, severity, detail, where, fix, ...extra });

export function fromQa(r) {
  const out = [], by = {};
  for (const i of r.issues || []) (by[i.type] ||= []).push(i);
  for (const [type, list] of Object.entries(by)) {
    if (type === "text-glitch") list.forEach(i => out.push(mk("qa", type, hash(i.qFull || i.question), "info", `${i.track} / ${i.level}: ${i.note}`, `${i.track}/${i.level}`, { type: "text-glitch", args: { question: i.qFull || i.question } })));
    else if (list[0].objective && list[0].weight >= 30) list.forEach(i => out.push(mk("qa", type, hash(i.qFull || i.question), "critical", `${i.track} / ${i.level}: ${i.question} (${i.note})`, `${i.track}/${i.level}`, null, { verified: true, question: i.qFull || i.question })));
    else { const pct = Math.round(list.length / Math.max(1, r.total) * 100); out.push(mk("qa", type, "all", pct >= 10 ? "warn" : "info", `${list.length} questions (${pct}%): ${list[0].note}. Example: ${list[0].track} / ${list[0].level}: ${list[0].question}`, "questions", null, { count: list.length })); }
  }
  return out;
}
export const fromHealth = h => (h.findings || []).map(f => mk("health", f.what.replace(/\W+/g, "-"), hash(f.detail), f.severity, f.detail, f.what));
export function fromFreshness(r) {
  const out = [], guides = (r.findings || []).filter(f => f.where.startsWith("guides/"));
  for (const f of (r.findings || []).filter(f => f.where.startsWith("wire."))) {
    const fixable = /^wire\.(CAL|EARN)$/.test(f.where) && /past/.test(f.detail);
    out.push(mk("freshness", f.where, hash(f.detail), f.severity, f.detail, f.where, fixable ? { type: "wire-past-rows", args: {} } : null));
  }
  if (guides.length) out.push(mk("freshness", "guide-years", "all", "info", `${guides.length} guides mention past years near recruiting words. Verify them, they are leads, not proof.`, "guides"));
  return out;
}
export const fromCost = c => (c.findings || []).map(f => mk("cost", f.code || "cost", f.code || "x", f.severity, f.detail, f.code || ""));
export function fromFunnel(f) {
  const out = [];
  if (f.confidence !== "usable") return out;
  if (f.biggestLeak && f.biggestLeak.lostPct >= 90) out.push(mk("funnel", "leak", f.biggestLeak.from + ">" + f.biggestLeak.to, "warn", `${f.biggestLeak.lostPct}% of ${f.visitors} visitors never get from "${f.biggestLeak.from}" to "${f.biggestLeak.to}".`, "funnel"));
  const g = f.guide; if (g && g.visitorsWhoSawAGuideCta >= 200 && g.clickedCta / g.visitorsWhoSawAGuideCta < 0.01) out.push(mk("funnel", "guide-cta", "low", "warn", `${g.visitorsWhoSawAGuideCta} visitors saw a guide call-to-action (${g.ofAll}% of all traffic) and ${g.clickedCta} clicked. Guide pages bring traffic but not students.`, "guides"));
  return out;
}
export const fromBilling = b => (b.findings || []).filter(f => f.severity !== "info").map(f => mk("billing", f.code, f.user, f.severity, f.detail, "billing"));
export function fromFeedbot(r) {
  return (r.items || []).filter(i => ["fix", "investigate", "recommend", "human"].includes(i.verdict)).map(i => mk("feedbot", i.verdict, hash(i.key), i.verdict === "fix" ? "warn" : "info", `${i.verdict}: ${i.why}${i.question ? " (" + i.question.slice(0, 80) + ")" : ""}`, i.target ? i.target.file : "feedback"))
    .concat((r.polls && r.polls.tally || []).filter(p => p.verdict === "recommend").map(p => mk("feedbot", "poll", hash(p.answer), "info", `${p.count} votes (${p.share}%): "${p.answer}". ${p.why}`, "polls")));
}
export const botFailure = (bot, e) => mk("circle", "bot-failure", bot, "critical", `${bot} failed to run: ${String(e.message || e).slice(0, 160)}`, bot);
