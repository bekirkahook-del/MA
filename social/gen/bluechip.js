// Blue Chip 2-slide posts: slide 1 = building photo + title, slide 2 = ranked bar chart.
const { chromium } = require("playwright");const fs=require("fs"),path=require("path");
const F=p=>"file://"+path.join(__dirname,"node_modules/@fontsource",p);
const photo="data:image/png;base64,"+fs.readFileSync(path.join(__dirname,"jpm.png")).toString("base64");
const CSS=`@font-face{font-family:Archivo;font-weight:900;font-stretch:62% 125%;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:Archivo;font-weight:800;src:url(${F("archivo/files/archivo-latin-800-normal.woff2")})}
@font-face{font-family:Plex;font-weight:400;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2")})}
@font-face{font-family:Plex;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:Mono;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{box-sizing:border-box;margin:0}body{width:1080px;height:1920px;overflow:hidden;background:#07101F;color:#fff;font-family:Plex,sans-serif;position:relative}
.ph{position:absolute;inset:0;background:url(${photo}) center 40%/cover}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,10,24,.88) 0%,rgba(4,10,24,.55) 30%,rgba(4,10,24,.05) 52%,rgba(4,10,24,.25) 75%,rgba(4,10,24,.85) 100%)}
.brand{position:absolute;top:84px;left:80px;font-family:Mono;font-size:28px;letter-spacing:6px;color:#E3C27A}
.t{position:absolute;top:170px;left:80px;right:150px}
.badge{display:inline-block;font-family:Archivo;font-weight:900;font-size:40px;letter-spacing:2px;background:#E3C27A;color:#07101F;padding:8px 22px;border-radius:10px;margin-bottom:26px}
h1{font-family:Archivo;font-weight:900;font-size:96px;line-height:.98;letter-spacing:-1.5px;text-shadow:0 6px 30px rgba(0,0,0,.5)}h1 em{font-style:normal;color:#E3C27A}
.sub{margin-top:24px;font-size:38px;color:#DCE3F0;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.sw{position:absolute;bottom:470px;left:80px;font-family:Mono;font-size:30px;color:#fff;background:rgba(7,16,31,.6);border:1px solid rgba(255,255,255,.25);border-radius:99px;padding:12px 26px}
.c{position:absolute;top:150px;left:80px;right:150px;bottom:440px;display:flex;flex-direction:column;justify-content:center;gap:34px}
.c h2{font-family:Archivo;font-weight:900;font-size:68px;line-height:1.02;letter-spacing:-1px}.c h2 em{font-style:normal;color:#E3C27A}
.k{font-family:Mono;font-size:28px;letter-spacing:5px;color:#E3C27A}
.rows{display:flex;flex-direction:column;gap:22px}
.r{display:grid;grid-template-columns:56px 1fr;gap:18px;align-items:center}
.rk{font-family:Archivo;font-weight:900;font-size:44px;color:#5E6C88;text-align:right}
.r.hi .rk{color:#E3C27A}
.nm{display:flex;justify-content:space-between;font-size:36px;font-weight:600;margin-bottom:8px}.nm b{font-family:Mono;font-weight:500}
.bar{height:34px;border-radius:8px;background:#1B2843;overflow:hidden}.bar i{display:block;height:100%;border-radius:8px;background:linear-gradient(90deg,#3B6CFF,#6E93FF)}
.r.hi .bar i{background:linear-gradient(90deg,#C99A3E,#E3C27A)}.r.neg .bar i{background:linear-gradient(90deg,#B9384A,#E0566A)}.r.neg .nm b{color:#FF8597}
.cap{font-size:34px;line-height:1.4;color:#C7D0E2}.src{font-size:26px;color:#7E8AA6}`;
const page=b=>`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${b}</body></html>`;
(async()=>{const spec=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1080,height:1920}});
 for(const p of spec.posts){
  const s1=page(`<div class="ph"></div><div class="sh"></div><div class="brand">BLUE CHIP FINANCIAL</div><div class="t">${p.badge?`<div class="badge">${p.badge}</div>`:""}<h1>${p.title}</h1>${p.sub?`<p class="sub">${p.sub}</p>`:""}</div><div class="sw">${p.swipe||"Swipe for the ranking →"}</div>`);
  const mx=Math.max(...p.rows.map(r=>Math.abs(r[1])));
  const s2=page(`<div class="brand">BLUE CHIP FINANCIAL</div><div class="c"><div class="k">${p.kicker}</div><h2>${p.chartTitle}</h2><div class="rows">${p.rows.map((r,i)=>`<div class="r ${r[3]?"hi":""} ${r[1]<0?"neg":""}"><div class="rk">${i+1}</div><div><div class="nm"><span>${r[0]}</span><b>${r[2]}</b></div><div class="bar"><i style="width:${(Math.abs(r[1])/mx*100).toFixed(1)}%"></i></div></div></div>`).join("")}</div>${p.caption?`<p class="cap">${p.caption}</p>`:""}<p class="src">Source: ${p.source}</p></div>`);
  for(const [i,h] of [[1,s1],[2,s2]]){const f=path.join(__dirname,"_bc.html");fs.writeFileSync(f,h);await pg.goto("file://"+f);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(150);
   const over=await pg.evaluate(()=>{const m=document.querySelector(".c,.t");return m.scrollHeight-m.clientHeight});
   await pg.screenshot({path:path.join(out,`${p.key}-0${i}.jpg`),type:"jpeg",quality:90});console.log(p.key,i,over>2?"OVERFLOW "+over:"ok")}}
 await b.close()})();
