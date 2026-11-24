// v2: b-roll scenes + graphics. card.bg = broll name -> transparent overlay composited on footage.
const { chromium } = require("playwright"); const fs=require("fs"),path=require("path"),{execFileSync}=require("child_process");
const NM=require("path").join(__dirname,"..","node_modules/@fontsource");const F=p=>"data:font/woff2;base64,"+fs.readFileSync(path.join(NM,p)).toString("base64");
const BR=process.env.BROLL||"../broll/";const S=JSON.parse(fs.readFileSync(process.argv[2],"utf8")),FPS=24,AN=30,G="#76B900",R="#FF4D4D";
const css=`@font-face{font-family:A;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:P;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:M;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1920px;height:1080px;overflow:hidden;color:#fff;font-family:P;background:transparent}
.top{position:absolute;top:50px;left:80px;right:80px;display:flex;justify-content:space-between;font:500 26px M;letter-spacing:.2em;color:#cfd8ee;text-shadow:0 2px 8px #000}
.chip{background:${G};color:#000;padding:6px 18px;border-radius:8px;letter-spacing:.1em;text-shadow:none}
#st{position:absolute;inset:130px 110px 140px;display:flex;flex-direction:column;justify-content:center}
.k{font:500 32px M;letter-spacing:.18em;color:#9FB4FF;margin-bottom:20px}.big{font:900 220px/0.92 A;letter-spacing:-8px}
.h{font:900 84px/1.05 A;letter-spacing:-1px}.sub{font:600 42px/1.3 P;color:#D7DEEF;margin-top:24px;max-width:1500px}
.sh{text-shadow:0 4px 30px rgba(0,0,0,.9)}
.lt{position:absolute;left:0;bottom:150px;display:flex;flex-direction:column;align-items:flex-start}.lt .tag{background:${G};color:#000;font:900 40px A;padding:10px 28px}.lt .main{background:rgba(5,8,15,.92);font:900 78px A;padding:18px 36px 22px;letter-spacing:-1px}.lt .s2{background:rgba(5,8,15,.8);font:600 36px P;color:#D7DEEF;padding:10px 36px}
.kin{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font:900 190px/0.95 A;letter-spacing:-6px;text-shadow:0 8px 60px #000}
.q{font:900 80px/1.12 A;border-left:14px solid ${G};padding-left:50px}.who{font:600 40px P;color:#C9D3EA;margin-top:30px;padding-left:64px}
.bars{display:flex;flex-direction:column;gap:34px;margin-top:20px}.row{display:flex;align-items:center;gap:30px}.lab{width:420px;font:900 52px A;text-align:right}.bar{height:96px;border-radius:12px}.val{font:900 64px A}
.vs{display:flex;gap:60px}.col{flex:1;border-radius:24px;padding:50px;background:rgba(10,14,28,.85)}.col h3{font:900 64px A;margin-bottom:24px}.col p{font:600 40px/1.3 P;color:#D7DEEF;margin-top:16px}
.dots{display:grid;grid-template-columns:repeat(20,34px);gap:12px;margin-top:30px}.dots i{width:34px;height:34px;border-radius:50%;background:#2a3350}
.src{position:absolute;bottom:44px;left:80px;right:400px;font:500 22px M;color:#aab4cc;text-shadow:0 2px 6px #000}.wm{position:absolute;bottom:40px;right:80px;font:700 30px P;color:rgba(255,255,255,.75);text-shadow:0 2px 6px #000}`;
function chart(c){const W=1500,H=560,xs=c.pts.map((_,i)=>i/(c.pts.length-1)*W),mn=Math.min(...c.pts.map(p=>p[1]))*0.85,mx=Math.max(...c.pts.map(p=>p[1]))*1.05,y=v=>H-(v-mn)/(mx-mn)*H;
 const d=c.pts.map((p,i)=>(i?"L":"M")+xs[i].toFixed(1)+" "+y(p[1]).toFixed(1)).join(" ");
 return `<div class=k data-a=fade>${c.k}</div><div class=h data-a=slide style="margin-bottom:20px">${c.h}</div><svg width=${W+260} height=${H+80} style="overflow:visible"><path id=ln d="${d}" fill=none stroke="${c.col||G}" stroke-width=10 stroke-linejoin=round stroke-linecap=round pathLength=1 stroke-dasharray=1 stroke-dashoffset=1 />${c.pts.map((p,i)=>`<g class=pt data-i=${i} opacity=0><circle cx=${xs[i]} cy=${y(p[1])} r=16 fill="${p[3]||"#fff"}"/><text x=${xs[i]} y=${y(p[1])-34} fill="#fff" font-family=A font-size=46 text-anchor=${i==c.pts.length-1?"end":i?"middle":"start"}>${p[2]}</text><text x=${xs[i]} y=${H+66} fill="#9FB4FF" font-family=M font-size=28 text-anchor=${i==c.pts.length-1?"end":i?"middle":"start"}>${p[0]}</text></g>`).join("")}</svg>`;}
function body(c){
 if(c.t==="stat")return `<div class="k sh" data-a=fade>${c.k||""}</div><div class="big sh" style="color:${c.col||G}" data-count="${c.n}" data-pre="${c.pre||""}" data-suf="${c.suf||""}" data-dec="${c.dec??0}">0</div><div class="h sh" data-a=slide style="margin-top:30px">${c.h||""}</div><div class="sub sh" data-a=fade2>${c.s||""}</div>`;
 if(c.t==="title")return `<div class="k sh" data-a=fade>${c.k||""}</div><div class="h sh" data-a=slide style="font-size:${c.px||120}px">${c.h}</div><div class="sub sh" data-a=fade2>${c.s||""}</div>`;
 if(c.t==="quote")return `<div class="k sh" data-a=fade>${c.k||""}</div><div class="q sh" data-a=slide>“${c.q}”</div><div class="who sh" data-a=fade2>— ${c.who}</div>`;
 if(c.t==="bars"){const mx=Math.max(...c.items.map(i=>Math.abs(i[1])));return `<div class=k data-a=fade>${c.k}</div><div class=h data-a=slide style="margin-bottom:30px">${c.h}</div><div class=bars>${c.items.map(i=>`<div class=row><div class=lab>${i[0]}</div><div class=bar data-w="${Math.max(30,Math.abs(i[1])/mx*900)}" style="width:0;background:${i[2]}"></div><div class=val data-a=fade2>${i[3]}</div></div>`).join("")}</div>`;}
 if(c.t==="vs")return `<div class="k sh" data-a=fade>${c.k}</div><div class=vs>${c.cols.map((x,j)=>`<div class=col data-a=${j?"fade2":"slide"} style="border-top:10px solid ${x[1]}"><h3>${x[0]}</h3>${x[2].map(l=>`<p>${l}</p>`).join("")}</div>`).join("")}</div>`;
 if(c.t==="chart")return chart(c);
 if(c.t==="dots")return `<div class=k data-a=fade>${c.k}</div><div class=h data-a=slide>${c.h}</div><div class=dots data-n="${c.n}">${Array.from({length:100},(_,i)=>`<i data-d=${i}></i>`).join("")}</div><div class=sub data-a=fade2>${c.s||""}</div>`;
 return "";}
const over=c=>c.t==="lt"?`<div class=lt><div class=tag data-a=slide>${c.tag}</div><div class=main data-a=slide>${c.h}</div>${c.s?`<div class=s2 data-a=fade2>${c.s}</div>`:""}</div>`:c.t==="kin"?`<div class=kin data-kin style="color:${c.col||"#fff"}">${c.h}</div>`:`<div id=st>${body(c)}</div>`;
const html=c=>`<html><head><style>${css}</style></head><body>${c.bg?"":`<div style="position:absolute;inset:0;background:radial-gradient(1400px 900px at 30% 40%,${c.acc||"#2448D8"}aa,transparent 70%),#060B1A"></div><div style="position:absolute;inset:0;opacity:.06;background-image:radial-gradient(#fff 1px,transparent 1px);background-size:6px 6px"></div>`}
<div class=top><span>${S.kicker}</span>${c.date?`<span class=chip>${c.date}</span>`:""}</div>${over(c)}${c.src?`<div class=src>Source: ${c.src}</div>`:""}<div class=wm>mnaprep.com</div>
<script>const e=p=>1-Math.pow(1-Math.min(1,Math.max(0,p)),3),bk=x=>{x=Math.min(1,Math.max(0,x));return 1+2.7*Math.pow(x-1,3)+1.7*Math.pow(x-1,2)};window.draw=t=>{
document.querySelectorAll('[data-a=fade]').forEach(x=>x.style.opacity=e(t/.4));
document.querySelectorAll('[data-a=slide]').forEach((x,i)=>{const tt=t-.08*i;x.style.opacity=e((tt-.05)/.35);x.style.transform='translateX('+(1-e((tt-.05)/.35))*-160+'px)'});
document.querySelectorAll('[data-a=fade2]').forEach(x=>x.style.opacity=e((t-.5)/.4));
document.querySelectorAll('[data-kin]').forEach(x=>{x.style.transform='scale('+(0.6+0.4*bk(t/.4)+t*0.01)+')';x.style.opacity=e(t/.2)});
document.querySelectorAll('[data-count]').forEach(x=>{const n=+x.dataset.count,d=+x.dataset.dec;x.textContent=x.dataset.pre+(n*e(t/.9)).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})+x.dataset.suf});
document.querySelectorAll('[data-w]').forEach(x=>x.style.width=(+x.dataset.w*e((t-.2)/.8))+'px');
const ln=document.getElementById('ln');if(ln){const p=e((t-.3)/2.2);ln.style.strokeDashoffset=1-p;const n=document.querySelectorAll('.pt').length;document.querySelectorAll('.pt').forEach(g=>{g.setAttribute('opacity',p>=(+g.dataset.i)/(n-1)-0.02?1:0)})}
document.querySelectorAll('.dots').forEach(g=>{const n=Math.round(+g.dataset.n*e((t-.4)/1.6));g.querySelectorAll('i').forEach((x,i)=>x.style.background=i<n?'#FF4D4D':'#2a3350')});}</script></body></html>`;
module.exports={};
(async()=>{const br=await chromium.launch();const pg=await br.newPage({viewport:{width:1920,height:1080}});const parts=[];let k=0;
 for(const sec of S.sections){const dur=+execFileSync("ffprobe",["-v","error","-show_entries","format=duration","-of","csv=p=0",sec.audio]).toString()+(sec.pad??0.8);
  const w=sec.cards.map(c=>c.w||1),tw=w.reduce((a,b)=>a+b);
  for(const [ci,c] of sec.cards.entries()){const d=dur*w[ci]/tw,dir=`g${k}`;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
   const h=html(c);
   await pg.setContent(h);await pg.waitForTimeout(120);const N=Math.round(d*FPS),ext=c.bg?"png":"jpg",AF=c.t==="chart"||c.t==="dots"?72:AN;
   const lst=[];const shot=async(t,j,du)=>{await pg.evaluate(x=>draw(x),t);const p=`${dir}/${String(j).padStart(4,"0")}.${ext}`;await pg.screenshot({path:p,type:c.bg?"png":"jpeg",omitBackground:!!c.bg,...(c.bg?{}:{quality:90})});lst.push(`file '${p}'\nduration ${du}`)};
   let j=0;for(;j<Math.min(N,AF);j++)await shot(j/FPS,j,1/FPS);let t=j/FPS;while(t<d-1e-3){const tt=Math.min(.5,d-t);await shot(t,j++,tt);t+=tt;}
   lst.push(lst[lst.length-1].split("\n")[0]);fs.writeFileSync(`${dir}.txt`,lst.join("\n"));const out=`d${k}.mp4`;
   if(c.bg){const ss=c.ss||0;execFileSync("ffmpeg",["-y","-loglevel","error","-stream_loop","-1","-ss",String(ss),"-i",BR+c.bg+".mp4","-f","concat","-safe","0","-i",`${dir}.txt`,"-filter_complex",
     `[0:v]scale=2112:1188,crop=1920:1080:'(in_w-1920)/2+t*8':'(in_h-1080)/2',fps=${FPS},eq=brightness=-0.12:saturation=${c.sat??0.9},drawbox=t=fill:c=black@${c.dim??0.35}[b];[1:v]fps=${FPS},format=rgba[o];[b][o]overlay=0:0:format=auto,format=yuv420p[v]`,
     "-map","[v]","-an","-c:v","libx264","-preset","veryfast","-crf","20","-t",String(d),out]);}
   else execFileSync("ffmpeg",["-y","-loglevel","error","-f","concat","-safe","0","-i",`${dir}.txt`,"-vf",`fps=${FPS},format=yuv420p`,"-c:v","libx264","-preset","veryfast","-crf","20","-t",String(d),out]);
   parts.push(out);k++;}}
 await br.close();fs.writeFileSync("parts2.txt",parts.map(p=>`file '${p}'`).join("\n"));
 execFileSync("ffmpeg",["-y","-loglevel","error","-f","concat","-safe","0","-i","parts2.txt","-c","copy","video2.mp4"]);console.log("video2 ok",parts.length);})();
