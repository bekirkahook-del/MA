/* Account growth: nudges guests to make a free account at the moments it matters, and counts each step
   (funnel events go to the owner's stats page through /.netlify/functions/hit, same anonymous visitor id).
   1) "Save your progress" pop-up right after a guest clears level 1 and level 3
   2) "Your progress is only on this device" bar for guests with XP
   3) Sign-up boxes on guide, tool and cheat-sheet pages (mid-article and end)
   Everything can be closed. Nothing blocks free content. */
(function(){
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const SS={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}}};
  const notrack=()=>!!LS.get("ma-notrack");
  const isApp=!!document.querySelector("nav.tabs")||location.pathname==="/"||location.pathname==="/index.html";
  const authTok=()=>!!LS.get("sb-nbakxpnhcfzdosbzbupd-auth-token");
  const guest=()=>{const A=window.MA_AUTH;if(A&&"session" in A)return !A.session;return !authTok()};

  /* ---------- funnel events ---------- */
  let evBuf={},evT=null;
  function ev(name){if(notrack())return;const v=LS.get("ma-vid");if(!v)return;evBuf[name]=(evBuf[name]||0)+1;clearTimeout(evT);evT=setTimeout(flush,2500)}
  function flush(){const v=LS.get("ma-vid");if(!v||!Object.keys(evBuf).length)return;const body=JSON.stringify({v,ev:evBuf});evBuf={};
    try{fetch("/.netlify/functions/hit",{method:"POST",headers:{"Content-Type":"application/json"},body,keepalive:true}).catch(()=>{})}catch(e){}}
  addEventListener("pagehide",flush);
  window.maEv=ev;

  const css=`.gw-ov{position:fixed;inset:0;z-index:9998;background:rgba(10,16,32,.55);display:grid;place-items:center;padding:16px;animation:gwIn .2s ease}
.gw-box{position:relative;width:min(420px,100%);background:var(--sheet,#fff);color:var(--ink,#13203B);border-radius:18px;padding:26px 24px 20px;box-shadow:0 24px 60px rgba(0,0,0,.3);text-align:center}
.gw-ic{font-size:40px;line-height:1}.gw-box h2{font-size:22px;margin:10px 0 6px}.gw-box p{font-size:15px;color:var(--ink-2,#4A5672);margin:0 0 14px;line-height:1.45}
.gw-xp{display:inline-block;font-family:var(--mono,monospace);font-weight:700;color:#A97A1E;background:rgba(169,122,30,.12);border-radius:8px;padding:2px 8px}
.gw-list{list-style:none;padding:0;margin:0 0 16px;text-align:left;display:grid;gap:5px;font-size:14px}.gw-list li:before{content:"✓ ";color:var(--good,#1e8e3e);font-weight:700}
.gw-go{display:block;width:100%;font:inherit;font-size:16px;font-weight:700;padding:12px;border:0;border-radius:12px;background:var(--cobalt,#2448D8);color:#fff;cursor:pointer}
.gw-no{margin-top:8px;font:inherit;font-size:13.5px;background:none;border:0;color:var(--ink-2,#4A5672);cursor:pointer;text-decoration:underline}
.gw-x{position:absolute;top:10px;right:12px;border:0;background:none;font-size:22px;color:var(--ink-2,#4A5672);cursor:pointer}
.gw-bar{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:8px 40px 8px 14px;background:#FFF4D6;color:#5B4210;font-size:13.5px;border-bottom:1px solid #F0D58A;text-align:center}
.gw-bar b{font-family:var(--mono,monospace)}.gw-bar button.go{font:inherit;font-size:13px;font-weight:700;padding:5px 12px;border:0;border-radius:8px;background:#13203B;color:#fff;cursor:pointer}
.gw-bar .x{position:absolute;right:10px;border:0;background:none;font-size:18px;color:#5B4210;cursor:pointer}
.gw-cta{border:1px solid var(--rule,#D3D9E4);border-left:4px solid var(--cobalt,#2448D8);border-radius:14px;background:var(--sheet,#fff);padding:18px 20px;margin:26px 0;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.gw-cta div{flex:1;min-width:220px}.gw-cta .k{font-size:11.5px;letter-spacing:.1em;font-weight:700;color:var(--cobalt,#2448D8);text-transform:uppercase}
.gw-cta .h{font-size:19px;font-weight:700;margin:4px 0;color:var(--ink,#13203B)}.gw-cta p{font-size:14.5px;color:var(--ink-2,#4A5672);margin:0}
.gw-cta a{display:inline-block;font-size:15px;font-weight:700;padding:11px 18px;border-radius:10px;background:var(--cobalt,#2448D8);color:#fff!important;text-decoration:none;white-space:nowrap}
@keyframes gwIn{from{opacity:0}to{opacity:1}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  /* ---------- guide / tool / cheat-sheet pages: sign-up boxes ---------- */
  if(!isApp&&/^\/(guides|tools|cheat-sheet)\//.test(location.pathname)){
    const slug=(location.pathname.split("/").filter(Boolean).pop()||"page").slice(0,40);
    const href=src=>`/?signup=1&utm_source=guide&utm_campaign=${encodeURIComponent(slug)}&cta=${src}`;
    const mk=(src,h,p,btn)=>{const d=document.createElement("div");d.className="gw-cta";d.dataset.cta=src;
      d.innerHTML=`<div><div class="k">Free account</div><div class="h">${h}</div><p>${p}</p></div><a href="${href(src)}">${btn}</a>`;
      d.querySelector("a").addEventListener("click",()=>{ev("guide_cta_click");flush()});return d};
    const place=()=>{if(!guest()||document.querySelector(".gw-cta"))return;
      const main=document.querySelector("main")||document.body;const hs=[...main.querySelectorAll("h2")].filter(h=>!/more free guides/i.test(h.textContent));
      if(hs.length>=3){const mid=hs[Math.floor(hs.length/2)];mid.parentNode.insertBefore(mk("mid","Practice this, don't just read it","Answer real interview questions in 5-minute levels and track your score. Free, no card.","Start free →"),mid)}
      const more=[...main.querySelectorAll("h2")].find(h=>/more free guides/i.test(h.textContent));
      const end=mk("end","Save your progress and climb the leaderboard","Make a free account: 1,000+ interview questions, XP and streaks, deal alerts, and a ranking against students from your school.","Create free account →");
      if(more)more.parentNode.insertBefore(end,more);else main.appendChild(end);ev("guide_cta_shown")};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",place);else place();
    return}

  if(!isApp)return;

  /* ---------- app: arrived from a guide sign-up box ---------- */
  const q=new URLSearchParams(location.search);
  if(q.get("signup")==="1"){ev("guide_cta_land");
    const tryOpen=(n=0)=>{if(window.MA_AUTH&&window.MA_AUTH.ready)window.MA_AUTH.ready.then(s=>{if(!s&&window.maOpenAuth){window.maOpenAuth("up");ev("signup_open_guide")}});else if(n<40)setTimeout(()=>tryOpen(n+1),250)};
    setTimeout(tryOpen,900);
    try{q.delete("signup");q.delete("cta");history.replaceState(null,"",location.pathname+(q.toString()?"?"+q:"")+location.hash)}catch(e){}}

  /* ---------- helpers that read the app's state ---------- */
  const xp=()=>{try{return totalXP()}catch(e){return 0}};
  const cleared=()=>{try{return Object.values(S.best||{}).filter(x=>x>=2).length}catch(e){return 0}};

  /* ---------- 1) save-your-progress pop-up ---------- */
  function popup(n){if(document.querySelector(".gw-ov"))return;
    const ov=document.createElement("div");ov.className="gw-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
    const first=n===1;
    ov.innerHTML=`<div class="gw-box"><button class="gw-x" aria-label="Close">×</button><div class="gw-ic">${first?"🎉":"🔥"}</div>
      <h2>${first?"First level cleared!":"3 levels down. You're on a roll."}</h2>
      <p>You have <span class="gw-xp">${xp()} XP</span>, but it's only saved in this browser. Make a free account so you don't lose it.</p>
      <ul class="gw-list"><li>Keep your XP, streak and levels on any device</li><li>Get ranked on the leaderboard and your school's board</li><li>Free forever. No card needed</li></ul>
      <button class="gw-go" type="button">Save my progress (free)</button><button class="gw-no" type="button">Not now</button></div>`;
    const close=()=>{ov.remove();document.removeEventListener("keydown",esc)};const esc=e=>{if(e.key==="Escape"){ev("prompt_dismiss");close()}};
    ov.querySelector(".gw-go").onclick=()=>{ev("prompt_click");ev("prompt"+n+"_click");close();LS.set("ma-gw-from","prompt"+n);if(window.maOpenAuth)window.maOpenAuth("up")};
    ov.querySelector(".gw-no").onclick=ov.querySelector(".gw-x").onclick=()=>{ev("prompt_dismiss");close()};
    ov.addEventListener("click",e=>{if(e.target===ov){ev("prompt_dismiss");close()}});document.addEventListener("keydown",esc);
    document.body.appendChild(ov);ov.querySelector(".gw-go").focus();ev("prompt_shown");ev("prompt"+n+"_shown")}
  function onLevel(){ev("level_clear");const n=cleared();if(n===1&&!LS.get("ma-first-clear")){LS.set("ma-first-clear","1");ev("first_level")}
    if(!guest())return;[1,3].forEach(k=>{if(n>=k&&!LS.get("ma-gw-p"+k)){LS.set("ma-gw-p"+k,"1");setTimeout(()=>popup(k),2200)}})}
  const hook=(t=0)=>{if(typeof window.questEvt==="function"&&!window.questEvt.__gw){const orig=window.questEvt;
      const w=function(k){const r=orig.apply(this,arguments);try{if(k==="level")onLevel()}catch(e){}return r};w.__gw=1;window.questEvt=w}
    else if(t<40)setTimeout(()=>hook(t+1),250)};
  hook();

  /* ---------- 2) progress-at-risk bar ---------- */
  let bar=null;
  function drawBar(){const show=guest()&&xp()>0&&!SS.get("ma-gw-barx")&&!LS.get("ma-notrack");
    if(!show){if(bar){bar.remove();bar=null}return}
    if(!bar){bar=document.createElement("div");bar.className="gw-bar";bar.setAttribute("role","status");
      bar.innerHTML=`<span>⚠️ Your <b class="n"></b> XP is only saved on this device.</span><button class="go" type="button">Save it free</button><button class="x" type="button" aria-label="Hide">×</button>`;
      bar.querySelector(".go").onclick=()=>{ev("bar_click");LS.set("ma-gw-from","bar");if(window.maOpenAuth)window.maOpenAuth("up")};
      bar.querySelector(".x").onclick=()=>{SS.set("ma-gw-barx","1");ev("bar_dismiss");drawBar()};
      document.body.insertBefore(bar,document.body.firstChild);if(!SS.get("ma-gw-barseen")){SS.set("ma-gw-barseen","1");ev("bar_shown")}}
    bar.querySelector(".n").textContent=xp()}
  setTimeout(drawBar,1500);setInterval(drawBar,4000);

  /* ---------- count sign-ups (and which nudge led to them) ---------- */
  const watch=(t=0)=>{const A=window.MA_AUTH;if(!(A&&A.sb)){if(t<40)setTimeout(()=>watch(t+1),250);return}
    try{A.sb.auth.onAuthStateChange((e,s)=>{if(e!=="SIGNED_IN"||!s||!s.user)return;const made=Date.parse(s.user.created_at||0);
      if(made&&Date.now()-made<10*60000&&!LS.get("ma-gw-signed")){LS.set("ma-gw-signed","1");ev("signup");const f=LS.get("ma-gw-from");if(f)ev("signup_from_"+f);
        if(new URLSearchParams(location.search).get("utm_source")==="guide")ev("signup_from_guide");flush()}
      if(bar){bar.remove();bar=null}})}catch(e){}};
  watch();
  /* remember a guide-box arrival for sign-up attribution */
  if(q.get("utm_source")==="guide")LS.set("ma-gw-from","guide");
})();
