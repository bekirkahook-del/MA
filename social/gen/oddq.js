// "Unexpected interview question" posts (meme style): slide 1 = question + reaction emoji,
// slide 2 = answer with the quick mental math, slide 3 = M&A Prep QR call to action.
// Usage: node oddq.js <spec.json> <outDir>
// spec = [{key, label?, question, emoji?, answer, steps:[...], tip?}]  (question/answer may use <b>/<em>)
const { chromium } = require("playwright");const QR=require("qrcode");const fs=require("fs"),path=require("path");
const F=p=>"file://"+path.join(__dirname,"node_modules/@fontsource",p);
const CSS=`@font-face{font-family:Archivo;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:Plex;font-weight:400;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2")})}
@font-face{font-family:Plex;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:Mono;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{box-sizing:border-box;margin:0}body{width:1080px;height:1920px;overflow:hidden;font-family:Plex,sans-serif;position:relative}
.w{background:#F7F5F0;color:#0B1630}.d{background:#07101F;color:#fff}
.top{position:absolute;top:150px;left:0;right:0;text-align:center}
.lab{font-family:Mono;font-size:30px;letter-spacing:7px;color:#5E6C88}
.big{font-family:Archivo;font-weight:900;font-size:92px;letter-spacing:-1px;margin-top:22px;color:#0B1630}
.red{font-family:Archivo;font-weight:900;font-size:48px;color:#D33A3A;margin-top:18px}
.q{position:absolute;top:560px;left:110px;right:110px;border-left:10px solid #0B1630;padding:10px 0 10px 44px}
.q .qm{font-family:Archivo;font-weight:900;font-size:120px;line-height:.6;color:#0B1630;display:block;margin-bottom:18px}
.q p{font-size:76px;line-height:1.12;font-weight:600}.q b{color:#D33A3A}
.emo{position:absolute;top:1060px;left:0;right:0;text-align:center;font-size:330px;line-height:1;font-family:"Noto Color Emoji"}
.hint{position:absolute;bottom:250px;left:0;right:0;text-align:center;font-family:Mono;font-size:32px;color:#5E6C88}
.a{position:absolute;top:150px;left:100px;right:100px}
.k{font-family:Mono;font-size:30px;letter-spacing:6px;color:#E3C27A}
.ans{font-family:Archivo;font-weight:900;font-size:150px;line-height:1;margin:26px 0 40px;color:#E3C27A}
.qq{font-size:40px;color:#C7D0E2;margin-bottom:44px;line-height:1.3}
.st{display:flex;flex-direction:column;gap:26px}
.s{display:grid;grid-template-columns:70px 1fr;gap:20px;align-items:start;background:#111D36;border-radius:20px;padding:26px 30px}
.s i{font-style:normal;font-family:Archivo;font-weight:900;font-size:44px;color:#3B6CFF}.s span{font-size:40px;line-height:1.3}
.tip{margin-top:40px;font-size:36px;line-height:1.35;color:#DCE3F0;background:rgba(227,194,122,.12);border:1px solid rgba(227,194,122,.4);border-radius:20px;padding:26px 30px}
.c{position:absolute;top:0;bottom:0;left:100px;right:100px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:34px}
.c h2{font-family:Archivo;font-weight:900;font-size:90px;line-height:1.02}.c h2 em{font-style:normal;color:#E3C27A}
.cap{font-size:38px;line-height:1.4;color:#C7D0E2}
.qrbig{background:#fff;border-radius:32px;padding:40px 52px;display:flex;flex-direction:column;align-items:center;gap:12px}.qrbig b{color:#07101F;font-family:Mono;font-size:72px;font-weight:500}.qrbig span{color:#07101F;font-family:Mono;font-size:26px}
.url2{font-family:Mono;font-size:42px;background:#E3C27A;color:#07101F;border-radius:99px;padding:14px 36px;font-weight:500}`;
const page=(cls,b)=>`<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body class="${cls}">${b}</body></html>`;
(async()=>{
  const [spec,out]=process.argv.slice(2);const posts=JSON.parse(fs.readFileSync(spec,"utf8"));fs.mkdirSync(out,{recursive:true});
  const br=await chromium.launch();const pg=await br.newPage({viewport:{width:1080,height:1920}});let bad=0;
  for(const p of posts){
    const qr=await QR.toDataURL(`https://mnaprep.com/?utm_source=tiktok&utm_campaign=${p.key}`,{margin:1,width:600});
    const s1=page("w",`<div class="top"><div class="lab">${p.label||"IB SUPERDAY"}</div><div class="big">Real interview</div><div class="red">UNEXPECTED Interview Question</div></div>
      <div class="q"><span class="qm">“</span><p>${p.question}</p></div><div class="emo">${p.emoji||"😳"}</div><div class="hint">No calculator. 10 seconds. Comment your answer 👇</div>`);
    const s2=page("d",`<div class="a"><div class="k">THE ANSWER</div><div class="ans">${p.answer}</div><div class="qq">${p.question.replace(/<[^>]+>/g,"")}</div>
      <div class="st">${p.steps.map((s,i)=>`<div class="s"><i>${i+1}</i><span>${s}</span></div>`).join("")}</div>${p.tip?`<div class="tip">💡 ${p.tip}</div>`:""}</div>`);
    const s3=page("d",`<div class="c"><div class="k">WANT TO BE READY?</div><h2>${["Practice the weird ones <em>for free.</em>","Ready for curveballs? <em>Train free.</em>","Don't freeze on the hard ones. <em>Practice free.</em>"][[...p.key].reduce((a,c)=>a+c.charCodeAt(0),0)%3]}</h2><p class="cap">Mental math, brainteasers and 1,000+ real IB and PE interview questions.</p><div class="qrbig"><b>mnaprep.com</b><span>🔗 Tap the link in bio</span></div></div>`);
    for(const [i,h] of [[1,s1],[2,s2],[3,s3]]){const f=path.join(out,`${p.key}-tmp.html`);fs.writeFileSync(f,h);await pg.goto("file://"+path.resolve(f));await pg.evaluate(()=>document.fonts.ready);
      const of=await pg.evaluate(()=>document.documentElement.scrollHeight>1920||[...document.querySelectorAll(".a,.q")].some(e=>e.getBoundingClientRect().bottom>1700));
      if(of){bad=1;console.log("OVERFLOW",p.key,i)}
      await pg.screenshot({path:path.join(out,`${p.key}-0${i}.jpg`),type:"jpeg",quality:90});fs.unlinkSync(f)}
    console.log(p.key," ok")}
  await br.close();process.exit(bad?2:0)})();
