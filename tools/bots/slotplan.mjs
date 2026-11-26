// Slot Planner: Tomorrow's 3-4 post slots: at least 2 from your top winners, at most 1 test, platforms routed from the scoreboard, times spaced over 12pm to 10pm ET.
// Part of the Content Flywheel and operator desk (gear: plan). Read-only: it reads your own files, tells you what to do, and never posts, signs in or deploys.
// Usage: node tools/bots/slotplan.mjs [tracks.json]
import fs from "node:fs";
import { ROOT, cli } from "./lib.mjs";
import { report } from "./scan.mjs";
import { eg, rule, imgSize } from "./scan2.mjs";
import { loadOps, daysAgo, dayNum, parseBlackouts, outreachWindow } from "./ops.mjs";
import * as FW from "./flywheel/core.mjs";
import * as COST from "./cost.mjs";
import { flatten } from "./qdata.mjs";
const { fly, total, best, hasViews, provisional, family, sim, planDay, PLATFORMS, parseWireDate } = FW;

export const slotplan = c => { const X = fly(c), f = [], tomorrow = new Date((dayNum(c.today) + 1) * 864e5).toISOString().slice(0, 10), made = (c.days.find(d => d.date === tomorrow) || {}).spec, p = planDay({ date: tomorrow, posts: X.posts, board: X.board, losers: X.losers.map(family), backlog: X.backlog.map(b => ({ ...b })), spikesDue: X.spikes, madeCount: made ? Object.keys(made.decks || {}).length : 0 }), PN = a => a.map(k => PLATFORMS[k]).join(" + "); for (const s of p.slots) f.push({ code: "slot-" + s.role.toLowerCase(), severity: s.topic.startsWith("NEEDS") ? "warn" : "info", where: "plan " + tomorrow, detail: `${s.time} ET, ${s.role}, ${s.family} (${s.format}): ${s.topic}. Post to ${PN(s.platforms.post)}${s.platforms.skip.length ? `; skip ${PN(s.platforms.skip)}` : ""}. Why: ${s.why}.` }); if (p.alreadyMade) f.push({ code: "already-made", severity: "info", where: "social/" + tomorrow, detail: `${p.alreadyMade} deck(s) are already made for ${tomorrow}.` }); return report("slotplan", f, { slots: p.slots.length, winnerSlots: p.winnersUsed, hasVideo: p.hasVideo, date: tomorrow, plan: p.slots }); };
export const scan = (root = ROOT, o = {}) => slotplan(o.ctx || loadOps(root, o.now || new Date(), { cost: COST, qs: o.qs || null }));
cli(import.meta.url, a => scan(ROOT, { qs: a[0] ? flatten(JSON.parse(fs.readFileSync(a[0], "utf8")).tracks) : null }));
