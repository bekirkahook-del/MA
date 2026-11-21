/* 1-year Monte Carlo for Market search (Nov 19, 2026).
   Adds a "1-year Monte Carlo" card to every quote and company panel. It pulls one year of daily closes from
   /.netlify/functions/history, estimates volatility from daily log returns, then simulates
   paired (antithetic) price paths (normal, fat-tail or replayed real days) for one year and shows percentile bands, odds and 95% VaR.
   Users can change the expected return, volatility and number of paths. Education only, not a forecast. */
(function(){
  "use strict";
  var $p=function(s,r){return (r||document).querySelector(s)};
  var E=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var SKIP={"10Y YIELD":1};          // yields are rates, not prices: a price simulation would mislead
  var cache={};

  var st=document.createElement("style");
  st.textContent=
    ".mc{margin-top:18px;border:1px solid var(--rule,#d9dde6);border-radius:14px;padding:14px 16px;background:var(--sheet,#fff)}"+
    ".mc-h{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}"+
    ".mc-h b{font-size:16px}.mc-h .note{margin:0}"+
    ".mc-f{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}"+
    ".mc-f label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--ink-2,#555);font-weight:600}"+
    ".mc-f input,.mc-f select{font:inherit;font-size:14px;padding:7px 9px;border:1px solid var(--rule,#d9dde6);border-radius:8px;background:var(--paper,#fff);color:var(--ink,#111);width:100%;box-sizing:border-box}"+
    ".mc svg{width:100%;height:auto;display:block;margin-top:6px}"+
    ".mc-k{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}"+
    ".mc-k div{border:1px solid var(--rule,#d9dde6);border-radius:10px;padding:8px 10px}"+
    ".mc-k span{display:block;font-size:11px;color:var(--ink-2,#555);text-transform:uppercase;letter-spacing:.06em}"+
    ".mc-k b{font-family:var(--mono,monospace);font-size:16px}"+
    ".mc-lg{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:var(--ink-2,#555);margin-top:6px}"+
    ".mc-lg i{display:inline-block;width:12px;height:8px;border-radius:2px;margin-right:5px;vertical-align:middle}"+
    ".mc-ch{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px}.mc-ch span{font-size:12px;color:var(--ink-2,#555);font-weight:600}"+
    ".mc .mc-ch button{font:inherit;font-size:12.5px;font-weight:600;padding:5px 11px;border-radius:999px;border:1px solid var(--rule,#d9dde6);background:var(--paper,#fff);color:var(--ink,#111);cursor:pointer;line-height:1.3}"+
    ".mc .mc-ch button:hover{border-color:var(--cobalt,#2448D8);color:var(--cobalt,#2448D8)}.mc-ch span{min-width:0}"+
    ".mc .up{color:var(--good,#1e8e3e)}.mc .dn{color:var(--bad,#c0392b)}"+
    "@media(max-width:560px){.mc-f{grid-template-columns:1fr 1fr}.mc-k{grid-template-columns:1fr 1fr}}";
  document.head.appendChild(st);

  /* ---------- math ---------- */
  function stats(pts){
    if(pts.length<21)return null;   // a brand-new listing: no reliable estimate yet
    var r=[];for(var i=1;i<pts.length;i++)r.push(Math.log(pts[i][1]/pts[i-1][1]));
    var n=r.length,m=0;r.forEach(function(x){m+=x});m/=n;
    var v=0;r.forEach(function(x){v+=(x-m)*(x-m)});v/=(n-1);
    var days=(pts[pts.length-1][0]-pts[0][0])/86400,ppy=Math.min(366,Math.max(200,Math.round(n/(days/365.25))));
    var sig=Math.sqrt(v*ppy),mu=m*ppy+sig*sig/2;     // arithmetic annual drift for GBM (past-year trend)
    var ew=v;r.forEach(function(x){ew=0.94*ew+0.06*(x-m)*(x-m)});   // RiskMetrics EWMA (lambda 0.94): recent volatility
    return {mu:mu,sig:sig,ppy:ppy,ewma:Math.sqrt(ew*ppy),rets:r,rm:m,rs:Math.sqrt(v),n:n};
  }
  var MARKET=0.10;   // long-run U.S. stock market average, ~10%/yr: a saner default than one noisy year of returns
  /* seeded RNG so the same inputs give the same answer (mulberry32) */
  function rng(seed){var t=seed>>>0;return function(){t=(t+0x6D2B79F5)>>>0;var x=Math.imul(t^(t>>>15),1|t);x^=x+Math.imul(x^(x>>>7),61|x);return ((x^(x>>>14))>>>0)/4294967296}}
  function normals(R){var spare=null;return function(){if(spare!==null){var z=spare;spare=null;return z}var u=0,v=0;while(!u)u=R();v=R();
    var m=Math.sqrt(-2*Math.log(u));spare=m*Math.sin(2*Math.PI*v);return m*Math.cos(2*Math.PI*v)}}
  /* Paired (antithetic) simulation: every random path is run twice, once with shocks z and once with -z.
     The pair's errors cancel, so averages and odds settle with fewer paths.
     model: "gbm" normal shocks | "t" fat tails (Student-t, 4 degrees of freedom, scaled to the same volatility)
            "boot" replays the stock's own past daily moves in 5-day blocks, rescaled to the chosen volatility and drift */
  function simulate(S0,mu,sig,steps,paths,model,st,seed){
    var R=rng(seed||1),N=normals(R),dt=1/steps,a=(mu-sig*sig/2)*dt,b=sig*Math.sqrt(dt),K=26,every=Math.max(1,Math.round(steps/K));
    var marks=[];for(var k=0;k<=steps;k+=every)marks.push(k);if(marks[marks.length-1]!==steps)marks.push(steps);
    paths=Math.max(2,paths-(paths%2));
    var grid=marks.map(function(){return new Float64Array(paths)}),end=new Float64Array(paths),hitDown=0,SAMPLE=24,samp=[];
    var tz=function(){var c=0;for(var q=0;q<4;q++){var g=N();c+=g*g}return N()/Math.sqrt(c/4)*Math.SQRT1_2};   // t(4) scaled to unit variance
    var boot=model==="boot"&&st&&st.rets&&st.rets.length>40,scale=boot?b/st.rs:0,R0=boot?st.rets:null,L=R0?R0.length:0;
    var z=new Float64Array(steps);
    for(var p=0;p<paths;p+=2){
      if(boot){for(var s0=0;s0<steps;){var st0=Math.floor(R()*(L-5));for(var q=0;q<5&&s0<steps;q++,s0++)z[s0]=(R0[st0+q]-st.rm)*scale}}
      else for(var s1=0;s1<steps;s1++)z[s1]=b*(model==="t"?tz():N());
      for(var side=0;side<2;side++){var sg=side?-1:1,x=0,lo=0,mi=0,pi=p+side,keep=samp.length<SAMPLE?[S0]:null;grid[0][pi]=S0;
        for(var s=1;s<=steps;s++){x+=a+sg*z[s-1];if(x<lo)lo=x;if(s===marks[mi+1]){mi++;var v=S0*Math.exp(x);grid[mi][pi]=v;if(keep)keep.push(v)}}
        end[pi]=S0*Math.exp(x);if(lo<=Math.log(0.8))hitDown++;if(keep)samp.push(keep)}}
    var pc=function(arr,q){var s=Array.prototype.slice.call(arr).sort(function(a,b){return a-b});return s[Math.min(s.length-1,Math.floor(q*s.length))]};
    var bands=grid.map(function(g,i){return {t:marks[i]/steps,p5:pc(g,.05),p25:pc(g,.25),p50:pc(g,.5),p75:pc(g,.75),p95:pc(g,.95)}});
    var up=0,sum=0,pairUp=[];for(var j=0;j<paths;j+=2){var u2=(end[j]>S0)+(end[j+1]>S0);up+=u2;pairUp.push(u2/2);sum+=end[j]+end[j+1]}
    var pu=up/paths,vv=0;pairUp.forEach(function(x){vv+=(x-pu)*(x-pu)});var se=Math.sqrt(vv/Math.max(1,pairUp.length-1)/pairUp.length);   // std error from pairs
    var sorted=Array.prototype.slice.call(end).sort(function(a,b){return a-b}),cut=Math.max(1,Math.floor(.05*paths)),tail=0;for(var c2=0;c2<cut;c2++)tail+=sorted[c2];
    return {bands:bands,marks:marks.map(function(m){return m/steps}),samp:samp,p5:pc(end,.05),p50:pc(end,.5),p95:pc(end,.95),mean:sum/paths,up:pu,upSE:se,dd20:hitDown/paths,es:tail/cut,n:paths};
  }

  /* ---------- chart ---------- */
  function chart(pts,S0,r,cur){
    var W=640,H=240,L=8,R=58,T=10,B=22,hist=pts.slice(-252),all=hist.map(function(p){return p[1]}).concat([r.bands[r.bands.length-1].p95,r.bands[r.bands.length-1].p5,S0]);
    var lo=Math.min.apply(null,all),hi=Math.max.apply(null,all);r.bands.forEach(function(b){if(b.p5<lo)lo=b.p5;if(b.p95>hi)hi=b.p95});
    var pad=(hi-lo)*.06||1;lo=Math.max(0,lo-pad);hi+=pad;
    var mid=L+(W-L-R)/2,X=function(f){return L+f*(W-L-R)},Y=function(v){return T+(1-(v-lo)/(hi-lo))*(H-T-B)};
    var hx=function(i){return X(hist.length<2?0.5:i/(hist.length-1)*0.5)},fx=function(t){return mid+t*(W-R-mid)};
    var line=hist.map(function(p,i){return (i?"L":"M")+hx(i).toFixed(1)+" "+Y(p[1]).toFixed(1)}).join("");
    var band=function(a,b){return r.bands.map(function(x,i){return (i?"L":"M")+fx(x.t).toFixed(1)+" "+Y(x[a]).toFixed(1)}).join("")+r.bands.slice().reverse().map(function(x){return "L"+fx(x.t).toFixed(1)+" "+Y(x[b]).toFixed(1)}).join("")+"Z"};
    var med=r.bands.map(function(x,i){return (i?"L":"M")+fx(x.t).toFixed(1)+" "+Y(x.p50).toFixed(1)}).join("");
    var fmt=function(v){return v>=1000?Math.round(v).toLocaleString():v.toFixed(v<10?2:1)};
    var tick=function(v,c){return '<text x="'+(W-R+6)+'" y="'+(Y(v)+4).toFixed(1)+'" font-size="11" fill="'+c+'" font-family="var(--mono,monospace)">'+fmt(v)+'</text>'};
    var last=r.bands[r.bands.length-1],cs=cur==="USD"?"$":"",m2=function(v){return cs+(v>=1000?Math.round(v).toLocaleString():v.toFixed(2))};
    var fd=function(t){return new Date(t*1000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},t1=hist.length?hist[hist.length-1][0]:Date.now()/1000;
    var rows=hist.map(function(p,i){return [+hx(i).toFixed(1),+Y(p[1]).toFixed(1),fd(p[0])+"\n"+m2(p[1])]}).concat(r.bands.slice(1).map(function(b){
      return [+fx(b.t).toFixed(1),+Y(b.p50).toFixed(1),"~"+fd(t1+b.t*365.25*86400)+" (simulated)\nMedian "+m2(b.p50)+"\nMiddle 50%: "+m2(b.p25)+" – "+m2(b.p75)+"\nMiddle 90%: "+m2(b.p5)+" – "+m2(b.p95)]}));
    var hv=window.maHvAttr?window.maHvAttr(rows):"";
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Past year of prices and simulated range for the next year. Hover or use arrow keys for values"'+hv+'>'+
      '<line x1="'+mid+'" x2="'+mid+'" y1="'+T+'" y2="'+(H-B)+'" stroke="currentColor" stroke-opacity=".18" stroke-dasharray="3 3"/>'+
      '<path d="'+band("p95","p5")+'" fill="var(--cobalt,#2448D8)" fill-opacity=".12"/>'+
      '<path d="'+band("p75","p25")+'" fill="var(--cobalt,#2448D8)" fill-opacity=".24"/>'+
      (r.samp||[]).map(function(sp){return '<path d="'+sp.map(function(v,i){return (i?"L":"M")+fx(r.marks[i]).toFixed(1)+" "+Y(Math.max(lo,Math.min(hi,v))).toFixed(1)}).join("")+'" fill="none" stroke="var(--cobalt,#2448D8)" stroke-opacity=".18" stroke-width=".8"/>'}).join("")+
      '<path d="'+line+'" fill="none" stroke="currentColor" stroke-width="1.6"/>'+
      '<path d="'+med+'" fill="none" stroke="var(--cobalt,#2448D8)" stroke-width="2"/>'+
      tick(last.p95,"var(--ink-2,#555)")+tick(last.p50,"var(--cobalt,#2448D8)")+tick(last.p5,"var(--ink-2,#555)")+
      '<text x="'+L+'" y="'+(H-6)+'" font-size="11" fill="var(--ink-2,#555)">Past year</text>'+
      '<text x="'+(mid+6)+'" y="'+(H-6)+'" font-size="11" fill="var(--ink-2,#555)">Next year (simulated)</text></svg>';
  }

  /* ---------- UI ---------- */
  var money=function(v,cur){var d=v>=1000?0:2;return (cur==="USD"?"$":"")+v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d})};
  var pct=function(v){return (v>=0?"+":"−")+Math.abs(v*100).toFixed(1)+"%"};

  function mount(sym){
    var panel=document.getElementById("panel");if(!panel||SKIP[sym]||$p(".mc",panel))return;
    var box=document.createElement("section");box.className="mc";box.setAttribute("aria-label","1-year Monte Carlo simulation");
    box.innerHTML='<div class="mc-h"><b>1-year Monte Carlo</b><button class="ghost outline" data-mc="go">Run simulation</button></div>'+
      '<p class="note" style="margin:6px 0 0">Simulates thousands of possible price paths for the next 12 months, using the past year\'s returns and volatility.</p><div class="mc-body"></div>';
    var anchor=$p(".ang",panel);anchor&&anchor.parentNode===panel?anchor.insertAdjacentElement("afterend",box):panel.appendChild(box);
    $p('[data-mc="go"]',box).onclick=function(){load(sym,box)};
  }

  function load(sym,box){
    var body=$p(".mc-body",box),btn=$p('[data-mc="go"]',box);btn.disabled=true;btn.textContent="Loading…";
    var got=cache[sym]?Promise.resolve(cache[sym]):(window.maHist?window.maHist(sym):fetch("/.netlify/functions/history?s="+encodeURIComponent(sym)).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}));
    got.then(function(d){cache[sym]=d;btn.remove();form(sym,d,box)}).catch(function(){
      btn.disabled=false;btn.textContent="Try again";body.innerHTML='<p class="note">Couldn\'t load price history for '+E(sym)+'. It may be too new or not covered.</p>'});
  }

  function form(sym,d,box){
    var s=stats(d.pts),body=$p(".mc-body",box),young=!s;
    if(young)s={mu:NaN,sig:NaN,ppy:252};
    body.innerHTML=(young?'<p class="note" style="margin:8px 0 0">Only '+d.pts.length+' trading day'+(d.pts.length===1?"":"s")+' of history, too few to estimate. Enter your own assumptions, for example the volatility of similar stocks.</p>':"")+'<div class="mc-f">'+
      '<label>Return / yr (%)<input type="number" step="0.5" data-mc="mu" placeholder="e.g. 10" value="'+(MARKET*100).toFixed(1)+'"></label>'+
      '<label>Volatility (%)<input type="number" step="0.5" min="1" max="300" data-mc="sig" placeholder="e.g. 40" value="'+(young?"":(s.sig*100).toFixed(1))+'"></label>'+
      '<label>Paths (paired)<select data-mc="n"><option value="2000">2,000</option><option value="10000" selected>10,000</option><option value="20000">20,000</option></select></label>'+
      '<label>Model<select data-mc="m"><option value="gbm">Normal (GBM)</option><option value="t">Fat tails</option>'+(young?"":'<option value="boot" selected>Real days</option>')+'</select></label></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn" data-mc="run">Run</button><button class="ghost outline" data-mc="new">New random draw</button></div>'+
      '<div class="mc-ch" role="group" aria-label="Return presets"><span>Return:</span><button type="button" data-mc="mkt">Market '+(MARKET*100).toFixed(0)+'%</button>'+(young?"":'<button type="button" data-mc="trend">Past year '+pct(s.mu)+'</button>')+'</div>'+
      (young?"":'<div class="mc-ch" role="group" aria-label="Volatility presets"><span>Volatility:</span><button type="button" data-mc="ew">Recent '+(s.ewma*100).toFixed(0)+'%</button><button type="button" data-mc="reset">1 yr '+(s.sig*100).toFixed(0)+'%</button></div>')+
      '<div class="mc-out"></div>';
    var run=function(){
      var mu=parseFloat($p('[data-mc="mu"]',body).value)/100,sig=parseFloat($p('[data-mc="sig"]',body).value)/100,n=+$p('[data-mc="n"]',body).value;
      if(!isFinite(mu)||!isFinite(sig)||sig<=0){$p(".mc-out",body).innerHTML='<p class="note">Enter a return and a volatility above 0.</p>';return}
      mu=Math.max(-0.95,Math.min(3,mu));sig=Math.min(3,sig);
      var model=$p('[data-mc="m"]',body).value,S0=d.last,r=simulate(S0,mu,sig,s.ppy,n,model,young?null:s,seed),cur=d.cur;
      $p(".mc-out",body).innerHTML=chart(d.pts,S0,r,cur)+
        '<div class="mc-lg"><span><i style="background:currentColor"></i>Past year</span><span><i style="background:var(--cobalt,#2448D8)"></i>Median path</span><span><i style="background:var(--cobalt,#2448D8);opacity:.45"></i>Middle 50%</span><span><i style="background:var(--cobalt,#2448D8);opacity:.2"></i>Middle 90%</span></div>'+
        '<div class="mc-k">'+
          '<div><span>Today</span><b>'+money(S0,cur)+'</b></div>'+
          '<div><span>Median in 1 yr</span><b>'+money(r.p50,cur)+'</b><small class="'+(r.p50>=S0?"up":"dn")+'"> '+pct(r.p50/S0-1)+'</small></div>'+
          '<div><span>90% range</span><b>'+money(r.p5,cur)+' – '+money(r.p95,cur)+'</b></div>'+
          '<div><span>Chance it\'s higher</span><b>'+Math.round(r.up*100)+'%</b><small> ±'+Math.max(0.1,r.upSE*196).toFixed(1)+'</small></div>'+
          '<div><span>Average (mean) in 1 yr</span><b>'+money(r.mean,cur)+'</b></div>'+
          '<div><span>Avg of worst 5% (ES)</span><b class="dn">'+pct(r.es/S0-1)+'</b></div>'+
          '<div><span>95% VaR (1 yr)</span><b class="dn">'+pct(Math.min(0,r.p5/S0-1))+'</b></div>'+
          '<div><span>Chance of a 20% drop</span><b>'+Math.round(r.dd20*100)+'%</b></div>'+
          '<div><span>Return used</span><b>'+pct(mu)+'</b></div>'+
          '<div><span>Volatility used</span><b>'+(sig*100).toFixed(1)+'%</b></div></div>'+
        '<p class="note" style="margin-top:10px">'+r.n.toLocaleString()+' paths in mirrored pairs (antithetic variates) for steadier results; ± is the 95% sampling error. '+({gbm:"Normal model: a random walk (geometric Brownian motion) with constant return and volatility; it underestimates crashes.",t:"Fat-tail model: daily moves drawn from a Student-t (4 df) at the same volatility, so big jumps happen more often, like real markets.",boot:"Replay model: rebuilds each year from this stock\'s real past daily moves in 5-day blocks (keeps fat tails and calm/volatile streaks), rescaled to the volatility and return above."})[model]+' The default return is the long-run stock market average, not last year\'s move. Education only, not a forecast or advice.</p>'+
        '<div class="ang" style="margin-top:10px"><b>Interview angle</b>Banks and funds use Monte Carlo for VaR, option pricing and LBO returns. Be ready to explain why higher volatility widens the range and why the median ends below the mean.</div>';
    };
    var seed=7,set=function(k,v){$p('[data-mc="'+k+'"]',body).value=v};
    $p('[data-mc="run"]',body).onclick=run;
    $p('[data-mc="new"]',body).onclick=function(){seed=(Math.random()*1e9)|0;run()};
    $p('[data-mc="mkt"]',body).onclick=function(){set("mu",(MARKET*100).toFixed(1));run()};
    var on=function(k,f){var b=$p('[data-mc="'+k+'"]',body);if(b)b.onclick=f};
    on("trend",function(){set("mu",(s.mu*100).toFixed(1));run()});
    on("ew",function(){set("sig",(s.ewma*100).toFixed(1));run()});
    on("reset",function(){set("sig",(s.sig*100).toFixed(1));run()});
    $p('[data-mc="m"]',body).onchange=run;
    if(!young)run();
  }

  /* ---------- hook into the quote and company panels ---------- */
  function wrap(name){
    var orig=window[name];if(typeof orig!=="function")return;
    window[name]=function(sym){var out=orig.apply(this,arguments);try{if(window.CO_RAW||name==="showQuote")mount(sym)}catch(e){}return out};
  }
  wrap("showQuote");wrap("showCompany");
  window.maMountMC=mount;
})();
