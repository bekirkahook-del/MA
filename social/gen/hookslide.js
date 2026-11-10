// Lead-up "swipe" slide shown BEFORE any chart/table (Bekir, 2026-11-10: skyscraper photo + green caption box + "—>").
// Usage: node hookslide.js OUT.jpg "CAPTION TEXT" [W H]   (default 1000x1500 for 2:3 pins; use 1080 1920 for TikTok)
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const [, , out, text, W = 1000, H = 1500] = process.argv;
const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(__dirname, "node_modules/@fontsource", p)).toString("base64");
const photo = "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "jpm.png")).toString("base64");
const fs1 = Math.round(+W * 0.085);
const html = `<html><head><style>@font-face{font-family:Plex;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden;position:relative}
.ph{position:absolute;inset:0;background:url(${photo}) center/cover}.sh{position:absolute;inset:0;background:rgba(4,10,24,.42)}
.box{position:absolute;left:5%;right:5%;top:52%;transform:translateY(-50%);text-align:center}
.box span{display:inline;background:#2E5A3A;color:#fff;font-family:Plex;font-weight:600;font-size:${fs1}px;line-height:1.32;padding:4px 24px;border-radius:20px;box-decoration-break:clone;-webkit-box-decoration-break:clone;text-transform:uppercase;letter-spacing:-1px}
.arr{display:inline-block;margin-top:24px;background:#2E5A3A;color:#fff;font-family:Plex;font-size:${Math.round(fs1 * .75)}px;padding:0 38px 8px;border-radius:18px}</style></head>
<body><div class="ph"></div><div class="sh"></div><div class="box"><span>${text}</span><br><div class="arr">—&gt;</div></div></body></html>`;
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +W, height: +H } }); await p.setContent(html); await p.waitForTimeout(150);
  await p.screenshot({ path: out, type: "jpeg", quality: 92 }); await b.close(); console.log(out); })();
