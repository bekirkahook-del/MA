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

test("one scoring bar for every difficulty: pass 7/10, 3 stars at 8/10", () => {
  assert.match(src, /const passN=tr=>lvlN\(tr\)===3\?2:7;/);
  assert.match(src, /return raw>=8\?3:raw>=7\?2:raw>=4\?1:0/);
  assert.match(src, /function pickQs\(tr,i,NQ\)/);
});
test("difficulty stored as strings so sync keeps the latest pick", () => {
  assert.match(src, /S\.diff\[tr\.id\]=\{k,s:sc,d:today\(\)\}/);
});

test("daily pacing: 3 new levels per specialized track per day, enforced in map, briefing and runner", () => {
  assert.match(src, /const DAILY_CAP=3;/);
  assert.match(src, /function capHit\(tr,i\)\{return LONG_TRACKS\.includes\(tr\.id\)&&!cleared\(tr\.id,i\)&&clearedToday\(tr\)>=DAILY_CAP\}/);
  assert.match(src, /function showBrief\(tr,i\)\{if\(capHit\(tr,i\)\)/);
  assert.match(src, /function runLevel\(tr,i\)\{if\(capHit\(tr,i\)\)/);
  assert.match(src, /&&!capHit\(tr,i\);/);
});
