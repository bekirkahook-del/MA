/* UX polish: skeleton loaders, optimistic updates, command menu extras, shortcut hints.
   Self-contained. Loads after app.js; touches nothing in it except by public globals (showTab, openPalette, $). */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s)};
  var MAC=/Mac|iPhone|iPad/.test(navigator.platform||"");

  /* ---------- styles ---------- */
  var css=document.createElement("style");
  css.textContent=
    ".skel{display:block;border-radius:4px;background:linear-gradient(90deg,var(--rule) 25%,color-mix(in srgb,var(--rule) 45%,var(--sheet)) 50%,var(--rule) 75%);background-size:200% 100%;animation:skelSh 1.2s linear infinite}"+
    "@keyframes skelSh{to{background-position:-200% 0}}"+
    ".skel-wrap{display:grid;gap:10px;padding:4px 0}"+
    ".skel-row{display:flex;gap:10px;align-items:center}"+
    ".skel-row .skel:first-child{width:22px;height:22px;border-radius:50%;flex:none}"+
    ".skel-row .skel+.skel{height:14px;flex:1}"+
    "html.calm .skel{animation:none}@media (prefers-reduced-motion:reduce){.skel{animation:none}}"+
    ".ux-toast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--ink);color:var(--paper);padding:10px 16px;border-radius:4px;font-size:14px;z-index:9999;box-shadow:0 10px 30px rgba(0,0,0,.25)}"+
    ".ux-hint{margin-left:auto;display:inline-flex;gap:3px;flex:none}"+
    ".pal-i{display:flex;align-items:center;gap:8px}"+
    ".ux-sc{position:fixed;inset:0;z-index:9998;display:grid;place-items:center;background:rgba(10,16,30,.55)}"+
    ".ux-sc[hidden]{display:none}"+
    ".ux-sc>div{background:var(--sheet);color:var(--ink);border:1px solid var(--rule);border-radius:6px;padding:20px 22px;width:min(420px,calc(100% - 24px));box-shadow:0 24px 70px rgba(0,0,0,.35)}"+
    ".ux-sc h3{margin:0 0 12px;font-size:17px}"+
    ".ux-sc dl{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;margin:0;font-size:14px}"+
    ".ux-sc dt{white-space:nowrap}.ux-sc dd{margin:0;color:var(--ink-2)}";
  document.head.appendChild(css);

  /* ---------- 1. skeleton loaders ---------- */
  function skeleton(rows){
    var h='<div class="skel-wrap" role="status" aria-label="Loading">';
    for(var i=0;i<(rows||4);i++)h+='<div class="skel-row"><i class="skel"></i><i class="skel" style="max-width:'+(92-i*9)+'%"></i></div>';
    return h+"</div>";
  }
  function isLoadingNote(el){
    return el&&el.nodeType===1&&el.matches&&el.matches("p.note")&&!el.id&&/^(Loading|Reading|Writing|Reviewing|Getting|Checking)\b[^.]{0,40}(…|\.\.\.)$/.test((el.textContent||"").trim());
  }
  function swapLoading(root){
    var list=[];
    if(isLoadingNote(root))list.push(root);
    if(root.querySelectorAll)root.querySelectorAll("p.note").forEach(function(p){if(isLoadingNote(p))list.push(p)});
    list.forEach(function(p){
      if(p.closest("#authBox,.auth"))return; /* keep "Signed in. Loading…" style messages */
      p.outerHTML=skeleton(4);
    });
  }
  swapLoading(document.body);
  new MutationObserver(function(ms){
    ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)swapLoading(n)})});
  }).observe(document.body,{childList:true,subtree:true});
  window.uxSkeleton=skeleton;

  /* ---------- 2. optimistic updates ---------- */
  function toast(msg){
    var t=document.createElement("div");t.className="ux-toast";t.setAttribute("role","status");t.textContent=msg;
    document.body.appendChild(t);setTimeout(function(){t.remove()},2600);
  }
  /* optimistic(apply, commit, rollback, failMsg): runs apply() instantly, then commit() (a promise).
     If commit rejects, rollback() runs and a toast says what happened. */
  window.optimistic=function(apply,commit,rollback,failMsg){
    try{apply()}catch(e){}
    return Promise.resolve().then(commit).catch(function(err){
      try{rollback&&rollback()}catch(e){}
      toast(failMsg||"Couldn't save that. Reverted.");
      throw err;
    });
  };

  /* ---------- 3. command menu extras ---------- */
  var NAV={h:["home","Home"],l:["learn","Learn"],p:["practice","Practice"],c:["compete","Compete"],r:["career","Career"]};
  function go(t){if(typeof window.showTab==="function"){if(typeof window.closeAll==="function")window.closeAll();window.showTab(t)}}

  /* "?" opens a shortcut sheet */
  var sc=document.createElement("div");sc.className="ux-sc";sc.hidden=true;sc.setAttribute("role","dialog");sc.setAttribute("aria-modal","true");sc.setAttribute("aria-label","Keyboard shortcuts");
  var mod=MAC?"⌘":"Ctrl";
  sc.innerHTML='<div><h3>Keyboard shortcuts</h3><dl>'+
    '<dt><kbd>'+mod+'</kbd> <kbd>K</kbd> or <kbd>/</kbd></dt><dd>Open the command menu</dd>'+
    '<dt><kbd>G</kbd> then <kbd>H</kbd></dt><dd>Home</dd>'+
    '<dt><kbd>G</kbd> then <kbd>L</kbd></dt><dd>Learn</dd>'+
    '<dt><kbd>G</kbd> then <kbd>P</kbd></dt><dd>Practice</dd>'+
    '<dt><kbd>G</kbd> then <kbd>C</kbd></dt><dd>Compete</dd>'+
    '<dt><kbd>G</kbd> then <kbd>R</kbd></dt><dd>Career</dd>'+
    '<dt><kbd>1</kbd>–<kbd>4</kbd> or <kbd>A</kbd>–<kbd>D</kbd></dt><dd>Pick an answer</dd>'+
    '<dt><kbd>?</kbd></dt><dd>Show this sheet</dd>'+
    '<dt><kbd>Esc</kbd></dt><dd>Close</dd></dl></div>';
  document.body.appendChild(sc);
  function scToggle(on){sc.hidden=!on}
  sc.addEventListener("click",function(e){if(e.target===sc)scToggle(false)});

  var armed=0;
  function typing(e){var t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName||"")||t.isContentEditable)}
  function quizOpen(){return !!document.querySelector(".opt:not([disabled])")}
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&!sc.hidden){scToggle(false);e.stopPropagation();return}
    if(e.metaKey||e.ctrlKey||e.altKey||typing(e))return;
    var k=(e.key||"").toLowerCase();
    if(e.key==="?"){e.preventDefault();scToggle(sc.hidden);return}
    if(armed&&Date.now()-armed<900&&NAV[k]){
      armed=0;e.preventDefault();e.stopImmediatePropagation();go(NAV[k][0]);return;
    }
    armed=0;
    if(k==="g"&&!quizOpen())armed=Date.now();
  },true); /* capture so "g then c" never also answers option C */

  /* ---------- 4. shortcut hints ---------- */
  /* tooltips on the main tabs */
  document.querySelectorAll(".tab[data-tab]").forEach(function(b){
    var key=Object.keys(NAV).filter(function(x){return NAV[x][0]===b.dataset.tab})[0];
    if(key&&!b.title)b.title=b.textContent.trim()+" (G then "+key.toUpperCase()+")";
  });
  /* hint chips inside the command menu rows */
  var pl=$("#palList");
  function hintPal(){
    if(!pl)return;
    pl.querySelectorAll(".pal-i:not([data-ux])").forEach(function(b){
      b.setAttribute("data-ux","1");
      var name=(b.firstElementChild&&b.firstElementChild.textContent||"").trim().toLowerCase();
      var key=Object.keys(NAV).filter(function(x){return NAV[x][1].toLowerCase()===name})[0];
      if(key&&b.closest("#palList")){
        var s=document.createElement("span");s.className="ux-hint";
        s.innerHTML="<kbd>G</kbd><kbd>"+key.toUpperCase()+"</kbd>";b.appendChild(s);
      }
    });
  }
  if(pl){new MutationObserver(hintPal).observe(pl,{childList:true});hintPal()}
  /* footer line in the command menu */
  var pal=$("#palette");
  if(pal&&!pal.querySelector(".ux-foot")){
    var f=document.createElement("div");f.className="ux-foot";
    f.style.cssText="padding:8px 14px;border-top:1px solid var(--rule);font-size:12px;color:var(--ink-2);display:flex;gap:12px;flex-wrap:wrap";
    f.innerHTML="<span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>?</kbd> all shortcuts</span>";
    pal.appendChild(f);
  }
})();

/* Friendly message when a server rate limit (429) is hit, instead of a silent fail. */
(function(){
  var of=window.fetch,last=0;if(!of)return;
  window.fetch=function(u,o){return of.apply(this,arguments).then(function(r){
    try{if(r&&r.status===429&&String(typeof u==="string"?u:(u&&u.url)||"").indexOf("/.netlify/functions/")>-1&&Date.now()-last>8000){
      last=Date.now();var ra=+r.headers.get("retry-after")||0;
      if(window.toast)window.toast(ra&&ra<120?"Slow down a little. Try again in "+ra+"s.":"You're going fast. Wait a minute and try again.")}}catch(e){}
    return r})};
})();
