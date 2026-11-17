import vm from "node:vm";import fs from "node:fs";import assert from "node:assert";
const src=fs.readFileSync(new URL("../js/clubmod.js",import.meta.url),"utf8");
function world(me,S,PLAYERS){const log=[];
  const ctx={window:{},document:{querySelector:()=>null},S,PLAYERS,myId:me,dbState:"on",toast:m=>log.push(m),save:()=>{},syncProfile:()=>{},
    clubMembers:()=>PLAYERS.filter(p=>p.club===S.club?.code),myStats:()=>({}),renderClub:()=>{},renderCompete:()=>{},openPanel:()=>{},esc:x=>x,RANKS:[["Intern"]],isoWeek:()=>"w",ago:()=>"",displayName:x=>x};
  vm.createContext(ctx);vm.runInContext(src,ctx);return {ctx,log}}
const mk=(id,extra={})=>({id,club:"abc123",xp:1,...extra});
// member is removed when owner bans them
{const P=[mk("own",{clubOfficer:true,clubName:"Club",clubBan:["bob"]}),mk("bob")];const S={club:{code:"abc123",name:"Club"}};
 const w=world("bob",S,P);w.ctx.window.maClubMod.guard();assert.equal(S.club,null);assert(w.log[0].includes("removed"));}
// banned member is hidden from boards
{const P=[mk("own",{clubOfficer:true,clubBan:["bob"]}),mk("bob"),mk("ann")];const S={club:{code:"abc123",officer:true,ban:["bob"]}};
 const w=world("own",S,P);assert.deepEqual(w.ctx.clubMembers().map(p=>p.id).sort(),["ann","own"]);}
// approval required: pending hidden until approved; owner approves
{const P=[mk("own",{clubOfficer:true,clubLock:true,clubOk:["ann"]}),mk("ann"),mk("zed")];const S={club:{code:"abc123",officer:true,lock:true,ok:["ann"]}};
 const w=world("own",S,P);assert.deepEqual(w.ctx.clubMembers().map(p=>p.id).sort(),["ann","own"]);}
// pending member fails the Series gate
{const P=[mk("own",{clubOfficer:true,clubLock:true}),mk("zed")];const S={club:{code:"abc123"}};
 const w=world("zed",S,P);assert.equal(w.ctx.window.maClubMod.approved(),false);}
// co-officer bans count; non-officer bans don't
{const P=[mk("own",{clubOfficer:true,clubCo:["co"]}),mk("co",{clubBan:["bob"]}),mk("evil",{clubBan:["ann"]}),mk("bob"),mk("ann")];const S={club:{code:"abc123"}};
 const w=world("ann",S,P);const t=w.ctx.window.maClubMod._t;assert.equal(t.banned("bob"),true);assert.equal(t.banned("ann"),false);}
// rename syncs down
{const P=[mk("own",{clubOfficer:true,clubName:"New Name"}),mk("ann")];const S={club:{code:"abc123",name:"Old"}};
 const w=world("ann",S,P);w.ctx.window.maClubMod.guard();assert.equal(S.club.name,"New Name");}
console.log("clubmod tests ok");
