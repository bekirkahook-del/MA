/* Club moderation (officers): remove members, require approval to join, co-officers, rename.
   Loaded after series.js. Wraps clubMembers / myStats / renderClub / renderCompete so app.js stays untouched.
   Trust model matches the rest of clubs: lists live on each officer's public player doc and members' browsers obey them.
   Real enforcement (tamper-proof) needs Supabase rules or a server function; see claude/club-officer-fixes in the project docs. */
(function(){
  if(typeof S==="undefined"||typeof clubMembers!=="function")return;
  const CAP=200;
  const code=()=>(S.club&&S.club.code)||"";
  const players=()=>typeof PLAYERS!=="undefined"?PLAYERS:[];
  const uniq=a=>[...new Set(a)].slice(-CAP);

  /* the club's owner = the officer record on this code; my own local state wins when it's me */
  function owner(c){c=c||code();if(!c)return null;
    if(S.club&&S.club.code===c&&S.club.officer)return{id:myId,me:true,clubName:S.club.name,clubBan:S.club.ban||[],clubOk:S.club.ok||[],clubCo:S.club.cos||[],clubLock:!!S.club.lock};
    return players().find(p=>p.club===c&&p.clubOfficer)||null}
  /* owner + the people the owner named co-officers */
  function officers(c){const o=owner(c);if(!o)return[];const list=[o];
    (o.clubCo||[]).forEach(id=>{if(id===o.id)return;
      if(id===myId&&S.club&&S.club.code===c)list.push({id,clubBan:S.club.ban||[],clubOk:S.club.ok||[]});
      else{const p=players().find(x=>x.id===id&&x.club===c);if(p)list.push(p)}});
    return list}
  const union=(f,c)=>{const s=new Set();officers(c).forEach(o=>(o[f]||[]).forEach(x=>s.add(x)));return s};
  const isOwner=()=>!!(S.club&&S.club.officer);
  const isCo=()=>{const o=owner();return !!(o&&!o.me&&(o.clubCo||[]).includes(myId))};
  const isOff=()=>isOwner()||isCo();
  const banned=(id,c)=>union("clubBan",c||code()).has(id);
  function approved(id,c){c=c||code();const o=owner(c);if(!o||!o.clubLock)return true;
    if(officers(c).some(x=>x.id===id))return true;return union("clubOk",c).has(id)}

  /* a removed member's browser drops the club; renames and co-officer flags sync down */
  function guard(){if(!S.club||!S.club.code||typeof dbState==="undefined"||dbState!=="on"||!myId)return false;
    if(S.club.officer)return false;const c=S.club.code,o=owner(c);if(!o)return false;
    if(banned(myId,c)){S.club=null;save();try{syncProfile()}catch(e){}try{toast("An officer removed you from the club")}catch(e){}return true}
    let ch=false;
    if(o.clubName&&S.club.name!==o.clubName){S.club.name=o.clubName;ch=true}
    const co=(o.clubCo||[]).includes(myId);if(!!S.club.isCo!==co){S.club.isCo=co;ch=true}
    if(ch)save();return false}

  /* publish the lists on my player doc */
  const _ms=myStats;
  myStats=function(){const o=_ms.apply(this,arguments);
    try{if(S.club&&S.club.code&&(S.club.officer||S.club.isCo)){
      o.clubBan=(S.club.ban||[]).slice(-CAP);o.clubOk=(S.club.ok||[]).slice(-CAP);
      if(S.club.officer){o.clubCo=(S.club.cos||[]).slice(-20);o.clubLock=!!S.club.lock}}}catch(e){}
    return o};

  /* removed and unapproved people don't count on boards or in the officer view */
  const _cm=clubMembers;
  clubMembers=function(){const l=_cm.apply(this,arguments),c=code();if(!c)return l;
    return l.filter(p=>!banned(p.id,c)&&approved(p.id,c))};

  const pending=()=>{const c=code(),o=owner(c);if(!c||!o||!o.clubLock)return[];
    return players().filter(p=>p.club===c&&!banned(p.id,c)&&!approved(p.id,c))};
  const removed=()=>[...(S.club&&S.club.ban||[])];

  const mut=fn=>{fn();save();try{syncProfile()}catch(e){}try{renderClub()}catch(e){}openManage()};
  const act={
    ok:id=>mut(()=>{S.club.ok=uniq([...(S.club.ok||[]),id])}),
    ban:id=>mut(()=>{if(id===myId)return;S.club.ban=uniq([...(S.club.ban||[]),id]);S.club.ok=(S.club.ok||[]).filter(x=>x!==id);S.club.cos=(S.club.cos||[]).filter(x=>x!==id)}),
    unban:id=>mut(()=>{S.club.ban=(S.club.ban||[]).filter(x=>x!==id)}),
    co:id=>mut(()=>{const l=S.club.cos||[];S.club.cos=l.includes(id)?l.filter(x=>x!==id):uniq([...l,id]).slice(-5)})};

  function openManage(){if(!isOff()||typeof openPanel!=="function")return;
    const c=code(),o=owner(c),owns=isOwner(),name=(S.club.name||(o&&o.clubName)||"Your club");
    const mem=clubMembers().slice().sort((a,b)=>(b.xp||0)-(a.xp||0));
    const pend=pending(),gone=removed(),cos=new Set(o&&o.clubCo||[]);
    const row=p=>`<tr><td class="nm" data-id="${esc(p.id)}"></td><td>${RANKS[p.rank||0][0]}</td><td>${p.xp||0}</td><td>${p.levels||0}</td><td>${p.mockN?p.mockAvg:"–"}</td><td>${p.gWeek===isoWeek()?p.gScore:"–"}</td><td>${p.streak||0}</td><td>${p.updated?ago(p.updated):"–"}</td>
      <td>${p.id===myId||(o&&p.id===o.id)?(p.id===myId?"You":"Owner"):`${owns?`<button class="flink" data-cm="co" data-id="${esc(p.id)}">${cos.has(p.id)?"Remove co-officer":"Make co-officer"}</button> `:""}<button class="flink" data-cm="ban" data-id="${esc(p.id)}">Remove</button>`}</td></tr>`;
    openPanel(`<div class="label">Manage club</div><h2>${esc(name)}</h2>
      ${owns?`<div class="actions" style="margin:8px 0;flex-wrap:wrap"><input id="cmName" maxlength="40" value="${esc(name)}" aria-label="Club name"><button class="ghost outline sm" id="cmRen">Rename</button>
        <label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="cmLock"${S.club.lock?" checked":""}> Require my approval to join</label></div>`:`<p class="note">You're a co-officer. The owner controls rename and approval settings.</p>`}
      ${pend.length?`<h3>Waiting for approval (${pend.length})</h3><div class="tbl-wrap"><table><tbody>${pend.map(p=>`<tr><td class="nm" data-id="${esc(p.id)}"></td><td>${p.xp||0} XP</td><td><button class="btn sm" data-cm="ok" data-id="${esc(p.id)}">Approve</button> <button class="ghost sm" data-cm="ban" data-id="${esc(p.id)}">Decline</button></td></tr>`).join("")}</tbody></table></div>`:""}
      <h3>Members (${mem.length})</h3>
      <div class="tbl-wrap"><table><thead><tr><th>Member</th><th>Title</th><th>XP</th><th>Levels</th><th>Interview avg</th><th>Gauntlet</th><th>Streak</th><th>Active</th><th></th></tr></thead><tbody>${mem.map(row).join("")}</tbody></table></div>
      ${gone.length?`<h3>Removed (${gone.length})</h3><div class="tbl-wrap"><table><tbody>${gone.map(id=>`<tr><td class="nm" data-id="${esc(id)}"></td><td><button class="flink" data-cm="unban" data-id="${esc(id)}">Allow back</button></td></tr>`).join("")}</tbody></table></div>`:""}
      <p class="note">Removed people drop out the next time their app syncs, and can't rejoin with the code until you allow them back.</p>`);
    panel.classList.add("wide");
    panel.querySelectorAll(".nm[data-id]").forEach(n=>n.textContent=displayName(n.dataset.id));
    panel.querySelectorAll("[data-cm]").forEach(b=>b.onclick=()=>act[b.dataset.cm](b.dataset.id));
    if(owns){
      panel.querySelector("#cmRen").onclick=()=>{const n=panel.querySelector("#cmName").value.trim();if(n.length<3){toast("Name needs 3+ characters");return}mut(()=>{S.club.name=n.slice(0,40)})};
      panel.querySelector("#cmLock").onchange=e=>mut(()=>{S.club.lock=e.target.checked})}}

  /* club card: pending notice for members, Manage button for officers */
  const _rc=renderClub;
  renderClub=function(){try{guard()}catch(e){}
    _rc.apply(this,arguments);
    try{const el=document.querySelector("#clubCard");if(!el||!S.club||!S.club.code)return;
      if(!isOff()&&!approved(myId)){el.insertAdjacentHTML("beforeend",`<p class="note">Waiting for an officer to approve you. You'll show on the club board once they do.</p>`)}
      if(isOff()){const n=pending().length,a=el.querySelector(".actions");
        const b=document.createElement("button");b.className="btn sm";b.id="clubManage";b.textContent="Manage club"+(n?` (${n} waiting)`:"");b.onclick=openManage;
        (a||el).insertBefore(b,(a||el).firstChild)}}catch(e){}};
  if(typeof renderCompete==="function"){const _rcp=renderCompete;renderCompete=function(){try{guard()}catch(e){}return _rcp.apply(this,arguments)}}

  window.maClubMod={approved:()=>!S.club||!S.club.code||isOwner()||approved(myId),banned:()=>banned(myId),guard,openManage,_t:{owner,officers,union,banned:id=>banned(id),approved:id=>approved(id)}};
})();
