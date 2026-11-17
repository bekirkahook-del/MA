/* Pro: instant application alerts toggle on Career → Openings. The daily server job emails new openings. */
(function(){
  const css=`.al-card{display:flex;justify-content:space-between;align-items:center;gap:14px;border:1px solid var(--rule);border-left:3px solid var(--good);border-radius:12px;background:var(--sheet);padding:14px 16px;margin:0 0 18px}
.al-card b{display:block;font-size:15.5px;color:var(--ink)}.al-card span{font-size:13.5px;color:var(--ink-2)}.al-card .k{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;color:var(--brass);text-transform:uppercase}
@media(max-width:560px){.al-card{flex-direction:column;align-items:flex-start}}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
  const on=()=>{try{return !!S.alertsOn}catch(e){return false}};
  async function toggle(btn){
    const A=window.MA_AUTH;if(!A||!A.session){const b=document.getElementById("authBtn");if(b)b.click();try{toast("Sign in to turn on alerts")}catch(e){}return}
    let firm="";
    if(!on()&&!isPro()){firm=((document.getElementById("alFirm")||{}).value||"").trim().slice(0,60);if(firm.length<2){try{toast("Type a firm name first, like Evercore")}catch(e){}return}}
    btn.disabled=true;btn.textContent="Saving…";
    try{const tok=(await A.sb.auth.getSession()).data.session.access_token;
      const r=await fetch("/.netlify/functions/alerts",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+tok},body:JSON.stringify({on:!on(),firm:firm||undefined})});
      const j=await r.json().catch(()=>({}));
      if(r.ok){S.alertsOn=j.on;S.alertFirm=j.firm||"";save();try{toast(j.on?"Alerts on. We'll email you when new applications open 🔔":"Alerts off")}catch(e){}}
      else if(j.code==="pro")upgrade("Instant application alerts are part of Pro");else try{toast(j.error||"Couldn't save")}catch(e){}}
    catch(e){try{toast("Couldn't connect. Try again.")}catch(x){}}
    draw()}
  function draw(){const pane=document.querySelector('[data-pane="open"]');if(!pane)return;let c=document.getElementById("alCard");
    if(!c){c=document.createElement("div");c.id="alCard";c.className="al-card";pane.insertBefore(c,pane.firstChild)}
    const pro=(()=>{try{return isPro()}catch(e){return false}})(),fm=(()=>{try{return S.alertFirm||""}catch(e){return""}})();
    c.innerHTML=pro||on()&&!fm?`<div><span class="k">Pro</span><b>🔔 Instant application alerts</b><span>${on()?"On. You'll get an email the day a new internship application opens.":"Get an email the day a new internship application opens, before spots fill up."}</span></div><button class="${on()?"ghost":"btn"}" id="alBtn">${on()?"Turn off":"Turn on alerts"}</button>`
      :on()?`<div><span class="k">Free</span><b>🔔 Alert on: ${String(fm).replace(/[<>&"]/g,"")}</b><span>We'll email you the day ${String(fm).replace(/[<>&"]/g,"")} opens an application. Pro adds alerts for every firm.</span></div><button class="ghost" id="alBtn">Turn off</button>`
      :`<div><span class="k">Free</span><b>🔔 Get alerted when one firm opens</b><span>Type a firm and we'll email you the day its application opens. Pro covers every firm.</span><input id="alFirm" placeholder="e.g. Evercore" maxlength="60" style="display:block;margin-top:8px;width:100%;max-width:260px"></div><button class="btn" id="alBtn">Alert me</button>`;
    document.getElementById("alBtn").onclick=e=>toggle(e.currentTarget)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(draw,300));else setTimeout(draw,300);
})();
