/* One free Pro day per student (Bekir, Nov 21-22, 2026): earned by whichever comes first - making an account (after
   Level 1), joining the Sunday email, or leaving a review.
   The server (netlify/functions/reward.mjs) checks everything and blocks repeat devices/networks; this only asks. */
(function(){
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const T=m=>{try{toast(m)}catch(e){}};
  const devId=()=>{let d=LS.get("ma-dev");if(!d||d.length<16){d=(window.crypto&&crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now().toString(36)+String(Math.random()).slice(2));LS.set("ma-dev",d)}return d};
  const fpr=()=>{try{return [navigator.userAgent,screen.width+"x"+screen.height,screen.colorDepth,devicePixelRatio,Intl.DateTimeFormat().resolvedOptions().timeZone,navigator.language,navigator.hardwareConcurrency||0,navigator.maxTouchPoints||0].join("|")}catch(e){return ""}};
  /* canvas + GPU fingerprint (hashed in the browser; only the hash is sent) */
  async function fp2(){try{const c=document.createElement("canvas");c.width=240;c.height=60;const x=c.getContext("2d");x.textBaseline="top";x.font="16px Arial";x.fillStyle="#f60";x.fillRect(100,1,62,20);x.fillStyle="#069";x.fillText("M&A Prep \u{1F4C8} 7.5%",2,15);x.fillStyle="rgba(102,204,0,.7)";x.fillText("M&A Prep \u{1F4C8} 7.5%",4,17);
      let gl="";try{const g=document.createElement("canvas").getContext("webgl");const e=g&&g.getExtension("WEBGL_debug_renderer_info");gl=e?g.getParameter(e.UNMASKED_RENDERER_WEBGL)+"|"+g.getParameter(e.UNMASKED_VENDOR_WEBGL):""}catch(e){}
      const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(c.toDataURL()+"|"+gl));return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,40)}catch(e){return ""}}
  const sess=async()=>{const A=window.MA_AUTH;if(!A)return null;try{return await A.ready}catch(e){return null}};
  const confirmed=s=>!!(s&&s.user&&(s.user.email_confirmed_at||s.user.confirmed_at));
  /* returns "ok" | "done" (already/blocked: stop asking) | "no" (not yet) */
  const ALL=()=>["signup","email","review"].forEach(k=>LS.set("ma-rw-"+k,"1"));
  async function reward(kind,okMsg){if(LS.get("ma-rw-"+kind))return "done";const s=await sess();if(!s||!confirmed(s))return "no";
    const r=await fetch("/.netlify/functions/reward",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+s.access_token},body:JSON.stringify({kind,device:devId(),fp:fpr(),fp2:await fp2()})});
    const j=await r.json().catch(()=>({}));
    if(r.ok){ALL();ev("reward_"+kind);try{window.maClubClaim&&maClubClaim()}catch(e){}if(okMsg)T(okMsg);return "ok"}
    if(["used","device_used","network_used","blocked"].includes(j.code)){if(j.code==="used")ALL();else LS.set("ma-rw-"+kind,"1");if(j.code!=="used"&&okMsg)T(j.error);return "done"}
    if(j.code==="short")T("Add a sentence or two to your review to get your free Pro day.");
    return "no"}
  window.maReward=reward;
  /* sign-up: claimed automatically once the account's email is confirmed */
  let tries=0;(async function signup(){const s=await sess();if(!s){if(tries++<20)setTimeout(signup,3000);return}
    if(confirmed(s))reward("signup","🎉 Welcome! 1 free day of Pro added to your account.").catch(()=>{})})();
  /* the sign-up day unlocks once Level 1 is cleared (the server checks the profile): retry after each level */
  (function hookLv(n){const q=window.questEvt;if(typeof q!=="function"){if(n<40)setTimeout(()=>hookLv(n+1),250);return}if(q.__rwc)return;
    const w=function(k){const r=q.apply(this,arguments);try{if(k==="level"&&!LS.get("ma-rw-signup"))setTimeout(()=>reward("signup","🎉 Level cleared! 1 free day of Pro added to your account.").catch(()=>{}),8000)}catch(e){}return r};w.__rwc=1;window.questEvt=w})(0);
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
