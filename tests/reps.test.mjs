/* "Your turn" reps + miss replay. Run: node --test tests/reps.test.mjs
   1) every generator reproduces the answer printed in its own lesson, 2) fuzz: random problems are sane, 3) replay matching coverage. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");

const win={};
const noop=()=>{};
const ctx=vm.createContext({window:win,console,Math,Object,Array,JSON,String,Number,Set,
  document:{createElement:()=>({}),head:{appendChild:noop},getElementById:noop,querySelector:noop},
  localStorage:{getItem:()=>null,setItem:noop},requestAnimationFrame:noop,setTimeout:noop,
  showBrief:noop,runLevel:noop,openPanel:noop,quiz:noop,shuffleOpts:noop});
/* the full TRACKS: main array + TRACKS.push(...) extras + DEEP_LEVELS, exactly as app.js assembles it */
const app=read("js/app.js"),a=app.indexOf("const TRACKS = [");
const endMark="Object.entries(DEEP_LEVELS).forEach(([id,lv])=>{const t=TRACKS.find(x=>x.id===id);if(t)t.levels.push(...lv)});";
const tctx=vm.createContext({console,Math,Object,Array,JSON,String,Number,Set,window:{}});
vm.runInContext(app.slice(a,app.indexOf(endMark,a)+endMark.length).replace("const TRACKS =","var TRACKS ="),tctx);
const TRACKS=tctx.TRACKS;
vm.runInContext(read("js/lessons.js"),ctx);vm.runInContext(read("js/lessons2.js"),ctx);
vm.runInContext(read("js/reps-data.js"),ctx);vm.runInContext(read("js/practice.js"),ctx);
const REPS=win.MA_REPS,LESSONS=win.MA_LESSONS,P=win.MAPractice;
const near=(x,y,e=1e-6)=>Math.abs(x-y)<=e;

test("every rep belongs to a real level that has a lesson with a worked example",()=>{
  for(const k of Object.keys(REPS)){
    const [t,i]=k.split(":"),tr=TRACKS.find(x=>x.id===t);
    assert.ok(tr&&tr.levels[+i],k+" is not a real level");
    assert.ok(LESSONS[k]&&LESSONS[k].some(c=>c.ex),k+" has no lesson with a worked example to attach to");
  }
  assert.ok(Object.keys(REPS).length>=20,"expected 20+ levels with reps");
  assert.equal(TRACKS.reduce((n,t)=>n+t.levels.length,0),Object.keys(LESSONS).length,"every level should have a lesson");
});

test("anchors: each generator reproduces the numbers printed in its lesson",()=>{
  const A=(k,p)=>REPS[k].build(p).ans;
  /* f:0 coffee-style flow: NI 30, +0 D&A, receivables 10, capex 15, no borrowing -> +5 (lesson "Coffee shop") */
  assert.equal(A("f:0",{ni:30,da:0,ar:10,capex:15,debt:0}),5);
  /* ib:7 depreciation +10 @40% -> cash +4; t:0 @25% -> +2.5 (lessons) */
  assert.equal(A("ib:7",{d:10,t:40}),4);assert.equal(A("t:0",{d:10,t:25}),2.5);
  /* f:1 time value: $100 at 10% for 2 years = 121; $200 at 20% = 288 (lesson worked example) */
  assert.equal(A("f:1",{pv:100,rate:10}),121);assert.equal(A("f:1",{pv:200,rate:20}),288);
  /* f:2 house: 300 + 200 - 20 = 480; t:1 $1,000 + 300 - 100 = 1,200 */
  assert.equal(A("f:2",{eq:300,debt:200,cash:20}),480);assert.equal(A("t:1",{eq:1000,debt:300,cash:100}),1200);
  /* f:3 comps: 10x * 50 = 500 and 8x * 25 = 200 */
  assert.equal(A("f:3",{e:50,m:10}),500);assert.equal(A("f:3",{e:25,m:8}),200);
  /* ib:8 8% debt at 25% tax = 6% */
  assert.ok(near(A("ib:8",{rate:8,t:25}),6));
  /* f:4 leverage: $100 asset, $50 debt, +20% -> +40% equity; $400 asset, 75% debt, +10% -> +40% */
  assert.equal(A("f:4",{a:100,d:50,x:20}),40);assert.equal(A("f:4",{a:400,d:75,x:10}),40);
  /* ib:3 same EBITDA 100: 15x vs 8x -> 1,500 - 800 = 700 */
  assert.equal(A("ib:3",{e:100,m1:15,m2:8}),700);
  /* pe:0 $1B fund: 2% fee = 20; $500M profit -> 100 carry */
  assert.equal(A("pe:0",{k:"fee",fund:1000}),20);assert.equal(A("pe:0",{k:"carry",profit:500}),100);
  /* pe:1 price 1,000 + fees 20, debt 60% (600) -> equity 420 */
  assert.equal(A("pe:1",{price:1000,fees:20,dp:60}),420);
  /* pe:2 $100 -> $200 = 2x; 2x/5y = 15%, 2.5x = 20%, 3x = 25%; t:3 same */
  assert.equal(A("pe:2",{k:"moic",inn:100,m:2}),2);assert.equal(A("pe:2",{k:"irr",m:2}),15);assert.equal(A("pe:2",{k:"irr",m:2.5}),20);assert.equal(A("t:3",{k:"irr",m:3}),25);
  /* pe:3 paper LBO from the lesson: EBITDA 100 x 10, 50% debt, yr5 EBITDA 130 x 10, debt left 300 -> exit equity 1,000 */
  assert.equal(A("pe:3",{e0:100,m:10,e5:130,left:300}),1000);
  /* pe:5 leverage 600/100 = 6x, coverage 100/25 = 4x, PIK $100 @10% -> 121 */
  assert.equal(A("pe:5",{k:"lev",e:100,mult:6}),6);assert.equal(A("pe:5",{k:"cov",e:100,i:25}),4);assert.equal(A("pe:5",{k:"pik",pr:100,rate:10}),121);
  /* pe:6 add-on 10 EBITDA at 6x into a 10x platform -> 40 */
  assert.equal(A("pe:6",{e:10,buy:6,plat:10}),40);
  /* pm:0 spread 0.04 on 10,000 shares = 400 */
  assert.equal(A("pm:0",{bid:99.98,sp:.04,sh:10000}),400);
  /* pm:1 $50 offer, $48 price -> 4.2% */
  assert.ok(near(A("pm:1",{o:50,px:48}),4.2));
  /* pm:2 $40 -> $52 target = 30% */
  assert.equal(A("pm:2",{px:40,up:30}),30);
  /* pm:3 long 120 short 80 -> net 40, gross 200; Sharpe (12-4)/16 = 0.5; lesson 150/100 -> net 50 */
  assert.equal(A("pm:3",{k:"net",l:120,s:80}),40);assert.equal(A("pm:3",{k:"gross",l:120,s:80}),200);assert.equal(A("pm:3",{k:"net",l:150,s:100}),50);assert.equal(A("pm:3",{k:"sharpe",ret:12,rf:4,vol:16}),.5);
  /* pm:4 $50 call bought for $3, stock ends $58 -> profit 5; ends below strike -> lose the premium */
  assert.equal(A("pm:4",{k:50,prem:3,px:58}),5);assert.equal(A("pm:4",{k:50,prem:3,px:45}),-3);
  /* pm:5 duration 7, yields +1 -> -7%; duration 5, yields -1 -> +5% */
  assert.equal(A("pm:5",{dur:7,dy:1}),-7);assert.equal(A("pm:5",{dur:5,dy:-1}),5);
  /* rx:0 debt 500 / EBITDA 80 = 6.25x */
  assert.equal(A("rx:0",{debt:500,e:80}),6.25);
  /* rx:1 value 500, secured 300, unsecured 400 -> 50% */
  assert.equal(A("rx:1",{v:500,sec:300,un:400}),50);
  /* rx:5 value 600, first lien 400, second lien 300 -> 66.7% */
  assert.ok(near(A("rx:5",{v:600,a:400,b:300}),66.7,1e-9));
  /* t:2 EBIT 100, tax 25%, D&A 20, capex 30, NWC 10 -> 55 */
  assert.equal(A("t:2",{ebit:100,t:25,da:20,capex:30,nwc:10}),55);
});

test("fuzz: 500 random problems per rep are sane, clean and self-consistent",()=>{
  for(const [k,G] of Object.entries(REPS)){
    for(let n=0;n<500;n++){
      const p=G.build(G.gen());
      assert.ok(Number.isFinite(p.ans),k+" ans not finite");
      assert.ok(Math.abs(p.ans*100-Math.round(p.ans*100))<1e-6,k+" answer has more than 2 decimals: "+p.ans);
      assert.ok(p.given&&p.q&&p.steps.length>=1,k+" missing text");
      p.steps.forEach(s=>assert.ok(s.length===2&&s[0]&&String(s[1]).length>0,k+" bad step"));
      assert.ok(!/NaN|undefined|Infinity/.test(JSON.stringify(p)),k+" has NaN/undefined in text: "+JSON.stringify(p));
      /* the last number the steps print must equal the answer (rx:0 ends on a verdict, so check the step before it) */
      const num=x=>Math.round(x*100)/100;
      const txt=p.steps.map(s=>String(s[1])).join(" | ").replace(/,/g,"").replace(/−/g,"-");
      const want=String(num(Math.abs(p.ans)));
      assert.ok(txt.includes(want),k+": steps never show the answer "+want+" -> "+txt);
      /* a typed answer equal to the real one is accepted, a clearly wrong one is rejected */
      assert.ok(P.closeEnough(p.ans,p),k+" rejects its own answer");
      assert.ok(!P.closeEnough(p.ans+Math.max(1,Math.abs(p.ans)*0.2),p),k+" accepts a wrong answer");
    }
  }
});

test("answer parsing accepts the ways students type numbers",()=>{
  assert.equal(P.parse("$1,020"),1020);assert.equal(P.parse("25%"),25);assert.equal(P.parse("2.5x"),2.5);
  assert.equal(P.parse("−4.5"),-4.5);assert.equal(P.parse("(7)"),-7);assert.equal(P.parse(" 6.25 "),6.25);
  assert.ok(Number.isNaN(P.parse("abc")));assert.ok(Number.isNaN(P.parse("")));assert.ok(Number.isNaN(P.parse("1,2,x3")));
});

test("miss replay: coverage and precision on every level question",()=>{
  let total=0,hit=0;const rows=[];
  for(const tr of TRACKS)tr.levels.forEach((L,i)=>{const k=tr.id+":"+i;if(!LESSONS[k])return;
    for(const q of L.q){total++;const b=P.bestCard(k,q);if(b){hit++;rows.push([k,q[0].slice(0,70),b.card.h.slice(0,46),b.score.toFixed(1)])}}});
  console.log(`replay coverage: ${hit}/${total} (${Math.round(100*hit/total)}%)`);
  fs.writeFileSync(process.env.REPLAY_DUMP||"/dev/null",rows.map(r=>r.join(" | ")).join("\n"));
  assert.ok(hit/total>=0.7,"fewer than 70% of questions get a replay card");
});
