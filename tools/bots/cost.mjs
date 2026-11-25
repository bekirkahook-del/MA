// Bot 6: Cost guard. Tracks Netlify deploy credits (15 per production deploy, 1,000/month), AI usage vs tier limits, and free users hitting the wall.
// Read-only. Deploys-this-month is counted from git; pass --credits-used N if Netlify shows a different number.
// Usage: node tools/bots/cost.mjs [ai.json] [--credits-used N]
import fs from "node:fs";
import { AI_LIMITS } from "../../netlify/functions/_lib/common.mjs";
import { cli, arg, git, pct, short, sortBySev } from "./lib.mjs";

export function deployBudget({ deploys, creditsUsed = null, perDeploy = 15, budget = 1000, now = new Date() }) {
  const used = creditsUsed != null ? creditsUsed : deploys * perDeploy, dim = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate(), day = now.getUTCDate();
  const pace = Math.round((used / day) * dim), left = Math.max(0, budget - used);
  const sev = used >= budget * 0.8 ? "critical" : used >= budget * 0.5 || pace > budget ? "warn" : "info";
  return { severity: sev, creditsUsed: used, ofBudget: pct(used, budget), deploys, deploysLeft: Math.floor(left / perDeploy), projectedMonthEnd: pace, overBudgetAtThisPace: pace > budget, advice: sev === "info" ? "Fine. Keep batching changes on staging." : sev === "warn" ? "Batch more per deploy. Each one is " + perDeploy + " credits." : "Stop deploying except for fixes. " + Math.floor(left / perDeploy) + " deploys left." };
}
export function aiUsage(rows, limits = AI_LIMITS) {
  const f = [], tiers = {}; let hitFree = 0, free = 0;
  for (const r of rows) {
    const d = r.data || r, tier = d.tier || "free", n = d.count ?? d.n ?? 0, lim = limits[tier] ?? limits.free, uid = r.uid || r.id;
    tiers[tier] = (tiers[tier] || 0) + n;
    if (tier === "free") { free++; if (n >= lim) hitFree++; }
    if (tier !== "owner" && n > lim * 1.5) f.push({ severity: "critical", code: "OVER_LIMIT", user: short(uid), detail: `${n} AI uses today on the ${tier} tier (limit ${lim}): the limiter is being bypassed or the tier is wrong.` });
    else if (tier !== "owner" && n > lim) f.push({ severity: "warn", code: "AT_LIMIT_PLUS", user: short(uid), detail: `${n} vs limit ${lim} on ${tier}.` });
  }
  return { users: rows.length, usesByTier: tiers, freeUsersAtLimit: hitFree, freeUsers: free, upsellLeads: hitFree, findings: sortBySev(f) };
}
export function costReport({ deploys, creditsUsed, aiRows = [], now = new Date() }) {
  const d = deployBudget({ deploys, creditsUsed, now }), a = aiUsage(aiRows);
  return { deploy: d, ai: a, findings: sortBySev([...(d.severity !== "info" ? [{ severity: d.severity, code: "DEPLOY_BUDGET", detail: d.ofBudget + "% of Netlify credits used. " + d.advice }] : []), ...a.findings]) };
}
cli(import.meta.url, a => {
  const now = new Date(), first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const deploys = git(["log", "--all", "--since=" + first, "--grep=^Deploy", "--format=%h"]).split("\n").filter(Boolean).length;
  const f = a.find(x => !x.startsWith("--")), cu = arg(a, "credits-used");
  return costReport({ deploys, creditsUsed: cu != null ? +cu : null, aiRows: f ? JSON.parse(fs.readFileSync(f, "utf8")) : [], now });
});
