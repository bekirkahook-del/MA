// Animated ranking-countdown VIDEO (1080x1920 MP4 with generated beat + sound effects).
// Usage: node rankvid.js spec.json OUTDIR
// spec: {key, kicker, hook (HTML, <em>=gold), sub, rows:[[label, value, display, emoji?], ...] ordered #1 first (3-6 rows),
//        reveal: "short line shown with #1", ask: "comment prompt", source}
// Timeline: hook (2.6s) -> rows count down from last place to #2 -> drumroll -> #1 reveal -> hold -> end card.
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path"); const { execFileSync } = require("child_process");
const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(__dirname, "node_modules/@fontsource", p)).toString("base64");
const photo = "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "jpm.png")).toString("base64");
const [, , specPath, outDir] = process.argv; const S = JSON.parse(fs.readFileSync(specPath, "utf8"));
const FPS = 30, n = S.rows.length;
// timeline (seconds)
const T = { hookEnd: 2.6, step: 1.25 }; T.listStart = T.hookEnd; T.rollStart = T.listStart + (n - 1) * T.step + 0.3; T.reveal = T.rollStart + 1.3;
T.holdEnd = T.reveal + 3.2; T.end = T.holdEnd + 1.8; const DUR = T.end;
const css = `@font-face{font-family:Arc;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:Plex;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:Mono;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;background:#050B18;color:#fff;font-family:Plex;position:relative}
.sc{position:absolute;inset:0}.ph{position:absolute;inset:-80px;background:url(${photo}) center/cover}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,11,24,.9),rgba(5,11,24,.35) 45%,rgba(5,11,24,.95))}
.hook{position:absolute;left:70px;right:70px;top:430px}.k{font-family:Mono;font-size:34px;letter-spacing:6px;color:#E3C27A;margin-bottom:30px}
.hook h1{font-family:Arc;font-size:128px;line-height:.95;letter-spacing:-2px}.hook h1 em{font-style:normal;color:#E3C27A}
.w{display:inline-block}.sub{font-size:46px;margin-top:34px;color:#D6DEEE}
.stk{position:absolute;left:70px;top:1260px;background:#E3C27A;color:#07101F;font-family:Arc;font-size:56px;padding:18px 34px;border-radius:18px;transform-origin:left center}
.top{position:absolute;left:60px;right:60px;top:250px}.top .k{margin-bottom:16px}.top h2{font-family:Arc;font-size:70px;line-height:1}
.rows{position:absolute;left:60px;right:60px;top:450px;display:flex;flex-direction:column;gap:34px}
.r{display:flex;align-items:center;gap:26px;background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.08);border-radius:26px;padding:24px 28px;height:160px}
.r .n{font-family:Arc;font-size:72px;width:86px;color:#6E93FF;flex:none}.r .e{font-size:64px;flex:none;width:80px;text-align:center}
.r .b{flex:1;min-width:0}.r .l{font-size:40px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.r .bar{height:22px;border-radius:10px;background:#1B2843;margin-top:14px;overflow:hidden}
.r .bar i{display:block;height:100%;border-radius:10px;background:linear-gradient(90deg,#3B6CFF,#8FA9FF)}.r .v{font-family:Arc;font-size:60px;flex:none}
.r.one{background:linear-gradient(90deg,rgba(227,194,122,.28),rgba(227,194,122,.08));border-color:#E3C27A}.r.one .n,.r.one .v{color:#E3C27A}.r.one .bar i{background:linear-gradient(90deg,#C99A3E,#F3D99A)}
.roll{position:absolute;left:0;right:0;top:1520px;text-align:center;font-family:Arc;font-size:84px;color:#E3C27A}
.flash{position:absolute;inset:0;background:#FFF3D1;pointer-events:none}
.ask{position:absolute;left:60px;right:60px;top:1500px;font-family:Arc;font-size:58px;line-height:1.1;text-align:center}.ask em{font-style:normal;color:#E3C27A}
.src{position:absolute;left:60px;right:60px;top:1700px;font-size:26px;color:#7E8AA6;text-align:center}
.coin{position:absolute;font-size:70px}
.endc{position:absolute;inset:0;background:radial-gradient(80% 60% at 50% 40%,#13254F,#050B18);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;text-align:center}
.endc h2{font-family:Arc;font-size:84px;line-height:1.02;padding:0 70px}.endc h2 em{font-style:normal;color:#E3C27A}
.endc .url{background:#fff;color:#07101F;font-family:Mono;font-size:64px;padding:26px 48px;border-radius:24px}.endc p{font-size:40px;color:#C7D0E2}`;
const rowsHtml = S.rows.map((r, i) => `<div class="r${i === 0 ? " one" : ""}" id="r${i}"><div class="n">${i + 1}</div>${r[3] ? `<div class="e">${r[3]}</div>` : ""}<div class="b"><div class="l">${r[0]}</div><div class="bar"><i id="bar${i}"></i></div></div><div class="v" id="v${i}">${r[2]}</div></div>`).join("");
const words = S.hook.replace(/<em>(.*?)<\/em>/g, (m, g) => g.split(" ").map(x => `<em>${x}</em>`).join(" ")).split(" ");
const html = `<html><head><style>${css}</style></head><body>
<div class="sc" id="s1"><div class="ph" id="ph"></div><div class="shade"></div><div class="hook"><div class="k">${S.kicker}</div><h1>${words.map((w, i) => `<span class="w" id="w${i}">${w}</span>`).join(" ")}</h1><div class="sub" id="sub">${S.sub}</div></div><div class="stk" id="stk">Guess #1 before it drops 👇</div></div>
<div class="sc" id="s2"><div class="top"><div class="k">${S.kicker}</div><h2>${S.title || S.hook}</h2></div><div class="rows">${rowsHtml}</div>
<div class="roll" id="roll">🥁 And #1 is…</div><div class="ask" id="ask">${S.ask}</div><div class="src" id="src">Source: ${S.source}</div><div id="coins"></div><div class="flash" id="flash"></div></div>
<div class="sc endc" id="s3"><h2>${S.endHead || "Want to work on <em>Wall Street?</em>"}</h2><div class="url">mnaprep.com</div><p>Free interview prep · link in bio</p></div>
<script>
const S=${JSON.stringify(S)},T=${JSON.stringify(T)},n=S.rows.length,max=Math.max(...S.rows.map(r=>r[1]));
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),ease=x=>1-Math.pow(1-cl(x),3),back=x=>{x=cl(x);const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
const $=id=>document.getElementById(id);
const coins=[...Array(18)].map((_,i)=>{const d=document.createElement('div');d.className='coin';d.textContent=i%3?'💸':'💰';$('coins').appendChild(d);return {d,x:Math.random()*1000,v:500+Math.random()*700,r:Math.random()*360}});
function fmt(r,p){ // count-up keeping the display format
  const m=r[2].match(/^([^0-9]*)([0-9][0-9,]*\\.?[0-9]*)(.*)$/); if(!m) return r[2];
  const num=parseFloat(m[2].replace(/,/g,'')),dec=(m[2].split('.')[1]||'').length,cur=num*ease(p);
  let s=cur.toFixed(dec); if(m[2].includes(',')) s=Number(s).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
  return m[1]+s+m[3];}
window.render=t=>{
  $('s1').style.opacity=t<T.hookEnd?1:0; $('s2').style.opacity=(t>=T.hookEnd&&t<T.holdEnd)?1:0; $('s3').style.opacity=t>=T.holdEnd?1:0;
  $('ph').style.transform='scale('+(1+t*0.04)+')';
  document.querySelectorAll('.w').forEach((w,i)=>{const p=back((t-0.1-i*0.12)/0.35);w.style.opacity=cl((t-0.1-i*0.12)/0.15);w.style.transform='translateY('+(1-p)*60+'px) scale('+(0.7+0.3*p)+')'});
  $('sub').style.opacity=cl((t-1.2)/0.3); const sp=back((t-1.5)/0.4); $('stk').style.transform='scale('+(sp*(1+0.04*Math.sin(t*12)))+') rotate(-2deg)';
  for(let i=0;i<n;i++){ // rows: last place first, #1 at reveal
    const at=i===0?T.reveal:T.listStart+(n-1-i)*T.step, p=(t-at)/0.5, el=$('r'+i);
    el.style.opacity=cl(p*2); el.style.transform='translateX('+(1-ease(p))*-900+'px)'+(i===0?' scale('+(1+0.08*Math.max(0,1-cl((t-at)/0.6))*Math.sin((t-at)*30))+')':'');
    if(i===0&&t>=T.listStart&&t<T.reveal){el.style.opacity=0.45;el.style.transform='none';el.querySelector('.l').textContent='???';if(el.querySelector('.e'))el.querySelector('.e').textContent='❓';$('v0').textContent='?';$('bar0').style.width='0%';continue}
    if(i===0){el.querySelector('.l').textContent=S.rows[0][0];if(el.querySelector('.e'))el.querySelector('.e').textContent=S.rows[0][3]||'';}
    $('bar'+i).style.width=(S.rows[i][1]/max*100*ease((t-at-0.1)/0.9))+'%'; $('v'+i).textContent=fmt(S.rows[i],(t-at-0.1)/0.9);}
  const rp=(t-T.rollStart)/0.3; $('roll').style.opacity=(t>=T.rollStart&&t<T.reveal)?cl(rp):0; $('roll').style.transform='translateX('+Math.sin(t*50)*8+'px)';
  $('flash').style.opacity=t>=T.reveal?Math.max(0,0.8-(t-T.reveal)*2.5):0;
  $('ask').style.opacity=cl((t-T.reveal-0.9)/0.3); $('src').style.opacity=cl((t-T.reveal-0.9)/0.3);
  coins.forEach(c=>{const dt=t-T.reveal;c.d.style.opacity=(dt>0&&dt<2.2)?1:0;c.d.style.left=c.x+'px';c.d.style.top=(-120+dt*c.v)+'px';c.d.style.transform='rotate('+(c.r+dt*200)+'deg)'});
  const ep=back((t-T.holdEnd-0.1)/0.5); document.querySelector('.endc .url').style.transform='scale('+ep+')';
};
</script></body></html>`;
(async () => {
  fs.mkdirSync(outDir, { recursive: true }); const fr = path.join(outDir, "_frames"); fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.setContent(html, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  const N = Math.round(DUR * FPS);
  for (let i = 0; i < N; i++) { await pg.evaluate(t => window.render(t), i / FPS); await pg.screenshot({ path: path.join(fr, String(i).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 88 }); }
  // cover frame (full chart) for thumbnails
  await pg.evaluate(t => window.render(t), T.reveal + 1.5); await pg.screenshot({ path: path.join(outDir, S.key + "-cover.jpg"), type: "jpeg", quality: 90 });
  await b.close();
  const wav = path.join(outDir, "_a.wav");
  execFileSync("python3", [path.join(__dirname, "sfx.py"), wav, String(DUR), JSON.stringify({ hits: S.rows.map((_, i) => i === 0 ? null : T.listStart + (n - 1 - i) * T.step).filter(x => x !== null), roll: T.rollStart, reveal: T.reveal, end: T.holdEnd })]);
  const out = path.join(outDir, S.key + ".mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(fr, "%04d.jpg"), "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out]);
  fs.rmSync(fr, { recursive: true, force: true }); fs.rmSync(wav);
  console.log(out, DUR.toFixed(1) + "s");
})();
