import test from "node:test";
import assert from "node:assert/strict";
import { outreachWindow } from "../tools/bots/ops.mjs";
import { draft } from "../tools/bots/outreach.mjs";
import { PACK3 } from "../tools/bots/circle/pack3.mjs";
import { PACK4 } from "../tools/bots/circle/pack4.mjs";
import { PACK5 } from "../tools/bots/circle/pack5.mjs";
import { NODES, EDGES } from "../tools/bots/circle/graph.mjs";

test("outreach window: Mon-Fri 9am-4pm ET only", () => {
  assert.equal(outreachWindow(new Date("2026-11-25T14:00:00Z")).open, true);   // Wed 9:00 ET
  assert.equal(outreachWindow(new Date("2026-11-25T13:59:00Z")).open, false);  // 8:59 ET
  assert.equal(outreachWindow(new Date("2026-11-25T20:59:00Z")).open, true);   // 3:59 ET
  assert.equal(outreachWindow(new Date("2026-11-25T21:00:00Z")).open, false);  // 4:00 ET
  assert.equal(outreachWindow(new Date("2026-11-28T16:00:00Z")).open, false);  // Saturday
  assert.match(outreachWindow(new Date("2026-11-28T16:00:00Z")).next, /Mon Nov 30/);
});
test("outreach drafter: one email per organization, ever, and short", () => {
  const t = [{ name: "Sam Lee", org: "Fisher Finance Club", email: "a@b.edu", kind: "club" }, { name: "Pat Wu", org: "Fisher Finance Club", email: "c@d.edu", kind: "club" }, { name: "Al X", org: "Old Club", email: "e@f.edu", kind: "club" }];
  const r = draft(t, { sent: { "org:old club": "2026-11-18" }, now: new Date("2026-11-25T15:00:00Z") });
  assert.equal(r.drafted, 1); assert.equal(r.sends, 0); assert.ok(r.drafts[0].body.split(/\s+/).length < 90);
  assert.match(r.drafts[0].body, /mnaprep\.com/); assert.match(r.drafts[0].body, /no thanks/);
});
test("flywheel pack: every bot is a graph node with edges", () => {
  const ids = new Set(NODES.map(n => n.id));
  for (const b of [...PACK3, ...PACK4, ...PACK5]) assert.ok(ids.has(b.id), b.id);
  const linked = new Set(EDGES.flatMap(e => [e.from, e.to]));
  for (const b of [...PACK3, ...PACK4, ...PACK5]) assert.ok(linked.has(b.id), "orphan " + b.id);
  assert.equal(new Set([...PACK3, ...PACK4, ...PACK5].map(b => b.id)).size, PACK3.length + PACK4.length + PACK5.length);
});
test("flywheel pack: every bot returns a report with findings", async () => {
  for (const b of [...PACK3, ...PACK4, ...PACK5]) { const r = await (await import("../tools/bots/" + b.id + ".mjs")).scan(); assert.ok(Array.isArray(r.findings), b.id); }
});
