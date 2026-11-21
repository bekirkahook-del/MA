// 1 free day of Pro for leaving a review (Bekir, Nov 21, 2026). Any rating counts: the reward never depends on what
// the review says (FTC 16 CFR 465), and the reviews section tells readers that reviewers get this.
// Anti-abuse, all on the server: confirmed email, the review must really exist with real text, once per account,
// once per device id, once per (IP + browser fingerprint), at most 3 per IP per 30 days. Only salted hashes are stored.
import { json, getUser, getBilling, setBilling, getDoc, rebuildProList, isConfirmed, hitLimit, tooMany, bump, clientIp } from "./_lib/common.mjs";
import { createHash } from "node:crypto";
const DAY = 864e5;
const H = (s) => createHash("sha256").update(String(s) + (process.env.RATE_LIMIT_SALT || "ma")).digest("hex").slice(0, 24);
export default async (req, context) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });
  if (!isConfirmed(user)) return json(409, { error: "Confirm your email first", code: "unconfirmed" });
  if (!(await hitLimit("revreward", user.id, 10, 3600))) return tooMany();
  const b = (await getBilling(user.id)) || {};
  if (b.reviewReward) return json(409, { error: "Already claimed", code: "used" });
  const rv = await getDoc("reviews", user.id);
  const text = String((rv && rv.text) || "").trim();
  if (!rv || !(rv.rating >= 1 && rv.rating <= 5)) return json(409, { error: "Leave a review first", code: "no_review" });
  if (text.length < 20) return json(409, { error: "Write at least a sentence about what helped or didn't", code: "short" });
  const { device, fp } = await req.json().catch(() => ({}));
  const dev = String(device || "").slice(0, 80), f = String(fp || "").slice(0, 200), ip = clientIp(req, context);
  if (dev.length < 16) return json(400, { error: "Missing device", code: "device" });
  const month = Math.floor(Date.now() / (30 * DAY));
  try {
    if ((await bump("rewardguard", "rev:dev:" + H(dev), null, 1)) === null) return json(409, { error: "This device already got a review reward", code: "device_used" });
    if ((await bump("rewardguard", "rev:ipfp:" + H(ip + "|" + f), null, 1)) === null) return json(409, { error: "This device already got a review reward", code: "device_used" });
    if ((await bump("rewardguard", "rev:ip:" + H(ip) + ":" + month, null, 3)) === null) return json(409, { error: "Too many review rewards from this network", code: "network_used" });
  } catch (e) { return json(503, { error: "Try again in a minute" }); } // fail closed: this gives away Pro
  const now = Date.now();
  const passUntil = Math.max(b.passUntil || 0, now) + DAY;
  await setBilling(user.id, { ...b, reviewReward: now, passUntil });
  await rebuildProList().catch(() => {});
  return json(200, { ok: true, passUntil });
};
