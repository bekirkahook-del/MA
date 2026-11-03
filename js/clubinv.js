/* M&A: invite friends to your club in-app, and accept club invites */
(function(){
  if(typeof renderClub!=="function")return;
  const st=document.createElement("style");st.textContent=`
.ci-list{display:flex;flex-direction:column;gap:8px;margin:14px 0 4px;max-height:52vh;overflow:auto}
.ci-row{display:flex;align-items:center;gap:10px;border:1px solid var(--rule);border-radius:12px;padding:9px 12px;background:var(--sheet)}
.ci-row .ci-t{flex:1;min-width:0;display:flex;flex-direction:column}
.ci-row b{font-size:14.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-row small{font-size:12px;color:var(--ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-row .done{color:var(--good)!important;border-color:var(--good)!important}
.ci-search{width:100%;margin-top:6px}
.ci-banner{display:flex;align-items:center;gap:10px;border:1px solid var(--cobalt);background:color-mix(in srgb,var(--cobalt) 7%,transparent);border-radius:12px;padding:10px 12px;margin:0 0 12px}
.ci-banner span{flex:1;font-size:13.5px;line-height:1.4}
.ci-banner .btn,.ci-banner .ghost{flex:none}`;document.head.appendChild(st);

  const live=()=>typeof dbState!=="undefined"&&dbState==="on"&&myId;
  const nm=id=>{try{return realName(id)||"Someone"}catch(e){return"Someone"}};
  window.maClubInvites=function(){if(!live())return[];const mine=S.club&&S.club.code,no=new Set((S.clubNo||[]));
    const seen={};return PLAYERS.filter(p=>p.id!==myId&&p.club&&p.club!==mine&&(p.clubInv||[]).includes(myId)&&!no.has(p.club))
      .filter(p=>seen[p.club]?false:(seen[p.club]=1)).map(p=>({from:p.id,code:p.club,name:p.clubName||(PLAYERS.find(o=>o.club===p.club&&o.clubOfficer)||{}).clubName||"a club"}))};
  window.maJoinClub=function(code,name){S.club={code,name:name||"",officer:false};S.clubNo=(S.clubNo||[]).filter(c=>c!==code);save();syncProfile();try{renderClub()}catch(e){}try{toast(`Joined ${name||"the club"}`)}catch(e){}};
  window.maDeclineClub=function(code){S.clubNo=[...new Set([...(S.clubNo||[]),code])].slice(-30);save();try{renderClub()}catch(e){}};

  function candidates(){const code=S.club.code,f=new Set(S.profile.follows||[]);
    return PLAYERS.filter(p=>p.id!==myId&&p.club!==code&&!p.hidden&&(f.has(p.id)||(p.follows||[]).includes(myId)))
      .map(p=>({p,rel:pplRel(p)})).sort((a,b)=>(a.rel==="connected"?0:1)-(b.rel==="connected"?0:1)||(b.p.xp||0)-(a.p.xp||0))}
  function pick(name){let q="";
    openPanel(`<div class="label">Invite to ${esc(name)}</div><h2>Invite friends</h2><p class="sub">They'll get a notification and can join with one tap.</p><input class="ci-search" id="ciQ" type="search" placeholder="Search your connections" aria-label="Search connections"><div class="ci-list" id="ciList"></div>`);
    const draw=()=>{const inv=new Set(S.club.inv||[]),list=candidates().filter(x=>!q||nm(x.p.id).toLowerCase().includes(q));
      $("#ciList").innerHTML=list.length?list.map(({p,rel})=>`<div class="ci-row">${avatar(p.id,nm(p.id),36)}<span class="ci-t"><b>${esc(nm(p.id))}</b><small>${esc(rel==="connected"?"Connected":rel==="incoming"?"Follows you":"You follow them")}${p.club?" · in another club":""}</small></span>${inv.has(p.id)?`<button class="ghost outline sm done" data-ciun="${esc(p.id)}">✓ Invited</button>`:`<button class="btn sm" data-ci="${esc(p.id)}">Invite</button>`}</div>`).join("")
        :`<p class="note">${q?"No one matches.":"No connections to invite yet. Connect with people in Compete → Friends, or use Invite by email."}</p>`;
      document.querySelectorAll("[data-ci]").forEach(b=>b.onclick=()=>{S.club.inv=[...new Set([...(S.club.inv||[]),b.dataset.ci])].slice(-100);save();syncProfile();toast(`Invited ${nm(b.dataset.ci).split(" ")[0]}`);draw()});
      document.querySelectorAll("[data-ciun]").forEach(b=>b.onclick=()=>{S.club.inv=(S.club.inv||[]).filter(i=>i!==b.dataset.ciun);save();syncProfile();draw()});
      const need=candidates().map(x=>x.p.id).filter(i=>!(i in NAMES));if(need.length){const r=loadNames(need);if(r&&r.then)r.then(()=>{need.forEach(i=>{if(!(i in NAMES))NAMES[i]=""});if($("#ciList"))draw()})}};
    $("#ciQ").oninput=e=>{q=e.target.value.trim().toLowerCase();draw()};draw()}

  const _rc=renderClub;renderClub=function(){_rc.apply(this,arguments);try{
    const el=$("#clubCard");if(!el)return;
    /* drop invites for people who already joined */
    if(S.club&&S.club.code&&(S.club.inv||[]).length&&live()){const left=S.club.inv.filter(id=>!PLAYERS.some(p=>p.id===id&&p.club===S.club.code));if(left.length!==S.club.inv.length){S.club.inv=left;save();syncProfile()}}
    const b=$("#clubInvFr");if(b)b.onclick=()=>{if(!live()){toast("Sign in to invite friends");return}pick(S.club.name||"your club")};
    const invs=maClubInvites();if(invs.length){const i=invs[0],ban=document.createElement("div");ban.className="ci-banner";
      ban.innerHTML=`${avatar(i.from,nm(i.from),30)}<span><b>${esc(nm(i.from).split(" ")[0])}</b> invited you to join <b>${esc(i.name)}</b>${S.club&&S.club.code?". Joining will leave your current club.":""}</span><button class="btn sm">Join</button><button class="ghost sm">Not now</button>`;
      ban.querySelector(".btn").onclick=()=>maJoinClub(i.code,i.name);ban.querySelector(".ghost").onclick=()=>maDeclineClub(i.code);el.insertBefore(ban,el.firstChild)}
  }catch(e){console.error(e)}};
  try{renderClub()}catch(e){}
})();
