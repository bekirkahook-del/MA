/* Counts one visit per visitor per day for the owner's stats page. No cookies, no third parties:
   a random id in localStorage, the page, where they came from, and the device type. */
(function(){
  try{
    if(localStorage.getItem("ma-notrack"))return; /* the owner's own browser */
    const day=new Date().toLocaleDateString("en-CA",{timeZone:"America/New_York"});
    let v=localStorage.getItem("ma-vid");if(!v){v=Math.random().toString(36).slice(2,10)+Date.now().toString(36);localStorage.setItem("ma-vid",v)}
    let f=localStorage.getItem("ma-vfirst");if(!f){f=day;localStorage.setItem("ma-vfirst",f)}
    if(localStorage.getItem("ma-vday")===day)return;
    const q=new URLSearchParams(location.search);
    const a=!!localStorage.getItem("sb-nbakxpnhcfzdosbzbupd-auth-token");
    const body=JSON.stringify({v,f,a,p:location.pathname,r:document.referrer,src:q.get("utm_source")||"",cmp:q.get("utm_campaign")||""});
    const go=()=>fetch("/.netlify/functions/hit",{method:"POST",headers:{"Content-Type":"application/json"},body,keepalive:true})
      .then(r=>{if(r.ok)localStorage.setItem("ma-vday",day)}).catch(()=>{});
    setTimeout(go,1500);
  }catch(e){}
})();
/* Time spent: counts active seconds per section (only while the tab is visible and the visitor did something in the
   last minute) and sends small totals to the same counter. Used for the "time spent" ranking on the owner's stats. */
(function(){
  try{
    if(localStorage.getItem("ma-notrack"))return;
    const v=localStorage.getItem("ma-vid");if(!v)return;
    let last=Date.now(),buf={},n=0;
    ["mousemove","keydown","scroll","touchstart","click"].forEach(e=>addEventListener(e,()=>{last=Date.now()},{passive:true}));
    const where=()=>{try{
      if(/^\/guides\//.test(location.pathname))return "Guide: "+(location.pathname.split("/")[2]||"index").replace(/-/g," ");
      const view=document.querySelector(".view:not([hidden])"),vn=view?view.dataset.view:"page";
      const ov=document.getElementById("overlay");
      if(ov&&!ov.hidden){const lb=(ov.querySelector(".label")||{}).textContent||"";const h=(ov.querySelector("h2")||{}).textContent||"";
        const t=(lb.split("·")[0]||h).replace(/[0-9]+/g,"").replace(/\s+/g," ").trim().slice(0,40);return vn+" › "+(t||"pop-up")}
      const pane=view&&[...view.querySelectorAll("[data-pane]")].find(x=>!x.hidden);return vn+(pane?" › "+pane.dataset.pane:"")}catch(e){return "page"}};
    setInterval(()=>{if(document.visibilityState!=="visible"||Date.now()-last>60000)return;const k=where();buf[k]=(buf[k]||0)+5;n+=5;if(n>=120)flush()},5000);
    const flush=()=>{if(!n)return;const body=JSON.stringify({v,time:buf});buf={};n=0;
      try{fetch("/.netlify/functions/hit",{method:"POST",headers:{"Content-Type":"application/json"},body,keepalive:true}).catch(()=>{})}catch(e){}};
    addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")flush()});addEventListener("pagehide",flush);
  }catch(e){}
})();
