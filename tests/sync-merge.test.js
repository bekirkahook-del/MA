/* Cross-device sync: runs the real merge code from js/app.js on two simulated devices.
   Run: node tests/sync-merge.test.js */
const fs=require("fs"),vm=require("vm"),path=require("path");
const src=fs.readFileSync(path.join(__dirname,"../js/app.js"),"utf8");
const grab=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b,i);if(i<0||j<0)throw new Error("can't find "+a);return src.slice(i,j)};
const syncCode=grab("const SYNC_WHOLE=","function save(){");
const mergeCode=grab("const MERGE_WHOLE=","const stateSig=");
const mkDevice=(init)=>{const ctx={S:JSON.parse(JSON.stringify(init)),Date:{now:()=>clock.t},JSON,Object,Array,Set,Math,console,setTimeout:()=>{}};
  vm.createContext(ctx);vm.runInContext(syncCode.replace(/^let SNAP=null;/m,"var SNAP=null;")+mergeCode+"\nfunction save(){stampEdits();S._t=Date.now()}\nsnapTake();",ctx);return ctx};
const clock={t:1e12};const tick=()=>clock.t+=60000;
/* "cloud" = merge like cloudPull/cloudPush do */
const sync=(a,b)=>{const m=a.mergeState(a.S,b.S,(a.S._t||0)>=(b.S._t||0));a.S=JSON.parse(JSON.stringify(m));b.S=JSON.parse(JSON.stringify(m));a.snapTake();b.snapTake()};
let fails=0;const ok=(c,msg)=>{console.log((c?"PASS ":"FAIL ")+msg);if(!c)fails++};
const base={profile:{name:"Bekir",follows:["y"],_t:1},settings:{dark:false},club:{code:"c1",name:"Club 1",inv:["p1"]},clubNo:[],_t:1};

{ /* 1. follow on phone, laptop is stale but saves something else later */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.profile.follows.push("x");A.save();tick();B.S.rapid=5;B.save();sync(B,A);
 ok(A.S.profile.follows.includes("x")&&B.S.profile.follows.includes("x"),"new connection reaches the other device even if it saved later");}
{ /* 2. unfollow */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.profile.follows=A.S.profile.follows.filter(i=>i!=="y");A.save();tick();B.S.rapid=1;B.save();sync(B,A);
 ok(!A.S.profile.follows.includes("y")&&!B.S.profile.follows.includes("y"),"removed connection stays removed everywhere");}
{ /* 3. both devices connect with different people */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.profile.follows.push("x");A.save();tick();B.S.profile.follows.push("z");B.save();sync(A,B);
 ok(["x","y","z"].every(i=>A.S.profile.follows.includes(i)),"connections made on two devices are both kept");}
{ /* 4. profile edit vs stale device */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.profile.name="Bekir K";A.save();tick();B.S.rapid=2;B.save();sync(B,A);
 ok(B.S.profile.name==="Bekir K","profile edit beats a stale device");}
{ /* 5. join a club on laptop; stale phone saved after */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.club={code:"c2",name:"Club 2",officer:false};A.save();tick();B.S.rapid=3;B.save();sync(B,A);
 ok(B.S.club.code==="c2"&&A.S.club.code==="c2","joined club carries over");}
{ /* 6. club invites sent on two devices */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.club.inv.push("p2");A.save();tick();B.S.club.inv.push("p3");B.save();sync(A,B);
 ok(["p1","p2","p3"].every(i=>A.S.club.inv.includes(i)),"club invites sent from both devices are kept");
 tick();A.S.club.inv=A.S.club.inv.filter(i=>i!=="p1");A.save();tick();B.S.rapid=9;B.save();sync(B,A);
 ok(!B.S.club.inv.includes("p1"),"withdrawn invite stays withdrawn");}
{ /* 7. declined club invite */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.clubNo=["c9"];A.save();tick();B.S.rapid=4;B.save();sync(B,A);
 ok(B.S.clubNo.includes("c9"),"declined invite stays declined on the other device");}
{ /* 8. settings */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.settings={dark:true};A.save();tick();B.S.rapid=6;B.save();sync(B,A);
 ok(B.S.settings.dark===true,"settings change beats a stale device");}
{ /* 9. sync order doesn't matter */
 const A=mkDevice(base),B=mkDevice(base);tick();A.S.profile.follows.push("x");A.save();tick();B.S.profile.follows=[];B.save();
 const m1=A.mergeState(A.S,B.S,false),m2=B.mergeState(B.S,A.S,true);
 ok(JSON.stringify(m1.profile.follows.sort())===JSON.stringify(m2.profile.follows.sort())&&m1.profile.follows.join()==="x","same result whichever device syncs first (newest decision per person wins)");}
{ /* 10. old data (before this update) still merges */
 const old={profile:{follows:["a","b"]},_t:5},A=mkDevice(base);const m=A.mergeState(A.S,old,true);
 ok(["a","b","y"].every(i=>m.profile.follows.includes(i)),"connections from a device on the old version aren't lost");}
console.log(fails?`\n${fails} FAILED`:"\nall passed");process.exit(fails?1:0);
