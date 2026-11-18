/* "Get set up" checklist: 5 steps in the side column on Home. Step 1 is creating the account with email.
   Uses the site's own .card / .label / .bar styles so it matches the cards around it. Self-contained:
   delete its script tag to turn it off. Hides itself when every step is done or when the visitor closes it. */
(function(){
  const $=(s,r)=>(r||document).querySelector(s);
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const g=n=>{try{return (0,eval)(n)}catch(e){return undefined}};   // read classic-script globals safely
  const ev=n=>{try{window.maEv&&window.maEv(n)}catch(e){}};
  const signedIn=()=>{const A=window.MA_AUTH;return !!(A&&A.session)};
  const css=`.ck-top{display:flex;justify-content:space-between;align-items:baseline;gap:10px}
.ck-top .x{border:0;background:none;font:inherit;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-2);cursor:pointer;padding:0}
.ck-list{list-style:none;margin:10px 0 0;padding:0}
.ck-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:11px 0;border:0;border-top:1px solid var(--rule);background:none;font:inherit;font-size:14.5px;line-height:1.3;color:var(--ink);text-align:left;cursor:pointer}
.ck-list li:first-child .ck-row{border-top:0}
.ck-dot{flex:none;width:20px;height:20px;box-sizing:border-box;border-radius:50%;border:1.5px solid var(--rule);display:grid;place-items:center;font-size:11px;line-height:1;color:var(--sheet)}
.ck-row.done{color:var(--ink-2);cursor:default}.ck-row.done .ck-dot{background:var(--ink);border-color:var(--ink)}
.ck-row.next{font-weight:600}.ck-row.next .ck-dot{border-color:var(--ink)}
.ck-row .go{margin-left:auto;flex:none;font-size:13px;color:var(--ink-2)}
.ck-f{display:flex;gap:8px;margin:0 0 12px 32px}.ck-f input{flex:1;min-width:0;font:inherit;font-size:14px;padding:8px 10px;border:1px solid var(--rule);border-radius:8px;background:var(--paper);color:var(--ink)}
.ck-m{margin:-6px 0 12px 32px;font-size:12.5px;color:var(--ink-2)}`;
  const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

  let openMail=false,last="",busy=false;
  const STEPS=()=>{const S=g("S")||{},p=S.profile||{};
    const lv=Object.values(S.best||{}).filter(x=>x>=2).length;
    return [
      {t:"Create your account with email",d:signedIn(),go:()=>{if(window.maOpenAuth)window.maOpenAuth("up")}},
      {t:"Add your name and school",d:!!(p.school&&(p.name||g("myName"))),go:()=>{const f=g("editProfile");if(f)f()}},
      {t:"Clear your first level",d:lv>=1,go:()=>{try{const nx=g("nextLevel")();if(nx)g("showBrief")(nx.tr,nx.i);else g("showTab")("learn")}catch(e){}}},
      {t:"Answer a daily question",d:Object.keys(S.daily||{}).length>=1,go:()=>{try{g("showTab")("daily")}catch(e){}}},
      {t:"Get the free Sunday email",d:LS.get("ma-sub")==="1",go:()=>{openMail=!openMail;draw(true);const i=$("#ckMail input");if(i)i.focus()}}
    ]};

  async function subscribe(form){
    const i=form.querySelector("input"),b=form.querySelector("button"),m=$("#ckMsg");const email=i.value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)){m.textContent="Please enter a valid email.";return}
    if(busy)return;busy=true;b.disabled=true;m.textContent="";
    try{const r=await fetch("/.netlify/functions/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,src:"checklist"})});
      if(r.ok){LS.set("ma-sub","1");ev("ck_email_signup");openMail=false;busy=false;draw(true);return}
      const j=await r.json().catch(()=>({}));m.textContent=j.error||"Something went wrong. Try again."}
    catch(e){m.textContent="Couldn't connect. Try again."}
    busy=false;b.disabled=false}

  function draw(force){
    const side=$('[data-view="home"] .hero-side');if(!side)return;
    let el=$("#ckCard");
    if(LS.get("ma-ck-hide")==="1"){if(el)el.remove();return}
    if(!g("S"))return;
    const steps=STEPS(),n=steps.filter(s=>s.d).length;
    if(n===steps.length){if(el)el.remove();LS.set("ma-ck-hide","1");ev("ck_complete");return}
    const nextI=steps.findIndex(s=>!s.d);
    const em=(window.MA_AUTH&&window.MA_AUTH.session&&window.MA_AUTH.session.user&&window.MA_AUTH.session.user.email)||"";
    const key=[steps.map(s=>+s.d).join(""),openMail].join("|");
    if(!force&&el&&key===last)return;last=key;
    const fresh=!el;
    if(!el){el=document.createElement("div");el.id="ckCard";el.className="card";el.setAttribute("aria-label","Get set up");
      const first=side.querySelector(":scope>.card");first?first.after(el):side.prepend(el)}
    el.innerHTML=`<div class="ck-top"><span class="label">Get set up</span><span class="label">${n}/${steps.length} <button type="button" class="x" id="ckX" aria-label="Hide checklist">· Hide</button></span></div>
      <div class="bar"><i style="width:${Math.round(n/steps.length*100)}%"></i></div>
      <ul class="ck-list">${steps.map((s,i)=>`<li><button type="button" class="ck-row ${s.d?"done":""} ${i===nextI?"next":""}" data-i="${i}" ${s.d?"disabled":""}><span class="ck-dot" aria-hidden="true">${s.d?"✓":""}</span><span>${s.t}</span>${s.d?"":`<span class="go" aria-hidden="true">→</span>`}</button>
        ${i===4&&openMail&&!s.d?`<form class="ck-f" id="ckMail" novalidate><input type="email" autocomplete="email" placeholder="you@school.edu" value="${em.replace(/[<>&"]/g,"")}" aria-label="Email address"><button class="btn sm" type="submit">Send</button></form><div class="ck-m" id="ckMsg" role="status">One email a week. Unsubscribe anytime.</div>`:""}</li>`).join("")}</ul>`;
    el.querySelectorAll(".ck-row:not(.done)").forEach(b=>b.onclick=()=>{const i=+b.dataset.i;ev("ck_step"+(i+1)+"_click");steps[i].go()});
    const f=$("#ckMail",el);if(f)f.onsubmit=e=>{e.preventDefault();subscribe(f)};
    $("#ckX",el).onclick=()=>{LS.set("ma-ck-hide","1");ev("ck_hide");el.remove()};
    if(fresh)ev("ck_shown")}

  const start=()=>{draw();setInterval(()=>draw(),2500);
    const A=window.MA_AUTH;if(A&&A.ready)A.ready.then(()=>draw(true))};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(start,600));else setTimeout(start,600);
})();
