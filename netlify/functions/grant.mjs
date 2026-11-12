// Owner only: give someone free Pro (free-Pro requests, club pilots). POST { uid, days }  (days 0 = remove)
import { json, getUser, getBilling, setBilling, rebuildProList, isOwner } from "./_lib/common.mjs";
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !(await isOwner(user.email))) return json(403, { error: "Owner only" });
  const { uid, days } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/.test(uid || "")) return json(400, { error: "Bad user id" });
  const d = Math.max(0, Math.min(400, Number(days) || 0)), now = Date.now();
  const b = (await getBilling(uid)) || {};
  const grantUntil = d ? Math.max(b.grantUntil || 0, now) + d * 864e5 : 0;
  await setBilling(uid, { ...b, grantUntil, grantStart: b.grantStart || now });
  await rebuildProList().catch(() => {});
  return json(200, { ok: true, grantUntil });
};
