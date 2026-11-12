// Hour-by-hour story video (1080x1920), same look/beat engine as punch.js. usage: node story.js spec.json OUT.mp4
// spec: {kicker, hook:[small, big], cards:[[time, line, sub]], tease, final:[big, small], style, bpm, pace, wm}
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const NM = path.join(__dirname, "..", "node_modules/@fontsource"); const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(NM, p)).toString("base64");
const [, , specP, out] = process.argv; const S = JSON.parse(fs.readFileSync(specP, "utf8")); const FPS = 30, B = 60 / (S.bpm || 120);
const n = S.cards.length; const C = []; let t = 4 * B; for (let i = 0; i < n; i++) { C.push(t); t += (S.pace || 3) * B; }
const ROLL = t; t += 4 * B; const FIN = t; t += 8 * B; const END = t;
const html = `<html><head><style>
@font-face{font-family:A;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:P;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:M;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;background:#07101F;color:#fff;font-family:P}
#bg{position:absolute;inset:0}.k{position:absolute;top:150px;left:0;right:0;text-align:center;font:500 34px M;letter-spacing:.25em;color:#9FB4FF}
#st{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 80px}
.time{font:900 180px/0.9 A;letter-spacing:-6px;white-space:nowrap;color:#FFD34D}.line{font:900 92px/1.05 A;margin:40px 0 24px}.sub{font:600 50px/1.25 P;color:#C9D3EA}
.small{font:600 60px/1.2 P;color:#C9D3EA}.big{font:900 150px/0.95 A;margin-top:20px}
.bar{position:absolute;left:80px;right:80px;bottom:240px;height:10px;border-radius:5px;background:rgba(255,255,255,.15)}.bar i{display:block;height:100%;border-radius:5px;background:#FFD34D}
#fl{position:absolute;inset:0;background:#fff;opacity:0}</style></head><body><div id=bg></div><div class=k>${S.kicker}</div><div id=st></div><div class=bar><i id=pb></i></div><div id=fl></div>
<script>const S=${JSON.stringify(S)},C=${JSON.stringify(C)},ROLL=${ROLL},FIN=${FIN},END=${END},B=${B};
const e=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3),bk=x=>{x=Math.min(1,Math.max(0,x));return 1+2.7*Math.pow(x-1,3)+1.7*Math.pow(x-1,2)};
window.draw=t=>{let h='',hue=220,fo=0;const st=document.getElementById('st');
 if(t<C[0]){const p=t/.4;h='<div class=small style="opacity:'+e(p)+'">'+S.hook[0]+'</div><div class=big style="transform:scale('+(0.5+0.5*bk(p))+')">'+S.hook[1]+'</div>';}
 else if(t<ROLL){let i=0;while(i+1<C.length&&t>=C[i+1])i++;const c=S.cards[i],p=t-C[i];hue=220+i*14;
  h='<div class=time style="transform:translateY('+(1-e(p/.25))*-140+'px)">'+c[0]+'</div><div class=line style="transform:translateX('+(1-e(p/.3))*1000+'px)">'+c[1]+'</div><div class=sub style="opacity:'+e((p-.35)/.3)+'">'+c[2]+'</div>';}
 else if(t<FIN){const p=(t-ROLL)/(FIN-ROLL);h='<div class=line style="transform:translateX('+Math.sin(t*80)*p*12+'px)">'+S.tease+'</div>';hue=0;}
 else{const p=t-FIN;fo=Math.max(0,1-p/.25);h='<div class=big style="color:#FFD34D;transform:scale('+(0.5+0.5*bk(p/.4))+')">'+S.final[0]+'</div><div class=line style="opacity:'+e((p-.9)/.3)+'">'+S.final[1]+'</div>';hue=45;}
 st.innerHTML=h;document.getElementById('fl').style.opacity=fo;
 document.getElementById('bg').style.background='radial-gradient(1200px 1000px at 50% 40%,hsla('+hue+',70%,35%,.85),transparent 70%),#07101F';
 document.getElementById('pb').style.width=Math.min(100,t/END*100)+'%';st.style.transform='scale('+((t%B)<.08?1.012:1)+')';};</script></body></html>`;
(async () => {
  const dir = out + "_f"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } }); await pg.setContent(html); await pg.waitForTimeout(300);
  for (let f = 0; f < Math.round(END * FPS); f++) { await pg.evaluate(t => draw(t), f / FPS); await pg.screenshot({ path: `${dir}/${String(f).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 }); }
  await br.close(); fs.writeFileSync(out + ".timing.json", JSON.stringify({ T: [FIN, ...C], ROLL, END, BEAT: B }));
  execFileSync("python3", [path.join(__dirname, "beat.py"), out + ".timing.json", out + ".wav"]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/%04d.jpg`, "-i", out + ".wav", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]);
  fs.rmSync(dir, { recursive: true, force: true }); console.log("ok", out, END.toFixed(1) + "s");
})();
