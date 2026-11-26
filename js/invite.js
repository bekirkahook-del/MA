/* One in-site invite window for Friends, school team and Club. Nothing opens outside the site unless you tap
   Text or Email yourself:
   - Copy your invite link in one click (your referral link when signed in, so 3 friends = a week of Pro)
   - Search everyone on M&A Prep and add (Friends) or invite (Club) them in one click; they get it in-app
   window.maInvite({mode:"friends"|"club"|"team", title, text}) */
(function(){
  const st=document.createElement("style");st.textContent=`.iv2-link{display:flex;gap:8px;margin:12px 0}.iv2-link input{flex:1;min-width:0;font:inherit;font-size:14px;padding:10px 12px;border:1px solid var(--rule);border-radius:4px;background:var(--paper);color:var(--ink)}
.iv2-quick{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}.iv2-quick a{font-size:13.5px;text-decoration:none;border:1px solid var(--rule);border-radius:999px;padding:6px 12px;color:var(--ink)}
.iv2-list{display:flex;flex-direction:column;gap:8px;margin:10px 0 0;max-height:46vh;overflow:auto}
.iv2-row{display:flex;align-items:center;gap:10px;border:1px solid var(--rule);border-radius:4px;padding:8px 12px;background:var(--sheet)}
.iv2-row .t{flex:1;min-width:0;display:flex;flex-direction:column}.iv2-row b{font-size:14.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.iv2-row small{font-size:12px;color:var(--ink-2)}
.iv2-row .ok{color:var(--good)!important;border-color:var(--good)!important}`;document.head.appendChild(st);
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const live=()=>typeof dbState!=="undefined"&&dbState==="on"&&typeof myId!=="undefined"&&myId;
  const nm=id=>{try{return (typeof realName==="function"&&realName(id))||(typeof displayName==="function"&&displayName(id))||"Student"}catch(e){return "Student"}};
  let refUrl=null;
  async function link(mode){if(mode==="club"&&S.club&&S.club.code)return (typeof SITE_URL!=="undefined"?SITE_URL:"https://mnaprep.com/")+"#join-"+S.club.code;
    if(refUrl)return refUrl;
    try{const A=window.MA_AUTH;const s=A&&A.sb&&(await A.sb.auth.getSession()).data.session;
      if(s){const dk=window.maDevKeys?await maDevKeys():{};const r=await fetch("/.netlify/functions/refer",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.access_token},body:JSON.stringify({action:"code",...dk})});
        const j=await r.json().catch(()=>({}));if(j&&j.ok&&j.code){refUrl="https://mnaprep.com/?ref="+j.code;return refUrl}}}catch(e){}
    return "https://mnaprep.com/?utm_source=invite"}
  window.maInvite=async function(o){o=o||{};const mode=o.mode||"friends";
    const clubName=(S.club&&S.club.name)||"my club";
    const title=o.title||(mode==="club"?`Invite to ${clubName}`:mode==="team"?"Invite friends to your school team":"Invite friends");
    const msg=o.text||(mode==="club"?`Join ${clubName} on M&A Prep. We train for finance interviews together and compete on our own leaderboard:`:"I'm training for finance interviews on M&A Prep. It's free and plays like a game. Join me:");
    openPanel(`<div class="label">${mode==="club"?"Club":"Friends"}</div><h2>${E(title)}</h2>
      <p class="sub">${mode==="club"?"Anyone with the link joins your club in one tap.":"Copy your link and send it anywhere, or tell them to type your email when they sign up. Every 3 friends who join and clear Level 1 earns you a week of Pro."}</p>
      <div class="iv2-link"><input id="iv2L" readonly value="Getting your link…" aria-label="Invite link"><button class="btn" id="iv2C">Copy link</button></div>
      <div class="iv2-quick" id="iv2Q"></div>
      <div class="label" style="margin-top:6px">${mode==="club"?"Invite people on M&A Prep":"Add people on M&A Prep"}</div>
      <input class="ci-search" id="iv2S" type="search" placeholder="Search by name or school" aria-label="Search people" style="width:100%;margin-top:6px">
      <div class="iv2-list" id="iv2List"></div>`);
    const url=await link(mode),full=msg+" "+url,inp=document.getElementById("iv2L");if(!inp)return;inp.value=url;
    document.getElementById("iv2Q").innerHTML=`<a href="sms:?&body=${encodeURIComponent(full)}">💬 Text</a><a href="mailto:?subject=${encodeURIComponent(mode==="club"?"Join "+clubName+" on M&A Prep":"Join me on M&A Prep")}&body=${encodeURIComponent(full)}">✉️ Email</a>`;
    const cb=document.getElementById("iv2C");cb.onclick=async()=>{try{await navigator.clipboard.writeText(full)}catch(e){inp.select();try{document.execCommand("copy")}catch(x){}}
      cb.textContent="Copied ✓";try{window.maEv&&maEv("invite_copy_"+mode)}catch(e){}setTimeout(()=>{if(cb.isConnected)cb.textContent="Copy link"},1800)};
    let q="";const list=document.getElementById("iv2List");
    const draw=()=>{if(!list.isConnected)return;
      if(!live()){list.innerHTML=`<p class="note">Sign in to add people on M&A Prep in one click. You can still copy your link above.</p>`;return}
      const follows=new Set(S.profile.follows||[]),inv=new Set((S.club&&S.club.inv)||[]),code=S.club&&S.club.code;
      const pool=(typeof PLAYERS!=="undefined"?PLAYERS:[]).filter(p=>p.id!==myId&&!p.hidden&&(mode!=="club"||p.club!==code));
      const qq=q.toLowerCase(),rows=pool.filter(p=>!qq||nm(p.id).toLowerCase().includes(qq)||String(p.school||"").toLowerCase().includes(qq))
        .sort((a,b)=>((b.follows||[]).includes(myId)?1:0)-((a.follows||[]).includes(myId)?1:0)||(b.xp||0)-(a.xp||0)).slice(0,40);
      list.innerHTML=rows.length?rows.map(p=>{const done=mode==="club"?inv.has(p.id):follows.has(p.id);
        return `<div class="iv2-row">${typeof avatar==="function"?avatar(p.id,nm(p.id),34):""}<span class="t"><b>${E(nm(p.id))}</b><small>${E(p.school||"")}${(p.follows||[]).includes(myId)?" · follows you":""}</small></span>
          ${done?`<button class="ghost outline sm ok" data-un="${E(p.id)}">✓ ${mode==="club"?"Invited":"Added"}</button>`:`<button class="btn sm" data-add="${E(p.id)}">${mode==="club"?"Invite":"Add"}</button>`}</div>`}).join("")
        :`<p class="note">${q?"No one matches. Send them your link instead.":"No one to show yet. Send your link above."}</p>`;
      list.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>{const id=b.dataset.add;
        if(mode==="club"){S.club.inv=[...new Set([...(S.club.inv||[]),id])].slice(-100);save();try{syncProfile()}catch(e){}}
        else if(typeof pplToggle==="function")pplToggle(id,true);else{S.profile.follows=[...new Set([...(S.profile.follows||[]),id])];save();try{syncProfile()}catch(e){}}
        try{toast(`${mode==="club"?"Invited":"Added"} ${nm(id).split(" ")[0]}`)}catch(e){}draw()});
      list.querySelectorAll("[data-un]").forEach(b=>b.onclick=()=>{const id=b.dataset.un;
        if(mode==="club"){S.club.inv=(S.club.inv||[]).filter(i=>i!==id);save();try{syncProfile()}catch(e){}}
        else if(typeof pplToggle==="function")pplToggle(id,false);draw()});
      try{const need=rows.map(p=>p.id).filter(i=>typeof NAMES!=="undefined"&&!(i in NAMES));if(need.length&&typeof loadNames==="function"){const r=loadNames(need);if(r&&r.then)r.then(()=>{need.forEach(i=>{if(!(i in NAMES))NAMES[i]=""});draw()})}}catch(e){}};
    document.getElementById("iv2S").oninput=e=>{q=e.target.value.trim();draw()};draw()};
  /* take over the old buttons: school team (Friends tab), club "Invite friends", Pro page referral */
  document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#scInvite,#clubInvFr,#refBtn");if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    window.maInvite({mode:b.id==="clubInvFr"?"club":b.id==="scInvite"?"team":"friends"})},true);
})();
