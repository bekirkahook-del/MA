/* ================= 18 visuals: hero career-path chart, tab icons, subtle texture ================= */
/* To turn all of this off, delete the <script src="js/18-visuals.js"> line in index.html. */
(function(){
  const reduce=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){return false}})();

  /* 1. Hero: an illustrative career-path chart that draws itself in */
  const heroSVG=`<figure class="hl-vis" aria-label="Illustrative career path from analyst to managing director">
  <svg viewBox="0 0 320 132" role="img" aria-hidden="true">
    <defs>
      <linearGradient id="hvFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--cobalt)" stop-opacity=".22"/><stop offset="1" stop-color="var(--cobalt)" stop-opacity="0"/></linearGradient>
    </defs>
    <g class="hv-grid" stroke="currentColor" stroke-width=".5" opacity=".14">
      <path d="M0 24H320M0 54H320M0 84H320M0 114H320"/><path d="M28 6V120M118 6V120M208 6V120M296 6V120" stroke-dasharray="2 4"/>
    </g>
    <path class="hv-area" d="M28 100C70 98 90 82 118 78S180 56 208 50 270 26 296 18L296 120L28 120Z" fill="url(#hvFill)"/>
    <path class="hv-line" pathLength="1" d="M28 100C70 98 90 82 118 78S180 56 208 50 270 26 296 18" fill="none" stroke="var(--cobalt)" stroke-width="2.2" stroke-linecap="round"/>
    ${[[28,100,"Analyst"],[118,78,"Associate"],[208,50,"VP"],[296,18,"MD"]].map(([x,y,l],i)=>`<g class="hv-node" style="--d:${.5+i*.35}s"><circle cx="${x}" cy="${y}" r="5.5" fill="var(--cobalt)" opacity=".16"/><circle cx="${x}" cy="${y}" r="3" fill="#fff" stroke="var(--cobalt)" stroke-width="1.6"/><text x="${x}" y="${i===3?y+20:y+17}" text-anchor="${i===0?"start":i===3?"end":"middle"}" ${i===0?`dx="-6"`:""}>${l}</text></g>`).join("")}
  </svg>
  <figcaption>Illustrative path · analyst to MD</figcaption></figure>`;

  /* 2. Small line icons for the four main tabs */
  const ICONS={
    learn:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5C5.5 4.3 8.5 4.3 12 6c3.5-1.7 6.5-1.7 9-.5V18c-2.5-1.2-5.5-1.2-9 .5-3.5-1.7-6.5-1.7-9-.5z"/><path d="M12 6v12.5"/></svg>`,
    practice:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4"/></svg>`,
    compete:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21v-7h4v7M10 21V6h4v15M15 21v-10h4v10"/></svg>`,
    career:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h5v-4h5v-4h5V8h3"/><path d="M15 4h6v6"/><path d="M21 4l-7 7" opacity="0"/></svg>`
  };
  function addIcons(){
    document.querySelectorAll('[data-view] .page-head h1').forEach(h=>{
      if(h.querySelector(".ph-ic"))return;
      const v=h.closest("[data-view]").dataset.view;if(!ICONS[v])return;
      const s=document.createElement("span");s.className="ph-ic";s.setAttribute("aria-hidden","true");s.innerHTML=ICONS[v];h.prepend(s);
    });
  }
  addIcons();

  /* hero chart goes into the new-visitor landing */
  const _rh=renderHome;
  renderHome=function(){_rh.apply(this,arguments);try{
    const land=document.getElementById("homeLand");
    if(land&&land.dataset.on&&!land.querySelector(".hl-vis")){
      const anchor=land.querySelector(".hl-proof");
      if(anchor)anchor.insertAdjacentHTML("beforebegin",heroSVG);
    }
  }catch(e){console.error(e)}};

  const st=document.createElement("style");st.textContent=`
/* subtle dot-grid texture behind the landing */
.hl-land{position:relative;isolation:isolate}
.hl-land::before{content:"";position:absolute;inset:-14px -10px 0;z-index:-1;pointer-events:none;
  background-image:radial-gradient(color-mix(in srgb,var(--ink,#0b1b3a) 14%,transparent) 1px,transparent 1.2px);background-size:18px 18px;
  -webkit-mask-image:linear-gradient(180deg,#000 0,transparent 70%);mask-image:linear-gradient(180deg,#000 0,transparent 70%);opacity:.7}
/* hero chart */
.hl-vis{margin:6px 0 2px;padding:10px 12px 8px;border:1px solid var(--rule,#e3e6ee);border-radius:12px;background:color-mix(in srgb,var(--cobalt,#2547d8) 3%,transparent);color:var(--ink,#0b1b3a)}
.hl-vis svg{display:block;width:100%;height:auto;overflow:visible}
.hl-vis text{font:500 10.5px "IBM Plex Mono",ui-monospace,monospace;fill:var(--ink-2,#55607a);letter-spacing:.02em}
.hl-vis figcaption{margin-top:4px;font:500 10px "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2,#55607a)}
.hl-vis .hv-line{stroke-dasharray:1;stroke-dashoffset:1;animation:hvDraw 1.8s cubic-bezier(.3,.7,.2,1) .25s forwards}
.hl-vis .hv-area{opacity:0;animation:hvFade .9s ease 1.2s forwards}
.hl-vis .hv-node{opacity:0;animation:hvFade .5s ease var(--d) forwards}
@keyframes hvDraw{to{stroke-dashoffset:0}}
@keyframes hvFade{to{opacity:1}}
@media (prefers-reduced-motion:reduce){.hl-vis .hv-line{animation:none;stroke-dashoffset:0}.hl-vis .hv-area,.hl-vis .hv-node{animation:none;opacity:1}}
/* tab header icons */
.page-head h1{display:flex;align-items:center;gap:12px}
.ph-ic{display:inline-grid;place-items:center;flex:none;width:38px;height:38px;border-radius:10px;color:var(--cobalt,#2547d8);
  background:color-mix(in srgb,var(--cobalt,#2547d8) 9%,transparent);border:1px solid color-mix(in srgb,var(--cobalt,#2547d8) 18%,transparent)}
.ph-ic svg{width:21px;height:21px}
.page-head{position:relative;padding-bottom:12px;border-bottom:1px solid var(--rule,#e3e6ee)}
.page-head::after{content:"";position:absolute;left:0;bottom:-1px;width:56px;height:2px;background:var(--cobalt,#2547d8)}
`;document.head.appendChild(st);
  try{renderHome()}catch(e){}
})();
