// Bot 4: Retention planner (DRY RUN ONLY, it never sends). Finds people with spaced-review items due and drafts the reminder.
// The site already sends opt-in streak/friend emails (engage-mail.mjs). This plans a NEW type, "review due", which needs its own opt-in.
// Until the engage doc has `review: true` for someone, they are counted as "would send if they opted in", never as eligible.
// Inputs: engage rows (col "engage"), progress rows (col "progress", data.srs = {id:{b,d}}), players rows (col "players"). Emails are never read.
import fs from "node:fs";
import { cli, short } from "./lib.mjs";

const dayNum = t => Math.floor((t - 0) / 864e5);
export const dueCount = (srs, today) => Object.values(srs || {}).filter(x => x && x.b < 6 && x.d <= today).length;
export function plan({ engage = [], progress = [], players = [], now = Date.now(), minDue = 3, maxSend = 50, dayMs = 864e5 }) {
  const today = Math.floor(now / dayMs), prog = new Map(progress.map(p => [p.id, p.data || {}])), ply = new Map(players.map(p => [p.id, p.data || {}]));
  const optedAll = new Map(engage.map(e => [e.id, e.data || {}]));
  const ids = new Set([...prog.keys()]), rows = [];
  for (const id of ids) {
    const due = dueCount((prog.get(id) || {}).srs, today); if (due < minDue) continue;
    const pe = optedAll.get(id) || {}, last = pe.lastReview || 0, cool = last && today - last < 3;
    rows.push({ user: short(id), due, streak: (ply.get(id) || {}).streak || 0, opted: pe.review === true, cooling: !!cool });
  }
  const eligible = rows.filter(r => r.opted && !r.cooling).sort((a, b) => b.due - a.due).slice(0, maxSend);
  const wouldIf = rows.filter(r => !r.opted).length;
  const tpl = r => ({ subject: `${r.due} things to review before you forget them`, body: `You missed ${r.due} questions or number reps. Reviewing them now takes a few minutes and locks them in.${r.streak >= 2 ? " Your " + r.streak + "-day streak is on the line too." : ""} Open the level briefing and tap Review.` });
  return {
    dryRun: true, sends: 0, withDue: rows.length, eligibleToday: eligible.length, wouldSendIfTheyOptIn: wouldIf,
    preview: eligible.slice(0, 3).map(r => ({ user: r.user, ...tpl(r) })),
    blocker: wouldIf && !rows.some(r => r.opted) ? "Nobody has opted in to review reminders. A new checkbox is needed where people set streak emails (Home page), which needs Bekir's OK. Until then this bot only counts." : "",
    rules: ["one email per person per 3 days", "only people with review:true", "max " + maxSend + " per run", "owner approves before any send is wired in"],
  };
}
cli(import.meta.url, a => plan(JSON.parse(fs.readFileSync(a[0], "utf8"))));
