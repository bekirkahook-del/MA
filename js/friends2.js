/* Leaderboard + Friends polish (Bekir, Nov 24, 2026: "leaderboard section is shit", "friends section still is bad").
   Styles for the leaderboard podium + "you" card (rendered in app.js renderCompete), and the Friends tab reorder. */
(function(){
  const st=document.createElement("style");st.textContent=`
.bd-you{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;border:1px solid color-mix(in srgb,var(--cobalt) 35%,var(--rule));background:color-mix(in srgb,var(--cobalt) 7%,var(--sheet));border-radius:10px;padding:12px 14px;margin:0 0 14px}
.bd-you>b{font-size:17px;color:var(--ink)}.bd-you span{font-size:14px;color:var(--ink-2)}.bd-you span b{color:var(--ink)}
.bd-pod{display:grid;grid-template-columns:1fr 1.15fr 1fr;align-items:end;gap:10px;margin:0 0 16px}
.bd-pp{display:flex;flex-direction:column;align-items:center;gap:6px;font:inherit;background:none;border:0;cursor:pointer;color:var(--ink);padding:0;min-width:0}
.bd-pp>b{font-size:14px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bd-v{font-family:var(--mono);font-size:12.5px;color:var(--ink-2)}
.bd-step{display:grid;place-items:center;width:100%;border-radius:10px 10px 4px 4px;font:800 22px var(--mono);color:#fff}
.bd-pp.p1 .bd-step{height:84px;background:linear-gradient(#e7b93b,#c9961d)}.bd-pp.p2 .bd-step{height:62px;background:linear-gradient(#b9c2d0,#8f9bb0)}.bd-pp.p3 .bd-step{height:48px;background:linear-gradient(#d39a6a,#a96f42)}
.bd-pp:hover .bd-step{filter:brightness(1.08)}
.bd-pp.p1 .av{box-shadow:0 0 0 3px #e7b93b}
.fr-school-moved{margin-top:24px}
@media(prefers-reduced-motion:no-preference){.bd-pp .bd-step{animation:bdUp .5s ease backwards}.bd-pp.p1 .bd-step{animation-delay:.12s}@keyframes bdUp{from{transform:scaleY(.2);transform-origin:bottom}}}`;
  document.head.appendChild(st);
  /* Friends tab order: your friends, then finding people, then your school's card (it used to sit on top) */
  function order(){const pane=document.querySelector('[data-pane="friends"]');if(!pane)return;const fp=document.getElementById("friendsPage"),pp=document.getElementById("people");if(!fp)return;
    if(pane.firstElementChild!==fp)pane.insertBefore(fp,pane.firstElementChild);if(pp&&fp.nextElementSibling!==pp)fp.after(pp);
    [...pane.children].filter(x=>x!==fp&&x!==pp&&!x.classList.contains("fr-school-moved")).forEach(x=>{x.classList.add("fr-school-moved");pane.appendChild(x)})}
  (function hook(n){if(typeof renderFriends!=="function"){if(n<40)setTimeout(()=>hook(n+1),250);return}if(renderFriends.__ord)return;
    const o=renderFriends;renderFriends=function(){const r=o.apply(this,arguments);try{order()}catch(e){}return r};renderFriends.__ord=1;try{order()}catch(e){}})(0);
  new MutationObserver(()=>{try{const pane=document.querySelector('[data-pane="friends"]');if(pane&&pane.firstElementChild&&pane.firstElementChild.id!=="friendsPage")order()}catch(e){}}).observe(document.body,{childList:true,subtree:true});
})();
