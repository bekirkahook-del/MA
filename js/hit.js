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
