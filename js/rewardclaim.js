/* Free Pro days (Bekir, Nov 21, 2026): +1 day each for making an account, the Sunday email, and a review.
   The server (netlify/functions/reward.mjs) checks everything and blocks repeat devices/networks; this only asks. */
(function(){
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const T=m=>{try{toast(m)}catch(e){}};
  const devId=()=>{let d=LS.get("ma-dev");if(!d||d.length<16){d=(window.crypto&&crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now().toString(36)+String(Math.random()).slice(2));LS.set("ma-dev",d)}return d};
  const fpr=()=>{try{return [navigator.userAgent,screen.width+"x"+screen.height,screen.colorDepth,devicePixelRatio,Intl.DateTimeFormat().resolvedOptions().timeZone,navigator.language,navigator.hardwareConcurrency||0,navigator.maxTouchPoints||0].join("|")}catch(e){return ""}};
  const sess=async()=>{const A=window.MA_AUTH;if(!A)return null;try{return await A.ready}catch(e){return null}};
  const confirmed=s=>!!(s&&s.user&&(s.user.email_confirmed_at||s.user.confirmed_at));
  /* returns "ok" | "done" (already/blocked: stop asking) | "no" (not yet) */
  async function reward(kind,okMsg){if(LS.get("ma-rw-"+kind))return "done";const s=await sess();if(!s||!confirmed(s))return "no";
    const r=await fetch("/.netlify/functions/reward",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.access_token},body:JSON.stringify({kind,device:devId(),fp:fpr()})});
    const j=await r.json().catch(()=>({}));
    if(r.ok){LS.set("ma-rw-"+kind,"1");ev("reward_"+kind);try{window.maClubClaim&&maClubClaim()}catch(e){}if(okMsg)T(okMsg);return "ok"}
    if(["used","device_used","network_used"].includes(j.code)){LS.set("ma-rw-"+kind,"1");if(j.code!=="used"&&okMsg)T(j.error);return "done"}
    if(j.code==="short")T("Add a sentence or two to your review to get your free Pro day.");
    return "no"}
  window.maReward=reward;
  /* sign-up: claimed automatically once the account's email is confirmed */
  let tries=0;(async function signup(){const s=await sess();if(!s){if(tries++<20)setTimeout(signup,3000);return}
    if(confirmed(s))reward("signup","🎉 Welcome! 1 free day of Pro added to your account.").catch(()=>{})})();
  /* Sunday email: one small card on Home for members who haven't claimed it */
  const st=document.createElement("style");
  st.textContent=`.rwc-card{display:flex;align-items:center;gap:12px;flex-wrap:wrap;border:1px dashed var(--rule);background:var(--sheet);border-radius:8px;padding:12px 14px;margin:14px 0;text-align:left;font-size:14px;color:var(--ink)}
.rwc-card .m{flex:1;min-width:200px}.rwc-card .x{border:0;background:none;color:var(--ink-2);font-size:20px;cursor:pointer;padding:0 4px}`;
  document.head.appendChild(st);
  async function emailCard(){const view=document.querySelector('[data-view="home"]');if(!view)return;let c=document.getElementById("rwcEmail");
    if(LS.get("ma-rw-email")||LS.get("ma-rwc-x")){if(c)c.remove();return}
    const s=await sess();if(!confirmed(s)){if(c)c.remove();return}
    const anchor=document.getElementById("continue");if(!anchor)return;
    if(!c){c=document.createElement("div");c.id="rwcEmail";c.className="rwc-card";
      c.innerHTML=`<span class="m">📬 <b>Get 1 free day of Pro:</b> join the Sunday email (one interview question + one recruiting tip a week). Unsubscribe anytime.</span><button class="btn" type="button" id="rwcGo">Join + get Pro day</button><button class="x" type="button" aria-label="Dismiss">×</button>`;
      c.querySelector(".x").onclick=()=>{LS.set("ma-rwc-x","1");ev("reward_email_dismiss");c.remove()};
      c.querySelector("#rwcGo").onclick=async()=>{const btn=c.querySelector("#rwcGo");btn.disabled=true;btn.textContent="Joining…";ev("reward_email_click");
        try{const r=await fetch("/.netlify/functions/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s.user.email,src:"reward"})});
          if(!r.ok)throw 0;const out=await reward("email","📬 You're in! 1 day of Pro added.");if(out!=="no"){c.remove();if(out==="done")T("You're on the Sunday email.")}else{btn.disabled=false;btn.textContent="Try again"}}
        catch(e){btn.disabled=false;btn.textContent="Try again";T("Couldn't join right now. Try again in a minute.")}}}
    if(anchor.previousElementSibling!==c)anchor.before(c)}
  (function hook(n){if(typeof renderHome!=="function"){if(n<40)setTimeout(()=>hook(n+1),250);return}if(renderHome.__rwc)return;
    const o=renderHome;renderHome=function(){const r=o.apply(this,arguments);try{emailCard()}catch(e){}return r};renderHome.__rwc=1;try{emailCard()}catch(e){}})(0);
})();
