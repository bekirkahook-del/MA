// 2-slide "table infographic" deck (like the viral Big Ten finance-schools post) -> 1080x1920 JPGs.
// Usage: node tabledeck.js spec.json OUTDIR   -> <key>-01.jpg (photo hook) + <key>-02.jpg (ranked table). adds the mnaprep.com footer + <key>-03.jpg CTA unless spec.promo is false
// spec: {key, hook:"BEST BIG 10 FINANCE SCHOOLS", title:"Big Ten Schools", subtitle:"Most Frequently Hired for Finance", note:"Based on ...",
//        cols:["School","Avg salary","Notes"], rows:[{logo:"umich.edu", name:"Michigan", sub:"Ross", cells:["$94,909","..."], hot?:true}], sources:"..."}
// logo = file in gen/logos/<logo>.png (fetched from the brand's site favicon); omit -> colored initials badge.
const { chromium } = require("playwright"); const fs = require("fs"), path = require("path");
const F = p => "data:font/woff2;base64," + fs.readFileSync(path.join(__dirname, "node_modules/@fontsource", p)).toString("base64");
const img = p => "data:image/png;base64," + fs.readFileSync(p).toString("base64");
const [, , specPath, outDir] = process.argv; const S = JSON.parse(fs.readFileSync(specPath, "utf8"));
const photo = img(path.join(__dirname, "jpm.png"));
const fonts = `@font-face{font-family:Arc;font-weight:900;src:url(${F("archivo/files/archivo-latin-900-normal.woff2")})}
@font-face{font-family:Plex;font-weight:600;src:url(${F("ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2")})}
@font-face{font-family:Mono;font-weight:500;src:url(${F("ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2")})}
@font-face{font-family:PF;font-weight:400;src:url(${F("playfair-display/files/playfair-display-latin-400-normal.woff2")})}
@font-face{font-family:PFB;font-weight:900;src:url(${F("playfair-display/files/playfair-display-latin-900-normal.woff2")})}
*{margin:0;box-sizing:border-box}body{width:1080px;height:1920px;overflow:hidden;position:relative}`;
const badge = (r) => { const ini = r.name.replace(/[^A-Za-z ]/g, "").split(" ").map(w => w[0]).join("").slice(0, 3);
  return r.logo && fs.existsSync(path.join(__dirname, "logos", r.logo + ".png")) ? `<img src="${img(path.join(__dirname, "logos", r.logo + ".png"))}">` : `<div class="ini">${ini}</div>`; };
const s1 = `<html><head><style>${fonts}
.ph{position:absolute;inset:0;background:url(${photo}) center/cover}.sh{position:absolute;inset:0;background:rgba(4,10,24,.45)}
.box{position:absolute;left:60px;right:60px;top:${S.hookTop || 1000}px;text-align:center}
.box span{display:inline;background:#2E5A3A;color:#fff;font-family:Plex;font-weight:600;font-size:92px;line-height:1.32;padding:6px 26px;border-radius:22px;box-decoration-break:clone;-webkit-box-decoration-break:clone;text-transform:uppercase;letter-spacing:-1px}
.arr{display:inline-block;margin-top:26px;background:#2E5A3A;color:#fff;font-family:Plex;font-size:70px;padding:0 40px 10px;border-radius:20px}</style></head><body>
<div class="ph"></div><div class="sh"></div><div class="box"><span>${S.hook}</span><br><div class="arr">—&gt;</div></div></body></html>`;
const n = S.rows.length, rowH = Math.min(132, Math.floor(((S.promo !== false) ? 1200 : 1310) / n));
const s2 = `<html><head><style>${fonts}body{background:#fff;color:#111;font-family:Plex;font-variant-numeric:lining-nums;display:flow-root}
h1{font-family:PFB;font-size:${S.titleSize || 92}px;line-height:1;text-align:center;margin-top:120px;letter-spacing:-2px}
h2{font-family:PF;font-size:56px;text-align:center;margin-top:8px}.nt{font-family:PF;font-size:28px;text-align:center;margin-top:10px;color:#333}
table{margin:26px 22px 0;width:1036px;border-collapse:collapse}th{background:#111;color:#fff;font-family:PF;font-size:28px;padding:14px 10px;border-right:1px solid #444;line-height:1.1}
td{border:1.5px solid #bbb;padding:0 12px;height:${rowH}px;font-family:PF;font-size:25px;line-height:1.2;vertical-align:middle}
td.rk{font-family:PF;font-size:46px;text-align:center;width:70px}td.sc{width:300px}.sc div.w{display:flex;align-items:center;gap:14px}
.sc img,.ini{width:${Math.min(80, rowH - 26)}px;height:${Math.min(80, rowH - 26)}px;object-fit:contain;border-radius:12px;flex:none}
.ini{background:#1B2843;color:#fff;font-family:Arc;font-size:28px;display:grid;place-items:center}
.nm{font-family:PF;font-size:31px;line-height:1.1}.nm small{display:block;font-size:22px;color:#333}
td.big{font-family:PFB;font-size:34px;white-space:nowrap}td.big small{display:block;font-family:PF;font-size:20px;color:#444;white-space:normal}
tr.hot td{background:#F4EBD3}.src{position:absolute;left:24px;right:24px;bottom:${(S.promo !== false) ? 150 : 60}px;font-family:PF;font-size:21px;line-height:1.3;color:#222}
.src b{font-family:PFB}.ft{position:absolute;left:0;right:0;bottom:0;height:120px;background:#111;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 40px}
.ft b{font-family:Mono;font-size:44px;color:#E3C27A}.ft span{font-family:Plex;font-size:28px}</style></head><body>
<h1>${S.title}</h1><h2>${S.subtitle}</h2><div class="nt">${S.note || ""}</div>
<table><thead><tr><th>Rank</th><th>${S.cols[0]}</th>${S.cols.slice(1).map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>
${S.rows.map((r, i) => `<tr class="${r.hot ? "hot" : ""}"><td class="rk">${i + 1}</td><td class="sc"><div class="w">${badge(r)}<div class="nm">${r.name}${r.sub ? `<small>(${r.sub})</small>` : ""}</div></div></td>${r.cells.map((c, j) => `<td class="${j === 0 ? "big" : ""}">${c}</td>`).join("")}</tr>`).join("")}
</tbody></table><div class="src"><b>Sources:</b> ${S.sources}</div>${(S.promo !== false) ? `<div class="ft"><b>mnaprep.com</b><span>Free IB &amp; PE prep · link in bio</span></div>` : ""}</body></html>`;
const s3 = `<html><head><style>${fonts}body{background:radial-gradient(80% 60% at 50% 40%,#13254F,#050B18);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px;text-align:center}
h2{font-family:Arc;font-size:84px;line-height:1.02;padding:0 70px}h2 em{font-style:normal;color:#E3C27A}.url{background:#fff;color:#07101F;font-family:Mono;font-size:64px;padding:26px 48px;border-radius:24px}p{font-family:Plex;font-size:40px;color:#C7D0E2}</style></head><body>
<h2>${S.ctaHead || "Want to land a job <em>like these?</em>"}</h2><div class="url">mnaprep.com</div><p>Free interview prep · link in bio</p></body></html>`;
(async () => { fs.mkdirSync(outDir, { recursive: true }); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  let over = false;
  for (const [i, h] of ((S.promo !== false) ? [s1, s2, s3] : [s1, s2]).entries()) { await p.setContent(h); await p.waitForTimeout(150);
    if (i === 1) { over = await p.evaluate(() => { const t = document.querySelector("table").getBoundingClientRect(), s = document.querySelector(".src").getBoundingClientRect(); return t.bottom > s.top - 8; }); }
    const f = path.join(outDir, `${S.key}-0${i + 1}.jpg`); await p.screenshot({ path: f, type: "jpeg", quality: 92 }); console.log(f); }
  await b.close(); if (over) { console.error("OVERFLOW: table runs into sources"); process.exit(2); } })();
