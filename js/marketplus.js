/* Market search upgrades (Nov 19, 2026).
   1. Price card on every quote and company panel: latest price, daily change, a 1M/3M/6M/1Y chart, and
      period return, 52-week high/low, distance from the high, volatility and max drawdown.
      Company panels used to show no price at all; now every listed symbol gets one.
   2. Ticker lookup: typing a symbol that isn't in the directory (a brand-new IPO, an ETF) offers
      "Look up XYZ" and opens a panel from Yahoo's data.
   Data comes from /.netlify/functions/history (1 year of daily closes + 50/200-day moving averages, CDN-cached 30 min).
   3. 50/200-day moving averages (Nov 24, 2026): lines on the chart, price vs each, golden/death cross, and a plain-English read.
   window.maHist(sym) is shared with montecarlo.js so a panel fetches history once. */
(function(){
  "use strict";
  var $p=function(s,r){return (r||document).querySelector(s)};
  var E=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var SKIP={"10Y YIELD":1};
  var cache={};
  window.maHist=function(sym){
    if(!cache[sym])cache[sym]=fetch("/.netlify/functions/history?s="+encodeURIComponent(sym)).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
      .catch(function(e){delete cache[sym];throw e});
    return cache[sym];
  };

  var st=document.createElement("style");
  st.textContent=
    ".pc{margin:14px 0 4px;border:1px solid var(--rule,#d9dde6);border-radius:6px;padding:14px 16px;background:var(--sheet,#fff)}"+
    ".pc-top{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}"+
    ".pc-top b{font-family:var(--mono,monospace);font-size:26px}"+
    ".pc-top .pc-d{font-family:var(--mono,monospace);font-size:14px;font-weight:700}"+
    ".pc-top .pc-asof{font-size:12px;color:var(--ink-2,#555);margin-left:auto}"+
    ".pc-rg{display:flex;gap:6px;margin:10px 0 4px}"+
    ".pc-rg button{font:inherit;font-size:12px;font-weight:700;border:1px solid var(--rule,#d9dde6);background:transparent;color:var(--ink-2,#555);border-radius:999px;padding:4px 10px;cursor:pointer}"+
    ".pc-rg button[aria-pressed=true]{background:var(--ink,#13203B);color:var(--paper,#fff);border-color:var(--ink,#13203B)}"+
    ".pc svg{width:100%;height:auto;display:block}"+
    ".pc-s{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}"+
    ".pc-s div{border:1px solid var(--rule,#d9dde6);border-radius:4px;padding:7px 10px}"+
    ".pc-s span{display:block;font-size:11px;color:var(--ink-2,#555);text-transform:uppercase;letter-spacing:.06em}"+
    ".pc-s b{font-family:var(--mono,monospace);font-size:15px}"+
    ".pc .up{color:var(--good,#1e8e3e)}.pc .dn{color:var(--bad,#c0392b)}"+
    ".pc-new{font-size:13px;color:var(--ink-2,#555);margin:8px 0 0}"+
    ".mk-look{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font:inherit;border:1px dashed var(--rule,#d9dde6);background:transparent;color:var(--ink,#111);border-radius:4px;padding:10px 12px;margin:6px 0;cursor:pointer}"+
    ".mk-look:hover{border-color:var(--cobalt,#2448D8)}.mk-look b{font-family:var(--mono,monospace)}"+
    ".pc-ma{margin-top:12px;border-top:1px solid var(--rule,#d9dde6);padding-top:12px}"+
    ".pc-mah{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}.pc-mah h4{margin:0;font-size:14px;color:var(--ink,#13203B)}"+
    ".pc-tag{font-size:12px;font-weight:700;border-radius:999px;padding:3px 9px;background:var(--paper,#f4f5f8);border:1px solid var(--rule,#d9dde6)}.pc-tag.up{background:rgba(30,142,62,.1);border-color:rgba(30,142,62,.3)}.pc-tag.dn{background:rgba(192,57,43,.08);border-color:rgba(192,57,43,.3)}"+
    ".pc-mat{margin-left:auto;font:inherit;font-size:12px;font-weight:700;border:1px solid var(--rule,#d9dde6);background:transparent;color:var(--ink-2,#555);border-radius:999px;padding:4px 10px;cursor:pointer}"+
    ".pc-k{display:inline-block;width:14px;height:3px;border-radius:2px;vertical-align:middle;margin-right:5px}"+
    ".pc-why{margin:10px 0 0;padding:0;list-style:none;font-size:14px;line-height:1.5;color:var(--ink,#13203B)}.pc-why li{padding:3px 0 3px 20px;position:relative}.pc-why li:before{content:'•';position:absolute;left:6px;color:var(--brass,#b08d2a)}"+
    ".pc-how{margin-top:8px;font-size:13.5px;line-height:1.5;color:var(--ink-2,#555)}.pc-how summary{cursor:pointer;font-weight:700;color:var(--ink,#13203B)}.pc-how p{margin:6px 0}"+
    "@media(max-width:560px){.pc-s{grid-template-columns:1fr 1fr}.pc-top b{font-size:22px}}";
  document.head.appendChild(st);

  /* ---------- numbers ---------- */
  var money=function(v,cur){if(v==null||!isFinite(v))return "–";var d=v>=1000?0:2;return (cur==="USD"?"$":"")+v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d})};
  var pct=function(v){return (v>=0?"+":"−")+Math.abs(v*100).toFixed(1)+"%"};
  var cls=function(v){return v>=0?"up":"dn"};
  var DAY=86400,RANGES=[["1M",31],["3M",92],["6M",183],["1Y",366]];

  function slice(pts,days){var end=pts[pts.length-1][0],from=end-days*DAY;var s=pts.filter(function(p){return p[0]>=from});return s.length>=2?s:pts}
  function vol(pts){if(pts.length<21)return null;var r=[];for(var i=1;i<pts.length;i++)r.push(Math.log(pts[i][1]/pts[i-1][1]));
    var m=r.reduce(function(a,b){return a+b},0)/r.length,v=r.reduce(function(a,b){return a+(b-m)*(b-m)},0)/(r.length-1);
    var days=(pts[pts.length-1][0]-pts[0][0])/DAY,ppy=Math.min(366,Math.max(200,Math.round(r.length/(days/365.25))));return Math.sqrt(v*ppy)}
  function maxDD(pts){var pk=pts[0][1],dd=0;pts.forEach(function(p){if(p[1]>pk)pk=p[1];var d=p[1]/pk-1;if(d<dd)dd=d});return dd}

  var C50="#e08a00",C200="#7b4fd6";
  function chart(pts,cur,ma){
    var W=640,H=180,L=6,R=56,T=8,B=18,v=pts.map(function(p){return p[1]}),lo=Math.min.apply(null,v),hi=Math.max.apply(null,v);
    if(ma)ma.forEach(function(m){[m[0],m[1]].forEach(function(x){if(x!=null){if(x<lo)lo=x;if(x>hi)hi=x}})});
    var pad=(hi-lo)*.08||hi*.02||1;lo-=pad;hi+=pad;
    var X=function(i){return L+(pts.length<2?0:i/(pts.length-1))*(W-L-R)},Y=function(x){return T+(1-(x-lo)/(hi-lo))*(H-T-B)};
    var up=v[v.length-1]>=v[0],col=up?"var(--good,#1e8e3e)":"var(--bad,#c0392b)";
    var line=pts.map(function(p,i){return (i?"L":"M")+X(i).toFixed(1)+" "+Y(p[1]).toFixed(1)}).join("");
    var area=line+"L"+X(pts.length-1).toFixed(1)+" "+(H-B)+"L"+X(0).toFixed(1)+" "+(H-B)+"Z";
    var d=function(t){return new Date(t*1000).toLocaleDateString("en-US",{month:"short",day:"numeric"})};
    var f=function(x){return x>=1000?Math.round(x).toLocaleString():x.toFixed(x<10?2:1)};
    var mx=v.indexOf(Math.max.apply(null,v)),mn=v.indexOf(Math.min.apply(null,v));
    var cs=cur==="USD"?"$":"",fd=function(t){return new Date(t*1000).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric",year:"numeric"})};
    var hv=window.maHvAttr?window.maHvAttr(pts.map(function(p,i){var ch=i?p[1]/pts[i-1][1]-1:null;return [+X(i).toFixed(1),+Y(p[1]).toFixed(1),fd(p[0])+"\n"+cs+(p[1]>=1000?p[1].toLocaleString("en-US",{maximumFractionDigits:2}):p[1].toFixed(2))+(ch===null?"":"  "+(ch>=0?"+":"−")+Math.abs(ch*100).toFixed(2)+"% day")+(ma&&ma[i]&&(ma[i][0]!=null||ma[i][1]!=null)?"\n"+(ma[i][0]!=null?"50-day "+cs+f(ma[i][0]):"")+(ma[i][1]!=null?"  200-day "+cs+f(ma[i][1]):""):"")]})):"";
    var mline=function(k){var d="",on=false;(ma||[]).forEach(function(m,i){var x=m[k];if(x==null){on=false;return}d+=(on?"L":"M")+X(i).toFixed(1)+" "+Y(x).toFixed(1);on=true});return d};
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Price chart. Hover or use arrow keys to see each day\'s price"'+hv+'>'+
      '<path d="'+area+'" fill="'+col+'" fill-opacity=".08"/><path d="'+line+'" fill="none" stroke="'+col+'" stroke-width="1.8"/>'+
      (ma?'<path d="'+mline(1)+'" fill="none" stroke="'+C200+'" stroke-width="1.6" stroke-dasharray="5 3"/><path d="'+mline(0)+'" fill="none" stroke="'+C50+'" stroke-width="1.6"/>':"")+
      '<text x="'+(W-R+6)+'" y="'+(Y(v[mx])+4).toFixed(1)+'" font-size="11" fill="var(--ink-2,#555)" font-family="var(--mono,monospace)">'+f(v[mx])+'</text>'+
      '<text x="'+(W-R+6)+'" y="'+(Y(v[mn])+4).toFixed(1)+'" font-size="11" fill="var(--ink-2,#555)" font-family="var(--mono,monospace)">'+f(v[mn])+'</text>'+
      '<text x="'+L+'" y="'+(H-4)+'" font-size="11" fill="var(--ink-2,#555)">'+d(pts[0][0])+'</text>'+
      '<text x="'+(W-R)+'" y="'+(H-4)+'" font-size="11" fill="var(--ink-2,#555)" text-anchor="end">'+d(pts[pts.length-1][0])+'</text></svg>';
  }

  /* ---------- 50 / 200-day moving averages: numbers + what they mean ---------- */
  function maBox(ma,pts,last,cur,shown){
    var m=ma[ma.length-1],a50=m[0],a200=m[1];
    if(a50==null)return '<div class="pc-ma"><div class="pc-mah"><h4>50 / 200-day moving averages</h4></div><p class="pc-new" style="margin:0">Needs at least 50 trading days of history ('+pts.length+' so far). Check back once this listing has more trading days.</p></div>';
    var v50=last/a50-1,v200=a200!=null?last/a200-1:null;
    /* most recent golden / death cross in the last year */
    var cross=null;for(var i=ma.length-1;i>0;i--){var p=ma[i-1],q=ma[i];if(p[0]==null||p[1]==null||q[1]==null)break;var s1=p[0]-p[1],s2=q[0]-q[1];if(s1<=0&&s2>0){cross=["golden",pts[i][0]];break}if(s1>=0&&s2<0){cross=["death",pts[i][0]];break}}
    var dt=function(t){return new Date(t*1000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})};
    var ab=function(x){return Math.abs(x*100).toFixed(1)+"% "+(x>=0?"above":"below")};
    var tag,tc;
    if(a200==null){tag=last>=a50?"Above its 50-day":"Below its 50-day";tc=last>=a50?"up":"dn"}
    else if(last>a50&&a50>a200){tag="Strong uptrend";tc="up"}
    else if(a50>a200&&last<=a50){tag=last>a200?"Uptrend, cooling off":"Uptrend at risk";tc=""}
    else if(last<a50&&a50<a200){tag="Downtrend";tc="dn"}
    else if(a50<a200&&last>=a50){tag=last>a200?"Recovering":"Trying to bounce";tc=""}
    else {tag="Mixed";tc=""}
    var why=[];
    why.push(last>=a50?"Price is "+ab(v50)+" the 50-day: the short-term trend (about the last 2½ months) is up. Buyers have been in control lately.":"Price is "+ab(v50)+" the 50-day: the short-term trend (about the last 2½ months) has turned down.");
    if(v200!=null)why.push(last>=a200?"Price is "+ab(v200)+" the 200-day: the long-term trend (about the last 10 months) is up. Many funds treat this as the line between a healthy stock and a broken one.":"Price is "+ab(v200)+" the 200-day: the long-term trend (about the last 10 months) is down. Many trend-following investors stay away until it gets back above.");
    if(a200!=null)why.push(a50>a200?"The 50-day is above the 200-day, so recent prices are higher than the longer-run average. Momentum is on the bullish side.":"The 50-day is below the 200-day, so recent prices are lower than the longer-run average. Momentum is on the bearish side.");
    if(cross)why.push(cross[0]==="golden"?"Golden cross on "+dt(cross[1])+": the 50-day crossed above the 200-day. Traders read it as a sign a new uptrend is starting.":"Death cross on "+dt(cross[1])+": the 50-day crossed below the 200-day. Traders read it as a sign a downtrend is setting in.");
    else if(a200!=null)why.push("No golden or death cross in the last year: the "+(a50>a200?"uptrend":"downtrend")+" has held the whole time.");
    if(v200!=null&&v200>.2)why.push("It's stretched: more than 20% above the 200-day. Stocks this far above their long-run average often pause or pull back toward it.");
    if(v200!=null&&v200<-.2)why.push("It's far below its long-run average (more than 20% under the 200-day). That can mean real problems, or a bounce candidate. Check the news and earnings.");
    if(a200==null)why.push("The 200-day needs 200 trading days of history ("+pts.length+" so far), so only the 50-day is shown for now.");
    return '<div class="pc-ma"><div class="pc-mah"><h4>50 / 200-day moving averages</h4><span class="pc-tag '+tc+'">'+E(tag)+'</span><button type="button" class="pc-mat" aria-pressed="'+shown+'">'+(shown?"Hide lines":"Show on chart")+'</button></div>'+
      '<div class="pc-s"><div><span><i class="pc-k" style="background:'+C50+'"></i>50-day avg</span><b>'+money(a50,cur)+'</b></div>'+
        (a200!=null?'<div><span><i class="pc-k" style="background:'+C200+'"></i>200-day avg</span><b>'+money(a200,cur)+'</b></div>':"")+
        '<div><span>Price vs 50-day</span><b class="'+cls(v50)+'">'+pct(v50)+'</b></div>'+
        (v200!=null?'<div><span>Price vs 200-day</span><b class="'+cls(v200)+'">'+pct(v200)+'</b></div>':"")+
        (a200!=null?'<div><span>50 vs 200</span><b class="'+cls(a50-a200)+'">'+(a50>a200?"50 above":"50 below")+'</b></div>':"")+
        (cross?'<div><span>Last cross</span><b class="'+(cross[0]==="golden"?"up":"dn")+'">'+(cross[0]==="golden"?"Golden":"Death")+'</b></div>':"")+
      '</div><ul class="pc-why">'+why.map(function(x){return '<li>'+E(x)+'</li>'}).join("")+'</ul>'+
      '<details class="pc-how"><summary>What is a moving average?</summary>'+
        '<p>A moving average is the average closing price over the last N trading days, updated every day. It smooths out the daily noise so you can see the trend.</p>'+
        '<p><b>50-day</b> ≈ the last 2½ months: the short-to-medium-term trend. <b>200-day</b> ≈ the last 10 months: the long-term trend, and the one funds and the financial press watch most.</p>'+
        '<p><b>Golden cross</b>: the 50-day moves above the 200-day (bullish). <b>Death cross</b>: the 50-day drops below the 200-day (bearish). These lines often act as support (prices bounce off them) or resistance (prices stall at them).</p>'+
        '<p><b>The catch:</b> moving averages lag. They only describe what already happened, so crosses often show up after a lot of the move is over. Use them as context, not a buy or sell signal.</p>'+
        '<p><b>Interview angle:</b> if asked to pitch a stock, mentioning where it trades vs. its 200-day shows you know how the market sees it. Then pivot to fundamentals (valuation, earnings, catalysts), which is what bankers and equity research actually care about.</p></details></div>';
  }

  /* ---------- price card ---------- */
  function card(sym,box){
    var body=$p(".pc-body",box);
    window.maHist(sym).then(function(d){
      var pts=d.pts,cur=d.cur,last=d.last,prev=pts.length>=2?pts[pts.length-2][1]:null;
      var lastPt=pts[pts.length-1];if(Math.abs(lastPt[1]-last)/last>1e-6&&pts.length>=1)prev=lastPt[1];
      var day=prev?last/prev-1:null;
      var asof=d.t?new Date(d.t*1000).toLocaleString("en-US",{timeZone:"America/New_York",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"})+" ET":"";
      var hi=d.hi52!=null?d.hi52:Math.max.apply(null,pts.map(function(p){return p[1]})),lo=d.lo52!=null?d.lo52:Math.min.apply(null,pts.map(function(p){return p[1]}));
      var young=pts.length<21,showMA=true;try{showMA=localStorage.getItem("ma-pc-ma")!=="0"}catch(e){}
      var sel=young?"1Y":"3M";
      var draw=function(){
        var s=slice(pts,RANGES.filter(function(r){return r[0]===sel})[0][1]),ret=s[s.length-1][1]/s[0][1]-1,v=vol(pts);
        var hasMA=Array.isArray(d.ma)&&d.ma.length===pts.length,maS=hasMA&&showMA?d.ma.slice(pts.length-s.length):null;
        body.innerHTML='<div class="pc-top"><b>'+money(last,cur)+'</b>'+(day==null?"":'<span class="pc-d '+cls(day)+'">'+(day>=0?"▲ ":"▼ ")+pct(day).replace(/^[+−]/,"")+' today</span>')+(asof?'<span class="pc-asof">'+E(asof)+'</span>':"")+'</div>'+
          (pts.length>=2?'<div class="pc-rg" role="group" aria-label="Chart range">'+RANGES.map(function(r){return '<button data-r="'+r[0]+'" aria-pressed="'+(r[0]===sel)+'">'+r[0]+'</button>'}).join("")+'</div>'+chart(s,cur,maS):"")+
          '<div class="pc-s">'+
            (pts.length>=2?'<div><span>'+E(sel)+' return</span><b class="'+cls(ret)+'">'+pct(ret)+'</b></div>':"")+
            '<div><span>52-wk high</span><b>'+money(hi,cur)+'</b></div>'+
            '<div><span>52-wk low</span><b>'+money(lo,cur)+'</b></div>'+
            (pts.length>=2?'<div><span>From high</span><b class="'+cls(last/hi-1)+'">'+pct(Math.min(0,last/hi-1))+'</b></div>':"")+
            (v!=null?'<div><span>Volatility (1 yr)</span><b>'+(v*100).toFixed(1)+'%</b></div>':"")+
            (pts.length>=2?'<div><span>Max drawdown</span><b class="dn">'+pct(maxDD(pts))+'</b></div>':"")+
          '</div>'+
          (hasMA?maBox(d.ma,pts,last,cur,showMA):"")+
          (young?'<p class="pc-new">New listing: only '+pts.length+' trading day'+(pts.length===1?"":"s")+' of history so far, so volatility and long-range stats fill in over the next few weeks.</p>':"");
        body.querySelectorAll("[data-r]").forEach(function(b){b.onclick=function(){sel=b.dataset.r;draw()}});
        var mt=$p(".pc-mat",body);if(mt)mt.onclick=function(){showMA=!showMA;try{localStorage.setItem("ma-pc-ma",showMA?"1":"0")}catch(e){}var o=$p(".pc-how",body),op=o&&o.open;draw();if(op)$p(".pc-how",body).open=true};
      };
      draw();
      /* live: refresh the price every 60s while this panel is open and the tab is visible.
         Tape symbols reuse the tape's own live prices; others ask the ticker function (edge-cached 60s). */
      var fmtT=function(){return new Date().toLocaleTimeString("en-US",{timeZone:"America/New_York",hour:"numeric",minute:"2-digit"})+" ET"};
      var tick=function(){
        if(!box.isConnected){clearInterval(iv);return}
        if(document.hidden)return;
        var t=null;try{t=(typeof TICKER!=="undefined"?TICKER:[]).find(function(x){return x[0]===sym})}catch(e){}
        var use=function(row){if(!row||!row[1])return;var p=parseFloat(String(row[1]).replace(/[$,%]/g,""));if(!isFinite(p)||p<=0)return;
          var ch=typeof row[2]==="number"?row[2]/100:null;
          if(Math.abs(p-last)>1e-9||ch!=null){last=p;if(ch!=null)day=ch;asof=(window.TAPE_LIVE?"Live · ":"Updated ")+fmtT();var keep=sel;sel=keep;draw()}};
        if(t&&window.TAPE_LIVE)return use(t);
        if(!/^[A-Z][A-Z.\-]{0,6}$/.test(sym))return;
        fetch("/.netlify/functions/ticker?s="+encodeURIComponent(sym)).then(function(r){return r.ok?r.json():null})
          .then(function(j){if(j&&Array.isArray(j.tape))use(j.tape.find(function(x){return x[0]===sym}))}).catch(function(){});
      };
      var iv=setInterval(tick,60000);setTimeout(tick,1500);
      var panel=box.closest("#panel"),note=panel&&[].slice.call(panel.querySelectorAll("p.note")).filter(function(p){return /closing prices only/i.test(p.textContent)})[0];
      if(note)note.textContent="Live price from Yahoo Finance (can lag a few minutes). Check filings here:";
    }).catch(function(){body.innerHTML='<p class="note" style="margin:0">Price data isn\'t available for '+E(sym)+' right now.</p>'});
  }
  function mount(sym){
    var panel=document.getElementById("panel");if(!panel||SKIP[sym]||$p(".pc",panel))return;
    var box=document.createElement("section");box.className="pc";box.setAttribute("aria-label","Price and chart");
    box.innerHTML='<div class="pc-body"><p class="note" style="margin:0">Loading price…</p></div>';
    var head=$p(".q-head",panel);head?head.insertAdjacentElement("afterend",box):panel.appendChild(box);
    var big=$p(".q-big",panel);if(big)big.hidden=true;   // the card shows a fresher price
    card(sym,box);
  }

  /* ---------- any-ticker lookup ---------- */
  function lookup(sym){
    if(typeof openPanel!=="function")return;
    openPanel('<button class="ghost back" id="qBack">← All markets</button><div class="label">Lookup</div><div class="q-head"><div><h2>'+E(sym)+'</h2><p class="sub" style="margin:0" id="lkName">Loading…</p></div></div>');
    try{panel.classList.add("wide")}catch(e){}
    var b=$p("#qBack");if(b)b.onclick=function(){openMarkets()};
    window.maHist(sym).then(function(d){var n=$p("#lkName");if(n)n.textContent=(d.name||sym)+(d.ex?" · "+d.ex:"")}).catch(function(){var n=$p("#lkName");if(n)n.textContent="No market data found for this symbol."});
    mount(sym);
    if(window.maMountMC)window.maMountMC(sym);
  }
  window.maLookup=lookup;
  function addLookupRow(){
    var q=$p("#mkQ"),list=$p("#mkList");if(!q||!list)return;
    var v=q.value.trim().toUpperCase();var old=$p(".mk-look",list);
    if(!/^[A-Z][A-Z0-9.\-]{0,5}$/.test(v)){if(old)old.remove();return}
    var known=list.querySelector('[data-q="'+v.replace(/"/g,"")+'"],[data-co="'+v.replace(/"/g,"")+'"]');
    if(known){if(old)old.remove();return}
    if(old&&old.dataset.sym===v)return;if(old)old.remove();
    var btn=document.createElement("button");btn.className="mk-look";btn.dataset.sym=v;
    btn.innerHTML='<span>🔎</span><span>Look up <b>'+E(v)+'</b> on the market<br><small class="note">Not in our list yet (new IPOs, ETFs, foreign listings)</small></span>';
    btn.onclick=function(){lookup(v)};list.appendChild(btn);
  }
  new MutationObserver(function(){if($p("#mkList"))addLookupRow()}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener("input",function(e){if(e.target&&e.target.id==="mkQ")setTimeout(addLookupRow,0)});

  /* ---------- hook into the panels ---------- */
  function wrap(name){var orig=window[name];if(typeof orig!=="function")return;
    window[name]=function(sym){var out=orig.apply(this,arguments);try{if(window.CO_RAW||name==="showQuote")mount(sym)}catch(e){}return out}}
  wrap("showQuote");wrap("showCompany");
  /* showCompany may wait for the company list; mount when its panel appears */
  new MutationObserver(function(){var p=document.getElementById("panel");if(!p||$p(".pc",p))return;var h=$p(".q-head h2",p);
    if(h&&$p(".co-facts",p))mount(h.textContent.trim())}).observe(document.body,{childList:true,subtree:true});
})();

/* ---------- company logos everywhere a stock appears (Nov 19, 2026) ----------
   Served by /.netlify/functions/logo (our own domain, CDN-cached 30 days), so visitors never contact a third party.
   Shows on: market list rows, company search results, quote/company/lookup panels, the ticker tape and the
   Ctrl K palette. If a logo doesn't exist the image removes itself and the letter avatar stays. */
(function(){
  "use strict";
  var NOT={"DOW":1,"S&P 500":1,"NASDAQ":1,"RUSSELL 2000":1,"VIX":1,"10Y YIELD":1,"WTI":1,"BRENT":1,"GOLD":1,"SILVER":1,"BITCOIN":1};
  var dead={};
  function isStock(sym){
    if(!sym||NOT[sym]||!/^[A-Z][A-Z0-9.\-]{0,9}$/.test(sym))return false;
    try{if(typeof tInfo==="function"){var t=tInfo(sym)[1];if(t&&t!=="Stocks")return false}}catch(e){}
    return true;
  }
  var url=function(s){return "/.netlify/functions/logo?s="+encodeURIComponent(s)};
  function img(sym,cls){
    var i=document.createElement("img");i.className="ma-logo "+(cls||"");i.alt="";i.loading="lazy";i.decoding="async";
    i.referrerPolicy="no-referrer";i.src=url(sym);i.onerror=function(){dead[sym]=1;i.remove()};
    i.onload=function(){if(i.naturalWidth<8){dead[sym]=1;i.remove()}};return i;
  }
  var st=document.createElement("style");
  st.textContent=
    ".mk-av{position:relative;overflow:hidden}"+
    ".mk-av .ma-logo{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#fff;padding:3px;box-sizing:border-box;border-radius:inherit}"+
    ".q-head .ma-logo{width:44px;height:44px;border-radius:4px;object-fit:contain;background:#fff;border:1px solid var(--rule,#d9dde6);padding:5px;box-sizing:border-box;flex:none;margin-right:12px}"+
    ".q-head>.ma-lw{display:flex!important;flex-direction:row!important;align-items:center;min-width:0}"+
    ".tk .ma-logo{width:14px;height:14px;border-radius:3px;object-fit:contain;background:#fff;align-self:center;margin-right:-2px}"+
    ".pal-i .ma-logo{width:18px;height:18px;border-radius:4px;object-fit:contain;background:#fff;border:1px solid var(--rule,#d9dde6);margin-right:8px;vertical-align:middle;flex:none}";
  document.head.appendChild(st);

  function rows(root){
    /* market list + company results: the symbol sits on the row's main button */
    root.querySelectorAll(".mk-av:not([data-lg])").forEach(function(av){
      av.dataset.lg="1";var b=av.closest("[data-q],[data-co]");if(!b)return;var s=b.dataset.q||b.dataset.co;
      if((b.dataset.co||isStock(s))&&!dead[s])av.appendChild(img(s));
    });
    /* ticker tape */
    root.querySelectorAll(".tk[data-sym]:not([data-lg])").forEach(function(tk){
      tk.dataset.lg="1";var s=tk.dataset.sym;if(!isStock(s)||dead[s])return;var b=tk.querySelector("b");if(b)tk.insertBefore(img(s),b);
    });
    /* Ctrl K palette */
    root.querySelectorAll(".pal-i:not([data-lg])").forEach(function(it){
      it.dataset.lg="1";var x=null;try{x=palItems[+it.dataset.i]}catch(e){}
      var m=x&&/^(co|quote)\|(.+)$/.exec(x.act||"");if(!m||!isStock(m[2])||dead[m[2]])return;it.insertBefore(img(m[2]),it.firstChild);
    });
    /* quote / company / lookup panel header */
    var p=document.getElementById("panel");
    if(p&&p.contains(root)||root===document.body){var h=p&&p.querySelector(".q-head:not([data-lg])");
      if(h){h.dataset.lg="1";var h2=h.querySelector("h2");var s=h2&&h2.textContent.trim();
        if(s&&isStock(s)&&!dead[s]){var first=h.firstElementChild;var w=document.createElement("div");w.className="ma-lw";
          h.insertBefore(w,first);w.appendChild(img(s,"big"));w.appendChild(first)}}}
  }
  var queued=false;
  new MutationObserver(function(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;rows(document.body)})})
    .observe(document.body,{childList:true,subtree:true});
  rows(document.body);
})();
