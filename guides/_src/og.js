const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const root=require('path').resolve(__dirname,'../..');const items=[{slug:'home',kick:'FREE FINANCE CAREER TRAINING',t:'Train for investment banking & private equity',sub:'5-minute levels · real interview questions · live deals'}];
for(const d of fs.readdirSync(root+'/guides')){const f=`${root}/guides/${d}/index.html`;if(!fs.existsSync(f)||d==='_src')continue;const s=fs.readFileSync(f,'utf8');const h=(s.match(/<h1>(.*?)<\/h1>/s)||[])[1];if(!h)continue;items.push({slug:d,kick:'FREE GUIDE',t:h.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&amp;/g,'&'),sub:'mnaprep.com/guides'})}
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630}});
for(const it of items){const fs2=it.t.length>70?60:it.t.length>45?70:82;
await p.setContent(`<html><body style="margin:0;width:1200px;height:630px;background:#13203B;font-family:Arial,Helvetica,sans-serif;color:#fff;position:relative;overflow:hidden">
<div style="position:absolute;right:-120px;top:-120px;width:520px;height:520px;border-radius:50%;background:#2448D8;opacity:.35"></div>
<div style="position:absolute;right:120px;bottom:-200px;width:380px;height:380px;border-radius:50%;background:#A97A1E;opacity:.25"></div>
<div style="position:absolute;left:72px;top:64px;font-weight:900;font-size:44px;letter-spacing:.04em">M<span style="color:#6E8BFF">&amp;</span>A Prep</div>
<div style="position:absolute;left:72px;right:140px;top:190px">
<div style="font-size:22px;letter-spacing:.16em;color:#E0B85A;font-weight:bold;margin-bottom:22px">${esc(it.kick)}</div>
<div style="font-size:${fs2}px;line-height:1.1;font-weight:800">${esc(it.t)}</div></div>
<div style="position:absolute;left:72px;bottom:56px;font-size:26px;color:#C9D3EA">${esc(it.sub)}</div></body></html>`);
await p.screenshot({path:`${root}/img/og/${it.slug}.jpg`,type:'jpeg',quality:82})}
await b.close();console.log(items.length)})();
