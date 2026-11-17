import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyStripeSignature, safeEqual, isConfirmed, cleanText, isEmail, memLimit, _memReset, clientIp } from "../netlify/functions/_lib/security.mjs";

const SECRET = "whsec_unit_test_secret";
const sign = (raw, secret, t = Math.floor(Date.now() / 1000)) => `t=${t},v1=${crypto.createHmac("sha256", secret).update(`${t}.${raw}`).digest("hex")}`;

test("stripe signature: valid signature passes", () => assert.equal(verifyStripeSignature("{}", sign("{}", SECRET), SECRET), true));
test("stripe signature: FORGED with an empty key is rejected (the old fail-open bug)", () => {
  assert.equal(verifyStripeSignature("{}", sign("{}", ""), ""), false);
  assert.equal(verifyStripeSignature("{}", sign("{}", ""), undefined), false);
  assert.equal(verifyStripeSignature("{}", sign("{}", ""), SECRET), false);
});
test("stripe signature: wrong secret / tampered body / garbage header rejected", () => {
  assert.equal(verifyStripeSignature("{}", sign("{}", "whsec_other_secret"), SECRET), false);
  assert.equal(verifyStripeSignature('{"a":1}', sign("{}", SECRET), SECRET), false);
  for (const h of [null, "", "garbage", "t=1,v1=zz", "v1=" + "a".repeat(64), `t=${Math.floor(Date.now() / 1000)}`]) assert.equal(verifyStripeSignature("{}", h, SECRET), false, String(h));
});
test("stripe signature: replay outside the 5 minute window rejected", () => {
  const old = Math.floor(Date.now() / 1000) - 3600;
  assert.equal(verifyStripeSignature("{}", sign("{}", SECRET, old), SECRET), false);
  assert.equal(verifyStripeSignature("{}", sign("{}", SECRET, old + 3550), SECRET), true);
});
test("stripe signature: any one of several v1 signatures may match (key rotation)", () => {
  const t = Math.floor(Date.now() / 1000), good = sign("{}", SECRET, t).split("v1=")[1];
  assert.equal(verifyStripeSignature("{}", `t=${t},v1=${"0".repeat(64)},v1=${good}`, SECRET), true);
});
test("safeEqual", () => { assert.equal(safeEqual("abc", "abc"), true); assert.equal(safeEqual("abc", "abd"), false); assert.equal(safeEqual("abc", "abcd"), false); assert.equal(safeEqual(undefined, ""), true); });
test("isConfirmed", () => { assert.equal(isConfirmed({ email_confirmed_at: "x" }), true); assert.equal(isConfirmed({ confirmed_at: "x" }), true); assert.equal(isConfirmed({}), false); assert.equal(isConfirmed(null), false); });
test("cleanText strips control chars, line separators and caps length", () => {
  assert.equal(cleanText("a\r\nb\u0000c d", 50), "a b c d");
  assert.equal(cleanText("x".repeat(500), 10).length, 10);
  assert.equal(cleanText(undefined, 5), "");
});
test("isEmail", () => {
  for (const ok of ["a@b.co", "first.last+tag@school.edu"]) assert.equal(isEmail(ok), true, ok);
  for (const bad of ["", "a@b", "a b@c.com", "a@b.c", "<x>@b.com", "a@b.com,c@d.com", "x".repeat(300) + "@b.com", 5, null]) assert.equal(isEmail(bad), false, String(bad));
});
test("memLimit allows `max` per window then blocks, then recovers", () => {
  _memReset();
  for (let i = 0; i < 3; i++) assert.equal(memLimit("k", 3, 1000, 0), true);
  assert.equal(memLimit("k", 3, 1000, 10), false);
  assert.equal(memLimit("other", 3, 1000, 10), true);
  assert.equal(memLimit("k", 3, 1000, 2000), true);
});
test("clientIp prefers Netlify context, then headers", () => {
  const r = (h) => new Request("https://x.test/", { headers: h });
  assert.equal(clientIp(r({}), { ip: "1.2.3.4" }), "1.2.3.4");
  assert.equal(clientIp(r({ "x-nf-client-connection-ip": "5.6.7.8" })), "5.6.7.8");
  assert.equal(clientIp(r({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" })), "9.9.9.9");
  assert.equal(clientIp(r({})), "unknown");
});
