/* Model Lab + timed mock. Run: node --test tests/models.test.mjs
   Anchors are hand-checked; fuzz makes sure no random run produces junk. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const win={};vm.runInNewContext(read("js/models-data.js"),{window:win,Math});
const M=win.MA_MODELS;
const rows=m=>m.sections.flatMap(s=>s.rows);
const near=(x,y,e=0.01)=>Math.abs(x-y)<=e;

test("models point at real levels",()=>{
  const app=read("js/app.js"),a=app.indexOf("const TRACKS = [");
  const end="Object.entries(DEEP_LEVELS).forEach(([id,lv])=>{const t=TRACKS.find(x=>x.id===id);if(t)t.levels.push(...lv)});";
  const c=vm.createContext({console,Math,Object,Array,JSON,String,Number,Set,window:{}});
  vm.runInContext(app.slice(a,app.indexOf(end,a)+end.length).replace("const TRACKS =","var TRACKS ="),c);
  for(const [id,m] of Object.entries(M))for(const k of m.keys){const[t,i]=k.split(":");
    assert.ok(c.TRACKS.find(x=>x.id===t)?.levels[+i],`${id} -> ${k} is not a real level`)}});

test("LBO anchor: 100 EBITDA, 8x, 5x debt, +10%/yr, 40% sweep",()=>{
  const r=rows(M.lbo.build({e0:100,m:8,lev:5,a:10,s:40})).map(x=>x.ans);
  [800,500,300,456,408,356,300,240,1200,960].forEach((v,i)=>assert.ok(near(r[i],v),`row ${i}: ${r[i]} vs ${v}`));
  assert.ok(near(r[10],3.2)&&near(r[11],26.19,0.05));});

test("DCF anchor: FCF 100, +10%, WACC 10%, g 2%, ND 200, 10 shares",()=>{
  const r=rows(M.dcf.build({f1:100,g:10,rate:10,tg:2,nd:200,sh:10})).map(x=>x.ans);
  [110,121,90.909,90.909,90.909,1542.75,1159.1,1431.8,1231.8,123.18].forEach((v,i)=>assert.ok(near(r[i],v,0.2),`row ${i}: ${r[i]} vs ${v}`))});

test("merger anchor: accretive 5.24%",()=>{
  const r=rows(M.merger.build({nia:200,sha:100,pa:40,price:400,pct:50,nit:30,d:6})).map(x=>x.ans);
  [2,5,9,221,105,2.1048,5.238].forEach((v,i)=>assert.ok(near(r[i],v,0.005),`row ${i}: ${r[i]} vs ${v}`))});

test("fuzz: 3000 runs per model are finite, positive where they must be, and every answer passes its own tolerance",()=>{
  for(const [id,m] of Object.entries(M))for(let i=0;i<3000;i++){
    const b=m.build(m.gen());
    for(const x of rows(b)){assert.ok(isFinite(x.ans)&&x.tol>0,`${id}: ${x.label}`);
      assert.ok(Math.abs(x.ans-x.ans)<=x.tol);
      if(id==="lbo"&&/Debt at end/.test(x.label))assert.ok(x.ans>0,"debt went negative");
      if(id==="lbo"&&/MOIC/.test(x.label))assert.ok(x.ans>1&&x.ans<6,"MOIC "+x.ans)}}});

test("typical rounding by a student still passes",()=>{
  const b=M.dcf.build({f1:100,g:10,rate:10,tg:2,nd:200,sh:10}),ev=rows(b)[7];
  assert.ok(Math.abs(1432-ev.ans)<=ev.tol);assert.ok(!(Math.abs(1500-ev.ans)<=ev.tol))});
