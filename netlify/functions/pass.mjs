// Free Pro days earned by reaching Managing Director (rank index 6): 3 days, once per account.
// Ranks are earned in the browser (XP lives client-side), so the server can only cap the damage: confirmed email,
// one payout per rank per account, a rate limit, and a back-dating window of the pass length.
import { json, getUser, getBilling, setBilling, rebuildProList, isConfirmed, hitLimit, tooMany } from "./_lib/common.mjs";
const DAYS = { 6: 3 }; // 6 = Managing Director (index in RANKS)
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });
  if (!isConfirmed(user)) return json(409, { error: "Confirm your email first", code: "unconfirmed" });
  if (!(await hitLimit("pass", user.id, 20, 3600))) return tooMany();
  const { rank, at } = await req.json().catch(() => ({}));
  const key = String(rank);
  const days = Object.hasOwn(DAYS, key) ? DAYS[key] : 0;
  if (!days) return json(400, { error: "Unknown rank" });
  const b = (await getBilling(user.id)) || {};
  const passes = b.passes || {};
  if (passes[key]) return json(409, { error: "Already claimed", code: "used" });
  const now = Date.now(), start = Math.min(now, Math.max(Number(at) || now, now - days * 864e5));
  if (start + days * 864e5 <= now) return json(409, { error: "Expired", code: "expired" });
  passes[key] = now;
  const passUntil = Math.max(b.passUntil || 0, start) + days * 864e5;
  await setBilling(user.id, { ...b, passes, passUntil });
  await rebuildProList().catch(() => {});
  return json(200, { ok: true, passUntil });
};
