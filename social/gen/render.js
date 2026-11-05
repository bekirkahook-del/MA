// Renders TikTok carousel slides (1080x1920 JPG) from a spec file. Usage: node render.js spec.json
// spec: {"date":"2026-11-08","decks":{"key":{"guide":"https://mnaprep.com/guides/...","ctaHead":"Practice DCFs <em>free</em>","ctaSub":"...","slides":["<html>",...]}}}
// Output: ../<date>/<key>-01.jpg ... (the last slide of each deck is an automatic QR call-to-action slide).
const { chromium } = require("playwright");
const QR = require("qrcode");
const fs = require("fs"), path = require("path");
const F = p => "file://" + path.join(__dirname, "node_modules/@fontsource", p);
const CSS = `
@font-face{font-family:Archivo;font-weight:800;src:url(${F("archivo/files/archivo-latin-800-normal.woff2")})}
@font-face{font-family:Archivo;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:Plex;font-weight:400;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2")})}
@font-face{font-family:Plex;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:Plex;font-weight:700;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff2")})}
@font-face{font-family:Mono;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;background:#0E1424;color:#F2F4F9;font-family:Plex,sans-serif;position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(900px 700px at 85% 8%,rgba(64,104,255,.35),transparent 60%),radial-gradient(800px 600px at 0% 100%,rgba(221,176,86,.16),transparent 60%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:60px 60px}
.top{position:absolute;top:70px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:center}
.logo{font-family:Archivo;font-weight:900;font-size:58px;letter-spacing:-1px}.logo span{color:#7C97FF;font-family:Plex;font-weight:700;padding:0 2px}
.count{font-family:Mono;font-size:30px;color:#9AA5BE;border:2px solid #2A3550;border-radius:99px;padding:8px 22px}
.main{position:absolute;top:200px;left:80px;right:150px;bottom:420px;display:flex;flex-direction:column;justify-content:center;gap:40px}
.kicker{font-family:Mono;font-size:32px;letter-spacing:4px;text-transform:uppercase;color:#DDB056}
h1{font-family:Archivo;font-weight:900;font-size:104px;line-height:.98;letter-spacing:-2px}
h1 em,h2 em{font-style:normal;color:#7C97FF}
h2{font-family:Archivo;font-weight:800;font-size:76px;line-height:1.02;letter-spacing:-1px}
p.lede{font-size:44px;line-height:1.4;color:#C3CBDD}
.foot{position:absolute;bottom:80px;left:80px;right:80px;display:flex;justify-content:space-between;align-items:center}
.url{font-family:Mono;font-size:30px;background:#F2F4F9;color:#0E1424;border-radius:99px;padding:16px 30px;font-weight:500}
.swipe{font-size:32px;color:#9AA5BE}
.chips{display:flex;flex-wrap:wrap;gap:18px}.chip{font-size:36px;font-weight:600;border:2px solid #34405E;border-radius:99px;padding:12px 28px;background:rgba(255,255,255,.04)}
.phone{align-self:center;width:560px;border-radius:56px;border:14px solid #1D2640;box-shadow:0 40px 120px rgba(0,0,0,.55),0 0 0 2px #2A3550;overflow:hidden;background:#fff}
.phone img{display:block;width:100%}
.list{display:flex;flex-direction:column;gap:26px}.li{display:flex;gap:28px;align-items:flex-start;font-size:46px;line-height:1.3;font-weight:600}
.li b{flex:none;width:64px;height:64px;border-radius:50%;background:#2448D8;display:grid;place-items:center;font-size:34px;color:#fff;margin-top:2px}
.card{background:#161E33;border:2px solid #2A3550;border-radius:36px;padding:44px 48px}
.opt{display:flex;gap:28px;align-items:center;font-size:52px;font-weight:600;padding:30px 36px;border:3px solid #2A3550;border-radius:28px;background:#161E33}
.opt i{font-family:Mono;font-style:normal;font-size:36px;color:#9AA5BE;width:40px}
.opt.ok{border-color:#4FC48A;background:rgba(79,196,138,.14)}.opt.ok i{color:#4FC48A}
.opts{display:flex;flex-direction:column;gap:22px}
table{width:100%;border-collapse:separate;border-spacing:0;font-variant-numeric:tabular-nums;background:#161E33;border:2px solid #2A3550;border-radius:30px;overflow:hidden}
th,td{font-size:44px;padding:24px 10px;text-align:center;border-bottom:2px solid #232D48}th{font-family:Mono;font-size:30px;color:#9AA5BE;font-weight:500;background:#121A2E}
td:first-child{font-weight:700;color:#DDB056}tr:last-child td{border-bottom:0}td.hot{color:#4FC48A;font-weight:700}
.step{display:flex;gap:30px;align-items:center}.step .n{font-family:Archivo;font-weight:900;font-size:58px;color:#7C97FF;width:150px;flex:none}.step .t{font-size:46px;line-height:1.3}.step .t small{display:block;font-size:34px;color:#9AA5BE}
.big{font-family:Archivo;font-weight:900;font-size:220px;line-height:1;color:#4FC48A}
.tl{display:flex;flex-direction:column;gap:0;border-left:6px solid #2448D8;margin-left:20px}
.tl div{position:relative;padding:0 0 46px 60px}.tl div::before{content:"";position:absolute;left:-23px;top:10px;width:40px;height:40px;border-radius:50%;background:#0E1424;border:6px solid #7C97FF}
.tl b{display:block;font-family:Archivo;font-weight:800;font-size:56px}.tl span{font-size:38px;color:#C3CBDD;line-height:1.35}
.qr{align-self:center;background:#fff;border-radius:40px;padding:34px;display:flex;flex-direction:column;align-items:center;gap:16px}
.qr img{width:420px;height:420px}.qr span{color:#0E1424;font-family:Mono;font-size:30px}
.note{font-size:30px;color:#7F8AA6}
.wide .step .n{width:var(--nw,290px);white-space:nowrap;font-size:52px}.wide .step{gap:24px}
`;
const wrap = (inner, i, n) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="bg"></div><div class="grid"></div>
<div class="top"><div class="logo">M<span>&amp;</span>A</div><div class="url">mnaprep.com</div><div class="count">${i}/${n}</div></div>
<div class="main">${inner}</div></body></html>`;
(async () => {
  const spec = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
  const out = path.join(__dirname, "..", spec.date); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  let bad = 0; const made = [];
  for (const [key, d] of Object.entries(spec.decks)) {
    if (!/^[a-z0-9-]{2,24}$/.test(key)) throw new Error("bad deck key " + key);
    const qr = await QR.toDataURL(`${d.guide || "https://mnaprep.com/"}?utm_source=tiktok&utm_campaign=${key}`, { margin: 1, width: 920, color: { dark: "#0E1424", light: "#FFFFFF" }, errorCorrectionLevel: "M" });
    const slides = [...d.slides, `<div class="kicker">Free · no card needed</div><h2>${d.ctaHead || "Practice free at <em>mnaprep.com</em>"}</h2><p class="lede">${d.ctaSub || "1,000+ interview questions, guides and drills."}</p><div class="qr"><img src="${qr}"><span>Scan or tap the link in bio</span></div>`];
    for (let i = 0; i < slides.length; i++) {
      const f = path.join(__dirname, "_tmp.html"); fs.writeFileSync(f, wrap(slides[i], i + 1, slides.length));
      await pg.goto("file://" + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(120);
      const over = await pg.evaluate(() => { const m = document.querySelector(".main"); return Math.max(0, m.scrollHeight - m.clientHeight - 2); });
      const name = `${key}-${String(i + 1).padStart(2, "0")}.jpg`;
      await pg.screenshot({ path: path.join(out, name), type: "jpeg", quality: 88 });
      if (over) bad++; made.push(name + (over ? `  OVERFLOW ${over}px (text runs into TikTok's button area: shorten it)` : ""));
    }
  }
  fs.rmSync(path.join(__dirname, "_tmp.html"), { force: true });
  await b.close(); console.log(made.join("\n")); if (bad) { console.error(bad + " slide(s) overflow"); process.exit(2); }
})();
