/* Home page cleanup (Nov 2026): same content, fewer blocks.
   1. On the first-visit landing, the greeting spans the page, then Current title (Intern → Summer Analyst), then today's challenge.
   2. Daily question + Curveball share one "Today's challenge" card with two tabs.
   3. Market open/closed status sits inside the ticker and Market search sits at the right end of the ticker (the extra row under it is gone).
   4. Learn / Practice / Land it is a slim row (CSS).
   5. The "0 XP · Intern" header chip is gone (it repeated the title card). */
(function(){
  const css=`.tape .mkt{flex:none;display:inline-flex;align-items:center;gap:6px;padding:0 14px;background:#0B1222;color:#E8ECF5;border-right:1px solid #1C2640;font-family:var(--mono,monospace);font-size:11.5px;letter-spacing:.06em;z-index:2;position:relative}
.tape-bar{display:none!important}
.tape #tapeSearch{flex:none;display:inline-flex;align-items:center;gap:6px;padding:0 14px;background:#0B1222;color:#E8ECF5;border:0;border-left:1px solid #1C2640;border-radius:0;font-family:var(--mono,monospace);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;z-index:2;position:relative;cursor:pointer}
.tape #tapeSearch:hover{background:#16203A}
@media(max-width:600px){.tape .mkt{padding:0 10px}.tape .mkt #mktTxt{display:none}.tape #tapeSearch{font-size:0;gap:0;padding:0 12px}}
#xpChip{display:none!important}
.tc-tabs{display:flex;justify-content:space-around;border-bottom:1px solid var(--rule);margin:0 0 12px}
.tc-tabs button{flex:0 0 auto;font:inherit;font-size:12px;font-family:var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;background:none;border:0;border-bottom:2px solid transparent;color:var(--ink-2);padding:6px 2px;cursor:pointer}
.tc-tabs button[aria-selected="true"]{color:var(--ink);border-bottom-color:var(--cobalt)}
.side-daily .cb-home{margin:0!important;border:0!important;padding:0!important;background:none!important}
body .hl-how{gap:8px}
body .hl-step{padding:10px 12px!important;gap:2px!important}
body .hl-step .hl-n{width:20px;height:20px;font-size:10.5px}
body .hl-step b{font-size:14px}
body .hl-step>span:last-child{font-size:12px!important;line-height:1.4!important}
.hero-side .side-daily{border-top:0!important;padding-top:0!important;margin-top:0!important;width:100%}
.side-daily .daily-top .label,.side-daily .cb-home .cb-k{display:none}
.side-daily .daily-top{justify-content:flex-end}
/* first-visit landing: one centered column, challenge card centered underneath */
.hero:has(.hl-land){grid-template-columns:1fr!important;gap:28px!important;align-items:start!important}
.hero:has(.hl-land) .hl-land{align-items:center;text-align:center}
.hero:has(.hl-land) .hl-land>p{margin-inline:auto!important}
.hero:has(.hl-land) .hl-cta{justify-content:center}
.hero:has(.hl-land) .hl-proof,.hero:has(.hl-land) .hl-how{width:100%;max-width:820px;margin-inline:auto}
.hero:has(.hl-land) .hl-proof div{align-items:center;text-align:center}
.hero:has(.hl-land) .hl-step{display:flex!important;flex-direction:column!important;align-items:center!important;text-align:center}
.hero:has(.hl-land) .hl-n{grid-row:auto!important}
main footer,.layout footer,body>footer,footer{text-align:center;justify-content:center;flex-wrap:wrap}
.hero:has(.hl-land) .hero-side{width:100%;max-width:820px;margin:0 auto;display:flex;flex-direction:column;gap:16px}
.hero:has(.hl-land) .hero-side>.card{border:1px solid var(--rule);border-radius:14px;background:var(--sheet);padding:16px 22px;text-align:center}
.hero:has(.hl-land) .hero-side>.card .rank-row{justify-content:center;gap:14px}
.hero:has(.hl-land) .hero-side>.card .stats,.hero:has(.hl-land) .hero-side>.card .ladder{justify-content:center}
.hero:has(.hl-land) .side-daily{border:1px solid var(--rule)!important;border-radius:14px;background:var(--sheet);padding:6px 20px 18px!important}
.hero:has(.hl-land) .side-daily .daily-top{justify-content:center}
.hero:has(.hl-land) .daily-q{text-align:center;margin-inline:auto}.hero:has(.hl-land) .side-daily .daily,.hero:has(.hl-land) .side-daily .cb-home{text-align:center}
.hero:has(.hl-land) .side-daily .cb-home{flex-direction:column;align-items:center}
/* returning visitors: greeting across the page, then Current title, then today's challenge, then Continue and the rest */
.hero:not(:has(.hl-land)){display:flex!important;flex-direction:column!important;gap:16px!important;align-items:stretch!important}
.hero:not(:has(.hl-land))>div,.hero:not(:has(.hl-land))>.hero-side{display:contents!important}
.hero:not(:has(.hl-land)) #homeDate{order:1;text-align:center}.hero:not(:has(.hl-land)) #greet{order:2;text-align:center;margin:0}.hero:not(:has(.hl-land)) #homeSub{order:3;text-align:center;margin:0 0 6px}
.hero:not(:has(.hl-land)) #rwHome{order:5}.hero:not(:has(.hl-land)) #homeSub{width:100%;max-width:none!important}.hero:not(:has(.hl-land)) .daily-q{text-align:center;margin-inline:auto}
.hero:not(:has(.hl-land)) .hero-side>.card{order:4;border:1px solid var(--rule);border-radius:14px;background:var(--sheet);padding:16px 22px;text-align:center}
.hero:not(:has(.hl-land)) .hero-side>.card .rank-row{justify-content:center;gap:14px}
.hero:not(:has(.hl-land)) .hero-side>.card .stats{justify-content:space-around}
.hero:not(:has(.hl-land)) .side-daily{order:6;border:1px solid var(--rule)!important;border-radius:14px;background:var(--sheet);padding:6px 20px 18px!important}
.hero:not(:has(.hl-land)) .side-daily .daily-top{justify-content:center}.hero:not(:has(.hl-land)) .side-daily .daily,.hero:not(:has(.hl-land)) .side-daily .cb-home{text-align:center}.hero:not(:has(.hl-land)) .side-daily .cb-home{flex-direction:column;align-items:center}
.hero:not(:has(.hl-land)) #continue{order:7}.hero:not(:has(.hl-land)) #homeDuo{order:8}.hero:not(:has(.hl-land)) #quests{order:9}.hero:not(:has(.hl-land)) #planCard{order:10}.hero:not(:has(.hl-land)) .side-up{order:11}
/* depth behind the greeting: soft blue glow + faint dot grid, fading out */
[data-view="home"] .hero{position:relative;isolation:isolate}
[data-view="home"] .hero::before{content:"";position:absolute;z-index:-1;top:-34px;left:calc(50% - 50vw);width:100vw;height:560px;pointer-events:none;
 background:radial-gradient(color-mix(in srgb,var(--ink) 13%,transparent) 1px,transparent 1.2px) 0 0/22px 22px,radial-gradient(60% 70% at 50% 0%,color-mix(in srgb,var(--cobalt) 10%,transparent),transparent 70%);
 -webkit-mask-image:linear-gradient(180deg,#000 35%,transparent);mask-image:linear-gradient(180deg,#000 35%,transparent)}
/* step icons */
.hl-step .hl-n.ic{width:34px!important;height:34px!important;border-radius:10px!important}
.hl-step .hl-n.ic svg{width:18px;height:18px}
/* real proof line */
.hl-trust{margin:-2px 0 0;font-size:13.5px;color:var(--ink-2)}.hl-trust b{color:var(--ink)}
/* today's challenge goes last on the returning home */
.hero:not(:has(.hl-land)) .side-daily{order:99!important}
.hero:not(:has(.hl-land)) #planCard{text-align:center}
/* footer: 3 even columns */
footer .ft-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;width:100%;margin:6px 0 14px;text-align:center}
footer .ft-cols b{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink);margin-bottom:8px;font-family:var(--mono,monospace)}
footer .ft-cols a{display:block;color:var(--ink-2);text-decoration:none;font-size:13.5px;margin:5px 0}footer .ft-cols a:hover{color:var(--cobalt)}
footer>a,footer>a+*{}footer>a[href="/guides/"],footer>a[href="/tools/"],footer>a[href="/deals/"]{display:none}
footer{flex-direction:column;align-items:center}
@media(max-width:560px){footer .ft-cols{grid-template-columns:1fr 1fr 1fr;gap:10px}footer .ft-cols a{font-size:12.5px}}
/* product preview under the landing button */
.pv{position:relative;width:100%;max-width:440px;margin:6px auto 4px;transform:rotate(-1.5deg)}
.pv-card{background:var(--sheet);border:1px solid var(--rule);border-radius:16px;padding:16px 18px;text-align:left;box-shadow:0 18px 40px rgba(19,32,59,.10),0 2px 6px rgba(19,32,59,.06)}
.pv-k{display:flex;justify-content:space-between;font-family:var(--mono,monospace);font-size:11px;letter-spacing:.08em;color:var(--ink-2);text-transform:uppercase;margin-bottom:8px}
.pv-q{font-weight:600;font-size:15px;margin:0 0 10px;color:var(--ink)}
.pv-o{display:block;width:100%;text-align:left;font:inherit;font-size:14px;background:var(--paper);color:var(--ink);border:1px solid var(--rule);border-radius:10px;padding:8px 11px;margin:6px 0;cursor:pointer;transition:border-color .15s,background .15s}
.pv-o:hover{border-color:var(--cobalt)}.pv-o.y{border-color:#16A06A;background:color-mix(in srgb,#16A06A 12%,var(--sheet))}.pv-o.n{border-color:#C33;background:color-mix(in srgb,#C33 10%,var(--sheet))}
.pv-why{font-size:13px;color:var(--ink-2);margin:8px 0 0}
.pv-xp{position:absolute;top:-14px;right:-12px;background:linear-gradient(90deg,var(--cobalt),#7357F6);color:#fff;font-weight:700;font-size:13px;border-radius:99px;padding:6px 12px;box-shadow:0 8px 20px color-mix(in srgb,var(--cobalt) 35%,transparent);transform:rotate(4deg)}
.pv-xp.pop{animation:pvPop .6s cubic-bezier(.2,1.6,.4,1)}@keyframes pvPop{0%{transform:rotate(4deg) scale(.6)}100%{transform:rotate(4deg) scale(1)}}
@media(prefers-reduced-motion:reduce){.pv,.pv-xp{transform:none}.pv-xp.pop{animation:none}}
/* live this week row */
.lw{width:100%;max-width:820px;margin:4px auto 0}
.hero .lw .lw-h{display:block;width:100%;max-width:none!important;margin:0 0 10px!important;font-size:12px!important;text-align:center!important;font-weight:400;font-family:var(--mono,monospace);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-2);margin:0 0 10px}
.lw-h i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#16A06A;margin-right:7px;vertical-align:1px;animation:livePulse 1.6s infinite}
.lw-row{display:grid;grid-template-columns:repeat(var(--n,3),1fr);gap:10px}
.lw-c{font:inherit;text-align:left;background:var(--sheet);border:1px solid var(--rule);border-top:3px solid var(--ac,var(--cobalt));border-radius:12px;padding:12px 14px;cursor:pointer;color:inherit;display:flex;flex-direction:column;gap:4px;transition:transform .15s,box-shadow .15s}
.lw-c:hover{transform:translateY(-2px);box-shadow:0 10px 24px rgba(19,32,59,.08)}
.lw-c span{font-family:var(--mono,monospace);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ac,var(--cobalt))}
.lw-c b{font-size:14px;line-height:1.35;color:var(--ink)}.lw-c em{font-style:normal;font-size:12px;color:var(--ink-2)}
@media(max-width:620px){.lw-row{grid-template-columns:1fr!important}}
.hero:not(:has(.hl-land)) .lw{order:98}
/* section headings centered for symmetry */
.pane>h2,.pane>.sec-title,.pane .sec-head{text-align:center}`;
  const st=document.createElement("style");st.id="simplify";st.textContent=css;document.head.appendChild(st);
  const $=s=>document.querySelector(s);

  /* 1. title card */
  function titleCard(){const t=$("#xpText"),card=t&&t.closest(".card");if(!card)return;
    const show=!/^\s*0\s*XP/i.test(t.textContent||"");if(card.hidden===show)card.hidden=!show}
  function watchXP(){const t=$("#xpText");if(!t)return setTimeout(watchXP,300);titleCard();
    new MutationObserver(titleCard).observe(t,{childList:true,characterData:true,subtree:true})}

  /* 2. today's challenge */
  let tries=0;
  function challenge(){const sec=document.querySelector("section.side-daily"),cb=$("#cbHome"),d=$("#daily");
    if(!sec||!d||!cb){if(++tries<40)setTimeout(challenge,150);return}
    if(sec.querySelector(".tc-tabs"))return;
    const tabs=document.createElement("div");tabs.className="tc-tabs";tabs.setAttribute("role","tablist");
    tabs.innerHTML=`<button type="button" role="tab" aria-selected="true" data-k="d">Daily question</button><button type="button" role="tab" aria-selected="false" data-k="c">Curveball</button>`;
    sec.prepend(tabs);sec.appendChild(cb);
    const pick=k=>{d.hidden=k!=="d";cb.hidden=k!=="c";tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.k===k)))};
    tabs.onclick=e=>{const b=e.target.closest("button");if(b)pick(b.dataset.k)};pick("d");
    /* curve.js re-renders the card in place; keep it inside our section */
    new MutationObserver(()=>{if(cb.parentElement!==sec)sec.appendChild(cb)}).observe(sec.parentElement,{childList:true})}

  /* 3. market status inside the ticker */
  function market(){const m=$("#mkt"),tape=$(".tape");if(!m||!tape)return setTimeout(market,300);
    if(m.parentElement!==tape)tape.prepend(m);const q=$("#tapeSearch");if(q&&q.parentElement!==tape)tape.appendChild(q)}


  /* 4. icons in the Learn / Practice / Land it cards */
  const ICONS=['<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
    '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".6"/>',
    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12h18"/>'];
  function icons(){document.querySelectorAll(".hl-step .hl-n:not(.ic)").forEach((n,i)=>{n.classList.add("ic");n.setAttribute("aria-hidden","true");
    n.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[i%3]}</svg>`})}
  /* 5. real proof line: only shown once the real account count is worth showing */
  let students=null;
  fetch("/.netlify/functions/stats").then(r=>r.ok?r.json():null).then(j=>{if(j&&j.students>=50){students=j.students;trust()}}).catch(()=>{});
  function trust(){const cta=document.querySelector(".hl-cta");if(!cta||students==null||document.querySelector(".hl-trust"))return;
    const p=document.createElement("p");p.className="hl-trust";p.innerHTML=`Join <b>${students.toLocaleString()}</b> students training on M&amp;A Prep`;cta.after(p)}
  /* 6. footer columns */
  function footer(){const f=document.querySelector("footer");if(!f||f.querySelector(".ft-cols"))return;const d=document.createElement("div");d.className="ft-cols";
    d.innerHTML=`<div><b>Guides</b><a href="/guides/investment-banking-interview-questions/">IB interview questions</a><a href="/guides/investment-banking-recruiting-timeline/">Recruiting timeline</a><a href="/guides/superday-guide/">Superday guide</a><a href="/guides/">All guides</a></div>
<div><b>Free tools</b><a href="/tools/recruiting-timeline-calculator/">Timeline calculator</a><a href="/tools/superday-readiness-test/">Superday test</a><a href="/tools/investment-banking-pay/">IB pay by level</a><a href="/deals/">Deal database</a></div>
<div><b>M&amp;A Prep</b><a href="/tools/embed/">Add our widget</a><a href="https://calendar.google.com/calendar/render?cid=webcal://mnaprep.com/calendar.ics" target="_blank" rel="noopener">Deadline calendar</a><a href="/feed.xml">RSS feed</a><a href="/guides/#schools">IB by school</a></div>`;f.prepend(d);[...f.childNodes].forEach(n=>{if(n.nodeType===3&&/^[\s·]*$/.test(n.textContent))n.remove()})}
  /* the landing re-renders; keep icons and the proof line on it */
  function keep(){const v=document.querySelector(".hero");if(!v)return setTimeout(keep,300);let busy=false;new MutationObserver(()=>{if(busy)return;busy=true;icons();trust();preview();live();busy=false}).observe(v,{childList:true,subtree:true});icons();trust();preview();live();setInterval(live,60000)}

  /* 7. product preview: a real sample question with a +10 XP badge */
  function preview(){const cta=document.querySelector(".hl-land .hl-cta");if(!cta||document.querySelector(".pv"))return;
    const after=document.querySelector(".hl-trust")||cta;const d=document.createElement("div");d.className="pv";d.setAttribute("aria-label","Sample question");
    d.innerHTML=`<span class="pv-xp">+10 XP</span><div class="pv-card"><div class="pv-k"><span>Level 1 · The three statements</span><span>1 of 8</span></div>
<p class="pv-q">Depreciation goes up by $10. Tax rate is 25%. What happens to cash?</p>
<button class="pv-o" data-i="0">Down $10</button><button class="pv-o" data-i="1">Up $2.50</button><button class="pv-o" data-i="2">No change</button>
<p class="pv-why" hidden></p></div>`;after.after(d);
    let done=false;d.querySelectorAll(".pv-o").forEach(b=>b.onclick=()=>{if(done)return;done=true;const ok=b.dataset.i==="1";
      d.querySelectorAll(".pv-o").forEach(x=>{if(x.dataset.i==="1")x.classList.add("y");else if(x===b)x.classList.add("n")});
      const w=d.querySelector(".pv-why");w.hidden=false;w.innerHTML=(ok?"<b>Nice.</b> ":"<b>Close.</b> ")+"Net income falls $7.50, but you add back the $10 non-cash expense, so cash goes up $2.50. <a href=\"#\" class=\"pv-go\">Play Level 1 →</a>";
      w.querySelector(".pv-go").onclick=e=>{e.preventDefault();const g=document.getElementById("landGo");if(g)g.click()};
      if(ok){const x=d.querySelector(".pv-xp");x.classList.remove("pop");void x.offsetWidth;x.classList.add("pop")}})}
  /* 8. live this week: newest story, newest deal, soonest open application, all from The Wire */
  function live(){const hero=document.querySelector(".hero");if(!hero)return;let el=document.querySelector(".lw");
    const g=v=>{try{return eval(v)}catch(e){return null}};const N=g("NEWS")||[],D=g("DEALS")||[],A=g("APP_OPEN")||[];if(!N.length)return;
    const ts=d=>Date.parse(d&&d.date)||0;const deal=D.slice().sort((a,b)=>ts(b)-ts(a))[0];
    const today=new Date().toISOString().slice(0,10);const app=A.filter(a=>a[3]==="open"&&(!a[6]||a[6]>today)).sort((a,b)=>String(a[6]||"9").localeCompare(String(b[6]||"9")))[0];
    const esc2=t=>String(t||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
    const cards=[`<button class="lw-c" style="--ac:var(--cobalt)" data-go="news"><span>Top story · ${esc2(N[0].d)}</span><b>${esc2(N[0].h)}</b><em>Read on The Wire →</em></button>`];
    if(deal)cards.push(`<button class="lw-c" style="--ac:#7357F6" data-go="deal"><span>Newest deal · ${esc2(deal.value)}</span><b>${esc2(deal.buyer)} → ${esc2(deal.target)}</b><em>Break it down →</em></button>`);
    if(app)cards.push(`<button class="lw-c" style="--ac:#16A06A" data-go="apps"><span>Applications open${app[6]?" · closes "+esc2(app[6].slice(5).replace("-","/")):""}</span><b>${esc2(app[0])}: ${esc2(app[1])}</b><em>See all openings →</em></button>`);
    const html=`<p class="lw-h"><i></i>Live this week</p><div class="lw-row" style="--n:${cards.length}">${cards.join("")}</div>`;
    if(!el){el=document.createElement("section");el.className="lw";const side=hero.querySelector(".hero-side");if(!side)return;side.insertBefore(el,side.querySelector(".side-daily"))}
    if(el.dataset.h!==html){el.innerHTML=html;el.dataset.h=html;
      el.onclick=e=>{const b=e.target.closest(".lw-c");if(!b)return;const k=b.dataset.go;try{if(k==="news")toggleWire(true);else if(k==="deal")showSub("learn","deals");else showTab("recruit")}catch(x){}}}}
  function init(){const t=$("#xpText"),c=t&&t.closest(".card");if(c)c.hidden=false;challenge();market();footer();keep()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,80));else setTimeout(init,80);
})();
