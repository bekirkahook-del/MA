// "Finance vibes" aesthetic cards (no site promo needed). Usage: node aesthetic.js spec.json OUTDIR [--story]
// spec: [{key, style: "navy"|"cream"|"marble"|"skyline"|"chart", kicker?, line (HTML, <em> = accent), sub?}]
// Default size 1000x1500 (Pinterest 2:3). --story renders 1080x1920 for Instagram stories.
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(__dirname, "node_modules/@fontsource", p)).toString("base64");
const photo = "data:image/png;base64," + fs.readFileSync(path.join(__dirname, "jpm.png")).toString("base64");
const [, , specPath, outDir, flag] = process.argv; const story = flag === "--story";
const W = story ? 1080 : 1000, H = story ? 1920 : 1500;
const css = `@font-face{font-family:PF;font-weight:400;src:url(${F("playfair-display/files/playfair-display-latin-400-normal.woff2")})}
@font-face{font-family:PF;font-weight:400;font-style:italic;src:url(${F("playfair-display/files/playfair-display-latin-400-italic.woff2")})}
@font-face{font-family:PF;font-weight:700;src:url(${F("playfair-display/files/playfair-display-latin-700-normal.woff2")})}
@font-face{font-family:Mono;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
@font-face{font-family:Plex;font-weight:400;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:${W}px;height:${H}px;overflow:hidden;position:relative;font-family:PF}
.bg{position:absolute;inset:0}.grain{position:absolute;inset:0;opacity:.09;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")}
.wrap{position:absolute;left:90px;right:90px;top:50%;transform:translateY(-50%)}
.k{font-family:Mono;font-size:28px;letter-spacing:7px;text-transform:uppercase;margin-bottom:44px}
.l{font-size:${story ? 112 : 100}px;line-height:1.08;font-weight:400}.l em{font-style:italic}
.s{font-family:Plex;font-size:38px;line-height:1.45;margin-top:40px;max-width:760px}
.rule{width:90px;height:2px;margin:46px 0 0}
.foot{position:absolute;bottom:${story ? 300 : 70}px;left:90px;font-family:Mono;font-size:22px;letter-spacing:6px;opacity:.7}
/* styles */
.navy .bg{background:radial-gradient(120% 80% at 80% 0%,#1b2b55 0%,#0a1226 55%,#050912 100%)}.navy{color:#F3EBDD}.navy em,.navy .k{color:#D9B66A}.navy .rule{background:#D9B66A}
.cream .bg{background:radial-gradient(100% 70% at 20% 10%,#FBF6EC 0%,#EFE5D2 70%,#E4D6BC 100%)}.cream{color:#1E2333}.cream em{color:#8A6A2B}.cream .k{color:#8A6A2B}.cream .rule{background:#1E2333}
.marble .bg{background:#F4F1EC}.marble .bg::after{content:"";position:absolute;inset:-20%;background:repeating-linear-gradient(115deg,transparent 0 60px,rgba(120,110,95,.06) 60px 62px,transparent 62px 140px),radial-gradient(60% 40% at 70% 70%,rgba(160,140,110,.18),transparent);filter:blur(1.5px)}
.marble{color:#14161D}.marble em{color:#9B7A3C}.marble .k{color:#6C6253}.marble .rule{background:#9B7A3C}
.skyline .bg{background:url(${photo}) center 35%/cover;filter:grayscale(.35) brightness(.55) contrast(1.05)}.skyline .bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,9,18,.15),rgba(5,9,18,.85))}
.skyline{color:#fff}.skyline em,.skyline .k{color:#E3C27A}.skyline .rule{background:#E3C27A}.skyline .wrap{top:auto;bottom:${story ? 420 : 170}px;transform:none}
.chart .bg{background:linear-gradient(160deg,#07140F 0%,#0C2219 60%,#06100C 100%)}.chart{color:#EAF4EE}.chart em,.chart .k{color:#7FD6A4}.chart .rule{background:#7FD6A4}
.chart svg{position:absolute;left:0;right:0;bottom:${story ? 400 : 120}px;opacity:.55}`;
const chartSvg = () => { let pts = []; for (let i = 0; i <= 40; i++) { const y = 290 - i * 6 - Math.sin(i * 1.7) * 18 - (i > 30 ? (i - 30) * 6 : 0); pts.push(`${i * W / 40},${y}`); }
  return `<svg width="${W}" height="320" viewBox="0 0 ${W} 320"><polyline points="${pts.join(" ")}" fill="none" stroke="#7FD6A4" stroke-width="4"/><polyline points="${pts.join(" ")} ${W},320 0,320" fill="rgba(127,214,164,.08)" stroke="none"/></svg>`; };
(async () => {
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8")); fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: H } });
  for (const c of spec) {
    const html = `<html><head><style>${css}</style></head><body class="${c.style}"><div class="bg"></div>${c.style === "chart" ? chartSvg() : ""}<div class="grain"></div>
<div class="wrap">${c.kicker ? `<div class="k">${c.kicker}</div>` : ""}<div class="l">${c.line}</div>${c.sub ? `<div class="s">${c.sub}</div>` : ""}<div class="rule"></div></div>
<div class="foot">BLUE CHIP FINANCIAL</div></body></html>`;
    await pg.setContent(html, { waitUntil: "networkidle" });
    const over = await pg.evaluate(() => { const r = document.querySelector(".wrap").getBoundingClientRect(); return r.top < 40 || r.bottom > innerHeight - 40; });
    const f = path.join(outDir, `${c.key}${story ? "-story" : ""}.jpg`); await pg.screenshot({ path: f, type: "jpeg", quality: 90 });
    console.log(path.basename(f), over ? "OVERFLOW" : "ok"); if (over) process.exitCode = 2;
  }
  await b.close();
})();
