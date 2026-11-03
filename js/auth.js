/* M&A sign in / sign out UI */
(function(){
  const A=window.MA_AUTH;if(!A||!A.sb)return;const sb=A.sb;
  const st=document.createElement("style");st.textContent=`
.authbtn{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--rule);background:var(--sheet);color:var(--ink);border-radius:999px;padding:6px 14px;cursor:pointer;white-space:nowrap;transition:border-color .2s,background .2s}
.authbtn:hover{border-color:var(--ink)}
.authbtn.cta{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.auth-ov{position:fixed;inset:0;z-index:9999;background:rgba(10,12,20,.45);display:grid;place-items:center;padding:16px;animation:authIn .2s ease both}
.auth-box{width:100%;max-width:380px;background:var(--sheet);color:var(--ink);border:1px solid var(--rule);border-radius:16px;padding:24px;box-shadow:0 24px 60px rgba(0,0,0,.25);display:flex;flex-direction:column;gap:12px;position:relative}
.auth-box h2{margin:0;font-family:var(--body);font-size:22px;font-weight:700;text-transform:none}
.auth-box p{margin:0;font-size:13.5px;color:var(--ink-2);line-height:1.5}
.auth-box label{display:flex;flex-direction:column;gap:4px;font-size:12.5px;font-weight:600;color:var(--ink-2)}
.auth-box input{font:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--rule);border-radius:9px;background:var(--paper);color:var(--ink)}
.auth-box input:focus{outline:none;border-color:var(--cobalt);box-shadow:0 0 0 3px var(--cobalt-soft)}
.auth-go{font:inherit;font-size:15px;font-weight:600;padding:11px;border:0;border-radius:9px;background:var(--cobalt);color:#fff;cursor:pointer}
.auth-go:disabled{opacity:.6;cursor:default}
.auth-sw{background:none;border:0;font:inherit;font-size:13px;color:var(--cobalt);cursor:pointer;padding:0;text-align:left}
.auth-msg{font-size:13px;min-height:1em}.auth-msg.err{color:var(--bad,#c0392b)}.auth-msg.ok{color:var(--good,#1e8e3e)}
.auth-x{position:absolute;top:10px;right:12px;background:none;border:0;font-size:22px;color:var(--ink-2);cursor:pointer}
.auth-perks{list-style:none;margin:0;padding:0;display:grid;gap:4px;font-size:13px}
.auth-perks li::before{content:"✓ ";color:var(--good,#1e8e3e);font-weight:700}
@keyframes authIn{from{opacity:0}to{opacity:1}}
@media (max-width:620px){.authbtn{padding:5px 10px;font-size:12px}}
@media (max-width:480px){.top-r{flex-wrap:nowrap!important;gap:8px!important}.top-r #newsBtn{display:none}}`;document.head.appendChild(st);

  function openAuth(mode){mode=mode||"in";
    const ov=document.createElement("div");ov.className="auth-ov";
    const draw=()=>{const up=mode==="up";
      ov.innerHTML=`<form class="auth-box" novalidate><button type="button" class="auth-x" aria-label="Close">×</button>
       <h2>${up?"Create your account":"Welcome back"}</h2>
       <p>${up?"Free. Your progress comes with you.":"Sign in to sync your progress and unlock everything."}</p>
       ${up?`<ul class="auth-perks"><li>AI grading on mock interviews</li><li>Leaderboards, friends and school boards</li><li>Progress synced across devices</li></ul>`:""}
       ${up?`<label>Your name<input id="auN" autocomplete="name" placeholder="Jane Smith"></label>`:""}
       <label>Email<input id="auE" type="email" autocomplete="email" placeholder="you@school.edu" required></label>
       <label>Password<input id="auP" type="password" autocomplete="${up?"new-password":"current-password"}" placeholder="${up?"At least 6 characters":""}" required></label>
       <button class="auth-go" type="submit">${up?"Create account":"Sign in"}</button>
       <div class="auth-msg" id="auM"></div>
       <button type="button" class="auth-sw" id="auSw">${up?"Already have an account? Sign in":"New here? Create a free account"}</button>
       ${up?"":`<button type="button" class="auth-sw" id="auF">Forgot password?</button>`}</form>`;
      const f=ov.querySelector("form"),msg=ov.querySelector("#auM"),go=ov.querySelector(".auth-go");
      const say=(t,ok)=>{msg.textContent=t;msg.className="auth-msg "+(ok?"ok":"err")};
      ov.querySelector(".auth-x").onclick=()=>ov.remove();
      ov.querySelector("#auSw").onclick=()=>{mode=up?"in":"up";draw()};
      const fp=ov.querySelector("#auF");if(fp)fp.onclick=async()=>{const e=ov.querySelector("#auE").value.trim();if(!e){say("Type your email first.");return}
        const {error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin});say(error?error.message:"Check your email for a reset link.",!error)};
      f.onsubmit=async ev=>{ev.preventDefault();const e=ov.querySelector("#auE").value.trim(),p=ov.querySelector("#auP").value;
        if(!e||!p){say("Enter your email and password.");return}
        go.disabled=true;say("");
        try{if(up){const n=(ov.querySelector("#auN").value||"").trim();
            if(n)try{const k="ma-progress-v1",s=JSON.parse(localStorage.getItem(k)||"{}");s.profile=s.profile||{};if(!s.profile.name){s.profile.name=n;localStorage.setItem(k,JSON.stringify(s))}}catch(x){}
            const {data,error}=await sb.auth.signUp({email:e,password:p,options:{data:{full_name:n},emailRedirectTo:location.origin}});
            if(error)throw error;if(!data.session)say("Almost done. Check your email to confirm, then sign in.",true)}
          else{const {error}=await sb.auth.signInWithPassword({email:e,password:p});if(error)throw error;say("Signed in. Loading…",true)}}
        catch(x){say(/Invalid login/i.test(x.message)?"Wrong email or password.":x.message||"Something went wrong.")}
        finally{go.disabled=false}};
      setTimeout(()=>{const i=ov.querySelector(up?"#auN":"#auE");i&&i.focus()},30)};
    draw();ov.addEventListener("mousedown",e=>{if(e.target===ov)ov.remove()});
    document.addEventListener("keydown",function k(e){if(e.key==="Escape"){ov.remove();document.removeEventListener("keydown",k)}});
    document.body.appendChild(ov)}
  window.maOpenAuth=openAuth;

  A.ready.then(s=>{const top=document.querySelector(".top-r");if(!top)return;
    const b=document.createElement("button");b.className="authbtn"+(s?"":" cta");b.id="authBtn";b.type="button";
    b.textContent=s?"Sign out":"Sign in";if(s)b.title="Signed in as "+s.user.email;
    b.onclick=()=>{if(s){if(confirm("Sign out of M&A?"))sb.auth.signOut()}else openAuth("in")};
    top.insertBefore(b,top.firstChild);
    if(s){let last="";const tick=()=>{try{const n=(JSON.parse(localStorage.getItem("ma-progress-v1")||"{}").profile||{}).name||"";if(n&&n!==last&&A.pushName){last=n;A.pushName(n)}}catch(e){}};
      tick();setInterval(tick,20000);document.addEventListener("visibilitychange",tick)}});
  /* "available when you sign in" notes become clickable */
  document.addEventListener("click",e=>{const n=e.target.closest&&e.target.closest(".note");if(!n||A.session)return;if(/sign in/i.test(n.textContent))openAuth("up")});
})();
