/* 1-year Monte Carlo for Market search (Nov 19, 2026).
   Adds a "1-year Monte Carlo" card to every quote and company panel. It pulls one year of daily closes from
   /.netlify/functions/history, estimates drift and volatility from daily log returns, then simulates
   geometric Brownian motion paths for one year and shows percentile bands, odds and 95% VaR.
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
    ".mc .up{color:var(--good,#1e8e3e)}.mc .dn{color:var(--bad,#c0392b)}"+
    "@media(max-width:560px){.mc-f{grid-template-columns:1fr 1fr}.mc-k{grid-template-columns:1fr 1fr}}";
  document.head.appendChild(st);

  /* ---------- math ---------- */
  function stats(pts){
    var r=[];for(var i=1;i<pts.length;i++)r.push(Math.log(pts[i][1]/pts[i-1][1]));
    var n=r.length,m=0;r.forEach(function(x){m+=x});m/=n;
    var v=0;r.forEach(function(x){v+=(x-m)*(x-m)});v/=(n-1);
    var days=(pts[pts.length-1][0]-pts[0][0])/86400,ppy=Math.min(366,Math.max(200,Math.round(n/(days/365.25))));
    var sig=Math.sqrt(v*ppy),mu=m*ppy+sig*sig/2;     // arithmetic annual drift for GBM
    return {mu:mu,sig:sig,ppy:ppy};
  }
  function gauss(){var u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
  function simulate(S0,mu,sig,steps,paths){
    var dt=1/steps,a=(mu-sig*sig/2)*dt,b=sig*Math.sqrt(dt),K=26,every=Math.max(1,Math.round(steps/K));
    var marks=[];for(var k=0;k<=steps;k+=every)marks.push(k);if(marks[marks.length-1]!==steps)marks.push(steps);
    var grid=marks.map(function(){return new Float64Array(paths)}),end=new Float64Array(paths),hitDown=0;
    for(var p=0;p<paths;p++){var x=0,lo=0,mi=0;grid[0][p]=S0;
      for(var s=1;s<=steps;s++){x+=a+b*gauss();if(x<lo)lo=x;if(s===marks[mi+1]){mi++;grid[mi][p]=S0*Math.exp(x)}}
      end[p]=S0*Math.exp(x);if(lo<=Math.log(0.8))hitDown++}
    var pc=function(arr,q){var s=Array.prototype.slice.call(arr).sort(function(a,b){return a-b});return s[Math.min(s.length-1,Math.floor(q*s.length))]};
    var bands=grid.map(function(g,i){return {t:marks[i]/steps,p5:pc(g,.05),p25:pc(g,.25),p50:pc(g,.5),p75:pc(g,.75),p95:pc(g,.95)}});
    var up=0,sum=0;for(var j=0;j<paths;j++){if(end[j]>S0)up++;sum+=end[j]}
    return {bands:bands,p5:pc(end,.05),p50:pc(end,.5),p95:pc(end,.95),mean:sum/paths,up:up/paths,dd20:hitDown/paths};
  }

  /* ---------- chart ---------- */
  function chart(pts,S0,r){
    var W=640,H=240,L=8,R=58,T=10,B=22,hist=pts.slice(-252),all=hist.map(function(p){return p[1]}).concat([r.bands[r.bands.length-1].p95,r.bands[r.bands.length-1].p5,S0]);
    var lo=Math.min.apply(null,all),hi=Math.max.apply(null,all);r.bands.forEach(function(b){if(b.p5<lo)lo=b.p5;if(b.p95>hi)hi=b.p95});
    var pad=(hi-lo)*.06||1;lo=Math.max(0,lo-pad);hi+=pad;
    var mid=L+(W-L-R)/2,X=function(f){return L+f*(W-L-R)},Y=function(v){return T+(1-(v-lo)/(hi-lo))*(H-T-B)};
    var hx=function(i){return X(i/(hist.length-1)*0.5)},fx=function(t){return mid+t*(W-R-mid)};
    var line=hist.map(function(p,i){return (i?"L":"M")+hx(i).toFixed(1)+" "+Y(p[1]).toFixed(1)}).join("");
    var band=function(a,b){return r.bands.map(function(x,i){return (i?"L":"M")+fx(x.t).toFixed(1)+" "+Y(x[a]).toFixed(1)}).join("")+r.bands.slice().reverse().map(function(x){return "L"+fx(x.t).toFixed(1)+" "+Y(x[b]).toFixed(1)}).join("")+"Z"};
    var med=r.bands.map(function(x,i){return (i?"L":"M")+fx(x.t).toFixed(1)+" "+Y(x.p50).toFixed(1)}).join("");
    var fmt=function(v){return v>=1000?Math.round(v).toLocaleString():v.toFixed(v<10?2:1)};
    var tick=function(v,c){return '<text x="'+(W-R+6)+'" y="'+(Y(v)+4).toFixed(1)+'" font-size="11" fill="'+c+'" font-family="var(--mono,monospace)">'+fmt(v)+'</text>'};
    var last=r.bands[r.bands.length-1];
    return '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Past year of prices and simulated range for the next year">'+
      '<line x1="'+mid+'" x2="'+mid+'" y1="'+T+'" y2="'+(H-B)+'" stroke="currentColor" stroke-opacity=".18" stroke-dasharray="3 3"/>'+
      '<path d="'+band("p95","p5")+'" fill="var(--cobalt,#2448D8)" fill-opacity=".12"/>'+
      '<path d="'+band("p75","p25")+'" fill="var(--cobalt,#2448D8)" fill-opacity=".24"/>'+
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
    var got=cache[sym]?Promise.resolve(cache[sym]):fetch("/.netlify/functions/history?s="+encodeURIComponent(sym)).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()});
    got.then(function(d){cache[sym]=d;btn.remove();form(sym,d,box)}).catch(function(){
      btn.disabled=false;btn.textContent="Try again";body.innerHTML='<p class="note">Couldn\'t load price history for '+E(sym)+'. It may be too new or not covered.</p>'});
  }

  function form(sym,d,box){
    var s=stats(d.pts),body=$p(".mc-body",box);
    body.innerHTML='<div class="mc-f">'+
      '<label>Expected return / yr (%)<input type="number" step="0.5" data-mc="mu" value="'+(s.mu*100).toFixed(1)+'"></label>'+
      '<label>Volatility / yr (%)<input type="number" step="0.5" min="1" max="300" data-mc="sig" value="'+(s.sig*100).toFixed(1)+'"></label>'+
      '<label>Paths<select data-mc="n"><option>1000</option><option selected>2000</option><option>5000</option></select></label></div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-mc="run">Run</button><button class="ghost outline" data-mc="reset">Use past-year numbers</button></div>'+
      '<div class="mc-out"></div>';
    var run=function(){
      var mu=parseFloat($p('[data-mc="mu"]',body).value)/100,sig=parseFloat($p('[data-mc="sig"]',body).value)/100,n=+$p('[data-mc="n"]',body).value;
      if(!isFinite(mu)||!isFinite(sig)||sig<=0){$p(".mc-out",body).innerHTML='<p class="note">Enter a return and a volatility above 0.</p>';return}
      mu=Math.max(-0.95,Math.min(3,mu));sig=Math.min(3,sig);
      var S0=d.last,r=simulate(S0,mu,sig,s.ppy,n),cur=d.cur;
      $p(".mc-out",body).innerHTML=chart(d.pts,S0,r)+
        '<div class="mc-lg"><span><i style="background:currentColor"></i>Past year</span><span><i style="background:var(--cobalt,#2448D8)"></i>Median path</span><span><i style="background:var(--cobalt,#2448D8);opacity:.45"></i>Middle 50%</span><span><i style="background:var(--cobalt,#2448D8);opacity:.2"></i>Middle 90%</span></div>'+
        '<div class="mc-k">'+
          '<div><span>Today</span><b>'+money(S0,cur)+'</b></div>'+
          '<div><span>Median in 1 yr</span><b>'+money(r.p50,cur)+'</b><small class="'+(r.p50>=S0?"up":"dn")+'"> '+pct(r.p50/S0-1)+'</small></div>'+
          '<div><span>90% range</span><b>'+money(r.p5,cur)+' – '+money(r.p95,cur)+'</b></div>'+
          '<div><span>Chance it\'s higher</span><b>'+Math.round(r.up*100)+'%</b></div>'+
          '<div><span>95% VaR (1 yr)</span><b class="dn">'+pct(Math.min(0,r.p5/S0-1))+'</b></div>'+
          '<div><span>Chance of a 20% drop</span><b>'+Math.round(r.dd20*100)+'%</b></div>'+
          '<div><span>Return used</span><b>'+pct(mu)+'</b></div>'+
          '<div><span>Volatility used</span><b>'+(sig*100).toFixed(1)+'%</b></div></div>'+
        '<p class="note" style="margin-top:10px">Assumes prices follow a random walk (geometric Brownian motion) with these numbers held constant. Past returns rarely repeat, so try a lower expected return too. Education only, not a forecast or advice.</p>'+
        '<div class="ang" style="margin-top:10px"><b>Interview angle</b>Banks and funds use Monte Carlo for VaR, option pricing and LBO returns. Be ready to explain why higher volatility widens the range and why the median ends below the mean.</div>';
    };
    $p('[data-mc="run"]',body).onclick=run;
    $p('[data-mc="reset"]',body).onclick=function(){$p('[data-mc="mu"]',body).value=(s.mu*100).toFixed(1);$p('[data-mc="sig"]',body).value=(s.sig*100).toFixed(1);run()};
    run();
  }

  /* ---------- hook into the quote and company panels ---------- */
  function wrap(name){
    var orig=window[name];if(typeof orig!=="function")return;
    window[name]=function(sym){var out=orig.apply(this,arguments);try{mount(sym)}catch(e){}return out};
  }
  wrap("showQuote");wrap("showCompany");
})();
