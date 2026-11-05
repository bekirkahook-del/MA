/* "Your school" card on Compete → Friends. Real numbers only, from the public leaderboard (players).
   Counts show once a school has enough people to mean something; before that it's an invite prompt. */
(function(){
  const MIN=5;
  const norm=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g," ").replace(/\b(the|university|univ|of|college)\b/g,"").replace(/\s+/g," ").trim();
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const css=`.sc-card{border:1px solid var(--rule);border-radius:14px;background:var(--sheet);padding:18px 20px;margin-bottom:20px}
.sc-k{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--brass)}
.sc-h{font-size:22px;font-weight:700;margin:6px 0 4px;color:var(--ink);line-height:1.25}.sc-h b{color:var(--cobalt)}
.sc-sub{font-size:13.5px;color:var(--ink-2);margin:0}
.sc-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:14px 0}
.sc-stat{border:1px solid var(--rule);border-radius:10px;padding:10px 12px;background:var(--paper)}.sc-stat b{display:block;font-family:var(--mono);font-size:20px;color:var(--ink)}.sc-stat span{font-size:11.5px;color:var(--ink-2)}
.sc-top{display:flex;flex-direction:column;gap:6px;margin:4px 0 14px}.sc-top div{display:flex;justify-content:space-between;font-size:14px}.sc-top em{font-style:normal;font-family:var(--mono);color:var(--ink-2)}
.sc-btn{font:inherit;font-size:14px;font-weight:600;padding:9px 16px;border-radius:10px;border:1px solid var(--ink);background:var(--ink);color:var(--paper);cursor:pointer}
@media(max-width:520px){.sc-stats{grid-template-columns:1fr 1fr}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  const players=()=>{try{return Array.isArray(PLAYERS)?PLAYERS:[]}catch(e){return[]}};
  const mySchool=()=>{try{return (S&&S.profile&&S.profile.school)||""}catch(e){return""}};
  const me=()=>{try{return myId}catch(e){return null}};
  let last="";
  function draw(){const pane=document.querySelector('[data-pane="friends"]');if(!pane)return;
    let el=document.getElementById("schoolCard");if(!el){el=document.createElement("div");el.id="schoolCard";pane.insertBefore(el,pane.firstChild)}
    const school=mySchool(),P=players(),key=norm(school);
    const by={};P.forEach(p=>{const k=norm(p.school);if(!k)return;(by[k]=by[k]||{name:p.school,list:[]}).list.push(p)});
    const ranked=Object.values(by).filter(s=>s.list.length>=MIN).sort((a,b)=>b.list.length-a.list.length);
    const mine=key&&by[key],n=mine?mine.list.length:0;
    let html;
    if(!school){html=`<div class="sc-k">Your school</div><div class="sc-h">See who from your school is training</div><p class="sc-sub">Add your school in your profile to join its team on the leaderboard.</p>`}
    else if(n<MIN){html=`<div class="sc-k">${esc(school)}</div><div class="sc-h">Be one of the first from ${esc(school)}</div><p class="sc-sub">Your school's team shows up on the leaderboard once ${MIN} students join. Invite your friends and start the rivalry.</p><div style="margin-top:14px"><button class="sc-btn" id="scInvite">Invite friends</button></div>`}
    else{const xp=mine.list.reduce((a,p)=>a+(+p.xp||0),0),rank=ranked.findIndex(s=>norm(s.name)===key)+1;
      const top=mine.list.slice().sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,3);
      html=`<div class="sc-k">Your school</div><div class="sc-h"><b>${n}</b> students from ${esc(school)} are training on M&A Prep</div><p class="sc-sub">${rank===1?"Your school is #1 right now. Keep it there.":rank?`Your school is #${rank} of ${ranked.length} schools.`:""}</p>
        <div class="sc-stats"><div class="sc-stat"><b>${n}</b><span>Students</span></div><div class="sc-stat"><b>${xp.toLocaleString()}</b><span>Team XP</span></div><div class="sc-stat"><b>${rank?"#"+rank:"–"}</b><span>School rank</span></div></div>
        <div class="sc-top">${top.map((p,i)=>`<div><span>${["🥇","🥈","🥉"][i]} ${esc((()=>{try{return displayName(p.id)}catch(e){return"Student"}})())}</span><em>${(+p.xp||0).toLocaleString()} XP</em></div>`).join("")}</div>
        <button class="sc-btn" id="scInvite">Invite friends to your team</button>`}
    const sig=html;if(sig===last)return;last=sig;el.className="sc-card";el.innerHTML=html;
    const b=document.getElementById("scInvite");if(b)b.onclick=async()=>{const url="https://mnaprep.com/?utm_source=invite";const text=`I'm training for finance interviews on M&A Prep. Join ${school||"our school"}'s team:`;
      try{if(navigator.share){await navigator.share({title:"M&A Prep",text,url});return}}catch(e){return}
      try{await navigator.clipboard.writeText(text+" "+url);b.textContent="Link copied ✓";setTimeout(()=>{b.textContent="Invite friends"},2000)}catch(e){}}}
  setTimeout(draw,1500);setInterval(()=>{const p=document.querySelector('[data-pane="friends"]');if(p&&!p.hidden)draw()},4000);
  document.addEventListener("click",()=>setTimeout(draw,300));
})();
