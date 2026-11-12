// Free Pro days earned by ranking up (Analyst 1, VP 2, Director 3, MD 7). Each rank pays out once per account.
import { json, getUser, getBilling, setBilling, rebuildProList } from "./_lib/common.mjs";
const DAYS = { 1: 1, 2: 2, 3: 3, 4: 7 };
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Sign in first" });
  const { rank, at } = await req.json().catch(() => ({}));
  const days = DAYS[rank];
  if (!days) return json(400, { error: "Unknown rank" });
  const b = (await getBilling(user.id)) || {};
  const passes = b.passes || {};
  if (passes[rank]) return json(409, { error: "Already claimed", code: "used" });
  const now = Date.now(), start = Math.min(now, Math.max(Number(at) || now, now - days * 864e5));
  if (start + days * 864e5 <= now) return json(409, { error: "Expired", code: "expired" });
  passes[rank] = now;
  const passUntil = Math.max(b.passUntil || 0, start) + days * 864e5;
  await setBilling(user.id, { ...b, passes, passUntil });
  await rebuildProList().catch(() => {});
  return json(200, { ok: true, passUntil });
};
