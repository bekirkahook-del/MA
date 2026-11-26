// Free Pro days for actions (Bekir, Nov 21, 2026): 1 day each for
//   signup - making an account (email confirmed + Level 1 cleared)
//   email  - the account's own email is subscribed to the Sunday email
//   review - leaving a review (3+ levels cleared). Any rating counts: the reward never depends on what it says
//            (FTC 16 CFR 465), and the site tells readers that reviewers get it.
// MEGA anti-exploit (all server-side, fail closed, only salted hashes stored):
//  1. confirmed email; disposable/temp email domains get nothing
//  2. one identity per real inbox: Gmail dots/+tags and +tags elsewhere are folded, so a.b+1@gmail.com = ab@gmail.com
//  3. ONE free Pro day per account, ever, for sign-up or email (Bekir: "only 1 day max"), whichever comes first.
//     Reviews are separate (Bekir, Nov 24, 2026): a review always earns its own 1 day, once per account, even after the other day.
//  4. device binding: the first account that claims on a device (device id), on a browser fingerprint + network, on a
//     canvas/GPU fingerprint + network, or with a canonical inbox OWNS it - every other account is refused, all kinds
//  5. network caps: max 3 accounts rewarded per IP, and 6 per /24 (IPv4) or /48 (IPv6) range, per 30 days
//  6. account must be at least 10 minutes old and show real activity (levels on its public profile)
//  7. site-wide brake: at most 60 rewards a day in total, so a bot run can't drain more than that
//  8. every grant is logged (rewardlog) for the owner to audit
import { json, getUser, getBilling, setBilling, getDoc, rebuildProList, isConfirmed, hitLimit, tooMany, bump, clientIp, claimOwner } from "./_lib/common.mjs";
import { sha, getSub } from "./_lib/mail.mjs";
import { H, canon, tempDomain, range } from "./_lib/identity.mjs";
const DAY = 864e5, KINDS = { signup: 1, email: 1, review: 1 }, MAX_DAYS = 1, GLOBAL_PER_DAY = 60;
const levelsOf = async (uid) => { const p = await getDoc("players", uid).catch(() => null); return (p && +p.levels) || 0; };
async function proof(kind, user) {
  if (kind === "signup") return (await levelsOf(user.id)) >= 1 ? null : { error: "Clear Level 1 to unlock your free Pro day", code: "not_yet" };
  if (kind === "review") {
    if ((await levelsOf(user.id)) < 3) return { error: "Clear 3 levels first", code: "not_yet" };
    const rv = await getDoc("reviews", user.id);
    if (!rv || !(rv.rating >= 1 && rv.rating <= 5)) return { error: "Leave a review first", code: "no_review" };
    if (String(rv.text || "").trim().length < 20) return { error: "Write at least a sentence about what helped or didn't", code: "short" };
    return null;
  }
  if (kind === "email") {
    const s = await getSub(await sha(String(user.email || "").trim().toLowerCase())).catch(() => null);
    return s && s.status === "active" ? null : { error: "Subscribe to the Sunday email first", code: "no_sub" };
  }
}
const NO = (code, error) => json(409, { error, code });
export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const ip = clientIp(req, context);
  if (!(await hitLimit("reward-ip", ip, 30, 3600, false))) return tooMany();
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });
  if (!isConfirmed(user)) return NO("unconfirmed", "Confirm your email first");
  if (!(await hitLimit("reward", user.id, 20, 3600, false))) return tooMany();
  const { kind, device, fp, fp2 } = await req.json().catch(() => ({}));
  if (!Object.hasOwn(KINDS, kind)) return json(400, { error: "Unknown reward" });
  if (tempDomain(user.email)) return NO("blocked", "Free Pro days need a real school or personal email");
  if (Date.now() - Date.parse(user.created_at || 0) < 10 * 60e3) return NO("not_yet", "Your free Pro day unlocks a few minutes after sign-up");
  const b = (await getBilling(user.id)) || {};
  const got = b.rewards || {};
  if (got[kind]) return NO("used", "Already claimed");
  if (kind !== "review" && Object.keys(got).filter(k => k !== "review").length >= MAX_DAYS) return NO("used", "You already got your free Pro day");
  const bad = await proof(kind, user);
  if (bad) return json(409, bad);
  const dev = String(device || "").slice(0, 80), f = String(fp || "").slice(0, 300), f2 = String(fp2 || "").slice(0, 120);
  if (dev.length < 16 || f.length < 10) return json(400, { error: "Missing device", code: "device" });
  const month = Math.floor(Date.now() / (30 * DAY)), day = Math.floor(Date.now() / DAY);
  try {
    // 4. identity binding: any of these already owned by another account = refuse
    const keys = ["dev:" + H(dev), "ipfp:" + H(ip + "|" + f), "mail:" + H(canon(user.email))];
    if (f2) keys.push("gpu:" + H(range(ip) + "|" + f2));
    for (const k of keys) if (!(await claimOwner("rewardowner", k, user.id))) return NO("device_used", "Free Pro days are one per student. This device or email already got them on another account.");
    // 5. network caps (first claim per account per window only)
    if (!Object.keys(got).length) {
      if ((await bump("rewardguard", `ip:${H(ip)}:${month}`, null, 3)) === null) return NO("network_used", "Too many accounts got free Pro days from this network");
      if ((await bump("rewardguard", `rng:${H(range(ip))}:${month}`, null, 6)) === null) return NO("network_used", "Too many accounts got free Pro days from this network");
    }
    // 7. site-wide brake
    // reviews have their own, bigger brake so a review email can't use up the sign-up budget (or hit it and break its promise)
    if ((await bump("rewardguard", kind === "review" ? `global-rv:${day}` : `global:${day}`, null, kind === "review" ? 400 : GLOBAL_PER_DAY)) === null) return NO("paused", "Free Pro days are paused for today. Try again tomorrow.");
  } catch (e) { console.error("reward guard", String(e)); return json(503, { error: "Try again in a minute" }); }
  const now = Date.now();
  const passUntil = Math.max(b.passUntil || 0, now) + KINDS[kind] * DAY;
  await setBilling(user.id, { ...b, rewards: { ...got, [kind]: now }, passUntil });
  await bump("rewardlog", `${now}:${user.id}:${kind}`, user.id, 1).catch(() => {}); // 8. audit trail
  await rebuildProList().catch(() => {});
  return json(200, { ok: true, kind, passUntil });
};
