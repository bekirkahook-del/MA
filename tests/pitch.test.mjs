/* Pitch Room data. Run: node --test tests/pitch.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"..");
const win={};vm.runInNewContext(fs.readFileSync(path.join(root,"js/pitch-data.js"),"utf8"),{window:win,Math});
const D=win.MA_PITCH;

test("every sector has 3 strong + 3 weak thesis points, 3 variant views and 3 catalysts (first is the strong one)",()=>{
  for(const [k,s] of Object.entries(D.SECTORS)){
    assert.equal(s.good.length,3,k);assert.equal(s.bad.length,3,k);assert.equal(s.variant.length,3,k);assert.equal(s.catalyst.length,3,k);
    assert.ok(s.names.length>=3&&s.blurb.length>30);
    for(const x of [...s.good,...s.bad,...s.variant,...s.catalyst])assert.ok(x[0].length>10&&x[1].length>=8,k+": "+x[0])}});

test("section plan adds up to 180 seconds",()=>assert.equal(D.SECTIONS.reduce((a,s)=>a+s[1],0),180));

test("fuzz: 5000 cases have clean sane numbers and answerable questions",()=>{
  for(let i=0;i<5000;i++){
    const c=D.gen();
    assert.ok(c.peer>c.m0&&c.bm<c.m0&&c.bm>0);
    assert.equal(c.P,c.m0*c.E);assert.equal(c.T,c.peer*c.E);
    assert.ok(c.up>10&&c.up<60,"upside "+c.up);assert.ok(c.down>5&&c.down<=25,"downside "+c.down);assert.ok(c.rr>0.6&&c.rr<8);
    const q=D.questions(c);assert.equal(q.length,5);
    assert.equal(q.filter(x=>x.type==="num").length,2);assert.equal(q.filter(x=>x.type==="qual").length,3);
    for(const x of q){if(x.type==="num"){assert.ok(isFinite(x.ans)&&x.tol>0&&x.steps.length>=2)}else assert.equal(x.points.length,3)}}});

test("anchor: EPS 4, 15x today, peers 19x, bear 13x",()=>{
  const c={co:"X",E:4,m0:15,peer:19,bm:13,P:60,T:76,bearP:52,up:(76-60)/60*100,down:(60-52)/60*100};c.rr=c.up/c.down;
  assert.ok(Math.abs(c.up-26.667)<0.01&&Math.abs(c.down-13.333)<0.01&&Math.abs(c.rr-2)<1e-9);
  let got=0;for(let i=0;i<200;i++){for(const q of D.questions(c)){if(q.type!=="num")continue;
    if(/Bear case/.test(q.q)){assert.equal(q.ans,52);got++}
    if(/upside-to-downside/.test(q.q)){assert.ok(Math.abs(q.ans-2)<1e-9);got++}
    if(/20% below/.test(q.q)){assert.ok(Math.abs(q.ans-48)<1e-9);got++}}}
  assert.ok(got>100)});
