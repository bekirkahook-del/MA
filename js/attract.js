/* ================= 17 attract: rank percentile, trust block, Pro preview after a good score ================= */
(function(){
  /* Add real student quotes here, e.g. {q:"Got me through my Kelley Superday prep.",n:"Junior, Indiana"}. Nothing shows until you add real ones. */
  window.MA_TESTIMONIALS=window.MA_TESTIMONIALS||[];

  const others=()=>{try{return(typeof PLAYERS!=="undefined"?PLAYERS:[]).filter(p=>p.id!==myId&&!p.hidden)}catch(e){return[]}};
  function pctl(){try{
    const xp=totalXP(),o=others(),n=o.length;if(n<3)return null;
    const behind=o.filter(p=>(p.xp||0)<xp).length,rank=o.filter(p=>(p.xp||0)>xp).length+1;
    return{n:n+1,rank,pct:Math.round(behind/n*100)};
  }catch(e){return null}}
  function pctlLine(){const p=pctl();if(!p)return"";
    if(p.n>=10&&p.pct>=50)return`You're ahead of ${p.pct}% of players · #${p.rank} of ${p.n}`;
    return`You're #${p.rank} of ${p.n} players · every level moves you up`}

  /* 2. rank feedback: home rank card + level-complete panel */
  const _rh=renderHome;
  renderHome=function(){_rh.apply(this,arguments);try{
    const view=document.querySelector('[data-view="home"]');if(!view)return;
    /* rank line on the dashboard */
    let el=$("#pctlHome");const line=totalXP()>0?pctlLine():"";
    if(line){if(!el){el=document.createElement("div");el.id="pctlHome";el.className="pctl";const nt=$("#nextText");if(nt)nt.after(el)}if(el)el.textContent=line}
    else if(el)el.remove();
    /* 4. trust block under the landing proof row */
    const land=$("#homeLand");
    if(land&&land.dataset.on&&!land.querySelector(".hl-trust")){
      const o=others().length+1,T=window.MA_TESTIMONIALS||[];
      const quotes=T.slice(0,2).map(t=>`<blockquote>“${esc(t.q)}”<cite>${esc(t.n||"")}</cite></blockquote>`).join("");
      const html=`<div class="hl-trust"><b>Built by a finance student, for finance students.</b><span>Made by Bekir Kahook, Ohio State finance (Class of 2030), while preparing for recruiting himself.${o>=3?` ${o} students are training here.`:""}</span>${quotes}</div>`;
      const anchor=land.querySelector(".hl-how");if(anchor)anchor.insertAdjacentHTML("beforebegin",html);else land.insertAdjacentHTML("beforeend",html);
    }
  }catch(e){console.error(e)}};

  const pan=document.getElementById("panel");
  if(pan)new MutationObserver(()=>{try{
    const stars=pan.querySelector(".big-stars");
    if(stars&&!pan.querySelector(".pctl")){const l=pctlLine();if(l)stars.insertAdjacentHTML("afterend",`<div class="pctl">${esc(l)}</div>`)}
  }catch(e){}}).observe(pan,{childList:true,subtree:true});

  /* 6. Pro preview right after a strong mock-interview score */
  const mock=document.getElementById("mock");
  const seenToday=()=>{try{return localStorage.getItem("ma_pp_day")===today()}catch(e){return false}};
  const markSeen=()=>{try{localStorage.setItem("ma_pp_day",today())}catch(e){}};
  if(mock)new MutationObserver(()=>{try{
    if(isPro()||seenToday()||mock.querySelector(".pro-prev"))return;
    const g=mock.querySelector(".grade .score div");if(!g)return;
    const sc=parseInt(g.textContent,10);if(!(sc>=7))return;
    const grade=mock.querySelector(".grade");if(!grade)return;
    grade.insertAdjacentHTML("afterend",`<div class="pro-prev"><b>${sc}/10. That's a Superday-level answer.</b><span>Pro runs 4 of these back to back, then a hiring committee debrief tells you what to fix.</span><button class="btn sm" id="ppGo">Try the Superday simulator</button></div>`);
    markSeen();const b=document.getElementById("ppGo");if(b)b.onclick=()=>upgrade("You're answering at Superday level");
  }catch(e){}}).observe(mock,{childList:true,subtree:true});

  const st=document.createElement("style");st.textContent=`
.pctl{margin:8px 0 2px;font-size:13px;font-weight:600;color:var(--cobalt);font-variant-numeric:tabular-nums}
.big-stars+.pctl{text-align:center;margin:10px 0 0}
.hl-trust{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border:1px solid var(--rule);border-radius:10px;margin-top:6px}
.hl-trust b{font-size:14px}
.hl-trust span{font-size:13px;color:var(--ink-2);line-height:1.5}
.hl-trust blockquote{margin:8px 0 0;font-size:13.5px;line-height:1.5}
.hl-trust cite{display:block;font-style:normal;font-size:12px;color:var(--ink-2);margin-top:2px}
.pro-prev{display:flex;flex-direction:column;gap:6px;align-items:flex-start;margin-top:14px;padding:14px;border:1px solid var(--cobalt);border-radius:10px;background:color-mix(in srgb,var(--cobalt) 6%,transparent)}
.pro-prev b{font-size:14.5px}
.pro-prev span{font-size:13px;color:var(--ink-2);line-height:1.5}
`;document.head.appendChild(st);
  try{renderHome()}catch(e){}
})();
