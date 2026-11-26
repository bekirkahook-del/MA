// Bot 8: Outreach drafter. Writes personalised first emails to clubs / career centers from a target list. DRAFTS ONLY: it never sends.
// Rules: uses only the fields you provide (no invented facts, numbers, quotes or experiences); no mnaprep claims beyond "free" and what the site is;
// skips anyone already contacted; never guesses an email; max 10 per run and ONE email per organization, ever (also skips any org already in the sent log as "org:<name>"); every draft has an opt-out line.
// Targets: [{id,name,org,role,email,kind:"club"|"career"|"other",note}]   Sent log: state/outreach-sent.json = {"<id or email>":"YYYY-MM-DD"}
import fs from "node:fs";
import { cli, arg, readJson } from "./lib.mjs";

const orgKey = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const clean = s => String(s || "").replace(/[\r\n<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
const first = n => clean(n).split(" ")[0];
const T = {
  club: t => ({ subject: `Free finance recruiting prep for ${t.org}`, body: `Hi ${first(t.name)},\n\nI'm Bekir, a finance student at Ohio State. I built mnaprep.com, a free site with short levels, technical questions and number drills for IB and PE recruiting. It might help ${t.org} members. Happy to set up a free club code if useful.\n\nBekir Kahook\nmnaprep.com\n80 W 11th Ave, Columbus, OH 43085\n\nReply "no thanks" and I won't email again.` }),
  career: t => ({ subject: `Free finance recruiting prep for ${t.org} students`, body: `Hi ${first(t.name)},\n\nI'm Bekir, a finance student at Ohio State. I built mnaprep.com, a free site where students practice IB and PE recruiting questions in short levels. If your office keeps a list of prep resources, it may be a fit.\n\nBekir Kahook\nmnaprep.com\n80 W 11th Ave, Columbus, OH 43085\n\nReply "no thanks" and I won't email again.` }),
};
T.other = T.club;
import { outreachWindow } from "./ops.mjs";
export function draft(targets, { sent = {}, max = 10, perOrg = 1, now = new Date() } = {}) {
  const out = [], skipped = [], org = {};
  for (const t of targets) {
    const id = t.id || t.email || t.name, why = r => skipped.push({ target: clean(t.name || id), reason: r });
    if (!clean(t.name) || !clean(t.org)) { why("missing name or organization"); continue; }
    if (!t.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t.email)) { why("no valid email on file (the bot never guesses one)"); continue; }
    if (sent[id] || sent[String(t.email).toLowerCase()]) { why("already contacted " + (sent[id] || sent[String(t.email).toLowerCase()])); continue; }
    if (sent["org:" + orgKey(t.org)]) { why("this organization was already contacted " + sent["org:" + orgKey(t.org)]); continue; }
    if ((org[t.org] || 0) >= perOrg) { why("already drafting " + perOrg + " for " + clean(t.org)); continue; }
    if (out.length >= max) { why("over the " + max + "-per-run cap"); continue; }
    org[t.org] = (org[t.org] || 0) + 1;
    out.push({ id, to: t.email, ...(T[t.kind] || T.other)({ name: t.name, org: t.org, role: t.role }) });
  }
  const sendWindow = outreachWindow(now); return { dryRun: true, sends: 0, sendWindow: sendWindow.open ? "open now (Mon-Fri 9am-4pm ET)" : `closed; send only Mon-Fri 9am-4pm ET, next ${sendWindow.next}`, drafted: out.length, skipped, drafts: out };
}
cli(import.meta.url, a => draft(JSON.parse(fs.readFileSync(a[0], "utf8")), { sent: readJson(arg(a, "sent") || "tools/bots/state/outreach-sent.json", {}) }));
