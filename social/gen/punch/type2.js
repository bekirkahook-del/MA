// Upbeat one-page timeline: rows pop into glass cards on a glowing timeline, title types fast, active row highlights, checkmarks on done rows.
// usage: node type2.js spec.json OUT.mp4   spec: {kicker, hook:[small,big], cards:[[time,line,sub,emoji]], tease, final:[big,small], bpm, cps}
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const NM = path.join(__dirname, "..", "node_modules/@fontsource"); const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(NM, p)).toString("base64");
const [, , specP, out] = process.argv; const S = JSON.parse(fs.readFileSync(specP, "utf8")); const FPS = 30, B = 60 / (S.bpm || 128), CPS = S.cps || 30;
const clicks = [], cuts = []; let t = .25; const ty = s => { const st = t; [...s].forEach((c, i) => c !== " " && clicks.push(st + i / CPS)); t += [...s].length / CPS; return st; };
const H0 = ty(S.hook[0]); t += .1; const H1 = ty(S.hook[1]); t = Math.ceil((t + .3) / B) * B;
const R = S.cards.map(c => { const st = t; cuts.push(st); const ls = st + .12; const save = t; t = ls; ty(c[1]); t = Math.max(save + 2 * B, t + .25); return { st, ls }; });
const ROLL = t; cuts.push(t); const TZ = ty(S.tease); t = Math.max(ROLL + 4 * B, t + .3); t = Math.ceil(t / B) * B; const FIN = t; t += 7 * B; const END = t;
const html = `<html><head><style>
@font-face{font-family:A;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:P;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:M;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;background:#060A18;color:#fff;font-family:P}
#bg{position:absolute;inset:-200px}.blob{position:absolute;width:900px;height:900px;border-radius:50%;filter:blur(120px);opacity:.55}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:60px 60px}
.k{position:absolute;top:110px;left:70px;font:500 28px M;letter-spacing:.22em;color:#8FB0FF;background:rgba(143,176,255,.12);padding:10px 18px;border-radius:40px}
.h0{position:absolute;top:185px;left:70px;right:70px;font:600 44px P;color:#C9D3EA}.h1{position:absolute;top:240px;left:70px;font:900 104px/1 A;background:linear-gradient(90deg,#FFE27A,#FF9F4A);-webkit-background-clip:text;color:transparent}
.tl{position:absolute;left:118px;top:400px;width:6px;border-radius:3px;background:linear-gradient(#FFD34D,#FF7A59)}
.list{position:absolute;top:390px;left:70px;right:70px}
.row{position:relative;display:flex;align-items:center;gap:22px;height:112px;margin-bottom:10px;padding:0 26px 0 104px;border-radius:24px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);transform-origin:left center}
.row.on{background:rgba(255,211,77,.14);border-color:rgba(255,211,77,.55);box-shadow:0 0 40px rgba(255,211,77,.18)}
.dot{position:absolute;left:28px;top:50%;width:50px;height:50px;margin-top:-25px;border-radius:50%;background:#16203D;border:4px solid #FFD34D;display:grid;place-items:center;font-size:26px}
.done .dot{background:#FFD34D;color:#060A18;font-weight:900}
.tm{width:190px;flex:none;font:500 38px M;color:#FFD34D}.ln{font:900 46px/1.05 A;white-space:nowrap}.sb{font:600 30px/1.2 P;color:#AEB9D3;margin-top:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:640px}
.bot{position:absolute;left:70px;right:70px;bottom:90px;text-align:center}.tz{font:700 46px P;color:#C9D3EA;height:60px}
.f0{font:900 74px/1 A;margin-top:14px;color:#FFD34D;white-space:nowrap}.f1{display:inline-block;font:900 50px A;margin-top:22px;background:#fff;color:#060A18;padding:14px 34px;border-radius:60px}
.cur{display:inline-block;width:.45em;height:.9em;background:#FFD34D;vertical-align:-0.1em;margin-left:4px}#fl{position:absolute;inset:0;background:#fff;opacity:0}
</style></head><body><div id=bg><div class=blob id=b1 style="background:#2448D8"></div><div class=blob id=b2 style="background:#B03AFF"></div><div class=blob id=b3 style="background:#FF7A3D"></div></div><div class=grid></div>
<div class=k>${S.kicker}</div><div class=h0 id=h0></div><div class=h1 id=h1></div><div class=tl id=tl></div>
<div class=list>${S.cards.map((c, i) => `<div class=row id=r${i}><div class=dot>${c[3] || ""}</div><div class=tm>${c[0]}</div><div><div class=ln id=l${i}></div><div class=sb id=s${i}>${c[2]}</div></div></div>`).join("")}</div>
<div class=bot><div class=tz id=tz></div><div class=f0 id=f0>${S.final[0]}</div><div><span class=f1 id=f1>${S.final[1]}</span></div></div><div id=fl></div>
<script>const S=${JSON.stringify(S)},R=${JSON.stringify(R)},H0=${H0},H1=${H1},TZ=${TZ},ROLL=${ROLL},FIN=${FIN},CPS=${CPS},B=${B};
const e=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3),bk=x=>{x=Math.min(1,Math.max(0,x));return 1+2.7*Math.pow(x-1,3)+1.7*Math.pow(x-1,2)};
const typ=(s,st,t)=>{const c=[...s];return c.slice(0,t<st?0:Math.min(c.length,Math.floor((t-st)*CPS)+1)).join('')};
window.draw=t=>{const g=id=>document.getElementById(id);
 [['b1',200,300,.13],['b2',600,900,.11],['b3',300,1500,.09]].forEach(([id,x,y,s],i)=>{g(id).style.transform='translate('+(x+Math.sin(t*s*6+i)*160)+'px,'+(y+Math.cos(t*s*5+i)*200)+'px)'});
 g('h0').textContent=typ(S.hook[0],H0,t);g('h1').textContent=typ(S.hook[1],H1,t);
 let act=-1;R.forEach((r,i)=>{const el=g('r'+i),p=t-r.st;if(t<r.st){el.style.opacity=0;return}
  el.style.opacity=e(p/.2);el.style.transform='translateX('+(1-bk(p/.35))*-140+'px) scale('+(t<ROLL&&(i===R.length-1||t<R[i+1].st)?1.02:1)+')';
  g('l'+i).textContent=typ(S.cards[i][1],r.ls,t);g('s'+i).style.opacity=e((p-.3)/.25);
  const on=t<ROLL&&(i===R.length-1||t<R[i+1].st);el.className='row'+(on?' on':' done');if(on)act=i;
  if(!on)el.querySelector('.dot').textContent='✓';});
 const lastSeen=R.filter(r=>t>=r.st).length;g('tl').style.height=lastSeen?Math.min(lastSeen*122-56,R.length*122-56)+'px':'0';
 g('tz').textContent=typ(S.tease,${TZ},t);
 const p=t-FIN;g('f0').style.opacity=p<0?0:1;g('f0').style.transform='scale('+(p<0?.5:.5+.5*bk(p/.35))+')';g('f1').style.opacity=e((p-.6)/.3);g('f1').style.transform='translateY('+(1-e((p-.6)/.3))*40+'px)';
 g('fl').style.opacity=p>=0?Math.max(0,.8-p/.3):0;
 document.querySelectorAll('.cur').forEach(c=>c.remove());let ce=null;if(act>=0&&t<R[act].ls+[...S.cards[act][1]].length/CPS+.4)ce=g('l'+act);else if(t<R[0].st)ce=t<H1?g('h0'):g('h1');else if(t>=ROLL&&t<FIN)ce=g('tz');
 if(ce&&Math.floor(t*3)%2===0){const c=document.createElement('span');c.className='cur';ce.appendChild(c)}
 document.querySelector('.list').style.transform='scale('+((t%B)<.06&&t<FIN?1.006:1)+')';};</script></body></html>`;
(async () => {
  const dir = out + "_f"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } }); await pg.setContent(html); await pg.waitForTimeout(300);
  for (let f = 0; f < Math.round(END * FPS); f++) { await pg.evaluate(t => draw(t), f / FPS); await pg.screenshot({ path: `${dir}/${String(f).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 }); }
  await br.close(); fs.writeFileSync(out + ".timing.json", JSON.stringify({ T: [FIN], ROLL, END, BEAT: B, clicks, cuts }));
  execFileSync("python3", [path.join(__dirname, "beat_up.py"), out + ".timing.json", out + ".wav"]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/%04d.jpg`, "-i", out + ".wav", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]);
  fs.rmSync(dir, { recursive: true, force: true }); console.log("ok", out, END.toFixed(1) + "s");
})();
