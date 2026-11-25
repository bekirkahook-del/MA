// Content Flywheel core: the compounding loop for social content.
//   measure (post log) -> classify (winner / test / loser) -> plan (tomorrow's slots) -> gate (rules) -> publish (Bekir / Metricool) -> score at 48h -> measure
// Everything here is a pure function of the files Bekir already keeps (social/winners.md post log + scoreboard, social/topics.md, social/posted.md).
// It never posts, never signs in, and never invents a number: every figure is computed from the log.
import { dayNum } from "../ops.mjs";

export const FAMILIES = [
  ["RANKED schools", /school rank|ranked|brawl/i], ["Live market news", /live market|market news|ipo|earnings/i], ["Character stories", /character|jake|day in the life/i],
  ["Tiered interview questions", /tiered|interview q/i], ["League tables", /league/i], ["Recruiting advice", /recruiting advice|timing/i],
  ["Quizzes", /quiz|brain/i], ["Bank stat lists", /bank stat/i], ["Site promo", /promo/i],
];
export const family = s => (FAMILIES.find(([, re]) => re.test(s || "")) || ["Other"])[0];
const num = s => { const n = String(s ?? "").replace(/[^\d.]/g, ""); return n ? +n : null; };
export function parseViews(cell) {
  const parts = String(cell || "").split("/").map(p => p.trim()).filter(p => /\d/.test(p) && !/^[-–]+$/.test(p)).map(num).filter(n => n != null);
  return parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : null;
}
export function parseLog(md, year = 2026) {
  const i = md.indexOf("## Post log"), body = i >= 0 ? md.slice(i) : "", out = [];
  for (const l of body.split("\n")) {
    const m = l.match(/^\|\s*(\d{1,2})-(\d{1,2})\s*\|/); if (!m) continue;
    const c = l.split("|").slice(1, -1).map(s => s.trim());
    out.push({ date: `${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`, post: c[1] || "", idea: c[2] || "", family: family(c[2] + " " + c[1]), ig: parseViews(c[3]), tt: parseViews(c[4]), notes: c[5] || "", raw: l });
  }
  return out;
}
export const total = p => (p.ig || 0) + (p.tt || 0);
export const best = p => Math.max(p.ig || 0, p.tt || 0);
export const hasViews = p => p.ig != null || p.tt != null;
export const provisional = p => /score \w+ \d+|at ~\d|at \d+h/i.test(p.notes) && !/final/i.test(p.notes);
const mean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const median = a => { const s = a.slice().sort((x, y) => x - y), m = Math.floor(s.length / 2); return s.length ? (s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2)) : null; };
const r0 = x => (x == null ? null : Math.round(x));
export function overall(posts) { const s = posts.filter(hasViews); return { n: s.length, avg: r0(mean(s.map(total))) }; }
export function familyStats(posts) {
  const by = {}; for (const p of posts.filter(hasViews)) (by[p.family] ||= []).push(p);
  return Object.entries(by).map(([fam, ps]) => ({ family: fam, n: ps.length, ig: r0(mean(ps.filter(p => p.ig != null).map(p => p.ig))), tt: r0(mean(ps.filter(p => p.tt != null).map(p => p.tt))), avg: r0(mean(ps.map(total))), bestAvg: r0(mean(ps.map(best))), last: ps[ps.length - 1].date, posts: ps })).sort((a, b) => b.avg - a.avg);
}
/* a family is a flop streak when its last three scored posts all stayed under the line on both platforms (Bekir's rule: 3 in a row under ~120) */
export function flopStreaks(stats, line = 120) { return stats.filter(s => s.n >= 3 && s.posts.slice(-3).every(p => best(p) < line)); }
export function winners(stats, k = 3, minN = 2, exclude = []) { return stats.filter(s => s.n >= minN && !exclude.includes(s.family)).slice(0, k); }
/* a post over 2x the average moves its idea up and needs a sequel within 3 days */
export function spikes(posts, today, mult = 2) {
  const o = overall(posts), out = [];
  for (const p of posts.filter(hasViews)) if (o.avg && total(p) > mult * o.avg) {
    const later = posts.filter(q => q.family === p.family && q.date > p.date && dayNum(q.date) - dayNum(p.date) <= 3);
    out.push({ post: p, multiple: +(total(p) / o.avg).toFixed(1), sequelBy: new Date((dayNum(p.date) + 3) * 864e5).toISOString().slice(0, 10), hasSequel: later.length > 0, overdue: !later.length && dayNum(today) - dayNum(p.date) > 3 });
  }
  return out;
}
const monday = d => { const n = dayNum(d); return new Date((n - ((n + 3) % 7)) * 864e5).toISOString().slice(0, 10); };
export function weekly(posts, minPosts = 3) {
  const w = {}; for (const p of posts.filter(hasViews)) (w[monday(p.date)] ||= []).push(p);
  return Object.entries(w).sort().map(([week, ps]) => ({ week, n: ps.length, avg: r0(mean(ps.map(total))), median: median(ps.map(total)), top: Math.max(...ps.map(total)) })).filter(x => x.n >= minPosts);
}
export function growth(posts, goal = 0.25, minPosts = 3) {
  const ws = weekly(posts, minPosts), steps = ws.slice(1).map((w, i) => ({ week: w.week, rate: ws[i].avg ? +((w.avg / ws[i].avg) - 1).toFixed(2) : null, medianRate: ws[i].median ? +((w.median / ws[i].median) - 1).toFixed(2) : null }));
  const last = steps[steps.length - 1], rate = last ? last.rate : null, medianRate = last ? last.medianRate : null;
  return { weeks: ws, steps, rate, medianRate, goal, onTrack: rate != null && rate >= goal, doublingWeeks: rate && rate > 0 ? +(Math.log(2) / Math.log(1 + rate)).toFixed(1) : null, needed: goal };
}
export function parseScoreboard(md) {
  const i = md.indexOf("PLATFORM SCOREBOARD"); if (i < 0) return [];
  const lines = md.slice(i).split("\n"), start = lines.findIndex(l => /^\|/.test(l)); let end = start; while (end < lines.length && /^\|/.test(lines[end])) end++;
  const rows = lines.slice(start, end).filter(l => !/^\|[-\s|]+\|?$/.test(l) && !/Idea type/.test(l)), P = ["ig", "tt", "fb", "yt"];
  return rows.map(l => { const c = l.split("|").slice(1, -1).map(s => s.trim()), cell = {}; P.forEach((p, k) => { const t = c[k + 1] || ""; cell[p] = { v: /🟢/.test(t) ? "g" : /🟡/.test(t) ? "y" : /🔴/.test(t) ? "r" : /untested/i.test(t) ? "u" : /n\/a/i.test(t) ? "x" : "u" }; }); return { family: family(c[0]), idea: c[0], ...cell }; }).filter(r => r.family);
}
export const PLATFORMS = { ig: "Instagram", tt: "TikTok", fb: "Facebook", yt: "YouTube Shorts" };
export function route(board, fam) { const r = board.find(b => b.family === fam); if (!r) return { post: ["ig", "tt"], skip: [], unknown: true }; const post = [], skip = []; for (const p of Object.keys(PLATFORMS)) (["g", "y", "u"].includes(r[p].v) ? post : skip).push(p); return { post, skip }; }
export function parseLosers(md) { const i = md.indexOf("## LOSERS"), j = md.indexOf("## Patterns", i); return i < 0 ? [] : md.slice(i, j > 0 ? j : undefined).split("\n").filter(l => /^\|/.test(l) && !/Idea type|---/.test(l)).map(l => l.split("|")[1].trim()); }
export function seriesQueue(md, posts) {
  const m = md.match(/RANKED series next:\s*([^|\n]+?)\s*\|/); if (!m) return [];
  const all = m[1].replace(/\.$/, "").split(/,\s*/), text = posts.map(p => p.post + " " + p.idea).join(" ").toLowerCase();
  return all.map(name => ({ name, done: text.includes(name.toLowerCase().replace(/ v2$/, "")) && !/ v2$/i.test(name) }));
}
const hash = s => [...String(s)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export const SLOT_TIMES = ["12:40", "15:35", "18:30", "21:20"];
export function slotTimes(date, n = 4) { const j = hash(date) % 11; return SLOT_TIMES.slice(0, n).map((t, i) => { const [h, m] = t.split(":").map(Number), mm = m + ((j + i * 3) % 12); return `${String(h + Math.floor(mm / 60)).padStart(2, "0")}:${String(mm % 60).padStart(2, "0")}`; }); }
export const VIDEO_FAMILIES = ["Character stories", "RANKED schools"];
export function topicFamily(section, text) { const s = (section + " " + text).toLowerCase(); return /school|college|universit|campus|conference|big ten|acc\b|sec\b|ivy|mba/.test(s) && !/quiz/.test(s) ? "RANKED schools" : /interview question|tiered/.test(s) ? "Tiered interview questions" : /quiz|brain/.test(s) ? "Quizzes" : /ipo|earnings|market|stock|crash|deal/.test(s) ? "Live market news" : "Bank stat lists"; }
/* tomorrow's plan: >=2 slots from the top winners, <=1 test slot, no family above half the day, platforms routed from the scoreboard, times spaced >=2h */
export function planDay({ date, posts, board = [], losers = [], backlog = [], spikesDue = [], madeCount = 0, slots = 4, recentDays = 3 }) {
  const stats = familyStats(posts), top = winners(stats, 3, 2, losers), recent = posts.filter(p => dayNum(date) - dayNum(p.date) <= recentDays && dayNum(date) - dayNum(p.date) > 0);
  const used = f => recent.filter(p => p.family === f).length, ranked = top.map(s => ({ ...s, weight: s.avg / (1 + used(s.family)) })).sort((a, b) => b.weight - a.weight);
  const plan = [], times = slotTimes(date, slots), winnerSlots = Math.max(2, slots - 1);
  for (let i = 0; i < winnerSlots && ranked.length; i++) { const pick = ranked[i % ranked.length]; if (plan.filter(p => p.family === pick.family).length >= Math.ceil(slots / 2)) continue; plan.push({ role: "WINNER", family: pick.family, why: `avg ${pick.avg} views/post over ${pick.n} scored posts` }); }
  const tested = stats.filter(s => !losers.includes(s.family) && !top.some(t => t.family === s.family)).sort((a, b) => a.n - b.n)[0];
  plan.push({ role: "TEST", family: tested ? tested.family : "New angle", why: tested ? `only ${tested.n} scored post(s); needs data before it can win or lose` : "no untested family left; try a new angle on a winner" });
  plan.slice(0, slots).forEach((s, i) => {
    const sq = spikesDue.find(x => x.post.family === s.family && !x.hasSequel), topic = sq ? { text: `SEQUEL to "${sq.post.post}" (${sq.multiple}x the average)`, kind: "sequel" } : backlog.find(b => b.family === s.family && !b.used);
    if (topic && !sq) topic.used = true;
    Object.assign(s, { time: times[i], platforms: route(board, s.family), format: VIDEO_FAMILIES.includes(s.family) || s.family === "Live market news" && i === 1 ? "video" : "carousel", topic: topic ? topic.text : `NEEDS A NEW ANGLE on ${s.family}` });
  });
  return { date, slots: plan.slice(0, slots), alreadyMade: madeCount, hasVideo: plan.some(p => p.format === "video"), winnersUsed: plan.filter(p => p.role === "WINNER").length };
}

export const tok = s => new Set((String(s).toLowerCase().match(/[a-z0-9]{3,}/g) || []));
export const sim = (a, b) => { const x = tok(a), y = tok(b); if (!x.size || !y.size) return 0; let n = 0; for (const t of x) if (y.has(t)) n++; return n / Math.min(x.size, y.size); };
const MON = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
export const parseWireDate = (s, year = 2026) => { const m = String(s).match(/([A-Z][a-z]{2})\w* (\d{1,2})(?:, (\d{4}))?/); return m && MON[m[1]] ? `${m[3] || year}-${String(MON[m[1]]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}` : null; };
/* live-market candidates straight from data/wire.json: deals of $10B+, earnings today or tomorrow, macro events, top market headlines. Each is only worth posting within a day. */
export function newsjack(wire, today, minDealB = 10) {
  if (!wire) return []; const out = [], age = d => (d ? dayNum(today) - dayNum(d) : 99);
  for (const d of wire.DEALS || []) { const dt = parseWireDate(d.date); if (age(dt) >= 0 && age(dt) <= 2 && (d.usd || 0) >= minDealB) out.push({ text: `Deal: ${d.buyer} buys ${d.target} (${d.value})`, due: dt, kind: "deal" }); }
  for (const e of wire.EARN || []) if (e[0] === today || age(e[0]) === -1) out.push({ text: `Earnings: ${e[2]} (${e[1]}) reports ${e[0]} ${e[3]}`, due: e[0], kind: "earnings" });
  for (const c of wire.CAL || []) { const dt = parseWireDate(c[0]); if (dt && age(dt) <= 0 && age(dt) >= -1) out.push({ text: `Macro: ${c[1]} (${c[0]})`, due: dt, kind: "macro" }); }
  for (const n of (wire.NEWS || []).filter(n => n.k === "Markets").slice(0, 2)) { const dt = parseWireDate(n.d); if (age(dt) <= 1) out.push({ text: `Headline: ${n.h}`, due: dt, kind: "headline" }); }
  return out;
}
/* interview-question candidates from the real question bank: short, with a number in the explanation, not already posted */
export function questionPicks(qs, posts, today, k = 5) {
  if (!qs) return []; const seen = posts.map(p => p.post).join(" ");
  return qs.filter(q => q.text.length < 170 && /\d/.test(q.why) && /\d/.test(q.text) && sim(q.text, seen) < 0.5).map(q => ({ q, h: hash(today + q.text) })).sort((a, b) => a.h - b.h).slice(0, k).map(x => ({ text: x.q.text, answer: x.q.opts[x.q.ans], where: x.q.track + " / " + x.q.level }));
}
export function buildBacklog({ topics = [], posts = [], queue = [], qs = null, wire = null, today }) {
  const items = [], text = posts.map(p => p.post).join(" | ");
  for (const q of queue.filter(x => !x.done)) items.push({ family: "RANKED schools", text: `${q.name} RANKED (next in the conference series)`, source: "series queue" });
  for (const t of topics) if (sim(t.text, text) < 0.5) items.push({ family: topicFamily(t.section, t.text), text: t.text, source: "topics.md" });
  for (const q of questionPicks(qs, posts, today)) items.push({ family: "Tiered interview questions", text: `Question: ${q.text}`, source: "question bank (" + q.where + ")" });
  for (const n of newsjack(wire, today)) if (sim(n.text, text) < 0.6) items.push({ family: "Live market news", text: n.text, source: "wire (post within 24h)" });
  return items;
}
/* everything the flywheel bots need, derived once per run from the operator context */
const cache = new WeakMap();
export function fly(ctx, goal = 0.25) {
  if (cache.has(ctx)) return cache.get(ctx);
  const posts = parseLog(ctx.winners), goal0 = (ctx.goal && ctx.goal.weeklyGrowth) ?? goal, stats = familyStats(posts), board = parseScoreboard(ctx.winners), losers = parseLosers(ctx.winners), queue = seriesQueue(ctx.winners, posts);
  const f = { posts, stats, board, losers, queue, overall: overall(posts), growth: growth(posts, goal0), spikes: spikes(posts, ctx.today), backlog: buildBacklog({ topics: ctx.topics, posts, queue, qs: ctx.qs, wire: ctx.wire, today: ctx.today }) };
  cache.set(ctx, f); return f;
}
