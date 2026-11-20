// Owner-only, read-only. Accounts that were created but never signed in (stuck on the old email-link sign-up). Sends nothing.
import { json, getUser, isOwnerUser, SB_URL } from "./_lib/common.mjs";
import { svc } from "./_lib/mail.mjs";

export default async (req) => {
  const user = await getUser(req);
  if (!user || !(await isOwnerUser(user))) return json(403, { error: "Owner only" });
  const r = await fetch(`${SB_URL}/auth/v1/admin/users?page=1&per_page=1000`, { headers: svc(), signal: AbortSignal.timeout(10000) }).catch(() => null);
  if (!r || !r.ok) return json(500, { error: "Couldn't read users." });
  const j = await r.json(); const all = (j.users || j || []).filter(u => u.email && !/^signup-test-/.test(u.email));
  const stuck = all.filter(u => !u.last_sign_in_at);
  return json(200, { total: all.length, signedIn: all.length - stuck.length, stuck: stuck.length,
    list: stuck.map(u => ({ email: u.email, created: u.created_at })) });
};
