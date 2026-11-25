// Bot 8: Outreach drafter. Writes personalised first emails to clubs / career centers from a target list. DRAFTS ONLY: it never sends.
// Rules: uses only the fields you provide (no invented facts, numbers, quotes or experiences); no mnaprep claims beyond "free" and what the site is;
// skips anyone already contacted; never guesses an email; max 10 per run and 2 per organization; every draft has an opt-out line.
// Targets: [{id,name,org,role,email,kind:"club"|"career"|"other",note}]   Sent log: state/outreach-sent.json = {"<id or email>":"YYYY-MM-DD"}
import fs from "node:fs";
import { cli, arg, readJson } from "./lib.mjs";

const clean = s => String(s || "").replace(/[\r\n<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
const first = n => clean(n).split(" ")[0];
const T = {
  club: t => ({ subject: `A free recruiting prep tool for ${t.org} members`, body: `Hi ${first(t.name)},\n\nI'm Bekir, a finance student at Ohio State. I built mnaprep.com, a free game-style site that teaches investment banking, private equity and other finance recruiting: short levels, technical questions and number drills.\n\nI thought it might be useful for ${t.org}${t.role ? " (I found you as " + clean(t.role) + ")" : ""}. If you'd like, I can set up a free club code so members can track progress together. Happy to take feedback on what would make it better for your members.\n\nBekir Kahook\nmnaprep.com\n\nReply "no thanks" and I won't email again.` }),
  career: t => ({ subject: `Free finance recruiting prep tool for ${t.org} students`, body: `Hi ${first(t.name)},\n\nI'm Bekir Kahook, a finance student at Ohio State. I built mnaprep.com, a free site where students practice investment banking and private equity recruiting questions in short game-style levels.\n\nIf your office keeps a list of prep resources for students, I'd be glad to share it, and I'd welcome any feedback on what students at ${t.org} need most.\n\nBekir Kahook\nmnaprep.com\n\nReply "no thanks" and I won't email again.` }),
};
T.other = T.club;
export function draft(targets, { sent = {}, max = 10, perOrg = 2 } = {}) {
  const out = [], skipped = [], org = {};
  for (const t of targets) {
    const id = t.id || t.email || t.name, why = r => skipped.push({ target: clean(t.name || id), reason: r });
    if (!clean(t.name) || !clean(t.org)) { why("missing name or organization"); continue; }
    if (!t.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.email)) { why("no valid email on file (the bot never guesses one)"); continue; }
    if (sent[id] || sent[String(t.email).toLowerCase()]) { why("already contacted " + (sent[id] || sent[String(t.email).toLowerCase()])); continue; }
    if ((org[t.org] || 0) >= perOrg) { why("already drafting " + perOrg + " for " + clean(t.org)); continue; }
    if (out.length >= max) { why("over the " + max + "-per-run cap"); continue; }
    org[t.org] = (org[t.org] || 0) + 1;
    out.push({ id, to: t.email, ...(T[t.kind] || T.other)({ name: t.name, org: t.org, role: t.role }) });
  }
  return { dryRun: true, sends: 0, drafted: out.length, skipped, drafts: out };
}
cli(import.meta.url, a => draft(JSON.parse(fs.readFileSync(a[0], "utf8")), { sent: readJson(arg(a, "sent") || "tools/bots/state/outreach-sent.json", {}) }));
