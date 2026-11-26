import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const src = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const grab = (re) => { const m = src.match(re); assert.ok(m, "missing " + re); return m[1]; };
const ranks = eval(grab(/const RANKS=(\[\[.*?\]\]);/));
const ladders = eval("(" + grab(/const LADDERS=(\{[\s\S]*?\});/) + ")");

test("every profession ladder has one title per XP step", () => {
  for (const [k, L] of Object.entries(ladders)) assert.equal(L.length, ranks.length, k);
});
test("ladders start at Intern and never repeat a title", () => {
  for (const [k, L] of Object.entries(ladders)) { assert.equal(L[0], "Intern", k); assert.equal(new Set(L).size, L.length, k); }
});
test("the generic RANKS names stay untouched (rewards.js matches on them)", () => {
  assert.deepEqual(ranks.map(r => r[0]), ["Intern","Summer Analyst","Analyst","Associate","VP","Director","Managing Director"]);
});
test("level attempts are logged and Hard mode is wired", () => {
  assert.match(src, /S\.lvlLog=S\.lvlLog\|\|\{\}/);
  assert.match(src, /id="hardBtn"/);
  assert.match(fs.readFileSync(new URL("../js/practice.js", import.meta.url), "utf8"), /S\.hard=S\.hard\|\|\{\}/);
});
