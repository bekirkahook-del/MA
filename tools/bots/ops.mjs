// Operator context: reads Bekir's own working files once (posting logs, Quora log, wire data, git queue, credits) so every operator bot is a pure function of it.
// Nothing here writes, posts, signs in or deploys.
import fs from "node:fs";
import path from "node:path";
import { ROOT, git, readJson } from "./lib.mjs";
import { read, guidePages, trackedFiles } from "./scan.mjs";

export const etDay = d => new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
/* Bekir's outreach rule (Nov 25, 2026): outreach only Monday to Friday, 9am to 4pm Eastern. Everything that sends or drafts outreach asks this one function. */
export const OUTREACH = { days: [1, 2, 3, 4, 5], from: 9, to: 16, tz: "America/New_York" };
export function outreachWindow(now = new Date()) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: OUTREACH.tz, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now).map(x => [x.type, x.value]));
  const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday], mins = +p.hour * 60 + +p.minute;
  const open = OUTREACH.days.includes(dow) && mins >= OUTREACH.from * 60 && mins < OUTREACH.to * 60;
  let next = null; for (let k = open ? 0 : 0; k <= 8 && !next; k++) { const t = new Date(now.getTime() + k * 864e5), q = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: OUTREACH.tz, weekday: "short", month: "short", day: "numeric" }).formatToParts(t).map(x => [x.type, x.value])), d = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[q.weekday]; if (OUTREACH.days.includes(d) && (k > 0 || mins < OUTREACH.from * 60)) next = `${q.weekday} ${q.month} ${q.day}, 9:00am ET`; }
  return { open, next: open ? null : next, label: "Mon-Fri, 9am-4pm ET" };
}
export const dayNum = s => Math.floor(Date.parse(s + "T12:00:00Z") / 864e5);
export const daysAgo = (s, today) => dayNum(today) - dayNum(s);
const cells = l => l.split("|").slice(1, -1).map(s => s.trim());

export function parsePosted(md) { return [...md.matchAll(/^- (\d{4}-\d{2}-\d{2}) (\S+)\s+[—-]\s+(.+)$/gm)].map(m => ({ date: m[1], key: m[2], title: m[3].trim() })); }
export function parsePunch(md) {
  return md.split("\n").filter(l => /^\|\s*\d{4}-\d{2}-\d{2}/.test(l)).map(l => {
    const c = cells(l), h = c.findIndex((x, i) => i >= 4 && /[A-Za-z]/.test(x)), views = h >= 0 ? c[h + 1] : "";
    return { date: c[0], topic: c[1], n: +c[2] || null, style: (c[3] || "").split(/[\s+]/)[0].toLowerCase(), hook: h >= 0 ? c[h] : "", views: /^\d[\d,]*$/.test(views || "") ? +views.replace(/,/g, "") : null, cells: c };
  });
}
export function parseQuora(md) { return md.split("\n").filter(l => /^\|\s*\d{4}-\d{2}-\d{2}/.test(l)).map(l => { const c = cells(l); return { date: c[0], question: c[1], url: c[2] || "" }; }); }
export function parseBlackouts(daily) {
  const M = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }, out = [];
  for (const m of daily.matchAll(/NO POSTS ANYWHERE on \w{3} (\w{3}) (\d{1,2}), (\d{4})/g)) out.push(`${m[3]}-${String(M[m[1]]).padStart(2, "0")}-${String(m[2]).padStart(2, "0")}`);
  return out;
}
export function parseTopics(md) { let sec = ""; const out = []; for (const l of md.split("\n")) { if (/^#/.test(l)) sec = l.replace(/^#+\s*/, ""); else if (/^- /.test(l)) out.push({ section: sec, text: l.slice(2).trim() }); } return out; }

export function loadOps(root = ROOT, now = new Date(), o = {}) {
  const today = etDay(now), rd = rel => read(root, rel), sd = path.join(root, "social");
  const days = fs.existsSync(sd) ? fs.readdirSync(sd).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n) && fs.statSync(path.join(sd, n)).isDirectory()).sort().map(date => {
    const files = fs.readdirSync(path.join(sd, date)); let spec = null; try { spec = JSON.parse(fs.readFileSync(path.join(sd, date, "decks.spec.json"), "utf8")); } catch (e) { /* none that day */ }
    return { date, files, spec };
  }) : [];
  const vidDir = path.join(sd, "vid"), videos = fs.existsSync(vidDir) ? fs.readdirSync(vidDir).filter(n => /^\d{4}-\d{2}-\d{2}$/.test(n)).flatMap(date => fs.readdirSync(path.join(vidDir, date)).filter(f => /\.mp4$/.test(f)).map(f => ({ date, file: f }))) : [];
  let wire = null; try { wire = JSON.parse(rd("data/wire.json")); } catch (e) { /* missing wire */ }
  const qlog = git(["log", "--name-only", "--format=@@%ct|%s", "origin/main..origin/staging"], root);
  const queue = qlog.split("@@").filter(Boolean).map(b => { const [h, ...files] = b.split("\n").map(s => s.trim()).filter(Boolean), [ts, ...s] = h.split("|"); return { days: Math.floor((now / 1000 - +ts) / 86400), subject: s.join("|"), files }; });
  let credits = null; try { const C = o.cost; credits = C ? C.costReport({ deploys: C.deploysThisMonth(root, now), aiRows: [], now }).deploy : null; } catch (e) { /* cost optional */ }
  const dig = rd("tools/bots/state/digest.md").match(/Circle digest (\d{4}-\d{2}-\d{2})/), fb = [...rd("tools/feedbot/LOG.md").matchAll(/^- (\d{4}-\d{2}-\d{2})/gm)].map(m => m[1]).sort();
  return {
    root, now, today, daily: rd("social/DAILY.md"), posted: parsePosted(rd("social/posted.md")), punch: parsePunch(rd("social/punch-log.md")), winners: rd("social/winners.md"),
    topics: parseTopics(rd("social/topics.md")), quora: { posted: parseQuora(rd("social/quora/posted.md")), asked: parseQuora(rd("social/quora/asked.md")) },
    directories: rd("social/directories.md"), sprint: rd("social/growth-sprint-nov23.md"), kit: rd("social/growth-kit.md"), days, videos, wire, queue, credits,
    outreach: readJson(path.join(root, "tools/bots/state/outreach-log.json"), { groups: [] }), homeBaseline: readJson(path.join(root, "tools/bots/state/home-baseline.json"), null),
    goal: readJson(path.join(root, "tools/bots/state/flywheel-goal.json"), { weeklyGrowth: 0.25 }), digestDate: dig ? dig[1] : null, feedbotLast: fb.length ? fb[fb.length - 1] : null, qs: o.qs || null,
    pages: guidePages(root), index: rd("index.html"), toml: rd("netlify.toml"), robots: rd("robots.txt"), sitemap: rd("sitemap.xml"), sw: rd("sw.js"), attract: rd("js/attract.js"),
    tracked: trackedFiles(root), exists: rel => fs.existsSync(path.join(root, rel)), stat: rel => { try { return fs.statSync(path.join(root, rel)); } catch (e) { return null; } },
    readRaw: rel => { try { return fs.readFileSync(path.join(root, rel)); } catch (e) { return null; } }, rd,
    commits: git(["log", "-n", "40", "--format=%s"], root).split("\n").filter(Boolean),
  };
}
