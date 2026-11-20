/* M&A sign in / sign out UI */
(function(){
  const A=window.MA_AUTH;if(!A||!A.sb)return;const sb=A.sb;
  const st=document.createElement("style");st.textContent=`
.authbtn{font:inherit;font-size:13px;font-weight:600;border:1px solid var(--rule);background:var(--sheet);color:var(--ink);border-radius:999px;padding:6px 14px;cursor:pointer;white-space:nowrap;transition:border-color .2s,background .2s}
.authbtn:hover{border-color:var(--ink)}
.authbtn.cta{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.auth-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,12,28,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px;animation:authIn .2s ease both}
.auth-box{width:100%;max-width:400px;background:var(--sheet);color:var(--ink);border:1px solid var(--rule);border-radius:22px;padding:30px 26px 22px;box-shadow:0 30px 80px rgba(10,20,60,.35);display:flex;flex-direction:column;gap:13px;position:relative;overflow:hidden;animation:authUp .28s cubic-bezier(.2,.9,.3,1.2) both}
.auth-box::before{content:"";position:absolute;left:0;right:0;top:0;height:5px;background:linear-gradient(90deg,#2448D8,#7357F6,#16A06A)}
.auth-mark{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#2448D8,#7357F6);color:#fff;font-weight:900;font-size:15px;letter-spacing:.02em;box-shadow:0 8px 20px rgba(36,72,216,.35)}
.auth-box h2{margin:2px 0 0;font-family:var(--body);font-size:25px;font-weight:800;letter-spacing:-.02em;text-transform:none;line-height:1.15}
.auth-box p{margin:0;font-size:14px;color:var(--ink-2);line-height:1.5}
.auth-box label{display:flex;flex-direction:column;gap:6px;font-size:12.5px;font-weight:700;color:var(--ink-2);letter-spacing:.01em}
.auth-box input{font:inherit;font-size:16px;padding:12px 14px;border:1.5px solid var(--rule);border-radius:12px;background:var(--paper);color:var(--ink);transition:border-color .15s,box-shadow .15s}
.auth-box input:focus{outline:none;border-color:var(--cobalt);box-shadow:0 0 0 4px var(--cobalt-soft)}
.auth-go{font:inherit;font-size:16px;font-weight:700;padding:13px;border:0;border-radius:12px;background:linear-gradient(135deg,#2448D8,#5a44f0);color:#fff;cursor:pointer;box-shadow:0 8px 22px rgba(36,72,216,.32);transition:transform .12s,box-shadow .12s}
.auth-go:hover{transform:translateY(-1px);box-shadow:0 12px 26px rgba(36,72,216,.4)}.auth-go:active{transform:translateY(0)}
.auth-go:disabled{opacity:.6;cursor:default;transform:none}
.auth-sw{background:none;border:0;font:inherit;font-size:13.5px;font-weight:600;color:var(--cobalt);cursor:pointer;padding:0;text-align:left}
.auth-links{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.auth-or{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--ink-2)}.auth-or::before,.auth-or::after{content:"";flex:1;height:1px;background:var(--rule)}
.auth-msg{font-size:13.5px;min-height:1em;font-weight:600}.auth-msg.err{color:var(--bad,#c0392b)}.auth-msg.ok{color:var(--good,#1e8e3e)}
.auth-msg:empty{display:none}
.auth-x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;background:var(--paper);border:0;font-size:20px;line-height:1;color:var(--ink-2);cursor:pointer}
.auth-perks{list-style:none;margin:0;padding:12px 14px;display:grid;gap:7px;font-size:13.5px;background:var(--paper);border-radius:12px}
.auth-perks li::before{content:"✓";display:inline-grid;place-items:center;width:18px;height:18px;margin-right:8px;border-radius:50%;background:#16A06A;color:#fff;font-size:11px;font-weight:800}
.auth-fine{font-size:11.5px!important;line-height:1.45!important;opacity:.85}
@keyframes authUp{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
.auth-o{display:flex;align-items:center;justify-content:center;gap:10px;padding:11px!important;font-size:15px!important;border-radius:9px!important;background:#fff!important;color:#1f1f1f!important;border:1px solid #c7cdd8!important;font-weight:600}
.auth-o:hover{background:#f6f8fb!important}.auth-o svg{flex:none}
@keyframes authIn{from{opacity:0}to{opacity:1}}
@media (max-width:620px){.authbtn{padding:5px 10px;font-size:12px}}
@media (max-width:480px){.top-r{flex-wrap:nowrap!important;gap:8px!important}}`;document.head.appendChild(st);

  /* One-field sign up: email -> magic link (confirms the email AND signs them in). Password stays as an option. */
  const MAILS=[[/^(gmail|googlemail)\.com$/,"Gmail","https://mail.google.com/"],[/^(outlook|hotmail|live|msn)\.com$/,"Outlook","https://outlook.live.com/mail/"],[/^(yahoo|ymail)\.com$/,"Yahoo Mail","https://mail.yahoo.com/"],[/^(icloud|me|mac)\.com$/,"iCloud Mail","https://www.icloud.com/mail"]];
  const mailFor=e=>{const d=(e.split("@")[1]||"").toLowerCase();for(const m of MAILS)if(m[0].test(d))return{name:m[1],url:m[2]};return null};
  const okEmail=e=>/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(e);
  const mev=n=>{try{window.maEv&&maEv(n)}catch(_){}};
  const LOGO={google:'<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.2C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z"/><path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.2C1 16.5 0 20.1 0 24s1 7.5 2.6 10.8l7.9-6.2z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.2C6.6 42.6 14.6 48 24 48z"/></svg>',
    azure:'<svg width="18" height="18" viewBox="0 0 23 23" aria-hidden="true"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#7FBA00" d="M12 1h10v10H12z"/><path fill="#00A4EF" d="M1 12h10v10H1z"/><path fill="#FFB900" d="M12 12h10v10H12z"/></svg>',
    apple:'<svg width="18" height="20" viewBox="0 0 17 20" aria-hidden="true"><path fill="currentColor" d="M14.1 10.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9s-2-.9-3.4-.9C3.6 4.8 2 5.8 1.1 7.3c-1.8 3.2-.5 7.9 1.3 10.5.9 1.3 1.9 2.7 3.2 2.6 1.3-.1 1.8-.8 3.3-.8s2 .8 3.4.8 2.2-1.3 3.1-2.6c1-1.4 1.4-2.9 1.4-3-.1 0-2.7-1-2.7-4.2zM11.6 3c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>',
    linkedin_oidc:'<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#0A66C2" d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/></svg>'};
  /* Google / Apple buttons show only once the provider is switched on in Supabase (Auth > Providers). */
  let OAUTH=null;const oauthBtns=()=>OAUTH||(OAUTH=fetch((sb.supabaseUrl||"")+"/auth/v1/settings",{headers:{apikey:sb.supabaseKey||""}}).then(r=>r.json()).then(j=>[["google","Google"],["azure","Microsoft"],["apple","Apple"],["linkedin_oidc","LinkedIn"]].filter(([k])=>j.external&&j.external[k])).catch(()=>[]));
  function openAuth(mode){mode=mode||"in";mev("auth_open");
    const ov=document.createElement("div");ov.className="auth-ov";
    let view="main",email="",cd=0,cdT=null;
    const agree=`By continuing you confirm you're 13 or older and agree to the <a href="/terms/" target="_blank" rel="noopener">Terms</a> and <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>.`;
    const draw=()=>{const up=mode==="up";
      if(view==="sent"){
        const m=mailFor(email);
        ov.innerHTML=`<div class="auth-box"><button type="button" class="auth-x" aria-label="Close">×</button>
         <h2>Check your email</h2>
         <p>We sent a sign-in link to <b id="auTo"></b>. Tap it and you're in. No password needed.</p>
         ${m?`<a class="auth-go" style="text-align:center;text-decoration:none" href="${m.url}" target="_blank" rel="noopener">Open ${m.name}</a>`:""}
         <p style="font-size:12.5px">Nothing yet? Check spam or promotions.</p>
         <div class="auth-msg" id="auM"></div>
         <button type="button" class="auth-sw" id="auRe"></button>
         <button type="button" class="auth-sw" id="auCh">Wrong email? Change it</button><button type="button" class="auth-sw" id="auBk">Use a password instead (instant)</button></div>`;
        ov.querySelector("#auTo").textContent=email;
        const re=ov.querySelector("#auRe"),msg=ov.querySelector("#auM");
        const tick=()=>{re.disabled=cd>0;re.textContent=cd>0?"Resend link in "+cd+"s":"Resend the link"};tick();
        clearInterval(cdT);cdT=setInterval(()=>{if(!ov.isConnected){clearInterval(cdT);return}if(cd>0){cd--;tick()}},1000);
        re.onclick=async()=>{if(cd>0)return;re.disabled=true;const r=await sendLink(email);msg.textContent=r?r:"Sent again.";msg.className="auth-msg "+(r?"err":"ok");cd=60;tick()};
        ov.querySelector("#auCh").onclick=()=>{view="magic";draw()};ov.querySelector("#auBk").onclick=()=>{view="main";draw()};
        ov.querySelector(".auth-x").onclick=()=>ov.remove();return}
      /* Main view: email + password, no email confirmation needed (project auto-confirms). One button signs in OR creates the account. */
      if(view==="main"){const up=mode==="up";
      ov.innerHTML=`<form class="auth-box" novalidate><button type="button" class="auth-x" aria-label="Close">×</button>
       <div class="auth-mark" aria-hidden="true">M&amp;A</div>
       <h2>${up?"Join free in 10 seconds":"Sign in or join free"}</h2>
       <p>One tap with Google, or email + password. You're in right away.</p>
       ${up?`<ul class="auth-perks"><li>AI grading on mock interviews</li><li>Leaderboards, friends and school boards</li><li>Progress synced across devices</li></ul>`:""}
       <div id="auO" style="display:none;flex-direction:column;gap:8px"></div>
       <label>Email<input id="auE" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="you@school.edu" required></label>
       <label>Password<span style="position:relative;display:block"><input id="auP" type="password" autocomplete="${up?"new-password":"current-password"}" placeholder="6+ characters" required style="width:100%;box-sizing:border-box;padding-right:58px"><button type="button" id="auEye" class="auth-sw" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:12.5px">Show</button></span></label>
       <button class="auth-go" type="submit">Continue</button>
       <p class="auth-fine">New here? This creates your free account. ${agree}</p>
       <div class="auth-msg" id="auM" role="status" aria-live="polite"></div>
       <div class="auth-links"><button type="button" class="auth-sw" id="auF">Forgot password?</button><button type="button" class="auth-sw" id="auMl">Email me a link instead</button></div></form>`;
      const f=ov.querySelector("form"),msg=ov.querySelector("#auM"),go=ov.querySelector(".auth-go"),ei=ov.querySelector("#auE"),pi=ov.querySelector("#auP");
      ei.value=email;const say=(t,ok)=>{msg.textContent=t;msg.className="auth-msg "+(ok?"ok":"err")};
      ov.querySelector(".auth-x").onclick=()=>ov.remove();
      ov.querySelector("#auEye").onclick=e=>{const s=pi.type==="password";pi.type=s?"text":"password";e.target.textContent=s?"Hide":"Show"};
      ov.querySelector("#auMl").onclick=()=>{email=ei.value.trim();view="magic";draw()};
      oauthBtns().then(list=>{const box=ov.querySelector("#auO");if(!box||!list.length)return;
        box.innerHTML=list.map(([id,name])=>`<button type="button" class="authbtn auth-o" data-o="${id}">${LOGO[id]||""}<span>Continue with ${name}</span></button>`).join("")+`<div class="auth-or">or use email</div>`;box.style.display="flex";
        box.querySelectorAll("[data-o]").forEach(b=>b.onclick=async()=>{mev("auth_oauth_"+b.dataset.o);b.disabled=true;const {error}=await sb.auth.signInWithOAuth({provider:b.dataset.o,options:{redirectTo:location.origin}});if(error){b.disabled=false;say(error.message)}})});
      ov.querySelector("#auF").onclick=async()=>{const e=ei.value.trim();if(!okEmail(e)){say("Type your email first, then tap Forgot password.");ei.focus();return}
        say("Sending…",true);let ok=false;try{const r=await fetch("/.netlify/functions/signin-link",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,type:"reset"})});const j=await r.json().catch(()=>({}));if(r.status===429){say("Too many tries. Wait a minute and try again.");return}ok=!!j.ok}catch(_){}
        if(!ok){const {error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin});if(error){say(error.message);return}}
        say("Check your email for a link to set your password.",true);mev("auth_reset")};
      f.onsubmit=async ev=>{ev.preventDefault();const e=ei.value.trim(),p=pi.value;mev("auth_submit");email=e;
        if(!okEmail(e)){say("Enter a valid email.");ei.focus();return}
        if(p.length<6){say("Password needs at least 6 characters.");pi.focus();return}
        go.disabled=true;go.textContent="One sec…";say("");
        const done=t=>{say(t,true);mev(t.startsWith("Account")?"auth_new":"auth_in");try{window.gtag&&gtag("event",t.startsWith("Account")?"sign_up":"login",{method:"password"})}catch(_){}setTimeout(()=>ov.remove(),700)};
        try{
          let r=await sb.auth.signInWithPassword({email:e,password:p});
          if(!r.error){done("Signed in. Loading…");return}
          if(!/invalid login|invalid credentials/i.test(r.error.message||""))throw r.error;
          r=await sb.auth.signUp({email:e,password:p,options:{emailRedirectTo:location.origin}});
          if(r.error){if(/already|registered|exists/i.test(r.error.message))throw new Error("WRONGPW");throw r.error}
          if(r.data&&r.data.session){done("Account created. You're in!");fetch("/.netlify/functions/welcome",{method:"POST",headers:{Authorization:"Bearer "+r.data.session.access_token},keepalive:true}).catch(()=>{});return}
          throw new Error("WRONGPW")}
        catch(x){mev(x.message==="WRONGPW"?"auth_wrongpw":"auth_err");
          if(x.message==="WRONGPW")say("That email already has an account and the password doesn't match. Tap Forgot password, or get a sign-in link below.");
          else if(/rate|too many/i.test(x.message||""))say("Too many tries. Wait a minute and try again.");
          else if(/fetch|network/i.test(x.message||""))say("Couldn't reach the server. Check your connection and try again.");
          else say(x.message||"Something went wrong. Try again.")}
        finally{go.disabled=false;go.textContent="Continue"}};
      setTimeout(()=>{(ei.value?pi:ei).focus()},30);return}

      const pw=view==="pw";
      ov.innerHTML=`<form class="auth-box" novalidate><button type="button" class="auth-x" aria-label="Close">×</button>
       <h2>${pw?(up?"Create your account":"Sign in with password"):(up?"Join free in 10 seconds":"Welcome back")}</h2>
       <p>${pw?"":(up?"Just your email. We'll send a link, no password to remember.":"Enter your email and we'll send a sign-in link.")}</p>
       ${up&&!pw?`<ul class="auth-perks"><li>AI grading on mock interviews</li><li>Leaderboards, friends and school boards</li><li>Progress synced across devices</li></ul>`:""}
       <label>Email<input id="auE" type="email" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="you@school.edu" required></label>
       ${pw?`<label>Password<input id="auP" type="password" autocomplete="${up?"new-password":"current-password"}" placeholder="${up?"At least 6 characters":""}" required></label>`:""}
       <button class="auth-go" type="submit">${pw?(up?"Create account":"Sign in"):"Email me a link"}</button>
       ${up||!pw?`<p style="font-size:12px;line-height:1.4">${agree}</p>`:""}
       <div class="auth-msg" id="auM"></div>
       <button type="button" class="auth-sw" id="auPw">${pw?"Use an email link instead":"Use a password instead"}</button>
       ${pw?`<button type="button" class="auth-sw" id="auSw">${up?"Already have an account? Sign in":"New here? Create a free account"}</button>`:""}
       ${pw&&!up?`<button type="button" class="auth-sw" id="auF">Forgot password?</button>`:""}</form>`;
      const f=ov.querySelector("form"),msg=ov.querySelector("#auM"),go=ov.querySelector(".auth-go"),ei=ov.querySelector("#auE");
      ei.value=email;
      const say=(t,ok)=>{msg.textContent=t;msg.className="auth-msg "+(ok?"ok":"err")};
      ov.querySelector(".auth-x").onclick=()=>ov.remove();
      ov.querySelector("#auPw").onclick=()=>{email=ei.value.trim();view="main";draw()};
      const sw=ov.querySelector("#auSw");if(sw)sw.onclick=()=>{email=ei.value.trim();mode=up?"in":"up";draw()};
      const fp=ov.querySelector("#auF");if(fp)fp.onclick=async()=>{const e=ei.value.trim();if(!e){say("Type your email first.");return}
        const {error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin});say(error?error.message:"Check your email for a reset link.",!error)};
      f.onsubmit=async ev=>{ev.preventDefault();const e=ei.value.trim();email=e;
        if(!okEmail(e)){say("Enter a valid email.");return}
        go.disabled=true;say("");
        try{
          if(!pw){const err=await sendLink(e);if(err)throw new Error(err);cd=60;view="sent";draw();return}
          const p=ov.querySelector("#auP").value;if(!p){say("Enter your password.");return}
          if(up){const {data,error}=await sb.auth.signUp({email:e,password:p,options:{emailRedirectTo:location.origin}});
            if(error)throw error;if(!data.session)say("Almost done. Check your email to confirm, then sign in.",true)}
          else{const {error}=await sb.auth.signInWithPassword({email:e,password:p});if(error)throw error;say("Signed in. Loading…",true)}}
        catch(x){say(/Invalid login/i.test(x.message)?"Wrong email or password.":x.message||"Something went wrong.")}
        finally{go.disabled=false}};
      setTimeout(()=>{if(!ei.value)ei.focus()},30)};
    /* returns "" on success, or a friendly error */
    async function sendLink(e){try{const r=await fetch("/.netlify/functions/signin-link",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,type:"magic"})});const j=await r.json().catch(()=>({}));if(r.status===429)return "Just a sec, we already sent one. Check your inbox, or try again in a minute.";if(j.ok)return ""}catch(_){}
    try{const {error}=await sb.auth.signInWithOtp({email:e,options:{shouldCreateUser:true,emailRedirectTo:location.origin}});
      if(!error)return "";if(/rate|seconds|too many/i.test(error.message))return "Just a sec, we already sent one. Check your inbox, or try again in a minute.";return error.message||"Couldn't send the link."}
      catch(x){return "Couldn't reach the server. Check your connection and try again."}}
    draw();ov.addEventListener("mousedown",e=>{if(e.target===ov)ov.remove()});
    document.addEventListener("keydown",function k(e){if(e.key==="Escape"){ov.remove();document.removeEventListener("keydown",k)}});
    document.body.appendChild(ov)}
  window.maOpenAuth=openAuth;
  function setPw(){const ov=document.createElement("div");ov.className="auth-ov";
    ov.innerHTML=`<form class="auth-box" novalidate><button type="button" class="auth-x" aria-label="Close">×</button><h2>Pick your password</h2>
     <p>You're signed in. Set a password so next time it's just email + password.</p>
     <label>New password<input id="auN" type="password" autocomplete="new-password" placeholder="6+ characters" required></label>
     <button class="auth-go" type="submit">Save password</button><div class="auth-msg" id="auM" role="status" aria-live="polite"></div></form>`;
    const m=ov.querySelector("#auM"),i=ov.querySelector("#auN");ov.querySelector(".auth-x").onclick=()=>ov.remove();
    ov.querySelector("form").onsubmit=async e=>{e.preventDefault();if(i.value.length<6){m.textContent="Password needs at least 6 characters.";m.className="auth-msg err";return}
      const {error}=await sb.auth.updateUser({password:i.value});m.textContent=error?error.message:"Saved. You're all set.";m.className="auth-msg "+(error?"err":"ok");if(!error){mev("auth_pwset");setTimeout(()=>ov.remove(),900)}};
    document.body.appendChild(ov);setTimeout(()=>i.focus(),30)}
  try{sb.auth.onAuthStateChange(ev=>{if(ev==="PASSWORD_RECOVERY")setTimeout(setPw,400)})}catch(_){}
  if(/type=recovery/.test(location.hash))A.ready.then(s=>{if(s)setTimeout(setPw,600)});

  A.ready.then(s=>{try{if(s&&Date.now()-Date.parse(s.user.created_at)<30*60*1000&&!localStorage.getItem("ma-welc")){localStorage.setItem("ma-welc","1");fetch("/.netlify/functions/welcome",{method:"POST",headers:{Authorization:"Bearer "+s.access_token}}).catch(()=>{})}}catch(e){}});
  A.ready.then(s=>{const top=document.querySelector(".top-r");if(!top)return;
    const b=document.createElement("button");b.className="authbtn"+(s?"":" cta");b.id="authBtn";b.type="button";
    b.textContent=s?"Sign out":"Sign in";if(s)b.title="Signed in as "+s.user.email;
    b.onclick=async()=>{if(s){if(confirm("Sign out of M&A? Your progress stays saved to your account.")){b.disabled=true;b.textContent="Saving…";try{if(window.maCloudFlush)await maCloudFlush()}catch(e){}sb.auth.signOut()}}else openAuth("in")};
    top.insertBefore(b,top.firstChild);
    if(s){let last="";const tick=()=>{try{const n=(JSON.parse(localStorage.getItem("ma-progress-v1")||"{}").profile||{}).name||"";if(n&&n!==last&&A.pushName){last=n;A.pushName(n)}}catch(e){}};
      tick();setInterval(tick,20000);document.addEventListener("visibilitychange",tick)}});
  /* "available when you sign in" notes become clickable */
  document.addEventListener("click",e=>{const n=e.target.closest&&e.target.closest(".note");if(!n||A.session)return;if(/sign in/i.test(n.textContent))openAuth("up")});
})();
