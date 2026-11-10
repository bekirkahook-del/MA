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
.hero:not(:has(.hl-land)) #continue{order:7}.hero:not(:has(.hl-land)) #homeDuo{order:8}.hero:not(:has(.hl-land)) #quests{order:9}.hero:not(:has(.hl-land)) #planCard{order:10}.hero:not(:has(.hl-land)) .side-up{order:11}`;
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

  function init(){const t=$("#xpText"),c=t&&t.closest(".card");if(c)c.hidden=false;challenge();market()}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(init,80));else setTimeout(init,80);
})();
