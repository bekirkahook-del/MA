/* Spaced review schedule. Run: node --test tests/srs.test.mjs */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"..");
const eq=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
const win={};
const ctx=vm.createContext({window:win,Math,Object,Date,Set,String,document:{createElement:()=>({}),head:{appendChild(){}}}});
vm.runInContext(fs.readFileSync(path.join(root,"js/srs.js"),"utf8"),ctx);
const mk=()=>{let day=20000;const S={};const c=win.MASrs.core(()=>S,()=>day);return{S,c,adv:n=>{day+=n},day:()=>day}};
const Q=["What is EV?",["a","b"],0,"why"];

test("miss -> due tomorrow; right when due -> 3 days; 7; 14; 30; then mastered",()=>{
  const {S,c,adv,day}=mk(),id=c.qid("f:2",Q);
  assert.equal(c.mark(id,false),true);eq(S.srs[id],{b:1,d:day()+1});
  assert.equal(c.due().length,0);adv(1);eq(c.due(),[id]);
  const gaps=[3,7,14,30];let b=1;
  for(const g of gaps){c.mark(id,true);b++;assert.equal(S.srs[id].b,b);assert.equal(S.srs[id].d,day()+g);adv(g)}
  c.mark(id,true);assert.equal(S.srs[id].b,6);assert.equal(c.due().length,0);assert.equal(c.stats().mastered,1);
  adv(1000);assert.equal(c.due().length,0,"mastered items never come due")});

test("right early gets no credit; right on a brand-new item adds nothing; a miss resets",()=>{
  const {S,c,adv}=mk(),id=c.qid("pe:1",Q);
  assert.equal(c.mark(id,true),false);assert.equal(Object.keys(S.srs).length,0);
  c.mark(id,false);assert.equal(c.mark(id,true),false);assert.equal(S.srs[id].b,1);
  adv(1);c.mark(id,true);assert.equal(S.srs[id].b,2);adv(3);c.mark(id,true);assert.equal(S.srs[id].b,3);
  c.mark(id,false);eq(S.srs[id].b,1)});

test("stats, ordering and weak spots",()=>{
  const {S,c,adv}=mk();
  c.mark(c.rid("f:3"),false);adv(1);c.mark(c.qid("f:3",["Other?",[],0]),false);c.mark(c.qid("ib:3",Q),false);
  const s=c.stats();assert.equal(s.due,1);assert.equal(s.later,2);
  assert.equal(c.due()[0],c.rid("f:3"),"oldest due first");
  assert.equal(c.weak()[0],"f:3");assert.ok(c.weak().length<=3)});

test("hash is stable and ids parse back to a level",()=>{
  const {c}=mk();assert.equal(c.qid("pm:2",Q),c.qid("pm:2",Q));
  assert.match(c.qid("pm:2",Q),/^q:pm:2:[a-z0-9]+$/);assert.equal(c.rid("rx:5"),"r:rx:5")});

test("prune keeps the table under the cap by dropping the oldest mastered first",()=>{
  const {S,c}=mk();
  for(let i=0;i<320;i++)S.srs=Object.assign(S.srs||{},{["q:f:1:m"+i]:{b:6,d:20000+i}});
  c.mark(c.rid("f:1"),false);c.mark(c.rid("f:1"),true);
  // trigger prune through an advancing mark
  const {S:S2,c:c2,adv}=mk();S2.srs={};for(let i=0;i<320;i++)S2.srs["q:f:1:m"+i]={b:6,d:20000+i};
  S2.srs[c2.rid("f:2")]={b:1,d:20000};c2.mark(c2.rid("f:2"),true);
  assert.ok(Object.keys(S2.srs).length<=300);assert.ok(S2.srs[c2.rid("f:2")],"live items are never pruned")});

test("sync merge: two devices' tables combine without losing progress",()=>{
  /* mergeVal (app.js) merges objects key by key and takes the max of numbers */
  const src=fs.readFileSync(path.join(root,"js/app.js"),"utf8");
  const a=src.indexOf("function mergeVal"),b=src.indexOf("/* +time/-time logs");
  const m=vm.runInNewContext(src.slice(a,b)+";mergeVal",{});
  const L={srs:{x:{b:3,d:100},y:{b:1,d:90}}},R={srs:{x:{b:2,d:120},z:{b:1,d:95}}};
  const out=m(L.srs,R.srs,true,"srs");
  eq(out.x,{b:3,d:120});assert.ok(out.y&&out.z)});
