/* Real reviews (Nov 21, 2026). No fake reviews, ever: everything here comes from members' own reviews.
   1) Ask at a good moment: a signed-in member who just cleared a level with 2+ stars, has 3+ levels cleared, hasn't
      reviewed yet and wasn't asked in the last 14 days gets one small "Rate M&A Prep" card (dismissible).
   2) Homepage rating strip: the real average and count, shown only once there are 10+ real reviews. */
(function(){
  const MIN_SHOW=10,GAP=14*864e5,K="ma-rev-ask";
  const st=document.createElement("style");
  st.textContent=`.ra-card{position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9997;width:min(440px,calc(100% - 24px));display:flex;align-items:center;gap:10px;padding:12px 12px 12px 14px;border-radius:8px;background:#13203B;color:#fff;font-size:14.5px;line-height:1.4;box-shadow:0 12px 32px rgba(0,0,0,.3)}
.ra-card .m{flex:1}.ra-card button.go{font:inherit;font-size:13.5px;font-weight:700;padding:8px 12px;border:0;border-radius:6px;background:#2448D8;color:#fff;cursor:pointer;white-space:nowrap}
.ra-card button.x{border:0;background:none;color:#B8C2DA;font-size:20px;cursor:pointer;padding:0 2px}
.ra-strip{display:inline-flex;align-items:center;gap:8px;margin:10px auto 0;font-size:14px;color:var(--ink-2);background:none;border:0;cursor:pointer}
.ra-strip b{color:var(--ink);font-size:16px}.ra-strip .s{color:#e0a400;letter-spacing:1px}`;
  document.head.appendChild(st);
  const ev=n=>{try{window.maEv&&maEv(n)}catch(e){}};
  const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
  const revs=()=>{try{return (typeof REVIEWS!=="undefined"&&REVIEWS)||[]}catch(e){return []}};
  const me=()=>{try{return (typeof myId!=="undefined"&&myId)||""}catch(e){return ""}};
  function eligible(){try{if(typeof dbState==="undefined"||dbState!=="on"||!me())return false;if(typeof canReview!=="function"||!canReview())return false;
      if(revs().some(r=>r.id===me()))return false;if(Date.now()-(+LS.get(K)||0)<GAP)return false;
      if(document.querySelector(".ra-card,.gw-tc,.ej-g"))return false;return true}catch(e){return false}}
  function ask(){if(!eligible())return;LS.set(K,String(Date.now()));ev("review_ask_shown");
    const d=document.createElement("div");d.className="ra-card";d.setAttribute("role","status");
    d.innerHTML=`<span class="m">Nice work. How's M&amp;A Prep helping you so far? An honest rating helps other students.</span><button class="go" type="button">Rate it</button><button class="x" type="button" aria-label="Dismiss">×</button>`;
    let t=0;const close=()=>{clearTimeout(t);d.remove()};
    d.querySelector(".go").onclick=()=>{ev("review_ask_click");close();try{closePanel()}catch(e){}try{writeReview(null)}catch(e){}};
    d.querySelector(".x").onclick=()=>{ev("review_ask_dismiss");close()};
    document.body.appendChild(d);t=setTimeout(close,16000)}
  /* after a level with 2+ stars: questEvt("level") fires only for c>=2 */
  (function hook(n){const q=window.questEvt;if(typeof q!=="function"){if(n<40)setTimeout(()=>hook(n+1),250);return}if(q.__ra)return;
    const w=function(k){const r=q.apply(this,arguments);try{if(k==="level")setTimeout(ask,2600)}catch(e){}return r};w.__ra=1;window.questEvt=w})(0);
  /* homepage strip with the real average, only from 10+ real reviews */
  function strip(){const list=revs().filter(r=>r.rating>=1&&r.rating<=5);const el=document.getElementById("raStrip");
    if(list.length<MIN_SHOW){if(el)el.remove();return}
    const avg=list.reduce((a,r)=>a+r.rating,0)/list.length;const host=document.querySelector('[data-view="home"] .hl-land h1')||document.querySelector('[data-view="home"] .hero h1');if(!host)return;
    const html=`<b>${avg.toFixed(1)}</b><span class="s" aria-hidden="true">${"★".repeat(Math.round(avg))}${"☆".repeat(5-Math.round(avg))}</span><span>from ${list.length} student reviews</span>`;
    if(el){el.innerHTML=html;return}
    const b=document.createElement("button");b.type="button";b.id="raStrip";b.className="ra-strip";b.setAttribute("aria-label",`Rated ${avg.toFixed(1)} out of 5 from ${list.length} student reviews. See reviews`);b.innerHTML=html;
    b.onclick=()=>{ev("review_strip_click");try{showTab("pro");setTimeout(()=>{const r=document.getElementById("reviews");r&&r.scrollIntoView({behavior:"smooth"})},300)}catch(e){}};
    host.after(b)}
  (function hookRender(n){if(typeof renderReviews!=="function"){if(n<40)setTimeout(()=>hookRender(n+1),250);return}if(renderReviews.__ra)return;
    const o=renderReviews;renderReviews=function(){const r=o.apply(this,arguments);try{strip()}catch(e){}return r};renderReviews.__ra=1;try{strip()}catch(e){}})(0);
  (function hookHome(n){if(typeof renderHome!=="function"){if(n<40)setTimeout(()=>hookHome(n+1),250);return}if(renderHome.__ra)return;
    const o=renderHome;renderHome=function(){const r=o.apply(this,arguments);try{strip()}catch(e){}return r};renderHome.__ra=1})(0);
})();
