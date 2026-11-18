/* ================= panes: calmer, more visual sub-pages (Nov 2026) =================
   Every sub-page (Learn / Practice / Compete / Career) now opens with a short visual banner
   (icon, one line, live stat chips and an XP hint) instead of a wall of text, tables and lists are tucked
   into "sub-sections" you can open, and long lists show the first 6 with a "Show all" button.
   Nothing is removed: every control still works, it's just one tap away.
   To turn all of this off, delete the <script src="js/panes.js"> line in index.html. */
(function(){
  const $=(s,r)=> (r||document).querySelector(s);
  const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));
  const num=s=>{const el=typeof s==="string"?$(s):s;return el?(el.textContent||"").trim():""};
  const keys=o=>Object.keys(o||{}).length;

  /* ---- icons (24px, stroke) ---- */
  const P={
    book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 5.5v16M9 8h6"/>',
    medal:'<circle cx="12" cy="9" r="5"/><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7"/>',
    layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    calc:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M14 12h2M8 16h2M14 16h2"/>',
    brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    chart:'<path d="M4 20V4M4 20h16"/><path d="m7 15 4-5 3 3 5-7"/>',
    bars:'<path d="M5 20V11M12 20V4M19 20v-6"/>',
    trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/>',
    flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    map:'<path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20zM9 4v13.5M15 6.5V20"/>',
    cal:'<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    building:'<path d="M4 21V5l8-2v18M12 9h8v12M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2"/>',
    star:'<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'
  };
  const svg=n=>`<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||P.star}</svg>`;

  /* ---- banner copy per pane. theme 0 blue, 1 green, 2 gold, 3 violet ---- */
  const bestCoffee=()=>{try{return (S.coffee||[]).reduce((m,h)=>Math.max(m,h.sc||0),0)}catch(e){return 0}};
  const C={
    learn:{
      tracks:{i:"book",t:0,h:"Tracks",l:"Short levels, one idea at a time. Clear them to earn stars.",c:()=>[["Levels",num("#sLevels")],["Stars",num("#sStars")]]},
      certs:{i:"medal",t:2,h:"Certifications",l:"Prove a skill once and keep the badge.",x:"+50 XP per cert",c:()=>[["Earned",keys(S.certs)]]},
      deals:{i:"layers",t:3,h:"Deal breakdowns",l:"Real deals, explained in plain English, with a quiz.",c:()=>[["Deals",num("#dealCount")]]},
      cheats:{i:"doc",t:1,h:"Cheat sheet",l:"The numbers and formulas to have in your head."}},
    practice:{
      interview:{i:"chat",t:0,h:"Mock interview",l:"One question at a time. Answer out loud or type, then get graded.",c:()=>[["Answered",num("#mockCount")]]},
      coffee:{i:"mic",t:1,h:"Coffee chat call",l:"A live voice call with a made-up banker. Keep their rapport up.",x:"+10 to +25 XP per call",c:()=>[["Calls",(S.coffee||[]).length],["Best",bestCoffee()?bestCoffee()+"/10":"—"]]},
      rapid:{i:"bolt",t:2,h:"Rapid Fire",l:"Beat the clock. Quick questions, big streaks.",c:()=>[["Best",num("#sRapid")]]},
      curve:{i:"target",t:3,h:"Curveballs",l:"The weird questions interviewers use to throw you off."},
      chal:{i:"calc",t:0,h:"Modeling challenges",l:"Fill in the cells like you would in Excel.",x:"+15 XP per solve",c:()=>[["Solved",keys(S.models)]]},
      cases:{i:"brief",t:1,h:"Practice cases",l:"Full deal cases, graded on a 100-point rubric.",x:"+25 XP, +25 more at 80+",c:()=>[["Tried",keys(S.casePractice)]]},
      lbo:{i:"chart",t:2,h:"LBO builder",l:"Move the sliders. Watch the returns change."},
      dcf:{i:"chart",t:3,h:"DCF builder",l:"Five-year projection, terminal value, football field."}},
    compete:{
      overview:{i:"trophy",t:2,h:"Your standing",l:"Rank, rivals and this week's Gauntlet.",c:()=>[["Title",num("#rankName")],["XP",num("#xpText")]]},
      case:{i:"flag",t:0,h:"Case Comp",l:"Same case for everyone. Best score wins."},
      boards:{i:"bars",t:3,h:"Leaderboards",l:"See where you stand against everyone."},
      club:{i:"users",t:1,h:"Club & duels",l:"Team up with your club or challenge a friend."},
      activity:{i:"clock",t:0,h:"Activity",l:"What your rivals and club have been up to."}},
    career:{
      road:{i:"map",t:1,h:"Roadmap",l:"From high school to offer, one step at a time.",c:()=>[["Done",num("#roadPct")]]},
      open:{i:"brief",t:0,h:"Openings",l:"Internships and programs that are open now."},
      apps:{i:"doc",t:3,h:"Applications",l:"Track every application in one place."},
      cal:{i:"cal",t:2,h:"Calendar",l:"Deadlines and recruiting dates."},
      net:{i:"users",t:1,h:"Networking",l:"Keep track of who you've talked to and who to follow up with."},
      res:{i:"doc",t:0,h:"Resume",l:"Upload it and get it checked line by line."},
      firms:{i:"building",t:3,h:"Firms",l:"Browse firms, pay and the career ladder."}}
  };

  const css=`.pn-hero{position:relative;display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 16px;margin:0 0 12px;border-radius:16px;color:#fff;overflow:hidden;background:linear-gradient(120deg,var(--g1),var(--g2))}
.pn-hero::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 92% -20%,rgba(255,255,255,.28),transparent 45%),radial-gradient(rgba(255,255,255,.14) 1px,transparent 1.5px) 0 0/14px 14px;opacity:.75;pointer-events:none}
.pn-hero>*{position:relative}
.pn-t0{--g1:#2448D8;--g2:#6B5CF0}.pn-t1{--g1:#13805A;--g2:#2BB38A}.pn-t2{--g1:#B9791A;--g2:#E6A93A}.pn-t3{--g1:#6A47E8;--g2:#B04FD6}
.pn-ic{flex:none;width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.pn-ic svg{width:28px;height:28px}
.pn-tx{flex:1;min-width:150px}.pn-tx h2{margin:0;font-size:18px;line-height:1.2;color:#fff;letter-spacing:0}.pn-tx p{margin:3px 0 0;font-size:13.5px;line-height:1.35;color:rgba(255,255,255,.9)}
.pn-chips{display:flex;gap:6px;flex-wrap:wrap}.pn-chip{display:flex;flex-direction:column;align-items:center;min-width:54px;padding:5px 10px;border-radius:10px;background:rgba(255,255,255,.18);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);line-height:1.1}
.pn-chip b{font-size:16px;font-weight:800}.pn-chip span{font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.85}
.pn-xp{display:inline-block;margin-top:7px;font-size:12px;font-weight:800;padding:3px 9px;border-radius:99px;background:rgba(255,255,255,.95);color:#1b2233;box-shadow:0 2px 6px rgba(0,0,0,.18)}
.pane>.hint,.pane .hint{font-size:13px;color:var(--ink-2);margin:0 0 10px}
[data-pane="interview"]>.pane-meta{display:none}
.pn-fold{margin:10px 0;border:1px solid var(--rule);border-radius:12px;background:var(--sheet,transparent);overflow:hidden}
.pn-fold>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;padding:11px 14px;font-weight:700;font-size:14px;color:var(--ink)}
.pn-fold>summary::-webkit-details-marker{display:none}
.pn-fold>summary::after{content:"";margin-left:auto;width:8px;height:8px;border-right:2px solid var(--ink-2);border-bottom:2px solid var(--ink-2);transform:rotate(45deg);transition:transform .2s}
.pn-fold[open]>summary::after{transform:rotate(-135deg)}
.pn-fold[open]>summary{border-bottom:1px solid var(--rule)}
.pn-fold>*:not(summary){margin:0;padding:12px 14px}
.pn-fold .label{display:none}
.pn-grid .chal-list,.pn-grid .case-past{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.pn-grid .chal-i,.pn-grid .case-pi{border:1px solid var(--rule);border-radius:14px;padding:14px;min-height:78px;transition:transform .15s,box-shadow .15s;background:var(--sheet,transparent)}
.pn-grid .chal-i:hover,.pn-grid .case-pi:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(20,30,60,.12)}
.pn-grid .chal-i.done{border-color:var(--good);background:color-mix(in srgb,var(--good) 8%,transparent)}
.pn-cap:not(.pn-all) .chal-list>:nth-child(n+7),.pn-cap:not(.pn-all) .case-past>:nth-child(n+7){display:none!important}
.pn-more{display:block;width:100%;margin:10px 0 0;padding:10px;border:1px dashed var(--rule);border-radius:12px;background:none;color:var(--cobalt);font-weight:700;font-size:14px;cursor:pointer}
.pn-tabs{display:flex;gap:8px;overflow-x:auto;padding:2px 1px 10px;margin:0 0 2px;scrollbar-width:none}.pn-tabs::-webkit-scrollbar{display:none}
.pn-tabs button{flex:none;display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:99px;border:1px solid var(--rule);background:var(--sheet,transparent);color:var(--ink-2);font:600 13.5px var(--body,inherit);cursor:pointer;transition:background .15s,color .15s,transform .1s}
.pn-tabs button:active{transform:scale(.96)}
.pn-tabs button[aria-pressed="true"]{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.pn-acc>:first-child{cursor:pointer;display:flex;align-items:center;gap:8px;user-select:none}
.pn-acc>:first-child::after{content:"";margin-left:auto;width:8px;height:8px;border-right:2px solid var(--ink-2);border-bottom:2px solid var(--ink-2);transform:rotate(-135deg);transition:transform .2s;flex:none}
.pn-acc.pn-c>:first-child::after{transform:rotate(45deg)}
.pn-acc.pn-c>:not(:first-child){display:none!important}
.pn-acc{border:1px solid var(--rule);border-radius:14px;padding:12px 14px;margin:0 0 10px;background:var(--sheet,transparent)}
[data-pn-x]{display:none!important}
.pn-ft{margin:0 0 6px}.pn-ft>summary{cursor:pointer;list-style:none;text-align:center;font-weight:700;font-size:14px;color:var(--cobalt);padding:10px}
.pn-ft>summary::-webkit-details-marker{display:none}
@media(max-width:560px){.pn-hero{padding:12px}.pn-ic{width:44px;height:44px}.pn-chips{width:100%}.pn-chip{flex:1}}
@media(prefers-reduced-motion:reduce){.pn-grid .chal-i,.pn-grid .case-pi,.pn-fold>summary::after{transition:none}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  /* ---- banner ---- */
  function heroHTML(c){let chips="";try{chips=(c.c?c.c():[]).filter(x=>x[1]!==""&&x[1]!==undefined&&x[1]!==null).map(([k,v])=>`<div class="pn-chip"><b>${String(v).replace(/[<>&]/g,"")}</b><span>${k}</span></div>`).join("")}catch(e){}
    return `<div class="pn-hero pn-t${c.t||0}${c.x?" pn-has-x":""}" data-pn-hero><div class="pn-ic">${svg(c.i)}</div><div class="pn-tx"><h2>${c.h}</h2><p>${c.l}</p>${c.x?`<span class="pn-xp">${c.x}</span>`:""}</div>${chips?`<div class="pn-chips">${chips}</div>`:""}</div>`}
  function ensureHero(pane,c){let h=pane.querySelector(":scope>[data-pn-hero]");const html=heroHTML(c);
    if(!h){pane.insertAdjacentHTML("afterbegin",html);return}
    const tmp=document.createElement("div");tmp.innerHTML=html;const n=tmp.firstChild;
    if(h.innerHTML!==n.innerHTML)h.innerHTML=n.innerHTML}

  /* ---- sub-sections ---- */
  function fold(el,title,open){if(!el||el.dataset.pn)return;el.dataset.pn="1";
    const els=[el];const pv=el.previousElementSibling;let t=title;
    if(pv&&pv.classList.contains("label")&&!pv.dataset.pn){pv.dataset.pn="1";els.unshift(pv);t=t||pv.textContent.trim()}
    const d=document.createElement("details");d.className="pn-fold";if(open)d.open=true;d.innerHTML=`<summary>${t}</summary>`;
    el.parentNode.insertBefore(d,els[0]);els.forEach(x=>d.appendChild(x))}

  function cap(pane,container){if(!pane||!container||pane.dataset.pnCap)return;pane.dataset.pnCap="1";
    pane.classList.add("pn-grid","pn-cap");
    const b=document.createElement("button");b.type="button";b.className="pn-more";b.hidden=true;container.after(b);
    const upd=()=>{const n=container.querySelectorAll(".chal-list>*,.case-past>*").length;b.hidden=n<=6;b.textContent=pane.classList.contains("pn-all")?"Show fewer":`Show all ${n}`};
    b.onclick=()=>{pane.classList.toggle("pn-all");upd()};
    new MutationObserver(upd).observe(container,{childList:true,subtree:true});upd()}

  /* ---- one page at a time: groups used to stack 3-4 panes on one screen (Drills = Rapid + Curveballs + Interview + Coffee).
     Now each group gets a row of tabs and shows only the selected pane. ---- */
  const SEL={};
  const TABLBL={rapid:["bolt","Rapid Fire"],curve:["target","Curveballs"],interview:["chat","Interview"],coffee:["mic","Coffee chat"],dcf:["chart","DCF"],lbo:["chart","LBO"],chal:["calc","Modeling"],overview:["trophy","Standing"],boards:["bars","Leaderboards"],open:["brief","Openings"],cal:["cal","Calendar"],apps:["doc","Applications"]};
  const small=n=>`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||P.star}</svg>`;
  function refine(v,gid){try{
    if(typeof GROUPS==="undefined"||typeof paneEl!=="function"||typeof viewEl!=="function")return;
    const g=GROUPS[v]&&GROUPS[v].find(x=>x[0]===gid);const view=viewEl(v);if(!g||!view)return;
    const allowed=g[2].filter(pid=>paneEl(pid)&&paneAllowed(v,pid));
    view.querySelectorAll(".pn-tabs").forEach(r=>{if(r.dataset.g!==gid||allowed.length<2)r.remove()});
    if(allowed.length<2)return;
    const key=v+":"+gid;let sel=SEL[key];if(!allowed.includes(sel))sel=allowed[0];SEL[key]=sel;
    allowed.forEach(pid=>{paneEl(pid).hidden=pid!==sel});
    view.querySelectorAll(".grp-h").forEach(h=>h.hidden=true);
    let row=view.querySelector(`.pn-tabs[data-g="${gid}"]`);
    if(!row){row=document.createElement("div");row.className="pn-tabs";row.dataset.g=gid;row.setAttribute("role","tablist");const nav=view.querySelector(".subnav");if(nav)nav.after(row);else view.prepend(row)}
    const html=allowed.map(pid=>{const [ic,lb]=TABLBL[pid]||["star",pid];return `<button type="button" role="tab" data-pid="${pid}" aria-pressed="${pid===sel}">${small(ic)}<span>${lb}</span></button>`}).join("");
    if(row.dataset.sig!==html){row.dataset.sig=html;row.innerHTML=html;
      row.querySelectorAll("button").forEach(b=>b.onclick=()=>{SEL[key]=b.dataset.pid;refine(v,gid);
        if(b.dataset.pid==="dcf"||b.dataset.pid==="lbo"){if(typeof drawTools==="function")setTimeout(()=>{try{drawTools()}catch(e){}},0)}
        tick()})}
  }catch(e){console.warn("panes tabs",e)}}
  if(typeof showGroupPanes==="function"){const _sg=showGroupPanes;showGroupPanes=function(v,gid,quiet){_sg(v,gid,quiet);refine(v,gid)}}
  if(typeof openGroup==="function"){const _og=openGroup;openGroup=function(v,gid,sc){const g=typeof GROUPS!=="undefined"&&GROUPS[v]&&GROUPS[v].find(x=>x[0]===gid);if(sc&&g&&g[2].includes(sc))SEL[v+":"+gid]=sc;return _og(v,gid,sc)}}
  setTimeout(()=>{try{if(typeof applyGroups==="function")applyGroups()}catch(e){}},300);

  /* ---- accordion (state survives re-renders) ---- */
  const ACC={};
  function accordion(id,root,itemSel,openFirst){const box=typeof root==="string"?$(root):root;if(!box)return;
    const st=ACC[id]||(ACC[id]={open:new Set(),touched:false});
    if(!box.dataset.pnAccBound){box.dataset.pnAccBound="1";
      box.addEventListener("click",e=>{const it=e.target.closest(itemSel);if(!it||!box.contains(it))return;const hd=it.firstElementChild;if(!hd||!hd.contains(e.target))return;
        const k=hd.textContent.trim();it.classList.toggle("pn-c");st.touched=true;if(it.classList.contains("pn-c"))st.open.delete(k);else st.open.add(k)})}
    $$(itemSel,box).forEach((it,i)=>{if(it.dataset.pnAcc)return;it.dataset.pnAcc="1";it.classList.add("pn-acc");
      const k=it.firstElementChild?it.firstElementChild.textContent.trim():String(i);
      const open=st.touched?st.open.has(k):(openFirst&&i<openFirst);if(open)st.open.add(k);if(!open)it.classList.add("pn-c")})}

  /* ---- show first N of a re-rendering list, with a Show all button ---- */
  const CAPX={};
  function capx(id,root,itemSel,n){const box=typeof root==="string"?$(root):root;if(!box)return;
    let c=CAPX[id];
    if(!c){c=CAPX[id]={all:false,btn:document.createElement("button")};c.btn.type="button";c.btn.className="pn-more";c.btn.hidden=true;
      c.btn.onclick=()=>{c.all=!c.all;mark()};box.after(c.btn);
      c.mo=new MutationObserver(()=>mark());c.mo.observe(box,{childList:true,subtree:false})}
    function mark(){c.mo.disconnect();const items=$$(itemSel,box);items.forEach((it,i)=>{if(!c.all&&i>=n)it.setAttribute("data-pn-x","");else it.removeAttribute("data-pn-x")});
      c.btn.hidden=items.length<=n;c.btn.textContent=c.all?"Show fewer":`Show all ${items.length}`;c.mo.observe(box,{childList:true,subtree:false})}
    mark()}

  function foldFooter(){const f=$(".ft-cols");if(!f||f.dataset.pn)return;f.dataset.pn="1";
    const d=document.createElement("details");d.className="pn-ft";d.innerHTML="<summary>More guides, tools &amp; links</summary>";f.parentNode.insertBefore(d,f);d.appendChild(f)}

  function setup(){
    Object.keys(C).forEach(view=>{const root=$(`[data-view="${view}"]`);if(!root)return;
      Object.keys(C[view]).forEach(sub=>{const pane=$(`[data-pane="${sub}"]`,root);if(pane)ensureHero(pane,C[view][sub])})});
    // practice: tuck tables, rankings and long lists into sub-sections
    // practice, page by page: keep the main action on screen, tuck the rest one tap away
    fold($("#weakCard"),"🎯 Weak-spot drill");
    fold($("#toolkitCard"),"📊 Your stats & toolkit");
    const cb=$("#curve .cb-meta");if(cb)cb.setAttribute("data-pn-x","1");
    fold($("#emBox"),"📬 Free weekly curveball email");
    fold($("#cbSprint"),"⚡ 60-second mental math sprint");
    const bt=[...document.querySelectorAll("#curve .cb-card")].find(x=>!x.id&&!x.dataset.pn&&/brainteaser/i.test(x.textContent));fold(bt,"🧠 Brainteasers & estimates");
    fold($("#sdCard"),"🎓 Superday simulator");
    fold($('[data-pane="interview"] .mock-grid'),"Pick a different question");
    ["dcf","lbo"].forEach(k=>fold($(`[data-pane="${k}"]>p.hint`),"How this model works"));
    {const ff=$("#ffChart");if(ff&&!ff.dataset.pnFf){ff.dataset.pnFf="1";const lb=ff.previousElementSibling;const nx=ff.nextElementSibling;
      const d=document.createElement("details");d.className="pn-fold";d.innerHTML="<summary>📊 Football field: valuation range</summary>";ff.parentNode.insertBefore(d,lb&&lb.classList.contains("label")?lb:ff);
      [lb&&lb.classList.contains("label")?lb:null,ff,nx&&nx.tagName==="P"?nx:null].filter(Boolean).forEach(x=>d.appendChild(x))}}
    fold($('[data-view="home"] .lw'),'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="vertical-align:-2px;margin-right:6px"><path d="M4 4h12v16H6a2 2 0 0 1-2-2z"/><path d="M16 8h4v10a2 2 0 0 1-2 2"/><path d="M8 8h4M8 12h4M8 16h4"/></svg>Live this week');
    fold($("#lb"),"🏆 Top players");
    fold($("#lboTbl"),"Year-by-year table");
    fold($("#dcfTbl"),"Projection table");
    fold($("#sensTbl"),"Sensitivity: enterprise value");
    cap($('[data-pane="chal"]'),$("#chal"));
    cap($('[data-pane="cases"]'),$("#pcases"));
    accordion("openings","#openings",".op-sec",1);
    capx("firms","#firmGrid","article.firm",9);
    capx("deals","#deals",":scope>details.deal",5);
    fold($("#ddb"),"Deal database: search every big deal");
    foldFooter();
  }
  const tick=()=>{try{setup()}catch(e){console.warn("panes",e)}};
  // panes render after boot and re-render on tab changes, so re-check lightly while a pane is on screen
  setTimeout(tick,500);
  setInterval(()=>{if(!document.hidden)tick()},1500);
  document.addEventListener("click",()=>setTimeout(tick,250),true);
})();
