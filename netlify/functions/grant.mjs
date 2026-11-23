// Owner only: give someone free Pro (free-Pro requests, club pilots). POST { uid, days }  (days 0 = remove)
import { sendOne, confirmedEmail, plainMail, btn } from "./_lib/mail.mjs";
import { json, getUser, getBilling, setBilling, rebuildProList, isOwnerUser, hitLimit, tooMany } from "./_lib/common.mjs";
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const user = await getUser(req);
  if (!user || !(await isOwnerUser(user))) return json(403, { error: "Owner only" });
  if (!(await hitLimit("grant", user.id, 120, 3600))) return tooMany();
  const { uid, days } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/.test(uid || "")) return json(400, { error: "Bad user id" });
  const d = Math.max(0, Math.min(400, Number(days) || 0)), now = Date.now();
  const b = (await getBilling(uid)) || {};
  const grantUntil = d ? Math.max(b.grantUntil || 0, now) + d * 864e5 : 0;
  await setBilling(uid, { ...b, grantUntil, grantStart: b.grantStart || now });
  await rebuildProList().catch(() => {});
  // Tell them. Best effort: a failed email never blocks the grant.
  let emailed = false;
  if (d) {
    try {
      const to = await confirmedEmail(uid);
      if (to) {
        const until = new Date(grantUntil).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });
        const html = plainMail("You've got M&amp;A Pro 🔓",
          `<p style="margin:0 0 12px">You've been upgraded to <b>M&amp;A Pro</b> through <b>${until}</b>. Log in and everything's unlocked.</p>
<p style="margin:0 0 16px">The people landing IB, PE and hedge fund offers started prepping early. You just did too.</p>
<p style="margin:0 0 16px">${btn("https://mnaprep.com/?utm_source=email&utm_campaign=pro-grant", "Open M&amp;A Prep →")}</p>
<p style="margin:0;font-size:14px;color:#4A5672">Questions? Just hit reply.<br>– Bekir, M&amp;A Prep</p>`,
          "You're getting this because you were given M&amp;A Pro access.");
        await sendOne({ to, subject: "You've got M&A Pro 🔓", html });
        emailed = true;
      }
    } catch (e) { console.error("pro grant email", String(e)); }
  }
  return json(200, { ok: true, grantUntil, emailed });
};
