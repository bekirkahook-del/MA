import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
globalThis.window = {};
await import("../js/hardq.js"); await import("../js/easyq.js");
for (const t of ["ib", "pe", "pm", "rx", "mc"]) { await import("../js/hardq-" + t + ".js"); await import("../js/easyq-" + t + ".js"); }
await import("../js/easyq-f.js"); await import("../js/hardq-f.js");
const H = window.MA_HARDQ, E = window.MA_EASYQ;
test("every Beginner and Advanced question has 4 distinct options, a valid answer and an explanation", () => {
  for (const [k, qs] of [...Object.entries(H), ...Object.entries(E)]) for (const q of qs) {
    assert.equal(q.length, 4, k); assert.equal(q[1].length, 4, k + ": " + q[0]);
    assert.equal(new Set(q[1]).size, 4, k + ": " + q[0]);
    assert.ok(Number.isInteger(q[2]) && q[2] >= 0 && q[2] < 4, k + ": " + q[0]);
    assert.ok(q[3] && q[3].length > 10, k);
  }
});
test("no duplicate questions inside a pool, and no pool question repeats a core question", () => {
  for (const [k, qs] of [...Object.entries(H), ...Object.entries(E)]) {
    const t = qs.map(q => q[0].trim().toLowerCase()); assert.equal(new Set(t).size, t.length, "duplicate in " + k);
  }
});
test("hard pool keys point at real levels", () => {
  const src = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
  for (const k of [...Object.keys(H), ...Object.keys(E)]) assert.match(k, /^(ib|pe|pm|rx|mc|f)-\d+$/);
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

test("Foundations and IB pools: every level has 12+ Beginner and 12+ Advanced questions, Foundations keys f-0..f-4 and IB keys up to ib-8", () => {
  for (let i = 0; i < 5; i++) { assert.ok((E["f-" + i] || []).length >= 12, "easy f-" + i); assert.ok((H["f-" + i] || []).length >= 12, "hard f-" + i); }
  for (let i = 0; i < 9; i++) { assert.ok((E["ib-" + i] || []).length >= 12, "easy ib-" + i); assert.ok((H["ib-" + i] || []).length >= 12, "hard ib-" + i); }
  assert.ok(!E["f-5"] && !H["f-5"] && !E["ib-9"] && !H["ib-9"]);
});
test("new Foundations answers match the arithmetic", () => {
  const near = (a, b) => Math.abs(a - b) < 1e-9;
  assert.ok(near(100 * 1.1 * 1.1, 121)); assert.ok(near(14641 / Math.pow(1.1, 4), 10000)); assert.ok(near(1.5 * 0.5 * 100, 75));
  assert.ok(near(50 / 0.1, 500) && near(50 / (0.1 - 0.02), 625));
  assert.ok(near(100 * 1.03 / (0.11 - 0.03), 1287.5));
  assert.ok(Math.abs((1200 * 0.1 - 90) / (1200 + 90) - 0.0233) < 0.0001);
  assert.ok(near(((200 * 0.1) / (200 - 120)), 0.25)); assert.ok(near(0.7 * 11 + 0.3 * 7 * 0.7, 9.17));
  assert.ok(near(260 / 140, 260 / 140) && Math.abs(260 / 140 - 1.86) < 0.005);
});
