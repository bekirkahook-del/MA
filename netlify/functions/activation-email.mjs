// Owner only. POST {mode:"preview"} -> how many accounts would get the "Finish Level 1" email + skip reasons + the HTML (nothing sent).
//            POST {mode:"test"}    -> sends ONE copy to the owner's own address.
// There is deliberately no "send to students" mode yet: that is added only when Bekir says to send (email rule in CLAUDE.md).
import { json, getUser, isOwnerUser } from "./_lib/common.mjs";
import { sendOne } from "./_lib/mail.mjs";
import { ready } from "./_lib/reviewmail.mjs";
import { recipients, build } from "./_lib/activationmail.mjs";
export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "POST only" });
  const u = await getUser(req); if (!(await isOwnerUser(u))) return json(403, { error: "Owner only" });
  const { mode } = await req.json().catch(() => ({}));
  if (mode === "test") {
    const miss = ready(); if (miss.length) return json(400, { error: "Missing settings: " + miss.join(", ") });
    const m = build({ uid: u.id, email: u.email, first: "" });
    await sendOne({ to: u.email, subject: "[TEST] " + m.subject, html: m.html });
    return json(200, { ok: true, to: u.email });
  }
  const { list, total, skip } = await recipients();
  return json(200, { willSend: list.length, accounts: total, skip, missing: ready(), sample: build(list[0] || { uid: u.id, email: u.email, first: "" }).html });
};
