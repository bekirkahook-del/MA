/* Market search upgrades (Nov 19, 2026).
   1. Price card on every quote and company panel: latest price, daily change, a 1M/3M/6M/1Y chart, and
      period return, 52-week high/low, distance from the high, volatility and max drawdown.
      Company panels used to show no price at all; now every listed symbol gets one.
   2. Ticker lookup: typing a symbol that isn't in the directory (a brand-new IPO, an ETF) offers
      "Look up XYZ" and opens a panel from Yahoo's data.
   Data comes from /.netlify/functions/history (1 year of daily closes, CDN-cached 30 min).
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
    ".pc{margin:14px 0 4px;border:1px solid var(--rule,#d9dde6);border-radius:14px;padding:14px 16px;background:var(--sheet,#fff)}"+
    ".pc-top{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}"+
    ".pc-top b{font-family:var(--mono,monospace);font-size:26px}"+
    ".pc-top .pc-d{font-family:var(--mono,monospace);font-size:14px;font-weight:700}"+
    ".pc-top .pc-asof{font-size:12px;color:var(--ink-2,#555);margin-left:auto}"+
    ".pc-rg{display:flex;gap:6px;margin:10px 0 4px}"+
    ".pc-rg button{font:inherit;font-size:12px;font-weight:700;border:1px solid var(--rule,#d9dde6);background:transparent;color:var(--ink-2,#555);border-radius:999px;padding:4px 10px;cursor:pointer}"+
    ".pc-rg button[aria-pressed=true]{background:var(--ink,#13203B);color:var(--paper,#fff);border-color:var(--ink,#13203B)}"+
    ".pc svg{width:100%;height:auto;display:block}"+
    ".pc-s{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}"+
    ".pc-s div{border:1px solid var(--rule,#d9dde6);border-radius:10px;padding:7px 10px}"+
    ".pc-s span{display:block;font-size:11px;color:var(--ink-2,#555);text-transform:uppercase;letter-spacing:.06em}"+
    ".pc-s b{font-family:var(--mono,monospace);font-size:15px}"+
    ".pc .up{color:var(--good,#1e8e3e)}.pc .dn{color:var(--bad,#c0392b)}"+
    ".pc-new{font-size:13px;color:var(--ink-2,#555);margin:8px 0 0}"+
    ".mk-look{display:flex;align-items:center;gap:10px;width:100%;text-align:left;font:inherit;border:1px dashed var(--rule,#d9dde6);background:transparent;color:var(--ink,#111);border-radius:10px;padding:10px 12px;margin:6px 0;cursor:pointer}"+
    ".mk-look:hover{border-color:var(--cobalt,#2448D8)}.mk-look b{font-family:var(--mono,monospace)}"+
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

  function chart(pts,cur){
    var W=640,H=180,L=6,R=56,T=8,B=18,v=pts.map(function(p){return p[1]}),lo=Math.min.apply(null,v),hi=Math.max.apply(null,v);
    var pad=(hi-lo)*.08||hi*.02||1;lo-=pad;hi+=pad;
    var X=function(i){return L+(pts.length<2?0:i/(pts.length-1))*(W-L-R)},Y=function(x){return T+(1-(x-lo)/(hi-lo))*(H-T-B)};
    var up=v[v.length-1]>=v[0],col=up?"var(--good,#1e8e3e)":"var(--bad,#c0392b)";
    var line=pts.map(function(p,i){return (i?"L":"M")+X(i).toFixed(1)+" "+Y(p[1]).toFixed(1)}).join("");
    var area=line+"L"+X(pts.length-1).toFixed(1)+" "+(H-B)+"L"+X(0).toFixed(1)+" "+(H-B)+"Z";
    var d=function(t){return new Date(t*1000).toLocaleDateString("en-US",{month:"short",day:"numeric"})};
    var f=function(x){return x>=1000?Math.round(x).toLocaleString():x.toFixed(x<10?2:1)};
    var mx=v.indexOf(Math.max.apply(null,v)),mn=v.indexOf(Math.min.apply(null,v));
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Price chart">'+
      '<path d="'+area+'" fill="'+col+'" fill-opacity=".08"/><path d="'+line+'" fill="none" stroke="'+col+'" stroke-width="1.8"/>'+
      '<text x="'+(W-R+6)+'" y="'+(Y(v[mx])+4).toFixed(1)+'" font-size="11" fill="var(--ink-2,#555)" font-family="var(--mono,monospace)">'+f(v[mx])+'</text>'+
      '<text x="'+(W-R+6)+'" y="'+(Y(v[mn])+4).toFixed(1)+'" font-size="11" fill="var(--ink-2,#555)" font-family="var(--mono,monospace)">'+f(v[mn])+'</text>'+
      '<text x="'+L+'" y="'+(H-4)+'" font-size="11" fill="var(--ink-2,#555)">'+d(pts[0][0])+'</text>'+
      '<text x="'+(W-R)+'" y="'+(H-4)+'" font-size="11" fill="var(--ink-2,#555)" text-anchor="end">'+d(pts[pts.length-1][0])+'</text></svg>';
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
      var young=pts.length<21;
      var sel=young?"1Y":"3M";
      var draw=function(){
        var s=slice(pts,RANGES.filter(function(r){return r[0]===sel})[0][1]),ret=s[s.length-1][1]/s[0][1]-1,v=vol(pts);
        body.innerHTML='<div class="pc-top"><b>'+money(last,cur)+'</b>'+(day==null?"":'<span class="pc-d '+cls(day)+'">'+(day>=0?"▲ ":"▼ ")+pct(day).replace(/^[+−]/,"")+' today</span>')+(asof?'<span class="pc-asof">'+E(asof)+'</span>':"")+'</div>'+
          (pts.length>=2?'<div class="pc-rg" role="group" aria-label="Chart range">'+RANGES.map(function(r){return '<button data-r="'+r[0]+'" aria-pressed="'+(r[0]===sel)+'">'+r[0]+'</button>'}).join("")+'</div>'+chart(s,cur):"")+
          '<div class="pc-s">'+
            (pts.length>=2?'<div><span>'+E(sel)+' return</span><b class="'+cls(ret)+'">'+pct(ret)+'</b></div>':"")+
            '<div><span>52-wk high</span><b>'+money(hi,cur)+'</b></div>'+
            '<div><span>52-wk low</span><b>'+money(lo,cur)+'</b></div>'+
            (pts.length>=2?'<div><span>From high</span><b class="'+cls(last/hi-1)+'">'+pct(Math.min(0,last/hi-1))+'</b></div>':"")+
            (v!=null?'<div><span>Volatility (1 yr)</span><b>'+(v*100).toFixed(1)+'%</b></div>':"")+
            (pts.length>=2?'<div><span>Max drawdown</span><b class="dn">'+pct(maxDD(pts))+'</b></div>':"")+
          '</div>'+
          (young?'<p class="pc-new">New listing: only '+pts.length+' trading day'+(pts.length===1?"":"s")+' of history so far, so volatility and long-range stats fill in over the next few weeks.</p>':"");
        body.querySelectorAll("[data-r]").forEach(function(b){b.onclick=function(){sel=b.dataset.r;draw()}});
      };
      draw();
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
