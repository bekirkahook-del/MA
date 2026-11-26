// Shared identity helpers for the free-Pro-day rewards (reward.mjs) and the referral program (refer.mjs).
// Only salted hashes of emails/IPs/devices are ever stored.
import { createHash } from "node:crypto";
export const H = (s) => createHash("sha256").update(String(s) + (process.env.RATE_LIMIT_SALT || "ma")).digest("hex").slice(0, 24);
export const TEMP = new Set(("mailinator.com guerrillamail.com guerrillamail.net guerrillamail.org sharklasers.com grr.la 10minutemail.com 10minutemail.net "
  + "temp-mail.org tempmail.com tempmail.net tempmailo.com tempmail.dev tmpmail.org tmpmail.net yopmail.com yopmail.net yopmail.fr trashmail.com "
  + "getnada.com nada.email dispostable.com maildrop.cc mailnesia.com mintemail.com mohmal.com emailondeck.com fakeinbox.com throwawaymail.com "
  + "spamgourmet.com mailcatch.com moakt.com burnermail.io 33mail.com inboxkitten.com mail.tm mail.gw emailfake.com fakemail.net tempinbox.com "
  + "discard.email spambox.us mytemp.email tempr.email anonbox.net mailpoof.com 1secmail.com 1secmail.org 1secmail.net linshiyouxiang.net "
  + "dropmail.me 20minutemail.com mailinator.net trbvm.com cuvox.de armyspy.com dayrep.com einrot.com fleckens.hu gustr.com jourrapide.com "
  + "rhyta.com superrito.com teleworm.us byom.de luxusmail.org tempail.com tempmailaddress.com emailtemporanea.com mailtemp.info").split(/\s+/));
export function canon(email) {
  let [u, d] = String(email || "").trim().toLowerCase().split("@");
  if (!u || !d) return "";
  if (d === "googlemail.com") d = "gmail.com";
  u = u.split("+")[0];
  if (d === "gmail.com") u = u.replace(/\./g, "");
  return u + "@" + d;
}
export const tempDomain = (email) => { const d = String(email || "").toLowerCase().split("@")[1] || ""; return TEMP.has(d) || [...TEMP].some(t => d.endsWith("." + t)); };
export const range = (ip) => ip.includes(":") ? ip.split(":").slice(0, 3).join(":") : ip.split(".").slice(0, 3).join(".");
