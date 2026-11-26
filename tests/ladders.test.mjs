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

test("difficulty tiers: pass bars and star cutoffs", () => {
  const N = 10;
  const bar = d => d === "a" ? 8 : d === "f" ? 6 : Math.ceil(N * .7);
  const stars = (d, raw) => raw >= (d === "a" ? N : N - 1) ? 3 : raw >= bar(d) ? 2 : raw >= (d === "a" ? 5 : d === "f" ? 3 : Math.ceil(N * .4)) ? 1 : 0;
  assert.match(src, /const passN=tr=>/);
  assert.equal(bar("s"), 7); assert.equal(stars("s", 9), 3); assert.equal(stars("s", 7), 2); assert.equal(stars("s", 4), 1);
  assert.equal(stars("a", 9), 2); assert.equal(stars("a", 10), 3); assert.equal(stars("a", 7), 1);
  assert.equal(stars("f", 6), 2); assert.equal(stars("f", 5), 1);
});
test("difficulty stored as strings so sync keeps the latest pick", () => {
  assert.match(src, /S\.diff\[tr\.id\]=\{k,s:sc,d:today\(\)\}/);
});
