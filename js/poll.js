/* One-question poll after a member's FIRST cleared level (Nov 23, 2026).
   Why: 0 feedback rows exist, so we're guessing what stops people. One tap, dismissible, asked once per browser.
   Stored through the feedback function (kind "feedback", reason "poll"), same as coaching.js. Not on the Home page. */
(function(){
  const K="ma-poll-1",ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const OPTS=["I don't know where to start","I don't have contacts or a network","Technical questions feel too hard","I don't have enough time","Nothing, I'm good"];
  const st=document.createElement("style");
  st.textContent=`.pl-card{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9996;width:min(440px,calc(100% - 24px));padding:12px 14px;border-radius:8px;background:#0E1630;color:#fff;box-shadow:0 8px 28px rgba(0,0,0,.28);font-size:14px}
.pl-card .h{display:flex;align-items:flex-start;gap:8px;margin-bottom:8px}.pl-card .h b{flex:1;font-size:14.5px}
.pl-card .x{border:0;background:none;color:#B8C2DA;font-size:20px;cursor:pointer;padding:0 2px;line-height:1}
.pl-card .o{display:flex;flex-direction:column;gap:6px}
.pl-card .o button{font:inherit;font-size:13.5px;text-align:left;padding:9px 11px;border:1px solid #33406A;border-radius:6px;background:transparent;color:#fff;cursor:pointer}
.pl-card .o button:hover,.pl-card .o button:focus-visible{background:#1C2750;border-color:#6F86E8}`;
  document.head.appendChild(st);
  function post(ans){try{
    fetch("/.netlify/functions/feedback",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({kind:"feedback",reason:"poll",question:"Biggest blocker right now?",answer:ans,text:"Poll after first level: "+ans,where:"poll1",page:location.pathname+location.hash})}).catch(()=>{})}catch(e){}}
  function ask(){
    if(LS.get(K)||document.querySelector(".pl-card,.ra-card,.gw-tc,.ej-g"))return;
    LS.set(K,"1");ev("poll1_shown");
    const d=document.createElement("div");d.className="pl-card";d.setAttribute("role","dialog");d.setAttribute("aria-label","Quick question");
    d.innerHTML=`<div class="h"><b>Quick question: what's your biggest blocker right now?</b><button class="x" type="button" aria-label="Dismiss">×</button></div><div class="o"></div>`;
    const box=d.querySelector(".o"),close=()=>{clearTimeout(t);d.remove()};
    OPTS.forEach(o=>{const b=document.createElement("button");b.type="button";b.textContent=o;
      b.onclick=()=>{post(o);ev("poll1_answered");box.innerHTML="";d.querySelector(".h b").textContent="Thanks, that helps us build the right thing.";setTimeout(close,1800)};box.appendChild(b)});
    d.querySelector(".x").onclick=()=>{ev("poll1_dismiss");close()};
    document.body.appendChild(d);const t=setTimeout(close,20000)}
  /* questEvt("level") fires after a level cleared with 2+ stars; ask once, on the first one */
  (function hook(n){const q=window.questEvt;if(typeof q!=="function"){if(n<40)setTimeout(()=>hook(n+1),250);return}if(q.__pl)return;
    const w=function(k){const r=q.apply(this,arguments);try{if(k==="level")setTimeout(ask,2200)}catch(e){}return r};w.__pl=1;window.questEvt=w})(0);
})();
