/* Clubs, server-backed. Who is a member / officer / removed is decided by netlify/functions/club-admin.mjs
   (verified sign-in, club docs only the server can write). This file is the browser side: it asks the server,
   mirrors the answer into S.club, and gives officers the Manage panel. Loaded after series.js.
   It wraps clubMembers / renderClub / renderCompete so app.js stays untouched. */
(function(){
  if(typeof S==="undefined"||typeof clubMembers!=="function")return;
  let CLUB=null,SCHOOL=[],SCHOOL_AT=0,lastAt=0,busy=false,prevCode="";
  const code=()=>(S.club&&S.club.code)||"";
  const tick=()=>{try{renderClub()}catch(e){}};

  async function call(action,body){
    try{const A=window.MA_AUTH,s=A&&A.sb&&(await A.sb.auth.getSession()).data.session;
      if(!s)return{status:401,j:{error:"Sign in to use clubs"}};
      const r=await fetch("/.netlify/functions/club-admin",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.access_token},body:JSON.stringify({action,...body})});
      return{status:r.status,j:await r.json().catch(()=>({}))}}
    catch(e){return{status:0,j:{error:"Couldn't reach the server. Try again."}}}}

  /* a paid club plan: ask for my seat as soon as I'm in (rewards.js), and tell the owner what happened to the plan */
  const claimSeat=()=>{if(typeof window.maClubClaim==="function")setTimeout(()=>{try{window.maClubClaim()}catch(e){}},300)};
  const billingNote=j=>{const b=j&&j.billing;if(!b)return;try{
    if(b.error)toast("Heads up: we couldn't update your club plan automatically. Open Manage billing on the Pro page to check it.");
    else if(b.canceled)toast("Your club plan won't renew. You keep access until the end of the period you paid for.")}catch(e){}};

  /* mirror the server's answer into my local club state */
  function adopt(v){
    if(!v)return;
    if(v.gone||(v.me&&v.me.banned)){
      if(S.club&&S.club.code===v.code){S.club=null;save();try{syncProfile()}catch(e){}try{toast(v.gone?"This club was disbanded":"An officer removed you from the club")}catch(e){}}
      CLUB=null;prevCode="";return}
    const wasMember=CLUB&&CLUB.code===v.code&&CLUB.me?!!CLUB.me.member:null; /* null = first look at this club */
    CLUB=v;
    if(wasMember===false&&v.me.member)claimSeat(); /* just approved */
    if(S.club&&S.club.code===v.code){const o=!!v.me.owner,co=!!v.me.co;
      if(S.club.name!==v.name||S.club.officer!==o||!!S.club.isCo!==co||S.club.sd!==v.sd){S.club.name=v.name;S.club.officer=o;S.club.isCo=co;S.club.sd=v.sd;save();try{syncProfile()}catch(e){}}}}

  /* ask the server where I stand; join / register if my browser says I'm in a club the server doesn't know yet */
  async function refresh(force){
    const c=code();
    if(!c){CLUB=null;return}
    if(busy||(!force&&Date.now()-lastAt<20e3))return;
    busy=true;lastAt=Date.now();
    try{let r=await call("get",{code:c});
      if(r.status===404&&r.j.unregistered){
        if(S.club&&S.club.officer){r=await call("create",{name:S.club.name||"My club",code:c});if(r.status===200||r.status===409)adopt(r.j.club)}
        else CLUB=null; /* older club whose officer hasn't opened the site yet */
      }else if(r.status===200&&r.j.club){
        adopt(r.j.club);
        const v=r.j.club;
        if(code()===c&&v&&!v.gone&&!v.me.member&&!v.me.pending&&!v.me.banned){const j=await call("join",{code:c});if(j.status===200){adopt(j.j.club);if(j.j.club&&j.j.club.me&&j.j.club.me.member)claimSeat()}else if(j.j&&j.j.banned)adopt({code:c,me:{banned:true}})}
      }}
    finally{busy=false}
    tick()}

  async function create(name,legacy){
    const r=await call("create",{name,code:legacy||""});
    if(r.status===200&&r.j.club){const v=r.j.club;S.club={code:v.code,name:v.name,officer:true,sd:v.sd};adopt(v);save();try{syncProfile()}catch(e){}tick();return{ok:true}}
    return{ok:false,error:r.j.error||"Couldn't create the club"}}
  async function join(c){
    c=String(c||"").trim().toLowerCase();
    if(!/^[a-z0-9]{4,8}$/.test(c))return{ok:false,error:"Enter the code your club officer shared."};
    const r=await call("join",{code:c});
    if(r.status===200&&r.j.club){const v=r.j.club;S.club={code:v.code,name:v.name,officer:false,sd:v.sd};adopt(v);save();try{syncProfile()}catch(e){}tick();if(v.me.member)claimSeat();return{ok:true,pending:!!v.me.pending}}
    return{ok:false,error:r.j.error||"Couldn't join the club",banned:!!r.j.banned}}
  async function leave(c){ /* the browser already cleared S.club; tell the server, and undo if it says no (e.g. owner with members) */
    const r=await call("leave",{code:c});
    if(r.status===200)billingNote(r.j);
    if(r.status!==200){const g=await call("get",{code:c});if(g.status===200&&g.j.club&&g.j.club.me.member){const v=g.j.club;S.club={code:v.code,name:v.name,officer:!!v.me.owner,sd:v.sd};adopt(v);save();try{syncProfile()}catch(e){}tick()}
      try{toast(r.j.error||"Couldn't leave the club")}catch(e){}}}

  /* boards and officer lists only count people the server says are approved members */
  const _cm=clubMembers;
  clubMembers=function(){const l=_cm.apply(this,arguments);if(!CLUB||CLUB.code!==code())return l;const ok=new Set(CLUB.members);return l.filter(p=>ok.has(p.id))};

  /* ---------- Series: clubs at my school, from the server ---------- */
  const loadSchool=cb=>{if(Date.now()-SCHOOL_AT<15e3)return;SCHOOL_AT=Date.now();
    call("list",{}).then(r=>{if(r.status===200&&JSON.stringify(r.j.clubs)!==JSON.stringify(SCHOOL)){SCHOOL=r.j.clubs||[];if(cb)cb()}})};

  /* ---------- Manage panel (owner + co-officers) ---------- */
  async function act(action,id,extra){
    const r=await call(action,{code:code(),id,...(extra||{})});
    if(r.status===200&&r.j.club){adopt(r.j.club);tick();billingNote(r.j);openManage()}else try{toast(r.j.error||"That didn't work")}catch(e){}}
  async function openManage(){
    if(!CLUB||!(CLUB.me.owner||CLUB.me.co)||typeof openPanel!=="function")return;
    const v=CLUB,owns=v.me.owner,ids=[...new Set([...v.members,...(v.pending||[]),...(v.ban||[])])];
    try{await loadNames(ids)}catch(e){}
    const P=id=>(typeof PLAYERS!=="undefined"?PLAYERS:[]).find(p=>p.id===id)||{id},co=new Set(v.co);
    const stat=p=>`<td>${RANKS[p.rank||0][0]}</td><td>${p.xp||0}</td><td>${p.levels||0}</td><td>${p.mockN?p.mockAvg:"–"}</td><td>${p.gWeek===isoWeek()?p.gScore:"–"}</td><td>${p.streak||0}</td><td>${p.updated?ago(p.updated):"–"}</td>`;
    let SEATS=null;try{const A=window.MA_AUTH,ss=A&&A.sb&&(await A.sb.auth.getSession()).data.session;
      if(ss){const rr=await fetch("/.netlify/functions/club",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+ss.access_token},body:JSON.stringify({action:"seats",code:v.code})});const jj=await rr.json().catch(()=>({}));if(jj&&jj.ok)SEATS=jj}}catch(e){}
    const holds=SEATS?new Set(SEATS.holders):null;
    const mem=v.members.map(P).sort((a,b)=>(b.xp||0)-(a.xp||0));
    const btn=(a,id,t,cls)=>`<button class="${cls||"flink"}" data-cm="${a}" data-id="${esc(id)}">${t}</button>`;
    openPanel(`<div class="label">Manage club</div><h2>${esc(v.name)}</h2>
      ${owns?`<div class="actions" style="margin:8px 0;flex-wrap:wrap"><input id="cmName" maxlength="40" value="${esc(v.name)}" aria-label="Club name"><button class="ghost outline sm" id="cmRen">Rename</button>
        <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="cmLock"${v.lock?" checked":""}> Require my approval to join</label></div>`:`<p class="note">You're a co-officer. The owner controls rename, approval and officers.</p>`}
      ${(v.pending||[]).length?`<h3>Waiting for approval (${v.pending.length})</h3><div class="tbl-wrap"><table><tbody>${v.pending.map(id=>`<tr><td class="nm" data-id="${esc(id)}"></td><td>${P(id).xp||0} XP</td><td>${btn("approve",id,"Approve","btn sm")} ${btn("decline",id,"Decline","ghost sm")}</td></tr>`).join("")}</tbody></table></div>`:""}
      <h3>Members (${mem.length})</h3>${SEATS?`<p class="note">Pro seats: ${SEATS.holders.length} of ${SEATS.seats} used. Members who are not in the club take a seat when they join, until your seats run out. You can give or take back a seat here.</p>`:""}
      <div class="tbl-wrap"><table><thead><tr><th>Member</th><th>Title</th><th>XP</th><th>Levels</th><th>Interview avg</th><th>Gauntlet</th><th>Streak</th><th>Active</th>${SEATS?"<th>Pro seat</th>":""}<th></th></tr></thead><tbody>${mem.map(p=>`<tr><td class="nm" data-id="${esc(p.id)}"></td>${stat(p)}${SEATS?`<td>${holds.has(p.id)?"✓ ":"– "}${p.id===v.owner?"":btn("seat:"+(holds.has(p.id)?"off":"on"),p.id,holds.has(p.id)?"Take back":"Give seat")}</td>`:""}<td>${p.id===v.owner?"Owner":p.id===myId?"You":`${owns?btn("co",p.id,co.has(p.id)?"Remove co-officer":"Make co-officer")+" "+btn("transfer",p.id,"Make owner")+" ":""}${btn("remove",p.id,"Remove")}`}</td></tr>`).join("")}</tbody></table></div>
      ${(v.ban||[]).length?`<h3>Removed (${v.ban.length})</h3><div class="tbl-wrap"><table><tbody>${v.ban.map(id=>`<tr><td class="nm" data-id="${esc(id)}"></td><td>${btn("unban",id,"Allow back")}</td></tr>`).join("")}</tbody></table></div>`:""}
      ${owns?`<p style="margin-top:14px"><button class="ghost danger sm" id="cmDis">Disband club</button></p>`:""}
      <p class="note">Removed people can't rejoin with the code until you allow them back.</p>`);
    panel.classList.add("wide");
    panel.querySelectorAll(".nm[data-id]").forEach(n=>n.textContent=displayName(n.dataset.id));
    panel.querySelectorAll("[data-cm]").forEach(b=>b.onclick=()=>{const a=b.dataset.cm,id=b.dataset.id;
      if(a.startsWith("seat:")){(async()=>{try{const A=window.MA_AUTH,ss=(await A.sb.auth.getSession()).data.session;const rr=await fetch("/.netlify/functions/club",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+ss.access_token},body:JSON.stringify({action:"seat",code:v.code,uid:id,on:a==="seat:on"})});const jj=await rr.json().catch(()=>({}));
        if(jj.ok)toast(a==="seat:on"?"Seat given":"Seat taken back");else toast(jj.reason==="full"?"All seats are used. Take one back first.":jj.reason==="payer"?"The person paying always keeps a seat.":jj.error||"That didn't work")}catch(e){try{toast("That didn't work")}catch(x){}}openManage()})();return}
      if(a==="transfer"&&!confirm("Make them the owner? You'll become a co-officer."))return;
      act(a,id,a==="co"?{on:!co.has(id)}:null)});
    if(owns){
      panel.querySelector("#cmRen").onclick=()=>act("rename","",{name:panel.querySelector("#cmName").value});
      panel.querySelector("#cmLock").onchange=e=>act("lock","",{on:e.target.checked});
      panel.querySelector("#cmDis").onclick=()=>{if(confirm("Disband this club for everyone? This can't be undone."))act("disband","")}}}

  /* ---------- club card ---------- */
  const _rc=renderClub;
  renderClub=function(){
    const c=code();
    if(prevCode&&prevCode!==c){const old=prevCode;prevCode=c;leave(old)} /* left via the Leave button */
    prevCode=c;
    _rc.apply(this,arguments);
    try{const el=document.querySelector("#clubCard");if(!el)return;
      if(!c){ /* create / join go through the server */
        const cr=el.querySelector("#clubCreate"),jn=el.querySelector("#clubJoin");
        if(cr)cr.onclick=async()=>{const n=el.querySelector("#clubName").value.trim();if(n.length<3){el.querySelector("#clubName").focus();toast("Name your club first");return}
          cr.disabled=true;const r=await create(n);cr.disabled=false;if(r.ok)toast("Club created. Share the code with members.");else toast(r.error)};
        if(jn)jn.onclick=async()=>{jn.disabled=true;const r=await join(el.querySelector("#clubCode").value);jn.disabled=false;
          if(r.ok)toast(r.pending?"Request sent. An officer has to approve you.":"Joined the club");else toast(r.error)};
        return}
      refresh();
      if(CLUB&&CLUB.code===c){
        if(!CLUB.me.member&&CLUB.me.pending)el.insertAdjacentHTML("beforeend",`<p class="note">Waiting for an officer to approve you. You'll show on the club board once they do.</p>`);
        if(CLUB.me.owner||CLUB.me.co){const n=(CLUB.pending||[]).length,a=el.querySelector(".actions"),b=document.createElement("button");
          b.className="btn sm";b.id="clubManage";b.textContent="Manage club"+(n?` (${n} waiting)`:"");b.onclick=openManage;(a||el).insertBefore(b,(a||el).firstChild)}}
      else if(!CLUB&&S.club&&!S.club.officer)el.insertAdjacentHTML("beforeend",`<p class="note">This club isn't registered yet. It shows up once its officer opens M&amp;A Prep.</p>`)}catch(e){}};
  if(typeof renderCompete==="function"){const _rcp=renderCompete;renderCompete=function(){try{refresh()}catch(e){}return _rcp.apply(this,arguments)}}
  setInterval(()=>{if(!document.hidden&&code())refresh(true)},90e3);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&code())refresh()});

  window.maClubMod={
    create,join,refresh:()=>refresh(true),openManage,loadSchool,
    schoolList:()=>SCHOOL.map(c=>({code:c.code,name:c.name,members:c.members})),
    /* Series gate: an approved member of a club the server says belongs to my verified school */
    gateOK:d=>!!(d&&CLUB&&S.club&&CLUB.code===S.club.code&&CLUB.sd&&CLUB.sd===d&&CLUB.me.member)};
})();
