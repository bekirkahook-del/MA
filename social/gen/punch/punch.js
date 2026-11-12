// Punchy full-screen ranking video, 1080x1920, no voice: beat-synced cuts, huge type, counting stats.
// usage: node punch.js spec.json OUT.mp4   spec: {kicker, hook:[line1, big, line3], rows:[[name, value(number), suffix, accent]] #1 first, reveal, ask, source}
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const NM = path.join(__dirname, "..", "node_modules/@fontsource");
const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(NM, p)).toString("base64");
const [, , specP, out] = process.argv; const S = JSON.parse(fs.readFileSync(specP, "utf8")); const FPS = 30;
const BEAT = 60 / (S.bpm || 124);
const TH = {glow:'',paper:'body{background:#F3EEE3;color:#14110F}.k{color:#B3261E}.h1,.h3{color:#3A332C}.big{color:#B3261E}.rank{color:rgba(20,17,15,.15)}.lbl{color:#6B6158}.dots i{background:rgba(20,17,15,.15)}.dots i.on{background:#14110F}.wm,.src{color:#8A7F73}.grain{opacity:.12;background-image:radial-gradient(#000 1px,transparent 1px)}',neon:'body{background:#000}.k{color:#39FF88}.big,.val{color:transparent;-webkit-text-stroke:6px #39FF88;text-shadow:0 0 40px #39FF8866}.name{color:#fff;text-shadow:0 0 30px #fff5}.rank{color:#39FF8833}.dots i.on{background:#39FF88}',terminal:'body{background:#0A0A0A;font-family:M}.k,.lbl,.wm{color:#FF9F1C}.name,.h1,.h3,.ask{font-family:M;font-weight:500;letter-spacing:0}.big,.val{color:#FF9F1C;font-family:M;letter-spacing:-6px}.rank{color:#FF9F1C44}.grain{background-image:repeating-linear-gradient(0deg,#fff1 0 2px,transparent 2px 6px);background-size:auto;opacity:.25}.dots i.on{background:#FF9F1C}'}[S.style||'glow']; // 124 bpm, cuts land on beats
const n = S.rows.length; const T = []; let t = 4 * BEAT; // hook = 4 beats
for (let i = n - 1; i >= 1; i--) { T[i] = t; t += (S.pace || 3) * BEAT; } // each of #n..#2 = 3 beats
const ROLL = t; t += Math.max(2, S.pace || 3) * BEAT; T[0] = t; t += 7 * BEAT; const END = t;
const html = `<html><head><style>
@font-face{font-family:A;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:P;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:M;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;background:#060B1A;color:#fff;font-family:P}
#bg{position:absolute;inset:0;transition:none}.grain{position:absolute;inset:0;opacity:.07;background-image:radial-gradient(#fff 1px,transparent 1px);background-size:6px 6px}
.k{position:absolute;top:150px;left:0;right:0;text-align:center;font:500 34px M;letter-spacing:.25em;color:#9FB4FF}
#stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 70px}
.h1{font:600 64px/1.15 P;color:#D7DEEF}.big{font:900 330px/0.9 A;letter-spacing:-12px;color:#FFD34D;margin:10px 0}.h3{font:600 64px/1.15 P;color:#D7DEEF}
.rank{font:900 200px/1 A;color:rgba(255,255,255,.18)}.name{font:900 104px/1.02 A;margin:10px 0 30px;letter-spacing:-2px}
.val{font:900 300px/0.9 A;letter-spacing:-10px}.lbl{font:500 34px M;letter-spacing:.2em;color:#B8C3DD;margin-top:16px}
.dots{position:absolute;bottom:260px;left:0;right:0;display:flex;gap:18px;justify-content:center}.dots i{width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.18)}.dots i.on{background:#fff}
.ask{font:900 92px/1.05 A}.src{position:absolute;bottom:90px;left:60px;right:60px;text-align:center;font:500 24px M;color:#7C89A8}
.wm{position:absolute;bottom:150px;left:0;right:0;text-align:center;font:700 34px P;color:rgba(255,255,255,.55)}
#flash{position:absolute;inset:0;background:#fff;opacity:0}${TH}
</style></head><body><div id=bg></div><div class=grain></div><div class=k>${S.kicker}</div><div id=stage></div><div class=dots id=dots></div>${S.wm===false?'':'<div class=wm>mnaprep.com</div>'}<div class=src>Source: ${S.source}</div><div id=flash></div>
<script>
const S=${JSON.stringify(S)},T=${JSON.stringify(T)},ROLL=${ROLL},END=${END},B=${BEAT};
const ease=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3), back=x=>{x=Math.min(1,Math.max(0,x));const c=1.7;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const fmt=(v,d)=>(S.pre||'')+v.toFixed(S.dec??d);
window.draw=t=>{const st=document.getElementById('stage'),bg=document.getElementById('bg'),fl=document.getElementById('flash'),dots=document.getElementById('dots');let h='',acc='#2448D8',fo=0;
 const n=S.rows.length;let cur=-1;for(let i=n-1;i>=0;i--)if(t>=T[i])cur=i;
 if(t<T[n-1]){const p=t/0.35;h='<div class=h1 style="opacity:'+ease(p)+'">'+S.hook[0]+'</div><div class=big style="transform:scale('+(0.4+0.6*back(p*0.8-0.1))+')">'+S.hook[1]+'</div><div class=h3 style="opacity:'+ease((t-0.6)/0.3)+'">'+S.hook[2]+'</div>';}
 else if(cur>0||(t>=ROLL&&t<T[0])){
  if(t>=ROLL&&t<T[0]){const p=(t-ROLL)/(T[0]-ROLL);const sh=Math.sin(t*90)*p*14;h='<div class=rank style="color:rgba(255,255,255,.5)">#1</div><div class=name style="transform:translateX('+sh+'px);font-size:150px">???</div><div class=lbl>GUESS BEFORE IT DROPS</div>';acc='#331111';}
  else{const r=S.rows[cur],p=(t-T[cur]);acc=r[3];const v=r[1]*ease(p/0.7);
   h='<div class=rank style="transform:translateY('+(1-ease(p/0.25))*-120+'px)">#'+(cur+1)+'</div><div class=name style="transform:translateX('+(1-ease(p/0.3))*900+'px)">'+r[0]+'</div><div class=val style="transform:scale('+(0.6+0.4*back(p/0.35))+')">'+fmt(v,1)+r[2]+'</div><div class=lbl>'+S.label+'</div>';}
  fo=0;}
 else if(cur===0){const r=S.rows[0],p=t-T[0];acc=r[3];fo=Math.max(0,1-p/0.25);
  h='<div class=rank style="color:#FFD34D;opacity:.9">#1</div><div class=name style="transform:scale('+(0.5+0.5*back(p/0.4))+');font-size:150px">'+r[0]+'</div><div class=val style="color:#FFD34D">'+fmt(r[1],1)+r[2]+'</div><div class=lbl style="opacity:'+ease((p-0.8)/0.3)+'">'+S.reveal+'</div>'+(p>1.9?'<div class=ask style="margin-top:70px;opacity:'+ease((p-1.9)/0.3)+';transform:translateY('+(1-ease((p-1.9)/0.3))*40+'px)">'+S.ask+'</div>':'');}
 st.innerHTML=h;fl.style.opacity=fo;
 const SM='${S.style||'glow'}';bg.style.background=SM==='glow'?'radial-gradient(1200px 1000px at 50% 40%,'+acc+'cc,transparent 70%),#060B1A':SM==='paper'?'linear-gradient(180deg,transparent 70%,'+acc+'33)':SM==='neon'?'radial-gradient(900px 700px at 50% 45%,'+acc+'55,transparent 70%)':'none';
 dots.innerHTML=S.rows.map((_,i)=>'<i class="'+(cur>=0&&i>=cur?'on':'')+'"></i>').reverse().join('');
 const z=1+((t%B)<0.08?0.012:0);st.style.transform='scale('+z+')';};
</script></body></html>`;
(async () => {
  const dir = out + "_frames"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.setContent(html); await pg.waitForTimeout(300);
  const N = Math.round(END * FPS);
  for (let f = 0; f < N; f++) { await pg.evaluate(t => draw(t), f / FPS); await pg.screenshot({ path: `${dir}/${String(f).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 }); }
  await br.close();
  fs.writeFileSync(out + ".timing.json", JSON.stringify({ T, ROLL, END, BEAT, n }));
  execFileSync("python3", [path.join(__dirname, "beat.py"), out + ".timing.json", out + ".wav"]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/%04d.jpg`, "-i", out + ".wav", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]);
  fs.rmSync(dir, { recursive: true, force: true }); console.log("ok", out, END.toFixed(1) + "s");
})();
