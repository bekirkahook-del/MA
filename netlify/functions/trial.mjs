// Starts the 3-day free trial. One per account, recorded on the server so it can't be reset.
import { json, getUser, getBilling, setBilling, tierOf, rebuildProList } from "./_lib/common.mjs";
const DAYS = 3;
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !user.id) return json(401, { error: "Make a free account first", code: "not_granted" });
  const b = (await getBilling(user.id)) || {};
  const tier = tierOf(b);
  if (tier === "pro" || tier === "season") return json(409, { error: "You already have Pro", code: "paid" });
  if (b.trialStart) return json(409, { error: "You've already used your free trial", code: "used", until: b.trialUntil || 0 });
  const now = Date.now();
  // Trials started before the switch to 3 days (Nov 12, 2026, 3pm ET) keep their original 7 days.
  const CUTOFF = Date.UTC(2026, 10, 12, 20, 0), body = await req.json().catch(() => ({}));
  const legacy = Number(body.legacyStart) || 0;
  const start = legacy && legacy < CUTOFF && now - legacy < 7 * 864e5 ? legacy : now;
  const until = start === now ? now + DAYS * 864e5 : legacy + 7 * 864e5;
  await setBilling(user.id, { ...b, trialStart: start, trialUntil: until });
  await rebuildProList().catch(() => {});
  return json(200, { ok: true, trialStart: start, trialUntil: until });
};
