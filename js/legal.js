/* Legal helpers: one-time privacy notice + accessibility styles. No cookies, no third parties. */
(function(){
  try{
    var st=document.createElement("style");
    st.textContent=".ma-skip{position:absolute;left:-9999px;top:8px;z-index:99999;background:#13203B;color:#fff;padding:10px 14px;border-radius:4px;font:600 14px system-ui}.ma-skip:focus{left:8px}"+
    "a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:3px solid #2448D8;outline-offset:2px}"+
    "@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}"+
    /* a thin bar, not a card: one line on desktop, two on phones, never covers the page's main button */
    ".ma-cn{position:fixed;left:0;right:0;bottom:0;z-index:9998;background:#13203B;color:#dfe6f3;padding:8px max(14px,env(safe-area-inset-right,0px)) calc(8px + env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px));font:12.5px/1.45 system-ui,sans-serif;display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;box-shadow:0 -4px 16px rgba(0,0,0,.18)}"+
    ".ma-cn>span{max-width:640px}.ma-cn a{color:#9DB4FF}.ma-cn div{display:flex;gap:6px;flex-wrap:nowrap}.ma-cn button{font:600 12.5px system-ui;border:0;border-radius:4px;padding:6px 11px;cursor:pointer;min-height:32px}"+
    ".ma-cn .ok{background:#fff;color:#13203B}.ma-cn .no{background:transparent;color:#fff;border:1px solid #fff5}";
    document.head.appendChild(st);
    if(localStorage.getItem("ma-notice"))return;
    var gpc=navigator.globalPrivacyControl||navigator.doNotTrack==="1";
    var d=document.createElement("div");d.className="ma-cn";d.setAttribute("role","region");d.setAttribute("aria-label","Privacy notice");
    d.innerHTML='<span>No ad cookies. We save progress in your browser and count anonymous visits. '+(gpc?'Your browser\'s privacy signal is on, so counting is off. ':'')+'<a href="/cookies/">Cookie policy</a> · <a href="/privacy/">Privacy</a></span><div><button class="ok" type="button">Got it</button>'+(gpc?'':'<button class="no" type="button">Don\'t count me</button>')+'</div>';
    function close(){try{localStorage.setItem("ma-notice","1")}catch(e){}d.remove()}
    d.querySelector(".ok").onclick=close;
    var n=d.querySelector(".no");if(n)n.onclick=function(){try{localStorage.setItem("ma-notrack","1")}catch(e){}close()};
    function add(){document.body.appendChild(d)}
    if(document.body)setTimeout(add,1200);else document.addEventListener("DOMContentLoaded",function(){setTimeout(add,1200)});
  }catch(e){}
})();
