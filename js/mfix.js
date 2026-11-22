/* Mobile + polish fixes (Nov 19, 2026).
   1. Cookie notice sits above the Netlify badge on phones so "Don't count my visits" is tappable.
   3. Signed-out visitors see a plain profile icon instead of a "Y" letter avatar.
   4. Hero label wraps evenly instead of leaving one word alone on a line. */
(function(){
  try{
    var st=document.createElement("style");
    st.textContent=
      /* (Nov 21) cookie bar is now a thin bar flush with the bottom; the old 84px lift for the Netlify badge is gone */
      ".hl-land .label{display:block;text-wrap:balance;max-width:36ch;margin-inline:auto}"+
      "@media (max-width:560px){"+
      "}";
    document.head.appendChild(st);

    var ICON='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>';
    function signedOut(){try{return typeof myName==="undefined"||!myName}catch(e){return true}}
    function fixAv(){
      var av=document.getElementById("avBtn");if(!av)return;
      if(signedOut()){if(!av.querySelector("svg.ma-guest")){av.innerHTML=ICON.replace("<svg ",'<svg class="ma-guest" ');}}
    }
    function start(){
      fixAv();
      var av=document.getElementById("avBtn");
      if(av&&window.MutationObserver)new MutationObserver(fixAv).observe(av,{childList:true});
    }
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
  }catch(e){}
})();
