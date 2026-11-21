/* Weekly email signup box. Shows on guide pages (above "More free guides") and on Practice → Curveballs. */
(function(){
  const done=()=>{try{return localStorage.getItem("ma-sub")==="1"}catch(e){return false}};
  const css=`.em-box{border:1px solid var(--rule,#D3D9E4);border-radius:14px;background:var(--sheet,#fff);padding:18px 20px;margin:26px 0}
.em-k{font-size:11.5px;letter-spacing:.1em;font-weight:700;color:#A97A1E;text-transform:uppercase}
.em-h{font-size:19px;font-weight:700;margin:6px 0 4px;color:var(--ink,#13203B)}.em-p{font-size:14.5px;color:var(--ink-2,#4A5672);margin:0 0 12px}
.em-f{display:flex;gap:8px;flex-wrap:wrap}.em-f input[type=email]{flex:1;min-width:200px;font:inherit;font-size:15px;padding:10px 12px;border:1px solid var(--rule,#D3D9E4);border-radius:10px;background:var(--paper,#EEF1F5);color:var(--ink,#13203B)}
.em-f button{font:inherit;font-size:15px;font-weight:600;padding:10px 18px;border:0;border-radius:10px;background:var(--cobalt,#2448D8);color:#fff;cursor:pointer}
.em-f button:disabled{opacity:.6}.em-msg{font-size:13.5px;margin-top:8px;color:var(--ink-2,#4A5672)}.em-hp{position:absolute;left:-9999px}
.em-sl{position:fixed;right:16px;bottom:16px;z-index:9996;width:min(360px,calc(100% - 24px));box-shadow:0 14px 40px rgba(0,0,0,.28);animation:emUp .25s ease}
.em-sl .em-box{margin:0;padding:16px 16px 14px;position:relative}.em-sl .em-h{font-size:17px}.em-sl .em-p{font-size:13.5px;margin-bottom:10px}
.em-sl .em-x{position:absolute;top:6px;right:10px;border:0;background:none;font-size:22px;line-height:1;color:var(--ink-2,#4A5672);cursor:pointer}
@media(max-width:600px){.em-sl{right:12px;left:12px;width:auto;bottom:max(12px,env(safe-area-inset-bottom))}}
@keyframes emUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}`;
  function box(src,o){o=o||{};const d=document.createElement("div");d.className="em-box";d.id="emBox";
    d.innerHTML=`<div class="em-k">${o.k||"Free · Every Sunday"}</div><div class="em-h">${o.h||"One finance curveball a week"}</div><p class="em-p">${o.p||"A real interview question, one tip for breaking in, and a guide worth reading. Takes 2 minutes. Unsubscribe anytime."}</p>
      <form class="em-f" novalidate><input type="email" name="email" placeholder="you@school.edu" autocomplete="email" required aria-label="Email address"><input class="em-hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><button type="submit">${o.btn||"Get it free"}</button></form><div class="em-msg" role="status"></div><div class="em-msg" style="font-size:12px">By subscribing you agree to our <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>. Unsubscribe anytime.</div>`;
    const f=d.querySelector("form"),m=d.querySelector(".em-msg"),b=f.querySelector("button");
    f.onsubmit=async e=>{e.preventDefault();const email=f.email.value.trim();if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)){m.textContent="Please enter a valid email.";return}
      b.disabled=true;b.textContent="Signing up…";
      try{const r=await fetch("/.netlify/functions/subscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,hp:f.hp.value,src})});const j=await r.json().catch(()=>({}));
        if(r.ok){try{localStorage.setItem("ma-sub","1")}catch(x){}d.innerHTML=`<div class="em-k">You're in ✓</div><div class="em-h">${o.doneH||"See you Sunday."}</div><p class="em-p" style="margin:0">${j.already?"You were already on the list.":"Check your inbox for a welcome email (and your spam folder, just in case)."}</p>`}
        else{m.textContent=j.error||"Something went wrong. Try again.";b.disabled=false;b.textContent=o.btn||"Get it free"}}
      catch(x){m.textContent="Couldn't connect. Try again.";b.disabled=false;b.textContent=o.btn||"Get it free"}};
    return d}
  window.maEmailBox=(src,o)=>{if(!document.getElementById("emCss")){const st=document.createElement("style");st.id="emCss";st.textContent=css;document.head.appendChild(st)}return box(src,o)};
  const TOOLS={"#res":{src:"cheatsheet:superday",k:"Free · Cheat sheet",h:"Get the 50-question cheat sheet",p:"We'll email you the PDF (short answers you can say out loud), then one curveball every Sunday. Unsubscribe anytime.",btn:"Email it to me",doneH:"Cheat sheet on its way."},
    "#out":{src:"alerts:timeline",k:"Free · Every Sunday",h:"Get told when applications open",p:"Each Sunday: which internship applications just opened or close soon, plus one interview question. Unsubscribe anytime.",btn:"Notify me",doneH:"You're on the list."}};
  function toolBox(){for(const sel of Object.keys(TOOLS)){const el=document.querySelector("main "+sel);if(!el)continue;const o=TOOLS[sel];
      const put=()=>{if(el.textContent.trim().length<3||document.getElementById("emBox"))return;const b=window.maEmailBox(o.src,o);b.style.margin="18px 0";el.after(b)};
      new MutationObserver(put).observe(el,{childList:true,subtree:true});put()}}
  /* Cheat-sheet slide-in on guide pages: once per session, after ~45% scroll or 30s, never again for 7 days if closed. */
  function slideIn(slug){
    const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
    const SS={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}}};
    if(done()||SS.get("ma-em-sl")||Date.now()-(+LS.get("ma-em-x")||0)<6048e5)return;
    const ev=n=>{try{window.maEv&&window.maEv(n)}catch(e){}};let shown=false;
    const show=()=>{if(shown||done()||document.querySelector(".gw-ov,.em-sl,.gw-gate"))return; /* one ask at a time: skip while the guide sign-up gate is up */shown=true;SS.set("ma-em-sl","1");
      const w=document.createElement("div");w.className="em-sl";w.setAttribute("role","complementary");
      const b=window.maEmailBox("cheatsheet:slide-"+slug,{k:"Free · Cheat sheet",h:"Get the 50 IB interview questions cheat sheet",p:"Short answers you can say out loud, emailed as a PDF. Plus one curveball question every Sunday.",btn:"Email it to me",doneH:"Cheat sheet on its way."});
      b.id="emSlide";const x=document.createElement("button");x.type="button";x.className="em-x";x.setAttribute("aria-label","Close");x.textContent="×";
      x.onclick=()=>{LS.set("ma-em-x",String(Date.now()));ev("em_slide_dismiss");w.remove()};b.appendChild(x);w.appendChild(b);document.body.appendChild(w);ev("em_slide_shown");
      const o=new MutationObserver(()=>{if(done()){ev("em_slide_signup");o.disconnect();setTimeout(()=>w.remove(),5000)}});o.observe(b,{childList:true})};
    const onScroll=()=>{const h=document.documentElement;if((scrollY+innerHeight)/h.scrollHeight>.45){removeEventListener("scroll",onScroll);show()}};
    addEventListener("scroll",onScroll,{passive:true});setTimeout(show,30000);
    document.addEventListener("mouseout",e=>{if(!e.relatedTarget&&e.clientY<=0&&matchMedia("(hover:hover)").matches)show()});}
  function init(){if(done()||document.getElementById("emBox"))return;
    if(/^\/tools\//.test(location.pathname)){toolBox();return}
    const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
    if(/^\/guides\//.test(location.pathname)){const h=[...document.querySelectorAll("main h2")].find(x=>/More free guides/.test(x.textContent));const slug=location.pathname.split("/")[2]||"index";
      if(h)h.before(box("guide:"+slug));else{const m=document.querySelector("main");if(m)m.appendChild(box("guide:"+slug))}slideIn(slug);return}
    const tryCurve=()=>{const w=document.querySelector("#curve .cb-wrap");if(!w)return false;if(!document.getElementById("emBox")){const d=w.querySelector("#cbDaily");const b=box("curveballs");b.style.margin="0";d?d.after(b):w.appendChild(b)}return true};
    if(!tryCurve()){let n=0;const t=setInterval(()=>{if(tryCurve()||++n>40)clearInterval(t)},500)}}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
