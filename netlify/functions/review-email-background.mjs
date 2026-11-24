// Owner only, background (up to 15 min). POST {confirm:"SEND <n>"} where n = the count review-email.mjs previewed.
// Skips anyone already sent (promolog), so re-running only reaches people it missed. Logs a summary.
import { getUser, isOwnerUser } from "./_lib/common.mjs";
import { recipients, sendBatch, markSent, ready } from "./_lib/reviewmail.mjs";
export default async (req) => {
  if (req.method !== "POST") return;
  const u = await getUser(req); if (!(await isOwnerUser(u))) { console.log("review email: not owner"); return; }
  const miss = ready(); if (miss.length) { console.log("review email: missing " + miss.join(", ")); return; }
  const { confirm } = await req.json().catch(() => ({}));
  const { list } = await recipients();
  if (confirm !== `SEND ${list.length}`) { console.log(`review email: confirm mismatch (${confirm} vs SEND ${list.length})`); return; }
  let sent = 0, failed = 0;
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    try { await sendBatch(chunk); for (const r of chunk) await markSent(r.uid).catch(() => {}); sent += chunk.length; }
    catch (e) { failed += chunk.length; console.error("review email batch failed", String(e)); }
    await new Promise(r => setTimeout(r, 600)); // stay under Resend's rate limit
  }
  console.log(`review email done: sent ${sent}, failed ${failed}`);
};
