/* The Wire, live. News, prices, deals and internship openings live in data/wire.json in the public
   GitHub repo. The scheduled refresh commits only that file; netlify.toml skips the deploy for it, and
   this loader reads it straight from GitHub. Updates reach the site within minutes and cost no deploys.
   The copy built into index.html is the fallback if GitHub can't be reached. */
(function(){
  const SRC="https://raw.githubusercontent.com/bekirkahook-del/MA/main/data/wire.json";
  const CK="ma-wire-v1";
  const ts=w=>Date.parse(w&&w.updated)||0;
  const okNews=n=>n&&typeof n.h==="string"&&typeof n.w==="string"&&typeof n.k==="string"&&Array.isArray(n.s);
  const okTick=t=>Array.isArray(t)&&typeof t[0]==="string"&&typeof t[1]==="string";
  function apply(w){
    try{
      if(!w||typeof w!=="object"||ts(w)<=(Date.parse(WIRE_UPDATED)||0))return false;
      const news=Array.isArray(w.NEWS)?w.NEWS.filter(okNews):[],tick=Array.isArray(w.TICKER)?w.TICKER.filter(okTick):[];
      if(news.length<3||tick.length<5)return false;
      NEWS=news;TICKER=tick;
      if(w.NEWS_DATE)NEWS_DATE=String(w.NEWS_DATE);
      if(w.TICKER_DATE)TICKER_DATE=String(w.TICKER_DATE);
      if(Array.isArray(w.NEWS_QUIZ)&&w.NEWS_QUIZ.length)NEWS_QUIZ=w.NEWS_QUIZ.filter(q=>Array.isArray(q)&&Array.isArray(q[1])&&q[1].length>=2);
      if(Array.isArray(w.DEALS)&&w.DEALS.length){DEALS=w.DEALS.filter(d=>d&&d.id&&d.buyer&&d.target);if(w.DEALS_DATE)DEALS_DATE=String(w.DEALS_DATE)}
      if(Array.isArray(w.APP_OPEN)&&w.APP_OPEN.length){APP_OPEN=w.APP_OPEN.filter(a=>Array.isArray(a)&&a.length>=6);if(w.APP_OPEN_DATE)APP_OPEN_DATE=String(w.APP_OPEN_DATE)}
      RECAP=w.RECAP&&typeof w.RECAP.t==="string"?w.RECAP:null;
      CAL=Array.isArray(w.CAL)?w.CAL.filter(c=>Array.isArray(c)&&c.length>=3):[];
      if(Array.isArray(w.EARN)){EARN=w.EARN.filter(e=>Array.isArray(e)&&/^\d{4}-\d{2}-\d{2}$/.test(e[0])&&e[1]);EARN_SRC=Array.isArray(w.EARN_SRC)?w.EARN_SRC:[]}
      WIRE_UPDATED=w.updated;return true}catch(e){return false}}
  function refresh(){const safe=f=>{try{f()}catch(e){}};
    safe(()=>render());safe(()=>renderTape());safe(()=>renderBriefing());
    safe(()=>{const w=document.getElementById("wire");if(w&&!w.hidden)renderNews()});safe(()=>wireDot())}
  /* last copy this browser saw, so a returning visitor gets fresh news instantly */
  try{const c=JSON.parse(localStorage.getItem(CK)||"null");if(apply(c))refresh()}catch(e){}
  try{wireDot()}catch(e){}
  let last=0;
  async function pull(){last=Date.now();
    try{const r=await fetch(SRC+"?t="+Math.floor(Date.now()/300000),{cache:"no-store"});if(!r.ok)return;
      const w=await r.json();if(apply(w)){refresh();if(liveAt)live();try{localStorage.setItem(CK,JSON.stringify(w))}catch(e){}}}catch(e){}}
  setTimeout(pull,300);
  /* Live prices: /.netlify/functions/ticker returns current quotes (cached 60s at Netlify's edge).
     They overwrite the prices from wire.json, so the tape is never stale. Refreshes every 60s while visible. */
  const ET=d=>d.toLocaleString("en-US",{timeZone:"America/New_York",month:"short",day:"numeric"});
  const ETT=d=>d.toLocaleString("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"2-digit"}).replace(" ","").toLowerCase();
  let liveAt=0;
  async function live(){liveAt=Date.now();
    try{const base=new Set(["DOW","S&P 500","NASDAQ","RUSSELL 2000","VIX","10Y YIELD","WTI","GOLD","SILVER","BITCOIN"]);
      const extra=TICKER.map(t=>t[0]).filter(s=>!base.has(s)&&/^[A-Z][A-Z.\-]{0,6}$/.test(s)).slice(0,20);
      const r=await fetch("/.netlify/functions/ticker?s="+encodeURIComponent(extra.join(",")));if(!r.ok)return;
      const j=await r.json();if(!j||!Array.isArray(j.tape)||j.tape.length<5)return;
      const m=new Map(j.tape.filter(okTick).map(t=>[t[0],t]));
      const next=TICKER.map(t=>m.get(t[0])||t);TICKER.forEach(t=>m.delete(t[0]));
      /* core stocks the wire file didn't have go right after the indexes */
      const at=next.findIndex(t=>!base.has(t[0]));const add=[...m.values()];
      if(add.length)next.splice(at<0?next.length:at,0,...add);
      TICKER=next;
      if(j.asOf){const d=new Date(j.asOf),fresh=Date.now()-d<20*60000;
        TICKER_DATE=fresh?ET(d)+", "+ETT(d)+" ET":ET(d);window.TAPE_LIVE=fresh}
      refresh()}catch(e){}}
  setTimeout(live,600);
  setInterval(()=>{if(!document.hidden&&Date.now()-liveAt>55000)live()},15000);

  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&Date.now()-last>15*60000)pull()});
})();
