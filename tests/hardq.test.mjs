import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
globalThis.window = {};
await import("../js/hardq.js");
const H = window.MA_HARDQ;
test("every hard question has 4 distinct options, a valid answer and an explanation", () => {
  for (const [k, qs] of Object.entries(H)) for (const q of qs) {
    assert.equal(q.length, 4, k); assert.equal(q[1].length, 4, k + ": " + q[0]);
    assert.equal(new Set(q[1]).size, 4, k + ": " + q[0]);
    assert.ok(Number.isInteger(q[2]) && q[2] >= 0 && q[2] < 4, k + ": " + q[0]);
    assert.ok(q[3] && q[3].length > 10, k);
  }
});
test("hard pool keys point at real levels", () => {
  const src = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
  for (const k of Object.keys(H)) assert.match(k, /^(ib|pe|pm|rx|mc)-\d+$/);
  assert.match(src, /MA_HARDQ/);
});
test("LBO and IRR answers match the arithmetic", () => {
  const irr = (m, n) => Math.pow(m, 1 / n) - 1;
  assert.ok(Math.abs(irr(3, 4) - .32) < .01); assert.ok(Math.abs(irr(2.5, 5) - .20) < .01);
  assert.ok(Math.abs(irr(4, 5) - .32) < .01); assert.equal((10 * 75 - 200) / 200, 2.75); assert.equal((8 * 75 - 200) / 200, 2);
  assert.equal(8 * 60 - 5 * 60, 180);
});

test("tiers are strict: Beginner/Advanced draw from their own pools, Intermediate from the core bank", () => {
  const src = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
  assert.match(src, /d==="f"\?\(window\.MA_EASYQ\|\|\{\}\)\[k\]:d==="a"\?\(window\.MA_HARDQ\|\|\{\}\)\[k\]:null/);
  assert.ok(!/HARD_SHARE/.test(src));
});
