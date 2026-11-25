// Bot 3: Funnel. Reads the daily visit rows (col "visits", id "<day>_<visitor>", data.ev = event counts) and shows where people drop.
// Fetch (read-only): select id, data->'ev' as ev from docs where col='visits' and id >= '2026-11-01'
// Usage: node tools/bots/funnel.mjs rows.json
import fs from "node:fs";
import { cli, pct } from "./lib.mjs";

export const STAGES = [
  ["Visited", null],
  ["Started a level", ["first_level", "lesson_open"]],
  ["Cleared a level", ["level_clear", "lesson_done"]],
  ["Saw the sign-up", ["gate_signup_open", "auth_open", "bar_shown"]],
  ["Signed up", ["signup", "signup_from_guide", "signup_from_chatgpt"]],
];
const SIDE = [["Guide CTA", "guide_cta_shown", "guide_cta_click"], ["Sign-up bar", "bar_shown", "bar_click"], ["Poll", "poll1_shown", "poll1_answered"], ["Install prompt", "install_shown", "install_click"], ["Review ask", "review_ask_shown", "review_ask_click"]];
export function funnel(rows, { minVisitors = 100 } = {}) {
  const vis = new Set(), per = new Map(), days = new Set(), tot = {};
  for (const r of rows) {
    const [day, v] = String(r.id).split("_"); if (!v) continue; days.add(day); vis.add(day + "_" + v);
    const ev = r.ev || (r.data && r.data.ev) || {}, s = per.get(v) || {};
    for (const [k, c] of Object.entries(ev)) { s[k] = (s[k] || 0) + c; tot[k] = (tot[k] || 0) + c; }
    per.set(v, s);
  }
  const people = per.size; // distinct visitors (a visitor id repeats across days)
  const hit = (s, names) => names.some(n => s[n] > 0);
  // a stage means "reached this step OR any later one" so the funnel can only shrink (sign-up prompts show before people finish a level)
  const reach = i => i === 0 ? people : [...per.values()].filter(s => STAGES.slice(i).some(([, names]) => names && hit(s, names))).length;
  let prev = null; const steps = STAGES.map(([label], i) => { const n = reach(i), step = { label, visitors: n, ofAll: pct(n, people), fromPrev: prev == null ? 100 : pct(n, prev) }; prev = n; return step; });
  const drops = steps.slice(1).map((s, i) => ({ from: steps[i].label, to: s.label, lost: steps[i].visitors - s.visitors, lostPct: 100 - s.fromPrev })).sort((a, b) => b.lost - a.lost);
  const side = SIDE.map(([label, a, b]) => ({ label, shown: tot[a] || 0, acted: tot[b] || 0, rate: pct(tot[b] || 0, tot[a] || 0) }));
  const some = names => [...per.values()].filter(s => hit(s, names)).length;
  const src = { chatgpt_or_ai: some(["from_ai", "from_chatgpt"]), referral: some(["ref_land"]), guide_landers: some(["guide_cta_land"]) };
  const guideSeen = [...per.values()].filter(s => hit(s, ["guide_cta_shown", "guide_ctl_shown"])), g = guideSeen.length;
  const guide = { visitorsWhoSawAGuideCta: g, ofAll: pct(g, people), clickedCta: guideSeen.filter(s => hit(s, ["guide_cta_click", "guide_plan_click", "guide_gate_click"])).length, signedUp: guideSeen.filter(s => hit(s, STAGES[4][1])).length };
  const enough = people >= minVisitors;
  return { days: days.size, visitors: people, steps, biggestLeak: drops[0] || null, side, sources: src, guide, confidence: enough ? "usable" : "too few visitors (" + people + " < " + minVisitors + "): treat every percentage as a guess", note: enough ? "" : "Come back at " + minVisitors + "+ visitors before changing anything based on this." };
}
cli(import.meta.url, a => funnel(JSON.parse(fs.readFileSync(a[0], "utf8"))));
