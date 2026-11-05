/* Weekly email signup box. Shows on guide pages (above "More free guides") and on Practice → Curveballs. */
(function(){
  const done=()=>{try{return localStorage.getItem("ma-sub")==="1"}catch(e){return false}};
  const css=`.em-box{border:1px solid var(--rule,#D3D9E4);border-radius:14px;background:var(--sheet,#fff);padding:18px 20px;margin:26px 0}
.em-k{font-size:11.5px;letter-spacing:.1em;font-weight:700;color:#A97A1E;text-transform:uppercase}
.em-h{font-size:19px;font-weight:700;margin:6px 0 4px;color:var(--ink,#13203B)}.em-p{font-size:14.5px;color:var(--ink-2,#4A5672);margin:0 0 12px}
.em-f{display:flex;gap:8px;flex-wrap:wrap}.em-f input[type=email]{flex:1;min-width:200px;font:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--rule,#D3D9E4);border-radius:10px;background:var(--paper,#EEF1F5);color:var(--ink,#13203B)}
.em-f button{font:inherit;font-size:15px;font-weight:600;padding:10px 18px;border:0;border-radius:10px;background:var(--cobalt,#2448D8);color:#fff;cursor:pointer}
.em-f button:disabled{opacity:.6}.em-msg{font-size:13.5px;margin-top:8px;color:var(--ink-2,#4A5672)}.em-hp{position:absolute;left:-9999px}`;
  function box(src){const d=document.createElement("div");d.className="em-box";d.id="emBox";
    d.innerHTML=`<div class="em-k">Free · Every Sunday</div><div class="em-h">One finance curveball a week</div><p class="em-p">A real interview question, one tip for breaking in, and a guide worth reading. Takes 2 minutes. Unsubscribe anytime.</p>
      <form class="em-f" novalidate><input type="email" name="email" placeholder="you@school.edu" autocomplete="email" required aria-label="Email address"><input class="em-hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><button type="submit">Get it free</button></form><div class="em-msg" role="status"></div>`;
    const f=d.querySelector("form"),m=d.querySelector(".em-msg"),b=f.querySelector("button");
    f.onsubmit=async e=>{e.preventDefault();const email=f.email.value.trim();if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)){m.textContent="Please enter a valid email.";return}
      b.disabled=true;b.textContent="Signing up…";
      try{const r=await fetch("/.netlify/functions/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,hp:f.hp.value,src})});const j=await r.json().catch(()=>({}));
        if(r.ok){try{localStorage.setItem("ma-sub","1")}catch(x){}d.innerHTML=`<div class="em-k">You're in ✓</div><div class="em-h">See you Sunday.</div><p class="em-p" style="margin:0">${j.already?"You were already on the list.":"Check your inbox for a welcome email (and your spam folder, just in case)."}</p>`}
        else{m.textContent=j.error||"Something went wrong. Try again.";b.disabled=false;b.textContent="Get it free"}}
      catch(x){m.textContent="Couldn't connect. Try again.";b.disabled=false;b.textContent="Get it free"}};
    return d}
  function init(){if(done()||document.getElementById("emBox"))return;
    const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    if(/^\/guides\//.test(location.pathname)){const h=[...document.querySelectorAll("main h2")].find(x=>/More free guides/.test(x.textContent));const slug=location.pathname.split("/")[2]||"index";
      if(h)h.before(box("guide:"+slug));else{const m=document.querySelector("main");if(m)m.appendChild(box("guide:"+slug))}return}
    const tryCurve=()=>{const w=document.querySelector("#curve .cb-wrap");if(!w)return false;if(!document.getElementById("emBox")){const d=w.querySelector("#cbDaily");const b=box("curveballs");b.style.margin="0";d?d.after(b):w.appendChild(b)}return true};
    if(!tryCurve()){let n=0;const t=setInterval(()=>{if(tryCurve()||++n>40)clearInterval(t)},500)}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
