/* M&A notifications: connect invites + accepted invites (bell, badge, toast, tab title, optional browser alerts) */
(function(){
  if(!window.MA_AUTH)return;
  const KEY="ma-notif-v1";
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}};
  const store=d=>{try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}};
  let N=load();N.seen=N.seen||{};N.conn=N.conn||null;N.items=N.items||[];
  const baseTitle=document.title;let lastPlayers=null,lastFollows="",first=true,open=false;

  const st=document.createElement("style");st.textContent=`
.nbell{position:relative;background:none;border:0;padding:0;width:30px;height:30px;display:grid;place-items:center;color:var(--ink-2);cursor:pointer;border-radius:50%;transition:color .2s,background .2s}
.nbell:hover{color:var(--ink);background:var(--paper)}
.nbell b{position:absolute;top:-2px;right:-3px;min-width:17px;height:17px;padding:0 4px;border-radius:9px;background:#e5484d;color:#fff;font-size:10.5px;font-weight:700;display:grid;place-items:center;line-height:1;box-shadow:0 0 0 2px var(--sheet);animation:nPop .35s cubic-bezier(.2,1.4,.4,1) both}
.nbell b[hidden]{display:none}
.npanel{position:fixed;z-index:9000;width:min(360px,calc(100vw - 24px));max-height:min(480px,70vh);overflow:auto;background:var(--sheet);color:var(--ink);border:1px solid var(--rule);border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,.18);animation:nIn .18s ease both}
.npanel h3{margin:0;padding:14px 16px 10px;font-family:var(--body);font-size:16px;font-weight:700;text-transform:none;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--rule)}
.npanel h3 button{background:none;border:0;font:inherit;font-size:12.5px;font-weight:500;color:var(--cobalt);cursor:pointer;padding:0}
.n-row{display:flex;gap:10px;align-items:center;padding:11px 16px;border-bottom:1px solid var(--rule);font-size:13.5px;line-height:1.4}
.n-row.new{background:color-mix(in srgb,var(--cobalt) 7%,transparent)}
.n-row .n-t{flex:1;min-width:0;cursor:pointer}
.n-row .n-t small{display:block;font-size:11.5px;color:var(--ink-2)}
.n-row .btn{flex:none}
.n-empty{padding:26px 16px;text-align:center;font-size:13.5px;color:var(--ink-2)}
.n-foot{padding:10px 16px;font-size:12.5px;color:var(--ink-2);display:flex;justify-content:space-between;gap:8px;align-items:center}
.n-foot button{background:none;border:0;font:inherit;font-size:12.5px;color:var(--cobalt);cursor:pointer;padding:0}
@keyframes nPop{from{transform:scale(.3)}to{transform:scale(1)}}
@keyframes nIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}`;document.head.appendChild(st);

  const ago=t=>{const s=Math.max(1,Math.round((Date.now()-t)/1000));return s<60?"just now":s<3600?Math.floor(s/60)+"m ago":s<86400?Math.floor(s/3600)+"h ago":Math.floor(s/86400)+"d ago"};
  const nm=id=>{try{return realName(id)||"Someone"}catch(e){return"Someone"}};
  const ok=()=>typeof PLAYERS!=="undefined"&&typeof myId!=="undefined"&&myId&&typeof dbState!=="undefined"&&dbState==="on"&&typeof pplRel==="function";

  function compute(){
    const others=PLAYERS.filter(p=>p.id!==myId);
    const inc=others.filter(p=>pplRel(p)==="incoming").map(p=>p.id);
    const conn=others.filter(p=>pplRel(p)==="connected").map(p=>p.id);
    const fresh=[];const now=Date.now();
    inc.forEach(id=>{if(!N.items.some(x=>x.k==="inv"&&x.id===id)){const it={k:"inv",id,at:now};N.items.unshift(it);fresh.push(it)}});
    if(N.conn){const was=new Set(N.conn);
      conn.forEach(id=>{if(!was.has(id)){const mineAccepted=N.items.some(x=>x.k==="inv"&&x.id===id);
        if(!mineAccepted&&!N.items.some(x=>x.k==="acc"&&x.id===id)){const it={k:"acc",id,at:now};N.items.unshift(it);fresh.push(it)}}})}
    N.conn=conn;
    const cinv=typeof maClubInvites==="function"?maClubInvites():[];
    cinv.forEach(c=>{if(!N.items.some(x=>x.k==="club"&&x.id===c.code)){const it={k:"club",id:c.code,from:c.from,name:c.name,at:now};N.items.unshift(it);fresh.push(it)}});
    /* drop invites that were withdrawn or already handled long ago; keep 30 items */
    N.items=N.items.filter(x=>(x.k!=="inv"||inc.includes(x.id)||conn.includes(x.id))&&(x.k!=="club"||cinv.some(c=>c.code===x.id)||(S.club&&S.club.code===x.id))).slice(0,30);
    store(N);return fresh}

  const unseen=()=>N.items.filter(x=>!N.seen[x.k+x.id]&&(x.k!=="inv"||PLAYERS.some(p=>p.id===x.id&&pplRel(p)==="incoming"))&&(x.k!=="club"||!(S.club&&S.club.code===x.id)));
  function paint(){const b=document.querySelector("#nBell b");if(!b)return;const n=unseen().length;
    b.hidden=!n;b.textContent=n>9?"9+":n;document.title=(n?`(${n}) `:"")+baseTitle;
    if(open)drawPanel()}

  function alertFor(items){if(!items.length)return;
    const it0=items[0],msg=items.length>1?`${items.length} new notifications`:it0.k==="inv"?`${nm(it0.id)} wants to connect`:it0.k==="club"?`${nm(it0.from)} invited you to join ${it0.name}`:`${nm(it0.id)} accepted your invite`;
    try{toast(msg)}catch(e){}
    try{if(document.hidden&&"Notification"in window&&Notification.permission==="granted"){const n=new Notification("M&A Prep",{body:msg,tag:"ma-notif",icon:document.querySelector('link[rel="icon"]')?.href});n.onclick=()=>{window.focus();openPanel()}}}catch(e){}}

  function drawPanel(){const pn=document.querySelector(".npanel");if(!pn)return;
    const rows=N.items.map(x=>{if(x.k==="club"){const inIt=S.club&&S.club.code===x.id,isNew=!N.seen[x.k+x.id];
        return `<div class="n-row${isNew?" new":""}">${typeof avatar==="function"?avatar(x.from,nm(x.from),34):""}<div class="n-t" data-nclub="1">${inIt?`You joined <b>${esc(x.name)}</b>`:`<b>${esc(nm(x.from))}</b> invited you to join <b>${esc(x.name)}</b>`}<small>${ago(x.at)}</small></div>${inIt?"":`<button class="btn sm" data-njoin="${esc(x.id)}">Join</button>`}</div>`}
      const p=PLAYERS.find(q=>q.id===x.id),rel=p?pplRel(p):"none",isNew=!N.seen[x.k+x.id];
      const txt=x.k==="inv"?(rel==="connected"?`You and <b>${esc(nm(x.id))}</b> are now connected`:`<b>${esc(nm(x.id))}</b> wants to connect`):`<b>${esc(nm(x.id))}</b> accepted your invite`;
      const act=x.k==="inv"&&rel==="incoming"?`<button class="btn sm" data-nacc="${esc(x.id)}">Accept</button>`:"";
      return `<div class="n-row${isNew?" new":""}">${typeof avatar==="function"?avatar(x.id,nm(x.id),34):""}<div class="n-t" data-nopen="${esc(x.id)}">${txt}<small>${ago(x.at)}</small></div>${act}</div>`}).join("");
    const canAsk="Notification"in window&&Notification.permission==="default";
    pn.innerHTML=`<h3>Notifications${N.items.length?`<button id="nClear">Clear all</button>`:""}</h3>${rows||`<div class="n-empty">No notifications yet.<br>Connect and club invites will show up here.</div>`}
      <div class="n-foot"><button id="nFind">Find people →</button>${canAsk?`<button id="nAsk">Turn on alerts</button>`:""}</div>`;
    pn.querySelectorAll("[data-nacc]").forEach(b=>b.onclick=e=>{e.stopPropagation();pplToggle(b.dataset.nacc,true);try{toast(`You're now connected with ${nm(b.dataset.nacc).split(" ")[0]}`)}catch(x){}setTimeout(()=>{compute();paint()},50)});
    pn.querySelectorAll("[data-nopen]").forEach(b=>b.onclick=()=>{const p=PLAYERS.find(q=>q.id===b.dataset.nopen);closePanel();if(p&&typeof showPlayer==="function")showPlayer(p)});
    pn.querySelectorAll("[data-njoin]").forEach(b=>b.onclick=e=>{e.stopPropagation();const it=N.items.find(x=>x.k==="club"&&x.id===b.dataset.njoin);if(it&&typeof maJoinClub==="function")maJoinClub(it.id,it.name);drawPanel()});
    pn.querySelectorAll("[data-nclub]").forEach(b=>b.onclick=()=>{closePanel();try{showSub("compete","club")}catch(e){}});
    const cl=pn.querySelector("#nClear");if(cl)cl.onclick=()=>{N.items=N.items.filter(x=>(x.k==="inv"&&PLAYERS.some(p=>p.id===x.id&&pplRel(p)==="incoming"))||(x.k==="club"&&!(S.club&&S.club.code===x.id)));store(N);drawPanel();paint()};
    pn.querySelector("#nFind").onclick=()=>{closePanel();try{showSub("compete","friends")}catch(e){}};
    const ask=pn.querySelector("#nAsk");if(ask)ask.onclick=async()=>{try{await Notification.requestPermission()}catch(e){}drawPanel()}}

  function openPanel(){if(open)return;open=true;const bell=document.querySelector("#nBell");const pn=document.createElement("div");pn.className="npanel";pn.setAttribute("role","dialog");pn.setAttribute("aria-label","Notifications");document.body.appendChild(pn);
    const r=bell.getBoundingClientRect();const w=Math.min(360,innerWidth-24);pn.style.top=(r.bottom+8)+"px";pn.style.left=Math.max(12,Math.min(innerWidth-12-w,r.right+8-w))+"px";
    drawPanel();bell.setAttribute("aria-expanded","true");
    setTimeout(()=>{N.items.forEach(x=>N.seen[x.k+x.id]=1);store(N);const b=document.querySelector("#nBell b");if(b)b.hidden=true;document.title=baseTitle},400)}
  function closePanel(){open=false;document.querySelectorAll(".npanel").forEach(p=>p.remove());const bell=document.querySelector("#nBell");if(bell)bell.setAttribute("aria-expanded","false");paint()}
  document.addEventListener("mousedown",e=>{if(open&&!e.target.closest(".npanel")&&!e.target.closest("#nBell"))closePanel()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&open)closePanel()});
  window.addEventListener("resize",()=>{if(open)closePanel()});

  MA_AUTH.ready.then(s=>{if(!s)return;const top=document.querySelector(".top-r");if(!top)return;
    const bell=document.createElement("button");bell.id="nBell";bell.className="nbell";bell.type="button";bell.setAttribute("aria-label","Notifications");bell.setAttribute("aria-expanded","false");
    bell.innerHTML='<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg><b hidden></b>';
    bell.onclick=()=>open?closePanel():openPanel();
    const av=document.querySelector("#avBtn");av&&av.parentNode===top?top.insertBefore(bell,av):top.appendChild(bell);
    setInterval(()=>{if(!ok())return;const f=JSON.stringify([(S&&S.profile&&S.profile.follows)||[],(S.club&&S.club.code)||"",S.clubNo||[]]);
      if(PLAYERS===lastPlayers&&f===lastFollows)return;lastPlayers=PLAYERS;lastFollows=f;
      const fresh=compute();if(first){first=false;const u=unseen();if(u.length)alertFor(u)}else alertFor(fresh);paint()},1500)});
})();
