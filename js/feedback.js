/* M&A: send feedback + flag a question */
(function(){
  const st=document.createElement("style");st.textContent=`
.qflag{display:inline-flex;align-items:center;gap:5px;margin-top:14px;background:none;border:0;padding:2px 0;font:inherit;font-size:12px;color:var(--ink-2);cursor:pointer;text-decoration:underline;text-decoration-color:var(--rule);text-underline-offset:3px}
.qflag:hover{color:var(--ink)}
.qflag-box{margin-top:12px;border:1px solid var(--rule);border-radius:12px;padding:12px;background:var(--paper);display:flex;flex-direction:column;gap:8px}
.qflag-box .chips{display:flex;flex-wrap:wrap;gap:6px}
.qflag-box .chips button{border:1px solid var(--rule);background:var(--sheet);color:var(--ink);border-radius:99px;padding:4px 11px;font:inherit;font-size:12.5px;cursor:pointer}
.qflag-box .chips button[aria-pressed="true"]{border-color:var(--cobalt);color:var(--cobalt);font-weight:600}
.qflag-box textarea,.fb-box textarea{width:100%;min-height:70px;font:inherit;font-size:14px;padding:9px 11px;border:1px solid var(--rule);border-radius:9px;background:var(--sheet);color:var(--ink);resize:vertical;box-sizing:border-box}
.qflag-box .row,.fb-box .row{display:flex;gap:8px;align-items:center;justify-content:flex-end}
.fb-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
footer .fb-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;margin-left:6px}`;document.head.appendChild(st);

  async function send(payload){const A=window.MA_AUTH;let tok="";try{const s=A&&A.sb&&(await A.sb.auth.getSession()).data.session;tok=s?s.access_token:""}catch(e){}
    const r=await fetch("/.netlify/functions/feedback",{method:"POST",headers:{"Content-Type":"application/json",...(tok?{Authorization:"Bearer "+tok}:{})},body:JSON.stringify({...payload,page:location.pathname+location.hash})});
    const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"Couldn't send");return j}

  /* flag a question: attaches under any multiple-choice question in the panel */
  function attach(){const p=document.getElementById("panel");if(!p)return;const q=p.querySelector(".q");const opts=p.querySelector(".opts");
    if(!q||!opts||p.querySelector(".qflag"))return;
    const btn=document.createElement("button");btn.type="button";btn.className="qflag";btn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 22V4m0 0h12l-2 4 2 4H4"/></svg>Flag this question';
    const host=p.querySelector("#fb")||opts;host.after(btn);
    btn.onclick=()=>{if(p.querySelector(".qflag-box"))return;const box=document.createElement("div");box.className="qflag-box";let reason="Wrong answer";
      box.innerHTML=`<b style="font-size:13.5px">What's wrong with it?</b><div class="chips">${["Wrong answer","Confusing","Typo","Too easy / too hard","Other"].map((r,i)=>`<button type="button" aria-pressed="${i===0}">${r}</button>`).join("")}</div><textarea maxlength="800" placeholder="Optional: tell us more"></textarea><input class="fb-hp" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="row"><button type="button" class="ghost sm qf-x">Cancel</button><button type="button" class="btn sm qf-go">Send</button></div>`;
      btn.after(box);btn.hidden=true;
      box.querySelectorAll(".chips button").forEach(c=>c.onclick=()=>{reason=c.textContent;box.querySelectorAll(".chips button").forEach(x=>x.setAttribute("aria-pressed",x===c))});
      box.querySelector(".qf-x").onclick=()=>{box.remove();btn.hidden=false};
      box.querySelector(".qf-go").onclick=async e=>{const g=e.target;g.disabled=true;g.textContent="Sending…";
        try{await send({kind:"question",reason,text:box.querySelector("textarea").value,question:q.textContent.trim(),answer:[...opts.querySelectorAll(".opt span:last-child")].map(s=>s.textContent).join(" | "),where:(p.querySelector(".q-meta .label")||{}).textContent||"",website:box.querySelector(".fb-hp").value});
          box.innerHTML='<span style="font-size:13.5px">Thanks. We review every flag and fix what\'s wrong.</span>'}
        catch(x){g.disabled=false;g.textContent="Send";try{toast(x.message)}catch(y){}}}}}
  const p=document.getElementById("panel");if(p)new MutationObserver(()=>attach()).observe(p,{childList:true,subtree:true});

  /* general feedback */
  window.maFeedback=function(){openPanel(`<div class="label">Feedback</div><h2>Tell us what to fix or add</h2><p class="sub">Bugs, wrong answers, ideas, anything. We read every message.</p>
     <form class="fb-box" style="display:flex;flex-direction:column;gap:10px;margin-top:6px"><textarea id="fbT" maxlength="2000" placeholder="What happened, or what would make M&amp;A better?" style="min-height:130px"></textarea>
     ${window.MA_AUTH&&MA_AUTH.session?"":`<input id="fbE" type="email" placeholder="Your email (optional, if you want a reply)" style="font:inherit;font-size:14px;padding:9px 11px;border:1px solid var(--rule);border-radius:9px;background:var(--sheet);color:var(--ink)">`}
     <input class="fb-hp" id="fbH" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="row"><button class="btn" id="fbGo">Send feedback</button></div></form>`);
    setTimeout(()=>{const t=$("#fbT");t&&t.focus()},50);
    document.querySelector(".fb-box").onsubmit=async e=>{e.preventDefault();const t=$("#fbT").value.trim();if(!t){toast("Write something first");return}const g=$("#fbGo");g.disabled=true;g.textContent="Sending…";
      try{await send({kind:"feedback",text:t,email:($("#fbE")||{}).value||"",website:$("#fbH").value});closePanel();toast("Thanks! Feedback sent.")}catch(x){g.disabled=false;g.textContent="Send feedback";toast(x.message)}}};
  const addLinks=()=>{const f=document.querySelector("footer");if(f&&!f.querySelector(".fb-link")){const b=document.createElement("button");b.type="button";b.className="fb-link";b.textContent="Send feedback";b.onclick=()=>maFeedback();f.appendChild(b)}
    const d=document.querySelector(".dr-foot");if(d&&!d.querySelector("[data-fbk]")){const b=document.createElement("button");b.type="button";b.dataset.fbk="1";b.textContent="Send feedback";b.onclick=()=>{try{closeDrawer()}catch(e){}maFeedback()};d.appendChild(b)}};
  addLinks();setInterval(addLinks,3000);
})();
