// Dispatcher Bot: ranks issues and decides who handles each. It never changes anything itself.
export const SEV = { critical: 3, warn: 2, info: 1 };
const days = (it, now) => Math.max(0, Math.floor((now - new Date(it.firstSeen)) / 864e5));
export const priority = (it, now = new Date()) => SEV[it.severity] * 100 + (it.reopened || 0) * 20 + Math.min(30, days(it, now) * 3) + (it.verified ? 25 : 0);
export function route(it, { autoAllowed = () => true } = {}) {
  if (it.status === "frozen") return { to: "human", why: "came back 3 times: a fix is not holding, a person has to look" };
  if (it.fix && it.attempts >= 2) return { to: "human", why: "2 fix attempts already failed" };
  if (it.fix && !autoAllowed(it.fix.type)) return { to: "human", why: `fix type "${it.fix.type}" was demoted after failing` };
  if (it.fix) return { to: "fixer", why: `safe, automatable fix: ${it.fix.type}` };
  if (it.severity === "info") return { to: "watch", why: "low severity, no safe fix" };
  return { to: "human", why: "needs judgment, no safe automatic fix" };
}
export function plan(ledger, { now = new Date(), autoAllowed } = {}) {
  return Object.values(ledger.issues).filter(i => !["resolved", "ignored", "fixed"].includes(i.status))
    .map(i => ({ issue: i, priority: priority(i, now), ...route(i, { autoAllowed }) })).sort((a, b) => b.priority - a.priority);
}
