/* Club tags on profiles (Bekir, Nov 21, 2026: "People can add club tags to their profile based on their school,
   like BCI Buckeye Capital Investors").
   - Picker suggests the clubs/programs listed in their school's guide (schoolplan.js SCH via maSchoolFind), plus a
     free-text box for anything missing. Up to 6 tags, 50 characters each.
   - Saved in S.profile.clubs, published with the profile (myStats -> players doc), shown as tags under the
     name/school on every profile card. Others' tags are shown read-only. */
(function(){
  const MAX=6,LEN=50;
  const st=document.createElement("style");
  st.textContent=`.ct-row{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}
.ct-tag{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:600;color:var(--cobalt,#2448D8);background:color-mix(in srgb,var(--cobalt,#2448D8) 9%,transparent);border:1px solid color-mix(in srgb,var(--cobalt,#2448D8) 28%,transparent);border-radius:999px;padding:3px 10px}
.ct-add{font:inherit;font-size:12.5px;font-weight:600;color:var(--ink-2);background:none;border:1px dashed var(--rule);border-radius:999px;padding:3px 10px;cursor:pointer}
.ct-pick{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
.ct-pick button{font:inherit;font-size:14px;border:1px solid var(--rule);background:var(--sheet);color:var(--ink);border-radius:999px;padding:8px 13px;cursor:pointer;min-height:40px;text-align:left}
.ct-pick button[aria-pressed=true]{background:var(--cobalt,#2448D8);border-color:var(--cobalt,#2448D8);color:#fff}
.ct-other{display:flex;gap:8px;margin-top:6px}.ct-other input,.ct-sch input{flex:1;min-width:0;font:inherit;font-size:16px;padding:10px 12px;border:1px solid var(--rule);border-radius:6px;background:var(--paper);color:var(--ink)}
.ct-sch{display:flex;gap:8px;margin:10px 0}`;
  document.head.appendChild(st);
  const E=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const clean=s=>String(s||"").replace(/[<>]/g,"").replace(/\s+/g," ").trim().slice(0,LEN);
  const ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const NOT_CLUB=/^where |competition|\bcup\b|center for|career(s)? (center|office)|guide/i;
  /* the school's clubs from its guide: "Buckeye Capital Investors (BCI)" etc. */
  function schoolClubs(school){try{const r=window.maSchoolFind&&maSchoolFind(school);if(!r)return {name:"",clubs:[]};
      return {name:r[0],clubs:(r[2]||[]).map(clean).filter(c=>c&&!NOT_CLUB.test(c))}}catch(e){return {name:"",clubs:[]}}}
  const mine=()=>{try{return ((S.profile&&S.profile.clubs)||[]).map(clean).filter(Boolean).slice(0,MAX)}catch(e){return []}};

  /* publish with the profile */
  (function hookStats(n){if(typeof myStats!=="function"){if(n<40)setTimeout(()=>hookStats(n+1),250);return}if(myStats.__ct)return;
    const o=myStats;myStats=function(){const r=o.apply(this,arguments);try{const c=mine();if(c.length)r.clubs=c}catch(e){}return r};myStats.__ct=1})(0);

  function picker(){const prof=S.profile=S.profile||{};let sel=new Set(mine());
    const draw=()=>{const sc=schoolClubs(prof.school||"");const sugg=[...new Set(sc.clubs.concat([...sel]))];
      openPanel(`<div class="label">Profile</div><h2>Your clubs</h2>
        <p class="sub">${sc.name?`Clubs and programs at <b>${E(sc.name)}</b>. Tap the ones you're in.`:"Add your school to see its clubs, or type yours below."}</p>
        ${sc.name?"":`<div class="ct-sch"><input id="ctSch" list="ctSchL" placeholder="Your school" value="${E(prof.school||"")}" autocomplete="organization"><datalist id="ctSchL">${(window.maSchoolNames||[]).map(n=>`<option value="${E(n)}">`).join("")}</datalist><button class="btn" id="ctSchGo" type="button">Show clubs</button></div>`}
        <div class="ct-pick">${sugg.map(c=>`<button type="button" data-ctc="${E(c)}" aria-pressed="${sel.has(c)}">${E(c)}</button>`).join("")||""}</div>
        <div class="ct-other"><input id="ctOther" maxlength="${LEN}" placeholder="Add another club (e.g. Women in Finance)"><button class="ghost outline" id="ctAdd" type="button">Add</button></div>
        <p class="note" id="ctNote">${sel.size}/${MAX} selected. Tags show on your public profile.</p>
        <div class="actions"><button class="btn" id="ctSave" type="button">Save clubs</button></div>`);
      const note=document.getElementById("ctNote");const upd=()=>{note.textContent=`${sel.size}/${MAX} selected. Tags show on your public profile.`};
      document.querySelectorAll("#overlay [data-ctc]").forEach(b=>b.onclick=()=>{const c=b.dataset.ctc;if(sel.has(c))sel.delete(c);else{if(sel.size>=MAX){note.textContent=`You can add up to ${MAX}.`;return}sel.add(c)}b.setAttribute("aria-pressed",sel.has(c));upd()});
      const addOther=()=>{const i=document.getElementById("ctOther");const c=clean(i.value);if(!c)return;if(sel.size>=MAX){note.textContent=`You can add up to ${MAX}.`;return}sel.add(c);ev("clubtag_custom");draw()};
      document.getElementById("ctAdd").onclick=addOther;document.getElementById("ctOther").onkeydown=e=>{if(e.key==="Enter"){e.preventDefault();addOther()}};
      const sg=document.getElementById("ctSchGo");if(sg)sg.onclick=()=>{const v=clean(document.getElementById("ctSch").value);if(!v)return;const r=window.maSchoolFind&&maSchoolFind(v);prof.school=(r&&r[0])||v;try{save()}catch(e){}draw()};
      document.getElementById("ctSave").onclick=()=>{prof.clubs=[...sel].slice(0,MAX);try{save()}catch(e){}try{syncProfile()}catch(e){}ev("clubtags_saved");
        try{toast(prof.clubs.length?`Saved ${prof.clubs.length} club${prof.clubs.length>1?"s":""} to your profile`:"Clubs cleared")}catch(e){}
        try{closePanel();showPlayer({id:(typeof myId!=="undefined"&&myId)||"me"})}catch(e){}}};
    draw();ev("clubtags_open")}
  window.maClubTags=picker;

  /* show tags on every profile card (own card gets an edit button) */
  (function hookCard(n){if(typeof showPlayer!=="function"){if(n<40)setTimeout(()=>hookCard(n+1),250);return}if(showPlayer.__ct)return;
    const o=showPlayer;showPlayer=function(p){const r=o.apply(this,arguments);try{
        const me=(typeof myId!=="undefined"&&myId)||null;const isMe=!p||p.id==="me"||(!!me&&p.id===me);const tags=(isMe?mine():((p&&p.clubs)||[]).map(clean).filter(Boolean).slice(0,MAX));
        const id=document.querySelector("#overlay .li-id");if(id&&!id.querySelector(".ct-row")&&(tags.length||isMe)){
          const row=document.createElement("div");row.className="ct-row";row.setAttribute("aria-label","Clubs");
          row.innerHTML=tags.map(t=>`<span class="ct-tag">${E(t)}</span>`).join("")+(isMe?`<button class="ct-add" type="button" id="ctEdit">${tags.length?"Edit clubs":"+ Add your clubs"}</button>`:"");
          const meta=id.querySelector(".li-meta")||id.querySelector(".li-headline");(meta||id.firstChild).after(row);
          const b=row.querySelector("#ctEdit");if(b)b.onclick=picker}}catch(e){}return r};showPlayer.__ct=1})(0);
})();
