// Hourly: refreshes the public list of verified Pro members (drops expired trials and lapsed plans),
// and sweeps old rate-limit counters out of the database.
import { rebuildProList, json, SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";
export default async () => {
  const pro = await rebuildProList();
  const cutoff = new Date(Date.now() - 2 * 864e5).toISOString();
  const r = await fetch(`${SB_URL}/rest/v1/docs?col=eq.ratelimit&updated_at=lt.${encodeURIComponent(cutoff)}`, { method: "DELETE", headers: { ...svc(), Prefer: "return=minimal" } }).catch(() => null);
  return json(200, { pro, swept: !!(r && r.ok) });
};
export const config = { schedule: "@hourly" };
