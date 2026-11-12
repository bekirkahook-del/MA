// One-page typewriter list video (1080x1920): each line types in letter by letter and stays on screen. usage: node type.js spec.json OUT.mp4
// spec: same as story.js (kicker, hook:[small,big], cards:[[time,line,sub]], tease, final:[big,small], bpm, cps)
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const NM = path.join(__dirname, "..", "node_modules/@fontsource"); const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(NM, p)).toString("base64");
const [, , specP, out] = process.argv; const S = JSON.parse(fs.readFileSync(specP, "utf8")); const FPS = 30, B = 60 / (S.bpm || 86), CPS = S.cps || 16;
// timeline: title types, then each card (time + line + sub) types in, then tease, then final
const items = []; let t = 0.4; const clicks = [];
const typeIt = (key, txt, gap) => { const st = t; for (let i = 0; i < [...txt].length; i++) { if ([...txt][i] !== " ") clicks.push(st + i / CPS); } t += [...txt].length / CPS; items.push({ key, txt, st, en: t }); t += gap; };
typeIt("h0", S.hook[0], .15); typeIt("h1", S.hook[1], .9);
S.cards.forEach((c, i) => { typeIt("t" + i, c[0], .1); typeIt("l" + i, c[1], .1); typeIt("s" + i, c[2], 1.0); });
const ROLL = t; typeIt("tease", S.tease, .6); const FIN = t; typeIt("f0", S.final[0], .2); typeIt("f1", S.final[1], 2.6); const END = t;
const html = `<html><head><style>
@font-face{font-family:A;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:P;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:M;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;background:radial-gradient(1100px 900px at 50% 0%,#1B2A55,transparent 70%),#07101F;color:#fff;font-family:P}
.k{position:absolute;top:120px;left:80px;font:500 30px M;letter-spacing:.22em;color:#9FB4FF}
.h0{position:absolute;top:185px;left:80px;right:80px;font:600 46px P;color:#C9D3EA}.h1{position:absolute;top:245px;left:80px;font:900 96px A}
.list{position:absolute;top:390px;left:80px;right:80px}
.row{display:flex;gap:28px;margin-bottom:22px;min-height:104px}.tm{width:270px;flex:none;font:500 46px/1.15 M;color:#FFD34D}
.ln{font:900 50px/1.1 A}.sb{font:600 34px/1.25 P;color:#AEB9D3;margin-top:6px}
.bot{position:absolute;left:80px;right:80px;bottom:110px}.tz{font:600 46px P;color:#C9D3EA}.f0{font:900 72px/1.05 A;color:#FFD34D;margin-top:14px}.f1{font:900 58px A;margin-top:10px}
.cur{display:inline-block;width:.5em;height:.95em;background:#FFD34D;vertical-align:-0.12em;margin-left:4px}
</style></head><body><div class=k>${S.kicker}</div><div class=h0 id=h0></div><div class=h1 id=h1></div><div class=list>
${S.cards.map((_, i) => `<div class=row><div class=tm id=t${i}></div><div><div class=ln id=l${i}></div><div class=sb id=s${i}></div></div></div>`).join("")}
</div><div class=bot><div class=tz id=tease></div><div class=f0 id=f0></div><div class=f1 id=f1></div></div>
<script>const I=${JSON.stringify(items)},CPS=${CPS};
window.draw=t=>{let active=null;for(const it of I){const el=document.getElementById(it.key);const ch=[...it.txt];const k=t<it.st?0:Math.min(ch.length,Math.floor((t-it.st)*CPS)+1);
 el.textContent=ch.slice(0,k).join('');if(t>=it.st&&t<it.en+0.0001)active=el;}
 document.querySelectorAll('.cur').forEach(c=>c.remove());
 if(!active){let last=null;for(const it of I)if(t>=it.en)last=document.getElementById(it.key);active=last;}
 if(active&&Math.floor(t*2.5)%2===0){const c=document.createElement('span');c.className='cur';active.appendChild(c);}};</script></body></html>`;
(async () => {
  const dir = out + "_f"; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } }); await pg.setContent(html); await pg.waitForTimeout(300);
  for (let f = 0; f < Math.round(END * FPS); f++) { await pg.evaluate(t => draw(t), f / FPS); await pg.screenshot({ path: `${dir}/${String(f).padStart(4, "0")}.jpg`, type: "jpeg", quality: 88 }); }
  await br.close(); fs.writeFileSync(out + ".timing.json", JSON.stringify({ T: [FIN], ROLL, END, BEAT: B, clicks }));
  execFileSync("python3", [path.join(__dirname, "beat_trap.py"), out + ".timing.json", out + ".wav"]);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", `${dir}/%04d.jpg`, "-i", out + ".wav", "-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]);
  fs.rmSync(dir, { recursive: true, force: true }); console.log("ok", out, END.toFixed(1) + "s");
})();
