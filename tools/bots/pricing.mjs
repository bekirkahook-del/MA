// Pricing Consistency Bot: the same plan must show the same price everywhere. Collects every "$X per month/year" near a plan name and flags plans that show more than one price.
// Leads only: it reads text, not Stripe. Compare against the live prices before changing anything.
// Usage: node tools/bots/pricing.mjs
import { ROOT, cli } from "./lib.mjs";
import { read, trackedFiles, textOf, report } from "./scan.mjs";

const PLANS = ["Pro", "Season", "Club", "Premium", "Plus"], PRICE = /\$\s?(\d{1,4}(?:\.\d{2})?)\s*(?:\/|per\s+|a\s+|each\s+)\s*(mo(?:nth)?|yr|year|season|semester)/gi;
export function priceMentions(text, where) {
  const out = [];
  for (const m of text.matchAll(PRICE)) { const ctx = text.slice(Math.max(0, m.index - 200), m.index + 40), plan = PLANS.find(p => new RegExp(`\\b${p}\\b`).test(ctx)); if (plan) out.push({ plan, price: `$${m[1]}/${m[2].slice(0, 2).toLowerCase() === "mo" ? "mo" : m[2].slice(0, 2).toLowerCase() === "yr" || m[2].toLowerCase().startsWith("year") ? "yr" : m[2].toLowerCase()}`, where }); }
  return out;
}
export function pricing(docs) {
  const all = docs.flatMap(d => priceMentions(d.text, d.name)), by = {};
  for (const m of all) ((by[m.plan] ||= {})[m.price] ||= []).push(m.where);
  const clash = Object.entries(by).filter(([, p]) => Object.keys(p).length > 1), f = [];
  if (clash.length) f.push({ code: "price-clash", severity: "warn", where: clash[0][0], detail: clash.map(([plan, p]) => `${plan} shows ${Object.entries(p).map(([pr, w]) => `${pr} (${w.length}x, e.g. ${w[0]})`).join(" and ")}`).join("; ") });
  return { ...report("pricing", f, { mentions: all.length, plans: Object.keys(by).length }), table: by };
}
export const scan = (root = ROOT) => pricing(trackedFiles(root).filter(f => /^(index\.html|guides\/index\.html|js\/(rewards|pro-plus|gate|grow)\.js)$/.test(f)).map(name => ({ name, text: /\.html$/.test(name) ? textOf(read(root, name)) : read(root, name) })));
cli(import.meta.url, () => scan());
