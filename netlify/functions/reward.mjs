// Free Pro days for actions (Bekir, Nov 21, 2026): 1 day each for
//   review  - leaving a review. Any rating counts: the reward never depends on what it says (FTC 16 CFR 465), and the
//             site tells readers that reviewers get it.
//   signup  - making an account (after the email is confirmed)
//   email   - the account's own email is subscribed to the Sunday email
// Anti-abuse, all on the server: confirmed email, the action must really exist, once per account per kind, once per
// device id, once per (IP + browser fingerprint), at most 3 per kind per IP per 30 days. Only salted hashes are stored.
import { json, getUser, getBilling, setBilling, getDoc, rebuildProList, isConfirmed, hitLimit, tooMany, bump, clientIp } from "./_lib/common.mjs";
import { sha, getSub } from "./_lib/mail.mjs";
import { createHash } from "node:crypto";
const DAY = 864e5, KINDS = { review: 1, signup: 1, email: 1 };
const H = (s) => createHash("sha256").update(String(s) + (process.env.RATE_LIMIT_SALT || "ma")).digest("hex").slice(0, 24);
async function proof(kind, user) {
  if (kind === "signup") return null;
  if (kind === "review") {
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
export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });
  if (!isConfirmed(user)) return json(409, { error: "Confirm your email first", code: "unconfirmed" });
  if (!(await hitLimit("reward", user.id, 20, 3600))) return tooMany();
  const { kind, device, fp } = await req.json().catch(() => ({}));
  if (!Object.hasOwn(KINDS, kind)) return json(400, { error: "Unknown reward" });
  const b = (await getBilling(user.id)) || {};
  const got = b.rewards || {};
  if (got[kind]) return json(409, { error: "Already claimed", code: "used" });
  const bad = await proof(kind, user);
  if (bad) return json(409, bad);
  const dev = String(device || "").slice(0, 80), f = String(fp || "").slice(0, 200), ip = clientIp(req, context);
  if (dev.length < 16) return json(400, { error: "Missing device", code: "device" });
  const month = Math.floor(Date.now() / (30 * DAY));
  try {
    if ((await bump("rewardguard", `${kind}:dev:${H(dev)}`, null, 1)) === null) return json(409, { error: "This device already got this reward", code: "device_used" });
    if ((await bump("rewardguard", `${kind}:ipfp:${H(ip + "|" + f)}`, null, 1)) === null) return json(409, { error: "This device already got this reward", code: "device_used" });
    if ((await bump("rewardguard", `${kind}:ip:${H(ip)}:${month}`, null, 3)) === null) return json(409, { error: "Too many rewards from this network", code: "network_used" });
  } catch (e) { return json(503, { error: "Try again in a minute" }); } // fail closed: this gives away Pro
  const now = Date.now();
  const passUntil = Math.max(b.passUntil || 0, now) + KINDS[kind] * DAY;
  await setBilling(user.id, { ...b, rewards: { ...got, [kind]: now }, passUntil });
  await rebuildProList().catch(() => {});
  return json(200, { ok: true, kind, passUntil });
};
