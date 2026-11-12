const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const NM = path.join(__dirname, "..", "node_modules/@fontsource"); const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(NM, p)).toString("base64");
const S = JSON.parse(fs.readFileSync(process.argv[2], "utf8")), out = process.argv[3];
const css = `@font-face{font-family:A;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:P;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:M;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;color:#fff;font-family:P;position:relative;
background:radial-gradient(900px 900px at 15% 10%,#2448D8aa,transparent 60%),radial-gradient(900px 900px at 90% 60%,#B03AFF88,transparent 60%),radial-gradient(800px 800px at 30% 100%,#FF7A3D77,transparent 60%),#060A18}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:60px 60px}
.k{position:absolute;top:110px;left:70px;font:500 28px M;letter-spacing:.22em;color:#8FB0FF;background:rgba(143,176,255,.12);padding:10px 18px;border-radius:40px}
.g{background:linear-gradient(90deg,#FFE27A,#FF9F4A);-webkit-background-clip:text;color:transparent}
.row{position:relative;display:flex;align-items:center;gap:22px;height:132px;margin-bottom:12px;padding:0 26px 0 104px;border-radius:26px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1)}
.dot{position:absolute;left:28px;top:50%;width:50px;height:50px;margin-top:-25px;border-radius:50%;background:#16203D;border:4px solid #FFD34D;display:grid;place-items:center;font-size:26px}
.tm{width:190px;flex:none;font:500 38px M;color:#FFD34D}.ln{font:900 46px/1.05 A}.sb{font:600 30px/1.2 P;color:#AEB9D3;margin-top:6px}`;
const s1 = `<div class=grid></div><div class=k>${S.kicker}</div><div style="position:absolute;top:560px;left:70px;right:70px">
<div style="font:600 64px P;color:#C9D3EA">This is what a</div><div class=g style="font:900 176px/0.95 A;letter-spacing:-5px;margin:10px 0 30px">Superday</div>
<div style="font:600 64px P;color:#C9D3EA">actually looks like</div><div style="margin-top:110px;font:900 64px A">Swipe for the full day <span style="color:#FFD34D">→</span></div></div>`;
const s2 = `<div class=grid></div><div class=k>${S.kicker}</div><div style="position:absolute;top:185px;left:70px;font:600 44px P;color:#C9D3EA">${S.hook[0]}</div>
<div class=g style="position:absolute;top:240px;left:70px;font:900 104px/1 A">${S.hook[1]}</div>
<div style="position:absolute;top:390px;left:70px;right:70px">${S.cards.map(c => `<div class=row><div class=dot>${c[3]}</div><div class=tm>${c[0]}</div><div><div class=ln>${c[1]}</div><div class=sb>${c[2]}</div></div></div>`).join("")}</div>
<div style="position:absolute;bottom:120px;left:0;right:0;text-align:center"><span style="display:inline-block;font:900 50px A;background:#fff;color:#060A18;padding:14px 34px;border-radius:60px">${S.final[1]}</span></div>`;
(async () => { const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [i, b] of [[1, s1], [2, s2]]) { await pg.setContent(`<html><head><style>${css}</style></head><body>${b}</body></html>`); await pg.waitForTimeout(200); await pg.screenshot({ path: `${out}-${i}.png` }); }
  await br.close(); console.log("ok"); })();
