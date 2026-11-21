/* Phone layout + first-run polish (redesign decisions, Nov 21, 2026):
   - Phones (≤700px): the 5 main tabs become a fixed bottom bar with icons, where thumbs are.
   - Phones: the stock ticker only shows on Home, so other tabs start with content, not chrome.
   - Toasts, the privacy bar and prompts sit above the bottom bar instead of on top of it.
   - Guests who finish their first level get one "save your plan" moment (once per device). */
(function(){
  const IC={
    home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    learn:'<path d="M4 5h7a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4zM20 5h-7a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h7z"/>',
    practice:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
    compete:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8"/>',
    career:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>'};
  const st=document.createElement("style");
  st.textContent=`.tab .tb-ic{display:none}
@media (max-width:700px){
  body.has-bb{padding-bottom:calc(66px + env(safe-area-inset-bottom,0px))}
  body.has-bb nav.tabs{position:fixed;left:0;right:0;bottom:0;z-index:40;margin:0;gap:0!important;display:grid;grid-template-columns:repeat(5,1fr);
    background:var(--sheet,#fff);border-top:1px solid var(--rule,#D3D9E4);border-bottom:0;overflow:visible;
    padding:4px max(4px,env(safe-area-inset-right,0px)) calc(4px + env(safe-area-inset-bottom,0px)) max(4px,env(safe-area-inset-left,0px));box-shadow:0 -6px 20px rgba(19,32,59,.06)}
  body.has-bb nav.tabs .tab{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0!important;min-height:52px;font-size:11px!important;font-weight:600;
    border:0!important;color:var(--ink-2,#4A5672);transform:none!important}
  body.has-bb nav.tabs .tab .tb-ic{display:block;width:22px;height:22px}
  body.has-bb nav.tabs .tab[aria-selected="true"]{color:var(--cobalt,#2448D8)}
  body.has-bb nav.tabs .fx-ind{display:none!important}
  body.has-bb.bb-ov nav.tabs{display:none!important}
  body.has-bb:not(.bb-home) #tape{display:none!important}
  body.has-bb .ma-cn,body.has-bb .gw-tc,body.has-bb .ej-g,body.has-bb .rk-bar{bottom:calc(68px + env(safe-area-inset-bottom,0px))!important}
  body.has-bb .toast,body.has-bb .ux-toast,body.has-bb .bdg-toast,body.has-bb .em-sl{bottom:calc(76px + env(safe-area-inset-bottom,0px))!important}
}`;
  document.head.appendChild(st);
  function setup(){const nav=document.querySelector("nav.tabs");if(!nav)return false;
    document.body.classList.add("has-bb");
    nav.querySelectorAll(".tab").forEach(b=>{if(b.querySelector(".tb-ic"))return;const k=b.dataset.tab;if(!IC[k])return;
      b.insertAdjacentHTML("afterbegin",`<svg class="tb-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`)});
    const sync=()=>{const on=nav.querySelector('[aria-selected="true"]');document.body.classList.toggle("bb-home",!on||on.dataset.tab==="home")};
    new MutationObserver(sync).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-selected"]});sync();
    /* hide the bar while a panel/popup is open so it never covers the panel's buttons */
    const ov=document.getElementById("overlay");if(ov){const os=()=>document.body.classList.toggle("bb-ov",!ov.hidden);new MutationObserver(os).observe(ov,{attributes:true,attributeFilter:["hidden"]});os()}
    return true}
  if(!setup())document.addEventListener("DOMContentLoaded",setup);

  /* first level done as a guest: one gentle "save your plan" card (grow.js toast; guests only, dismissible) */
  let tries=0;(function hook(){const q=window.questEvt;if(typeof q!=="function"){if(tries++<40)setTimeout(hook,250);return}if(q.__fr)return;
    const w=function(k){const r=q.apply(this,arguments);
      try{if(k==="level"&&!localStorage.getItem("ma-l1-save")&&window.MA_SIGNED===false&&window.maGrowToast){
        localStorage.setItem("ma-l1-save","1");
        const sc=(typeof S!=="undefined"&&S.profile&&S.profile.school)||"";
        setTimeout(()=>window.maGrowToast("l1","🎯",`Level done. Save your ${sc?sc.replace(/[<>&"]/g,"")+" ":""}plan and progress so they're here tomorrow.`,"Save my plan"),1600)}}catch(e){}
      return r};w.__fr=1;window.questEvt=w})();
})();
