/* Account growth: nudges guests to make a free account at the moments it matters, and counts each step
   (funnel events go to the owner's stats page through /.netlify/functions/hit, same anonymous visitor id).
   1) "Save your progress" pop-up right after a guest clears level 1 and level 3
   2) "Your progress is only on this device" bar for guests with XP
   3) Sign-up boxes on guide, tool and cheat-sheet pages (mid-article and end)
   Everything can be closed. Nothing blocks free content (the guide gate test has a "keep reading" button). */
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
.gw-box{position:relative;width:min(420px,100%);background:var(--sheet,#fff);color:var(--ink,#13203B);border-radius:6px;padding:26px 24px 20px;box-shadow:0 24px 60px rgba(0,0,0,.3);text-align:center}
.gw-ic{font-size:40px;line-height:1}.gw-box h2{font-size:22px;margin:10px 0 6px}.gw-box p{font-size:15px;color:var(--ink-2,#4A5672);margin:0 0 14px;line-height:1.45}
.gw-xp{display:inline-block;font-family:var(--mono,monospace);font-weight:700;color:#A97A1E;background:rgba(169,122,30,.12);border-radius:4px;padding:2px 8px}
.gw-list{list-style:none;padding:0;margin:0 0 16px;text-align:left;display:grid;gap:5px;font-size:14px}.gw-list li:before{content:"✓ ";color:var(--good,#1e8e3e);font-weight:700}
.gw-go{display:block;width:100%;font:inherit;font-size:16px;font-weight:700;padding:12px;border:0;border-radius:4px;background:var(--cobalt,#2448D8);color:#fff;cursor:pointer}
.gw-no{margin-top:8px;font:inherit;font-size:13.5px;background:none;border:0;color:var(--ink-2,#4A5672);cursor:pointer;text-decoration:underline}
.gw-x{position:absolute;top:10px;right:12px;border:0;background:none;font-size:22px;color:var(--ink-2,#4A5672);cursor:pointer}
.gw-bar{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:8px 40px 8px 14px;background:#FFF4D6;color:#5B4210;font-size:13.5px;border-bottom:1px solid #F0D58A;text-align:center}
.gw-bar b{font-family:var(--mono,monospace)}.gw-bar button.go{font:inherit;font-size:13px;font-weight:700;padding:5px 12px;border:0;border-radius:4px;background:#13203B;color:#fff;cursor:pointer}
.gw-bar .x{position:absolute;right:10px;border:0;background:none;font-size:18px;color:#5B4210;cursor:pointer}
.gw-cta{border:1px solid var(--rule,#D3D9E4);border-left:4px solid var(--cobalt,#2448D8);border-radius:6px;background:var(--sheet,#fff);padding:18px 20px;margin:26px 0;display:flex;gap:16px;align-items:center;flex-wrap:wrap}
.gw-cta div{flex:1;min-width:220px}.gw-cta .k{font-size:11.5px;letter-spacing:.1em;font-weight:700;color:var(--cobalt,#2448D8);text-transform:uppercase}
.gw-cta .h{font-size:19px;font-weight:700;margin:4px 0;color:var(--ink,#13203B)}.gw-cta p{font-size:14.5px;color:var(--ink-2,#4A5672);margin:0}
.gw-cta a{display:inline-block;font-size:15px;font-weight:700;padding:11px 18px;border-radius:4px;background:var(--cobalt,#2448D8);color:#fff!important;text-decoration:none;white-space:nowrap}
.gw-tc{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9997;width:min(460px,calc(100% - 24px));display:flex;align-items:center;gap:10px;padding:11px 12px 11px 14px;border-radius:6px;background:#13203B;color:#fff;font-size:14.5px;line-height:1.35;box-shadow:0 14px 40px rgba(0,0,0,.35);animation:gwUp .25s ease}
.gw-tc .m{flex:1}.gw-tc b{font-family:var(--mono,monospace)}.gw-tc .ic{font-size:20px}
.gw-tc button.go{font:inherit;font-size:13.5px;font-weight:700;padding:8px 12px;border:0;border-radius:4px;background:#2448D8;color:#fff;cursor:pointer;white-space:nowrap}
.gw-tc button.x{border:0;background:none;color:#B8C2DA;font-size:20px;cursor:pointer;padding:0 2px}
.gw-strip{display:flex;align-items:center;gap:10px;flex-wrap:wrap;border:1px solid var(--rule,#D3D9E4);border-left:4px solid var(--cobalt,#2448D8);border-radius:4px;background:var(--sheet,#fff);padding:10px 14px;margin:10px 0;font-size:14.5px;color:var(--ink,#13203B)}
.gw-strip>span{flex:1;min-width:200px}.gw-strip button.go{font:inherit;font-size:14px;font-weight:700;padding:8px 14px;border:0;border-radius:4px;background:var(--cobalt,#2448D8);color:#fff;cursor:pointer;white-space:nowrap}
.gw-pw.lock{max-height:220px;overflow:hidden;position:relative}
.gw-pw.lock:after{content:"";position:absolute;left:0;right:0;bottom:0;height:180px;background:linear-gradient(transparent,var(--paper,#fff))}
.gw-gate{border:1px solid var(--rule,#D3D9E4);border-top:4px solid var(--cobalt,#2448D8);border-radius:6px;background:var(--sheet,#fff);padding:22px 20px;margin:0 0 28px;text-align:center;box-shadow:0 10px 30px rgba(19,32,59,.08)}
.gw-gate .k{font-size:11.5px;letter-spacing:.1em;font-weight:700;color:var(--cobalt,#2448D8);text-transform:uppercase}
.gw-gate .h{font-size:22px;font-weight:800;margin:6px 0;color:var(--ink,#13203B)}.gw-gate p{font-size:15px;color:var(--ink-2,#4A5672);margin:0 0 14px}
.gw-gate a.go{display:inline-block;font-size:16px;font-weight:700;padding:12px 22px;border-radius:4px;background:var(--cobalt,#2448D8);color:#fff!important;text-decoration:none}
.gw-gate .skip{display:block;margin:10px auto 0;font:inherit;font-size:13.5px;background:none;border:0;color:var(--ink-2,#4A5672);text-decoration:underline;cursor:pointer}
@keyframes gwUp{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes gwIn{from{opacity:0}to{opacity:1}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  /* static pages (guides, tools) don't load the app's auth: load it on demand, then open the real sign-up popup */
  let authLoading=null;
  function openAuthLazy(mode){if(window.maOpenAuth){maOpenAuth(mode);return}
    const add=src=>new Promise((ok,no)=>{const sc=document.createElement("script");sc.src=src;sc.onload=ok;sc.onerror=no;document.head.appendChild(sc)});
    if(!authLoading){const vs=document.createElement("style");vs.textContent=`.auth-ov{--sheet:#fff;--paper:#EEF1F5;--ink:#13203B;--ink-2:#4A5672;--rule:#D3D9E4;--cobalt:#2448D8;--body:"IBM Plex Sans",system-ui,-apple-system,sans-serif;font-family:var(--body)}`;document.head.appendChild(vs);
      authLoading=add("/vendor/supabase.js").then(()=>add("/js/backend.js")).then(()=>add("/js/auth.js"))}
    authLoading.then(()=>{if(window.maOpenAuth)maOpenAuth(mode);else location.href="/"}).catch(()=>{location.href="/"})}
  window.maOpenAuthLazy=openAuthLazy;
  /* ---------- tool pages: the tools are for members who made their plan. The page (and its text) stays for search,
     but the tool itself sits behind a wall that sends people to Make my plan. ---------- */
  if(!isApp&&/^\/tools\/[^/]+/.test(location.pathname)){
    const onb=()=>{try{const x=JSON.parse(LS.get("ma-progress-v1")||"{}");return !!((x.onb&&x.onb.done)||(x.plan&&x.plan.order&&x.plan.year))}catch(e){return false}};
    if(!authTok()||!onb()){const css=document.createElement("style");css.textContent=`body.tw-on main,body.tw-on .wrap{filter:blur(3px);pointer-events:none;user-select:none}
.tw-ov{position:fixed;inset:0;z-index:9990;display:grid;place-items:center;padding:16px;background:rgba(10,16,32,.45)}
.tw-box{max-width:420px;width:100%;box-sizing:border-box;background:#fff;color:#13203B;border-radius:8px;padding:26px 22px;text-align:center;box-shadow:0 30px 80px rgba(10,20,60,.35);font-family:system-ui,-apple-system,sans-serif;border-top:4px solid #2448D8}
.tw-box .k{font-size:11.5px;letter-spacing:.12em;font-weight:700;color:#2448D8;text-transform:uppercase}.tw-box h2{font-size:23px;margin:8px 0 6px}.tw-box p{font-size:15px;color:#4A5672;margin:0 0 16px}
.tw-box a{display:block;font-weight:800;font-size:16px;padding:13px;border-radius:6px;background:#2448D8;color:#fff!important;text-decoration:none}
.tw-box button{margin-top:10px;font:inherit;font-size:14px;background:none;border:0;color:#4A5672;text-decoration:underline;cursor:pointer}`;document.head.appendChild(css);
      const put=()=>{document.body.classList.add("tw-on");const o=document.createElement("div");o.className="tw-ov";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");
        o.innerHTML=`<div class="tw-box"><div class="k">Free · 30 seconds</div><h2>Make your plan to use this tool</h2><p>Every tool is free with an account. Tell us your school and year, and we'll build your step-by-step plan.</p><a href="/#plan">Make my plan →</a>${authTok()?"":`<button type="button">Already have an account? Sign in</button>`}</div>`;
        const b=o.querySelector("button");if(b)b.onclick=()=>openAuthLazy("in");o.querySelector("a").addEventListener("click",()=>{ev("tool_wall_click");flush()});
        document.body.appendChild(o);ev("tool_wall_shown")};
      if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",put);else put()}}

  /* ---------- guide / tool / cheat-sheet pages: sign-up boxes ---------- */
  if(!isApp&&/^\/(guides|tools|cheat-sheet)\//.test(location.pathname)){
    const slug=(location.pathname.split("/").filter(Boolean).pop()||"page").slice(0,40);
    const href=src=>`/?signup=1&utm_source=guide&utm_campaign=${encodeURIComponent(slug)}&cta=${src}`;
    const E0=x=>String(x).replace(/[<>&"]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c]));
    const mk=(src,h,p,btn)=>{const d=document.createElement("div");d.className="gw-cta";d.dataset.cta=src;
      d.innerHTML=`<div><div class="k">Free account</div><div class="h">${h}</div><p>${p}</p></div><a href="${href(src)}">${btn}</a>`;
      d.querySelector("a").addEventListener("click",()=>{ev("guide_cta_click");ev("guide_cta_"+src+"_click");flush()});return d};
    const place=()=>{if(!guest()||document.querySelector(".gw-cta"))return;
      const main=document.querySelector("main")||document.body;const hs=[...main.querySelectorAll("h2")].filter(h=>!/more free guides/i.test(h.textContent));
      /* A/B test (Nov 21, 2026): half of guests on /guides/ hit a soft gate at the halfway heading: the rest of the
         article fades out behind "Sign up free to keep reading". The text stays in the page (marked as paywalled
         content for Google), and "Keep reading" always unlocks it, so nothing is truly blocked. */
      /* Nov 22, 2026 (Bekir): every logged-out reader hits the wall at the halfway point; the A/B test is over. */
      const gate="g";
      const isGuide=/^\/guides\//.test(location.pathname);
      /* halfway point: the middle section heading, or for short guides (under 2 sections) the middle content block */
      const midEl=(()=>{if(hs.length>=2){const par0=hs[0].parentNode,all=[...par0.children],moreH=all.find(n=>n.tagName==="H2"&&/more free guides/i.test(n.textContent)),
          body=moreH?all.slice(0,all.indexOf(moreH)):all,tot=body.reduce((a,n)=>a+n.textContent.length,0)||1;let acc=0,best=null,bd=9;
          /* nearest block boundary to 50% of the text; a section heading wins if it is within 8 points of it */
          let bh=null,bhd=9;const skip=n=>/^(SCRIPT|STYLE)$/.test(n.tagName)||n.classList.contains("crumb")||n.classList.contains("upd")||n.tagName==="H1";
          for(const n of body){if(acc>0&&!skip(n)){const d=Math.abs(acc/tot-.5);if(d<bd){bd=d;best=n}if(n.tagName==="H2"&&d<bhd){bhd=d;bh=n}}acc+=n.textContent.length}
          return (bh&&bhd<=bd+.08?bh:best)||hs[Math.floor(hs.length/2)]}const a=hs[0]||main.querySelector("p");const pp=a?a.parentNode:main;
        const kids=[...pp.children].filter(n=>!/^(SCRIPT|STYLE)$/.test(n.tagName)&&!(n.tagName==="H2"&&/more free guides/i.test(n.textContent)));return kids.length>=4?kids[Math.floor(kids.length/2)]:null})();
      if(isGuide&&gate==="g"&&midEl){const mid=midEl,par=mid.parentNode;
        const stopAt=[...par.children].find(n=>n.tagName==="H2"&&/more free guides/i.test(n.textContent)&&(mid.compareDocumentPosition(n)&4));
        const w=document.createElement("div");w.className="gw-pw lock";par.insertBefore(w,mid);
        let n=mid;while(n&&n!==stopAt){const nx=n.nextSibling;w.appendChild(n);n=nx}
        const g=document.createElement("div");g.className="gw-gate";
        g.innerHTML=`<div class="k">Free account</div><div class="h">Build your free plan to read the rest</div><p>30 seconds: pick your school and year, get your step-by-step plan, and keep reading. Free, no card.</p><a class="go" href="${href("gate")}" data-gate-up>Build my plan and keep reading →</a><button type="button" class="skip" data-gate-in>Already have an account? Sign in</button>`;
        w.after(g);
        g.querySelector("a").addEventListener("click",e=>{e.preventDefault();ev("guide_gate_click");flush();openAuthLazy("up")});
        g.querySelector(".skip").onclick=()=>{ev("guide_gate_signin");openAuthLazy("in")};
        try{const ld=document.createElement("script");ld.type="application/ld+json";ld.textContent=JSON.stringify({"@context":"https://schema.org","@type":"Article","headline":document.title,"isAccessibleForFree":false,"hasPart":{"@type":"WebPageElement","isAccessibleForFree":false,"cssSelector":".gw-pw"}});document.head.appendChild(ld)}catch(e){}
        ev("guide_gate_shown")}
      else if(midEl){const mid=midEl;
        /* school guides ("...from Ohio State"): offer this guide as a step-by-step plan for that school, straight into the
           guest plan preview on the homepage (no account needed to see it) */
        const h1=(document.querySelector("h1")||{}).textContent||"";const sm=isGuide&&h1.match(/\b(?:from|at)\s+(.{2,60}?)\s*$/i);
        if(sm){const school=sm[1].trim();const d=document.createElement("div");d.className="gw-cta";d.dataset.cta="plan";
          d.innerHTML=`<div><div class="k">Free · 30 seconds</div><div class="h">Get this as a step-by-step plan for ${E0(school)}</div><p>Pick your year and see your first steps, built around ${E0(school)}'s own clubs and programs. No account needed to look.</p></div><a href="/?plan=${encodeURIComponent(school)}&utm_source=guide&utm_campaign=${encodeURIComponent(slug)}&cta=plan">See my plan →</a>`;
          d.querySelector("a").addEventListener("click",()=>{ev("guide_plan_click");flush()});mid.parentNode.insertBefore(d,mid);ev("guide_plan_shown")}
        else mid.parentNode.insertBefore(mk("mid","Get your free step-by-step recruiting plan","Pick your school and year and see your first steps. Takes 30 seconds, no card.","Build my plan →"),mid);if(isGuide)ev("guide_ctl_shown")}
      const more=[...main.querySelectorAll("h2")].find(h=>/more free guides/i.test(h.textContent));
      if(!document.querySelector(".gw-gate")){const end=mk("end","Turn this guide into your plan","Tell us your school and year. We build your step-by-step path to an offer, then save it free so it follows you. 30 seconds, no card.","Build my free plan →");
      if(more)more.parentNode.insertBefore(end,more);else main.appendChild(end);ev("guide_cta_shown")}};
    /* Nov 26, 2026: most readers never reach the box at the bottom (860 saw it load, 1 clicked), so a slim sticky bar
       offers the plan (the one thing that converts: ~15 of 22 signups) once they've scrolled a bit or stayed 10s. */
    const stick=()=>{if(!guest()||SS.get("ma-gw-gbx")||document.querySelector(".gw-sbar"))return;
      const b=document.createElement("div");b.className="gw-sbar";b.setAttribute("role","region");b.setAttribute("aria-label","Free plan");
      b.innerHTML=`<span><b>Free plan:</b> your step-by-step path to an offer, in 30 seconds.</span><a href="${href("bar")}">Build my plan →</a><button type="button" aria-label="Dismiss">×</button>`;
      b.querySelector("a").addEventListener("click",()=>{ev("guide_bar_click");flush()});
      b.querySelector("button").onclick=()=>{SS.set("ma-gw-gbx","1");ev("guide_bar_dismiss");b.remove()};
      document.body.appendChild(b);ev("guide_bar_shown")};
    if(!document.getElementById("gw-sbar-css")){const st=document.createElement("style");st.id="gw-sbar-css";
      st.textContent=".gw-sbar{position:fixed;left:50%;bottom:calc(14px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9000;display:flex;align-items:center;gap:12px;max-width:min(560px,calc(100vw - 24px));padding:10px 10px 10px 16px;background:#13203B;color:#fff;border-radius:999px;box-shadow:0 10px 30px rgba(19,32,59,.35);font:500 14px/1.3 system-ui,sans-serif}.gw-sbar span{flex:1;min-width:0}.gw-sbar a{flex:none;background:#2448D8;color:#fff;font-weight:800;text-decoration:none;padding:9px 16px;border-radius:999px;white-space:nowrap}.gw-sbar button{flex:none;all:unset;cursor:pointer;color:#c9d2e6;font-size:20px;line-height:1;padding:4px 8px}@media(max-width:480px){.gw-sbar{border-radius:16px;font-size:13px;gap:8px;padding:10px 8px 10px 12px}.gw-sbar a{padding:8px 12px}}";
      document.head.appendChild(st)}
    {let done=false;const go=()=>{if(done)return;done=true;stick()};
      addEventListener("scroll",()=>{const h=document.documentElement;if(h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight)>.25)go()},{passive:true});setTimeout(go,10000)}
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",place);else place();
    return}

  if(!isApp)return;

  /* ---------- app: arrived from a guide sign-up box ---------- */
  const q=new URLSearchParams(location.search);
  if(q.get("signup")==="1"){ev("guide_cta_land");
    /* Nov 22, 2026: new visitors make their plan first (gate.js); sign-up opens from its "Save my plan" button */
    try{q.delete("signup");q.delete("cta");history.replaceState(null,"",location.pathname+(q.toString()?"?"+q:"")+location.hash)}catch(e){}}

  /* ---------- invites: remember ?ref=, credit the inviter once this visitor has a confirmed account ---------- */
  const rf=(q.get("ref")||"").toLowerCase();if(/^[a-z0-9]{4,12}$/.test(rf)&&!LS.get("ma-ref-done")){LS.set("ma-ref",rf);ev("ref_land")}
  async function claimRef(){const code=LS.get("ma-ref"),A=window.MA_AUTH;if(!code||!A||!A.sb)return;
    try{const s=(await A.sb.auth.getSession()).data.session;if(!s)return;
      const r=await fetch("/.netlify/functions/refer",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.access_token},body:JSON.stringify({action:"claim",code})});
      const j=await r.json().catch(()=>({}));
      if(j&&j.drop){try{localStorage.removeItem("ma-ref")}catch(e){}LS.set("ma-ref-done","1")}
    }catch(e){}}
  const hookRef=(n=0)=>{const A=window.MA_AUTH;if(A&&A.sb&&A.ready){A.ready.then(()=>claimRef());try{A.sb.auth.onAuthStateChange(evt=>{if(evt==="SIGNED_IN")setTimeout(claimRef,800)})}catch(e){}}else if(n<40)setTimeout(()=>hookRef(n+1),250)};
  if(LS.get("ma-ref"))hookRef();

  /* ---------- helpers that read the app's state ---------- */
  const xp=()=>{try{return totalXP()}catch(e){return 0}};
  const cleared=()=>{try{return Object.values(S.best||{}).filter(x=>x>=2).length}catch(e){return 0}};

  /* ---------- 1) save-your-progress pop-up ---------- */
  function popup(n){if(document.querySelector(".gw-ov"))return;
    const ov=document.createElement("div");ov.className="gw-ov";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");
    const first=n===1,back=n===0;
    ov.innerHTML=`<div class="gw-box"><button class="gw-x" aria-label="Close">×</button><div class="gw-ic">${back?"👋":first?"🎉":"🔥"}</div>
      <h2>${back?"Welcome back!":first?"First level cleared!":"3 levels down. You're on a roll."}</h2>
      <p>You have <span class="gw-xp">${xp()} XP</span>, but it's only saved in this browser. Make a free account so you don't lose it.</p>
      <ul class="gw-list"><li>Keep your XP, streak and levels on any device</li><li>Get ranked on the leaderboard and your school's board</li><li>Free forever. No card needed</li></ul>
      <button class="gw-go" type="button">Save my progress (free)</button><button class="gw-no" type="button">Not now</button></div>`;
    const close=()=>{ov.remove();document.removeEventListener("keydown",esc)};const esc=e=>{if(e.key==="Escape"){ev("prompt_dismiss");close()}};
    ov.querySelector(".gw-go").onclick=()=>{ev("prompt_click");ev("prompt"+n+"_click");close();LS.set("ma-gw-from","prompt"+n);(window.maQuickJoin||window.maOpenAuth||(()=>{}))("up")};
    ov.querySelector(".gw-no").onclick=ov.querySelector(".gw-x").onclick=()=>{ev("prompt_dismiss");close()};
    ov.addEventListener("click",e=>{if(e.target===ov){ev("prompt_dismiss");close()}});document.addEventListener("keydown",esc);
    document.body.appendChild(ov);ov.querySelector(".gw-go").focus();ev("prompt_shown");ev("prompt"+n+"_shown")}
  function onLevel(){ev("level_clear");const n=cleared();if(n===1&&!LS.get("ma-first-clear")){LS.set("ma-first-clear","1");ev("first_level")}
    if(!guest())return;[1,3].forEach(k=>{if(n>=k&&!LS.get("ma-gw-p"+k)){LS.set("ma-gw-p"+k,"1");setTimeout(()=>popup(k),2200)}})}
  const hook=(t=0)=>{if(typeof window.questEvt==="function"&&!window.questEvt.__gw){const orig=window.questEvt;
      const w=function(k,v){const r=orig.apply(this,arguments);try{if(k==="level")onLevel();else if(k==="daily")onDaily();else if(k==="rfBest")onRapid(v)}catch(e){}return r};w.__gw=1;window.questEvt=w}
    else if(t<40)setTimeout(()=>hook(t+1),250)};
  hook();

  /* ---------- 2) progress-at-risk bar ---------- */
  let bar=null;
  function drawBar(){const show=guest()&&xp()>0&&!SS.get("ma-gw-barx")&&!LS.get("ma-notrack");
    if(!show){if(bar){bar.remove();bar=null}return}
    if(!bar){bar=document.createElement("div");bar.className="gw-bar";bar.setAttribute("role","status");
      bar.innerHTML=`<span>⚠️ Your <b class="n"></b> XP<span class="sk"></span> only lives on this device. Save it free and keep your rank.</span><button class="go" type="button">Save it free</button><button class="x" type="button" aria-label="Hide">×</button>`;
      bar.querySelector(".go").onclick=()=>{ev("bar_click");LS.set("ma-gw-from","bar");(window.maQuickJoin||window.maOpenAuth||(()=>{}))("up")};
      bar.querySelector(".x").onclick=()=>{SS.set("ma-gw-barx","1");ev("bar_dismiss");drawBar()};
      document.body.insertBefore(bar,document.body.firstChild);if(!SS.get("ma-gw-barseen")){SS.set("ma-gw-barseen","1");ev("bar_shown")}}
    bar.querySelector(".n").textContent=xp();try{const k=typeof streak==="function"?streak():0;bar.querySelector(".sk").textContent=k>1?" and "+k+"-day streak":""}catch(e){}}
  setTimeout(drawBar,1500);setInterval(drawBar,4000);

  /* ---------- more sign-in moments. Guests only, always dismissible, never block free content.
     Every one logs p_<name>_shown / _click (and signup_from_<name>) so the stats page shows which ones work. ---------- */
  const $1=s=>document.querySelector(s);
  function toastCard(key,icon,msg,btn){
    if(!guest()||SS.get("ma-gwt-"+key)||document.querySelector(".gw-ov,.gw-tc"))return false;
    if(Date.now()-(+SS.get("ma-gwt-last")||0)<45000)return false;
    SS.set("ma-gwt-"+key,"1");SS.set("ma-gwt-last",String(Date.now()));
    const d=document.createElement("div");d.className="gw-tc";d.setAttribute("role","status");
    d.innerHTML=`<span class="ic">${icon}</span><span class="m">${msg}</span><button class="go" type="button">${btn}</button><button class="x" type="button" aria-label="Dismiss">×</button>`;
    let t=0;const close=()=>{clearTimeout(t);d.remove()};
    d.querySelector(".go").onclick=()=>{ev("p_"+key+"_click");ev("p_any_click");LS.set("ma-gw-from",key);close();(window.maQuickJoin||window.maOpenAuth||(()=>{}))("up")};
    d.querySelector(".x").onclick=()=>{ev("p_"+key+"_dismiss");close()};
    document.body.appendChild(d);ev("p_"+key+"_shown");ev("p_any_shown");t=setTimeout(close,14000);return true}
  window.maGrowToast=toastCard;
  function mkStrip(key,html,btn){const d=document.createElement("div");d.className="gw-strip";d.dataset.gw=key;
    d.innerHTML=`<span>${html}</span><button class="go" type="button">${btn}</button>`;
    d.querySelector(".go").onclick=()=>{ev("p_"+key+"_click");ev("p_any_click");LS.set("ma-gw-from",key);(window.maQuickJoin||window.maOpenAuth||(()=>{}))("up")};return d}
  function putStrip(host,where,key,html,btn){if(!host)return;document.querySelectorAll(`.gw-strip[data-gw="${key}"]`).forEach(x=>x.remove());
    if(!guest())return;host.insertAdjacentElement(where,mkStrip(key,html,btn));
    if(!SS.get("ma-gws-"+key)){SS.set("ma-gws-"+key,"1");ev("p_"+key+"_shown");ev("p_any_shown")}}
  const E=s=>typeof esc==="function"?esc(s):String(s).replace(/[<>&"]/g,"");

  /* daily question + Rapid Fire results */
  function onDaily(){setTimeout(()=>{const n=typeof streak==="function"?streak():0;
    if(n>=2)toastCard("streak","🔥",`Don't lose your <b>${n}-day streak</b>. It's only saved on this device.`,"Save my streak");
    else toastCard("score","✅","Save today's answer and XP, and start a streak that follows you.","Save it free")},1800)}
  function onRapid(score){setTimeout(()=>toastCard("rapid","⚡",`You scored <b>${+score||0}</b> in Rapid Fire. Save it and see where you rank.`,"Save my score"),2000)}

  /* wrap the app's own render functions so the prompts survive every re-render */
  function wrap(name,fn){const o=window[name];if(typeof o!=="function"||o.__gw)return;const w=function(){const r=o.apply(this,arguments);try{fn()}catch(e){}return r};w.__gw=1;window[name]=w}
  const afterPlan=()=>{const hasPlan=typeof S!=="undefined"&&!!S.plan;if(!hasPlan){document.querySelectorAll('.gw-strip[data-gw="plan"]').forEach(x=>x.remove());return}putStrip($1("#planCard"),"afterend","plan","📌 Your plan is saved on this device only. Save it free so it's here tomorrow.","Save my plan")};
  /* Nov 26, 2026: the school + leaderboard strips were shown to ~740 visitors in 14 days and got 0 clicks, so they are gone. */
  const afterCompete=()=>{document.querySelectorAll('.gw-strip[data-gw="school"],.gw-strip[data-gw="lb"]').forEach(x=>x.remove())};
  const afterOpen=()=>{const el=$1("#openings");if(!el||el.dataset.gwo)return;el.dataset.gwo="1";
    el.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest(".op-add");if(!b||!guest()||b.getAttribute("aria-pressed")==="true")return;
      setTimeout(()=>toastCard("open","🗓️","Added to your calendar <b>on this device</b>. Make a free account so your deadlines follow you.","Save my deadlines"),700)},true)};
  const dealCount=()=>{const c=$1("#dealCount");if(!c)return;const n=Object.keys((typeof S!=="undefined"&&S.savedDeals)||{}).length;
    c.textContent=c.textContent.replace(/ · ★ \d+ saved$/,"")+(n?` · ★ ${n} saved`:"")};
  const afterDeals=()=>{const el=$1("#deals");if(!el)return;
    el.querySelectorAll("[data-deal]").forEach(b=>{if(b.parentNode.querySelector(".gw-save"))return;const id=b.dataset.deal;
      const on=!!((S.savedDeals||{})[id]);const s=document.createElement("button");s.type="button";s.className="ghost gw-save";s.setAttribute("aria-pressed",String(on));s.textContent=on?"★ Saved":"☆ Save deal";
      s.onclick=e=>{e.stopPropagation();
        if(guest()){ev("p_deal_click");ev("p_any_click");LS.set("ma-gw-from","deal");(window.maQuickJoin||window.maOpenAuth||(()=>{}))("up");return}
        S.savedDeals=S.savedDeals||{};if(S.savedDeals[id])delete S.savedDeals[id];else S.savedDeals[id]=Date.now();try{save()}catch(x){}
        const n=!!S.savedDeals[id];s.setAttribute("aria-pressed",String(n));s.textContent=n?"★ Saved":"☆ Save deal";dealCount()};
      b.after(s)});
    if(guest()&&el.querySelector(".gw-save")&&!SS.get("ma-gws-deal")){SS.set("ma-gws-deal","1");ev("p_deal_shown");ev("p_any_shown")}
    dealCount()};
  /* favorite stocks: toast on add, plus a strip in the markets list while the guest has favorites */
  const nWatch=()=>((typeof S!=="undefined"&&S.watch)||[]).length;
  const favStrip=()=>{const l=$1("#mkList");document.querySelectorAll('.gw-strip[data-gw="fav"]').forEach(x=>x.remove());
    if(!l||!guest()||!nWatch())return;const n=nWatch();
    putStrip(l,"beforebegin","fav",`★ You're watching <b>${n}</b> ${n===1?"stock":"stocks"}. They're only saved on this device. Sign up free to keep your watchlist everywhere.`,"Save my watchlist")};
  function hookWatch(t=0){const o=window.toggleWatch;
    if(typeof o!=="function"){if(t<40)setTimeout(()=>hookWatch(t+1),250);return}
    if(o.__gw)return;
    const w=function(sym){const before=nWatch();const r=o.apply(this,arguments);
      try{const n=nWatch();
        if(guest()&&n>before){setTimeout(()=>{
          if(n>=3)toastCard("fav3","★",`You're watching <b>${n}</b> stocks. Sign up free so your watchlist follows you.`,"Save my watchlist");
          else toastCard("fav","★",`<b>${E(sym)}</b> is on your watchlist, saved <b>on this device only</b>. Sign up free to keep it.`,"Save my watchlist")},500)}
        setTimeout(favStrip,0)}catch(e){}
      return r};
    w.__gw=1;window.toggleWatch=w}
  hookWatch();
  const afterMarkets=()=>setTimeout(favStrip,0);
  const hookRender=(t=0)=>{const m=[["renderPlan",afterPlan],["renderCompete",afterCompete],["renderOpenings",afterOpen],["renderDeals",afterDeals],["openMarkets",afterMarkets]];
    let miss=0;m.forEach(([n,f])=>{if(typeof window[n]!=="function")miss++;else wrap(n,f)});if(miss&&t<40)setTimeout(()=>hookRender(t+1),250);
    else{try{afterPlan();afterOpen()}catch(e){}}};
  hookRender();

  /* the "Your plan is ready" screen: add a save button right there */
  setTimeout(()=>{const pn=$1("#panel");if(!pn)return;
    new MutationObserver(()=>{if(!guest())return;const o=pn.querySelector(".ob");if(!o||o.querySelector("[data-gw=planpanel]"))return;
      const l=o.querySelector(".label");if(!l||!/plan is ready/i.test(l.textContent))return;const a=o.querySelector(".actions");if(!a)return;
      a.before(mkStrip("planpanel","Save your plan free so you keep it on every device.","Save my plan"));ev("p_planpanel_shown");ev("p_any_shown")}).observe(pn,{childList:true,subtree:true})},800);

  /* returning guest with progress: one welcome-back pop-up (2nd visit or later) */
  {const v=+LS.get("ma-visits")||0;if(!SS.get("ma-visit-counted")){SS.set("ma-visit-counted","1");LS.set("ma-visits",String(v+1))}
   let tries=0;const wb=()=>{if(!guest()||xp()<=0||(+LS.get("ma-visits")||0)<2||LS.get("ma-gw-wb"))return;
     const ovl=$1("#overlay");if((ovl&&!ovl.hidden)||document.querySelector(".gw-ov")){if(++tries<8)setTimeout(wb,6000);return}
     LS.set("ma-gw-wb","1");popup(0)};
   setTimeout(wb,5000)}

  /* ---------- count sign-ups (and which nudge led to them) ---------- */
  const watch=(t=0)=>{const A=window.MA_AUTH;if(!(A&&A.sb)){if(t<40)setTimeout(()=>watch(t+1),250);return}
    try{A.sb.auth.onAuthStateChange((e,s)=>{if(e!=="SIGNED_IN"||!s||!s.user)return;const made=Date.parse(s.user.created_at||0);
      if(made&&Date.now()-made<10*60000&&!LS.get("ma-gw-signed")){LS.set("ma-gw-signed","1");ev("signup");const f=LS.get("ma-gw-from");if(f)ev("signup_from_"+f);const gc=LS.get("ma-gw-camp");if(gc)ev("signup_c_"+gc);if(LS.get("ma-ai-from"))ev("signup_from_chatgpt");
        if(new URLSearchParams(location.search).get("utm_source")==="guide")ev("signup_from_guide");flush()}
      document.querySelectorAll(".gw-strip,.gw-tc").forEach(x=>x.remove());
      if(bar){bar.remove();bar=null}})}catch(e){}};
  watch();
  /* remember a guide-box arrival for sign-up attribution */
  if(q.get("utm_source")==="guide")LS.set("ma-gw-from","guide");
  /* social/email/club arrivals: remember where they came from so a later sign-up is credited (event names signup_from_<source>, signup_c_<campaign>) */
  {const us=(q.get("utm_source")||"").toLowerCase(),uc=(q.get("utm_campaign")||"").toLowerCase().replace(/[^a-z0-9]+/g,"_").slice(0,28);
   if(/^(tiktok|instagram|youtube|facebook|pinterest|x|reddit|email|club|linkedin|discord)$/.test(us)){if(!LS.get("ma-gw-from"))LS.set("ma-gw-from",us);ev("land_"+us);if(uc)LS.set("ma-gw-camp",uc)}}
  /* AI-assistant arrivals (ChatGPT adds utm_source=chatgpt.com; others only leave a referrer): count the visit and credit later sign-ups */
  {const src=(q.get("utm_source")||"").toLowerCase(),ref=(document.referrer||"").toLowerCase();
   const ai=/chatgpt|openai/.test(src)||/chatgpt\.com|chat\.openai\.com/.test(ref)||/perplexity/.test(src+ref)||/claude\.ai/.test(ref)||/gemini\.google|copilot\.microsoft/.test(ref);
   if(ai&&!SS.get("ma-ai-seen")){SS.set("ma-ai-seen","1");LS.set("ma-ai-from","1");ev("from_ai");if(/chatgpt|openai/.test(src+ref))ev("from_chatgpt")}}
})();
