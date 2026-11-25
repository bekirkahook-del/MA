const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+__dirname+'/index.html');await p.waitForFunction(()=>window.ready);await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))});
const TL=await p.evaluate(()=>TL);fs.writeFileSync('tl.json',JSON.stringify(TL));const fps=30;const test=process.argv[2]=='test';
const ts=test?[1.5,TL.stan,TL.heroes[2][1]+1.5,TL.hold+.5,TL.xs[3]+.4,TL.cta+1,TL.next+1]:[...Array(Math.ceil(TL.end*fps)).keys()].map(f=>f/fps);
if(!test)fs.mkdirSync('frames',{recursive:true});
for(const [k,t] of ts.entries()){await p.evaluate(t=>render(t),t);
 if(!test)await p.evaluate(()=>Promise.all([...document.querySelectorAll('#himg')].map(i=>i.decode().catch(()=>{}))));
 await p.screenshot({path:test?`t${k}.jpg`:`frames/${String(k).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
await b.close();})();
