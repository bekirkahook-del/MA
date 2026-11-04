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
      const w=await r.json();if(apply(w)){refresh();try{localStorage.setItem(CK,JSON.stringify(w))}catch(e){}}}catch(e){}}
  setTimeout(pull,300);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&Date.now()-last>15*60000)pull()});
})();
