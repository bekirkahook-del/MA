// Brain-teaser / quiz VIDEO with a ticking countdown (1080x1920 MP4, synthesized audio).
// Usage: node teaservid.js spec.json OUTDIR
// spec: {key, label:"IB SUPERDAY", question (HTML, <b>=red), emoji, seconds:5,
//        options?:["A text","B text","C text","D text"], correct?:1,   // omit options for open questions
//        answer:"604,800", steps:["...","...","..."], ask:"Did you get it? 👇"}
// Timeline: question pops (1.6s) -> countdown ring with ticks -> "TIME'S UP" -> answer slam -> steps one by one -> end card.
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path"); const { execFileSync } = require("child_process");
const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(__dirname, "node_modules/@fontsource", p)).toString("base64");
const [, , specPath, outDir] = process.argv; const S = JSON.parse(fs.readFileSync(specPath, "utf8"));
const FPS = 30, SEC = S.seconds || 5, steps = S.steps || [];
const VO = require("./vo.js"); fs.mkdirSync(outDir, { recursive: true }); const voDir = path.join(outDir, "_vo_" + S.key);
// Voiceover script (override with spec.vo = {question, up, answer, steps:[...], ask})
const vo = S.vo || {};
const VL = [vo.question || (S.question + (S.options ? " Is it A, B, C, or D?" : "")), vo.up || "Time's up!", vo.answer || `The answer is ${S.answer}.`,
  ...steps.map((st, i) => (vo.steps && vo.steps[i]) || st), vo.ask || S.ask || "Did you get it?"];
const D = VO.synth(voDir, VL), ns = steps.length;
const T = { qIn: 0.1, stepAt: [] }; T.timer = Math.max(1.6, D[0] + 0.4); T.up = T.timer + SEC; T.ans = T.up + Math.max(0.7, D[1] + 0.15);
let c = T.ans + D[2] + 0.35; for (let i = 0; i < ns; i++) { T.stepAt[i] = c; c += Math.max(1.1, D[3 + i] + 0.3); }
T.askAt = c; T.hold = T.askAt + D[3 + ns] + 1.3; T.end = T.hold; T.steps = T.stepAt[0] || c;
const VOEV = [[0.2, 0], [T.up + 0.05, 1], [T.ans + 0.1, 2], ...T.stepAt.map((t, i) => [t + 0.05, 3 + i]), [T.askAt + 0.05, 3 + ns]]
  .map(([t, i]) => [t, path.join(voDir, "vo_" + String(i).padStart(2, "0") + ".wav")]);
const css = `@font-face{font-family:Arc;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:Plex;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:Mono;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;font-family:Plex;position:relative;background:#F6F1E7;color:#0B1630}
.sc{position:absolute;inset:0}
.lab{position:absolute;top:210px;left:0;right:0;text-align:center;font-family:Mono;font-size:34px;letter-spacing:8px;color:#6C6253}
.tag{position:absolute;top:270px;left:0;right:0;text-align:center;font-family:Arc;font-size:66px;color:#D33A3A}
.q{position:absolute;top:420px;left:80px;right:80px;font-size:82px;line-height:1.1;font-weight:600;border-left:12px solid #0B1630;padding-left:40px}.q b{color:#D33A3A}
.emo{position:absolute;top:1000px;left:0;right:0;text-align:center;font-size:300px;line-height:1}
.opts{position:absolute;top:840px;left:80px;right:80px;display:flex;flex-direction:column;gap:20px}
.o{display:flex;gap:28px;align-items:center;background:#fff;border:4px solid #0B1630;border-radius:26px;padding:20px 28px;font-size:46px;font-weight:600}
.o i{font-style:normal;font-family:Arc;width:76px;height:76px;border-radius:50%;background:#0B1630;color:#fff;display:grid;place-items:center;font-size:42px;flex:none}
.o.ok{background:#2FB574;border-color:#2FB574;color:#fff}.o.ok i{background:#fff;color:#2FB574}.o.no{opacity:.3}
.tm{position:absolute;left:50%;top:1490px;width:300px;height:300px;margin-left:-150px}.tm svg{position:absolute;inset:0}.tm b{position:absolute;inset:0;display:grid;place-items:center;font-family:Arc;font-size:150px}
.up{position:absolute;left:0;right:0;top:1580px;text-align:center;font-family:Arc;font-size:120px;color:#D33A3A}
.ans{background:#07101F;color:#fff}.ans .k{position:absolute;top:240px;left:80px;font-family:Mono;font-size:34px;letter-spacing:7px;color:#E3C27A}
.ans .big{position:absolute;top:300px;left:70px;right:70px;font-family:Arc;font-size:190px;line-height:1;color:#E3C27A}
.ans .qq{position:absolute;top:560px;left:80px;right:80px;font-size:42px;color:#C7D0E2}
.st{position:absolute;left:80px;right:80px;top:720px;display:flex;flex-direction:column;gap:26px}
.s{display:flex;gap:26px;background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.1);border-radius:24px;padding:30px}.s i{font-style:normal;font-family:Arc;font-size:54px;color:#6E93FF}.s span{font-size:44px;line-height:1.3}.s b{color:#E3C27A}
.ask{position:absolute;left:80px;right:80px;top:1480px;font-family:Arc;font-size:70px;text-align:center}
.flash{position:absolute;inset:0;background:#fff}
.endc{background:radial-gradient(80% 60% at 50% 40%,#13254F,#050B18);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;text-align:center}
.endc h2{font-family:Arc;font-size:84px;line-height:1.02;padding:0 70px}.endc h2 em{font-style:normal;color:#E3C27A}.endc .url{background:#fff;color:#07101F;font-family:Mono;font-size:64px;padding:26px 48px;border-radius:24px}.endc p{font-size:40px;color:#C7D0E2}`;
const L = "ABCD";
const html = `<html><head><style>${css}</style></head><body>
<div class="sc" id="s1"><div class="lab">${S.label || "IB SUPERDAY"}</div><div class="tag" id="tag">UNEXPECTED QUESTION</div><div class="q" id="q">${S.question}</div>
${S.options ? `<div class="opts">${S.options.map((o, i) => `<div class="o" id="o${i}"><i>${L[i]}</i>${o}</div>`).join("")}</div>` : `<div class="emo" id="emo">${S.emoji || "🤔"}</div>`}
<div class="tm" id="tm"${S.options ? ' style="top:1500px;width:240px;height:240px;margin-left:-120px"' : ""}><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="130" fill="#fff" stroke="#E4DCCB" stroke-width="22"/><circle id="ring" cx="150" cy="150" r="130" fill="none" stroke="#D33A3A" stroke-width="22" stroke-linecap="round" transform="rotate(-90 150 150)" stroke-dasharray="816.8" stroke-dashoffset="0"/></svg><b id="num">${SEC}</b></div>
<div class="up" id="up">TIME'S UP ⏰</div></div>
<div class="sc ans" id="s2"><div class="k">THE ANSWER</div><div class="big" id="big" style="font-size:${S.answer.length > 14 ? 96 : S.answer.length > 7 ? 130 : 190}px">${S.answer}</div><div class="qq">${S.question.replace(/<[^>]+>/g, "")}</div>
<div class="st">${steps.map((s, i) => `<div class="s" id="st${i}"><i>${i + 1}</i><span>${s}</span></div>`).join("")}</div><div class="ask" id="ask">${S.ask || "Did you get it? 👇"}</div><div class="flash" id="fl"></div></div>
<div class="sc endc" id="s3" style="display:none"><div class="url" id="url"></div></div>
<script>
const S=${JSON.stringify(S)},T=${JSON.stringify(T)},SEC=${SEC};const $=id=>document.getElementById(id);
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),ease=x=>1-Math.pow(1-cl(x),3),back=x=>{x=cl(x);const c=1.9;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2)};
window.render=t=>{
 $('s1').style.opacity=t<T.ans?1:0;$('s2').style.opacity=(t>=T.ans&&t<T.hold)?1:0;$('s3').style.opacity=t>=T.hold?1:0;
 const qp=back((t-T.qIn)/0.45);$('q').style.transform='translateX('+(1-qp)*-200+'px)';$('q').style.opacity=cl((t-T.qIn)/0.2);
 $('tag').style.transform='scale('+back((t-0.3)/0.4)+') rotate('+Math.sin(t*9)*2+'deg)';
 if($('emo')){$('emo').style.transform='scale('+back((t-0.8)/0.5)*(1+0.05*Math.sin(t*6))+') rotate('+Math.sin(t*3)*8+'deg)'}
 if(S.options){S.options.forEach((o,i)=>{const p=back((t-0.6-i*0.12)/0.4);const e=$('o'+i);e.style.transform='scale('+p+')';
   e.className='o'+(t>=T.up+0.15?(i===S.correct?' ok':' no'):'')})}
 const tp=cl((t-T.timer)/SEC),left=Math.max(0,Math.ceil(SEC-(t-T.timer)));$('tm').style.opacity=(t>=T.timer-0.3&&t<T.up)?1:0;
 $('ring').setAttribute('stroke-dashoffset',816.8*tp);$('num').textContent=t<T.timer?SEC:left;
 $('tm').style.transform='scale('+(1+0.08*Math.max(0,1-((t-T.timer)%1)*4))+')';
 $('up').style.opacity=(t>=T.up&&t<T.ans)?1:0;$('up').style.transform='scale('+back((t-T.up)/0.3)+') rotate(-4deg)';
 const bp=back((t-T.ans)/0.4);$('big').style.transform='scale('+(0.4+0.6*bp)+')';$('big').style.transformOrigin='left center';
 $('fl').style.opacity=t>=T.ans?Math.max(0,0.7-(t-T.ans)*2.5):0;
 S.steps.forEach((s,i)=>{const p=ease((t-T.stepAt[i])/0.4),e=$('st'+i);e.style.opacity=p;e.style.transform='translateY('+(1-p)*80+'px)'});
 $('ask').style.opacity=cl((t-T.askAt)/0.3);$('ask').style.transform='scale('+back((t-T.askAt)/0.4)+')';
 $('url').style.transform='scale('+back((t-T.hold-0.1)/0.5)+')';
};
</script></body></html>`;
(async () => {
  fs.mkdirSync(outDir, { recursive: true }); const fr = path.join(outDir, "_frames_" + S.key); fs.rmSync(fr, { recursive: true, force: true }); fs.mkdirSync(fr);
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await pg.setContent(html, { waitUntil: "networkidle" }); await pg.evaluate(() => document.fonts.ready);
  const N = Math.round(T.end * FPS);
  for (let i = 0; i < N; i++) { await pg.evaluate(t => window.render(t), i / FPS); await pg.screenshot({ path: path.join(fr, String(i).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 88 }); }
  await pg.evaluate(t => window.render(t), T.timer + 0.5); await pg.screenshot({ path: path.join(outDir, S.key + "-cover.jpg"), type: "jpeg", quality: 90 });
  await pg.evaluate(t => window.render(t), T.hold - 0.2); await pg.screenshot({ path: path.join(outDir, S.key + "-answer.jpg"), type: "jpeg", quality: 90 });
  await b.close();
  const wav = path.join(outDir, "_a_" + S.key + ".wav"); const ticks = []; for (let s = 0; s < SEC; s++) ticks.push(T.timer + s);
  execFileSync("python3", [path.join(__dirname, "sfx.py"), wav, String(T.end), JSON.stringify({ ticks, roll: T.timer, reveal: T.ans, end: T.hold, hits: T.stepAt })]);
  const wav2 = path.join(outDir, "_m_" + S.key + ".wav"); VO.mix(wav, wav2, VOEV); fs.renameSync(wav2, wav); fs.rmSync(voDir, { recursive: true, force: true });
  const out = path.join(outDir, S.key + ".mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(fr, "%04d.jpg"), "-i", wav, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", out]);
  fs.rmSync(fr, { recursive: true, force: true }); fs.rmSync(wav);
  console.log(out, T.end.toFixed(1) + "s");
})();
